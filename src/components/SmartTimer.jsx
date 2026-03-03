/**
 * SmartTimer — global persistent study session timer.
 *
 * Features:
 *  - Start / Pause / Stop controls
 *  - Subject dropdown (locked while running)
 *  - SVG progress ring: green → amber at 60 min → red at 80 min
 *  - 90-minute fatigue alert modal
 *  - Session-summary modal on Stop (focus time + retention bonus)
 *  - POSTs session to /api/stability/session on Stop
 *  - "Session Recorded" toast notification
 *  - State persists via TimerContext (survives tab switches)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTimer, AMBER_THRESHOLD, RED_THRESHOLD, TIMER_LIMIT } from '../contexts/TimerContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Play, Pause, Square, Clock, Coffee, X, CheckCircle2, AlertTriangle } from 'lucide-react';

// ── Subject options ────────────────────────────────────────────────────────────
const SUBJECTS = [
  { value: 'SC1007', label: 'SC1007 · Data Structures' },
  { value: 'MH1810', label: 'MH1810 · Linear Algebra' },
  { value: 'SC2001', label: 'SC2001 · Algorithm Design' },
  { value: 'SC2002', label: 'SC2002 · Object-Oriented Design' },
  { value: 'SC2005', label: 'SC2005 · Computer Organisation' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Ring colour based on elapsed seconds */
function ringColor(elapsed) {
  if (elapsed >= RED_THRESHOLD)   return '#EF4444'; // red
  if (elapsed >= AMBER_THRESHOLD) return '#f59e0b'; // amber
  return '#10b981';                                  // green
}

/** SVG progress ring — tracks toward 90-minute cap */
function ProgressRing({ elapsed, size = 88, strokeWidth = 6 }) {
  const radius   = (size - strokeWidth) / 2;
  const circ     = 2 * Math.PI * radius;
  const progress = Math.min(elapsed / TIMER_LIMIT, 1);
  const dashOffset = circ * (1 - progress);
  const color    = ringColor(elapsed);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="#1e293b"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.6s ease' }}
      />
    </svg>
  );
}

// ── 90-minute fatigue alert ───────────────────────────────────────────────────

function FatigueAlert({ onDismiss }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl p-7 max-w-sm w-full mx-4 border border-amber-500/40 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Coffee size={28} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-50 mb-1">90-Minute Limit Reached</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Extended studying beyond 90 minutes causes cognitive fatigue and reduces memory consolidation.
              Take a <span className="text-amber-400 font-semibold">15-minute break</span> or switch to a different subject to stay sharp.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onDismiss}
              className="flex-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-semibold hover:bg-amber-500/30 transition-all"
            >
              Take a Break ☕
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 text-slate-300 text-sm font-semibold hover:bg-slate-700/60 transition-all"
            >
              Keep Going
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Session Summary modal ─────────────────────────────────────────────────────

function SummaryModal({ summary, onClose, posting, posted, postError }) {
  const subject = SUBJECTS.find(s => s.value === summary.subject);
  const focusPct = summary.durationMinutes > 0
    ? Math.round((summary.focusMinutes / summary.durationMinutes) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl p-7 max-w-sm w-full mx-4 border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-50">Session Summary</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Subject */}
        <div className="mb-4 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">Subject</p>
          <p className="text-sm font-semibold text-indigo-300">{subject?.label ?? summary.subject}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Total Time',     value: fmt(summary.duration),          sub: `${summary.durationMinutes} min` },
            { label: 'Focus Time',     value: fmt(summary.focusSeconds),       sub: `${focusPct}% focus` },
            { label: 'Pauses',         value: summary.pauseCount,              sub: summary.pauseCount === 1 ? '1 pause' : `${summary.pauseCount} pauses` },
            { label: 'Focus Quality',  value: `${Math.round(summary.focusQuality * 100)}%`, sub: summary.focusQuality >= 0.75 ? '🔥 Excellent' : summary.focusQuality >= 0.5 ? '👍 Good' : '⚠️ Scattered' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-xl bg-slate-800/50 border border-slate-700/30 px-3 py-3">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-xl font-bold text-slate-100">{value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Retention bonus */}
        {summary.retentionBonus > 0 && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <p className="text-sm font-semibold text-emerald-300">+{summary.retentionBonus}% Retention Bonus</p>
              <p className="text-[11px] text-slate-400">Estimated memory consolidation gain for this session</p>
            </div>
          </div>
        )}

        {/* Backend status */}
        {posting && (
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            Saving session to stability model…
          </div>
        )}
        {posted && !postError && (
          <div className="mb-4 flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
            <CheckCircle2 size={14} />
            Session recorded · Stability updated
          </div>
        )}
        {postError && (
          <div className="mb-4 flex items-center gap-2 text-xs text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
            <AlertTriangle size={14} />
            {postError}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-sm font-semibold hover:bg-indigo-600/40 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Toast notification ────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={cn(
      'fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-fade-in border',
      type === 'success'
        ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-300'
        : 'bg-amber-900/90 border-amber-500/40 text-amber-300'
    )}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      {message}
    </div>
  );
}

// ── SmartTimer (main export) ──────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function SmartTimer() {
  const { state, actions } = useTimer();
  const { getIdToken } = useAuth();
  const { phase, subject, elapsed, pauseCount, show90Alert, summary } = state;

  // Backend POST state
  const [posting,   setPosting]   = useState(false);
  const [posted,    setPosted]    = useState(false);
  const [postError, setPostError] = useState(null);

  // Toast
  const [toast, setToast] = useState(null); // { message, type }

  // POST session to backend when summary appears
  const hasPostedRef = useRef(false);

  const postSession = useCallback(async (s) => {
    if (s.durationMinutes < 1) {
      setPostError('Session too short to record (< 1 min).');
      return;
    }
    if (!API_BASE) {
      setPostError('No backend configured — session saved locally only.');
      setToast({ message: 'Session saved locally only', type: 'warn' });
      return;
    }
    setPosting(true);
    setPostError(null);
    try {
      const token = await getIdToken();
      const res = await fetch(`${API_BASE}/api/stability/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': token,
        },
        body: JSON.stringify({
          subject:          s.subject,
          duration_minutes: s.durationMinutes,
          focus_quality:    s.focusQuality,
          pause_count:      s.pauseCount,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      setPosted(true);
      setToast({ message: 'Session Recorded · Stability Updated ✓', type: 'success' });
    } catch (e) {
      setPostError(`Could not save session: ${e.message}`);
      setToast({ message: 'Session saved locally only', type: 'warn' });
    } finally {
      setPosting(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (phase === 'done' && summary && !hasPostedRef.current) {
      hasPostedRef.current = true;
      postSession(summary);
    }
    if (phase === 'idle') {
      hasPostedRef.current = false;
      setPosted(false);
      setPostError(null);
    }
  }, [phase, summary, postSession]);

  const handleStop = () => {
    actions.stop();
  };

  const handleDismissSummary = () => {
    actions.dismissSummary();
  };

  const color = ringColor(elapsed);
  const isIdle    = phase === 'idle';
  const isRunning = phase === 'running';
  const isPaused  = phase === 'paused';
  const isDone    = phase === 'done';

  return (
    <>
      {/* ── 90-minute fatigue alert ── */}
      {show90Alert && <FatigueAlert onDismiss={actions.dismiss90Alert} />}

      {/* ── Session summary ── */}
      {isDone && summary && (
        <SummaryModal
          summary={summary}
          onClose={handleDismissSummary}
          posting={posting}
          posted={posted}
          postError={postError}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* ── Timer Widget ── */}
      <div className="px-3 pb-4">
        <div className="rounded-2xl bg-slate-900/70 border border-slate-700/40 p-4 space-y-3">

          {/* Header */}
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-slate-500" />
            <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">
              Study Timer
            </span>
            {(isRunning || isPaused) && (
              <span className={cn(
                'ml-auto flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border',
                isRunning
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')} />
                {isRunning ? 'Running' : 'Paused'}
              </span>
            )}
          </div>

          {/* Ring + time display */}
          <div className="flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <ProgressRing elapsed={elapsed} size={96} strokeWidth={7} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-lg font-bold font-mono leading-none tabular-nums"
                  style={{ color: isIdle ? '#475569' : color }}
                >
                  {fmt(elapsed)}
                </span>
                <span className="text-[9px] font-mono text-slate-600 mt-0.5">
                  {isIdle ? '00:00' : `/ 90:00`}
                </span>
              </div>
            </div>
          </div>

          {/* Subject dropdown — locked while running/paused */}
          <div>
            <select
              value={subject}
              onChange={e => actions.setSubject(e.target.value)}
              disabled={!isIdle}
              className={cn(
                'w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-300',
                'focus:outline-none focus:border-indigo-500/50 transition-all',
                !isIdle && 'opacity-50 cursor-not-allowed'
              )}
            >
              {SUBJECTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Pause count hint */}
          {(isRunning || isPaused) && pauseCount > 0 && (
            <p className="text-[10px] font-mono text-slate-600 text-center">
              {pauseCount} pause{pauseCount !== 1 ? 's' : ''} · focus quality affected
            </p>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {isIdle && (
              <button
                onClick={actions.start}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/35 transition-all"
              >
                <Play size={13} />
                Start
              </button>
            )}

            {isRunning && (
              <>
                <button
                  onClick={actions.pause}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500/20 border border-amber-500/35 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-all"
                >
                  <Pause size={13} />
                  Pause
                </button>
                <button
                  onClick={handleStop}
                  className="flex items-center justify-center px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  <Square size={13} />
                </button>
              </>
            )}

            {isPaused && (
              <>
                <button
                  onClick={actions.resume}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/35 transition-all"
                >
                  <Play size={13} />
                  Resume
                </button>
                <button
                  onClick={handleStop}
                  className="flex items-center justify-center px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  <Square size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
