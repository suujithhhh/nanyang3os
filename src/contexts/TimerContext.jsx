/**
 * TimerContext — global study session timer state.
 *
 * Persists across tab/view switches. Exposes:
 *   state   : { phase, subject, elapsed, pauses, pauseCount, sessionId }
 *   actions : { start, pause, resume, stop, setSubject, dismiss90Alert }
 *
 * phase: 'idle' | 'running' | 'paused' | 'done'
 */

import React, {
  createContext, useContext, useReducer, useEffect, useRef, useCallback,
} from 'react';

// ── Constants ──────────────────────────────────────────────────────────────
export const TIMER_LIMIT     = 90 * 60;   // 90 minutes in seconds
export const AMBER_THRESHOLD = 60 * 60;   // colour turns amber
export const RED_THRESHOLD   = 80 * 60;   // colour turns red

// ── Initial state ──────────────────────────────────────────────────────────
const INIT = {
  phase:       'idle',     // 'idle' | 'running' | 'paused' | 'done'
  subject:     'SC1007',
  elapsed:     0,          // seconds
  pauses:      [],         // [{start, end}] for focus-quality calc
  pauseCount:  0,
  show90Alert: false,      // 90-min fatigue alert triggered
  alerted90:   false,      // prevent re-triggering
  sessionId:   null,       // unique id per session
  summary:     null,       // set when stopped: { duration, subject, pauses, ... }
};

// ── Reducer ────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'SET_SUBJECT':
      if (state.phase !== 'idle') return state;
      return { ...state, subject: action.subject };

    case 'START':
      return {
        ...INIT,
        subject:   state.subject,
        phase:     'running',
        sessionId: crypto.randomUUID(),
        summary:   null,
      };

    case 'PAUSE':
      if (state.phase !== 'running') return state;
      return {
        ...state,
        phase:      'paused',
        pauseCount: state.pauseCount + 1,
        pauses:     [...state.pauses, { start: state.elapsed, end: null }],
      };

    case 'RESUME':
      if (state.phase !== 'paused') return state;
      return {
        ...state,
        phase:  'running',
        pauses: state.pauses.map((p, i) =>
          i === state.pauses.length - 1 ? { ...p, end: state.elapsed } : p
        ),
      };

    case 'TICK': {
      if (state.phase !== 'running') return state;
      const newElapsed = state.elapsed + 1;
      const hit90 = !state.alerted90 && newElapsed >= TIMER_LIMIT;
      return {
        ...state,
        elapsed:     newElapsed,
        show90Alert: hit90 ? true : state.show90Alert,
        alerted90:   hit90 ? true : state.alerted90,
      };
    }

    case 'DISMISS_90':
      return { ...state, show90Alert: false };

    case 'STOP': {
      const duration = state.elapsed;
      // Close any open pause interval
      const closedPauses = state.pauses.map((p, i) =>
        i === state.pauses.length - 1 && p.end === null
          ? { ...p, end: duration } : p
      );
      const totalPauseSeconds = closedPauses.reduce(
        (acc, p) => acc + ((p.end ?? duration) - p.start), 0
      );
      const focusSeconds = Math.max(0, duration - totalPauseSeconds);

      // Estimated retention bonus (shown in summary modal)
      const focusQuality = _focusQuality(duration, state.pauseCount);
      const retentionBonus = _retentionBonus(focusSeconds / 60, focusQuality);

      return {
        ...state,
        phase: 'done',
        pauses: closedPauses,
        summary: {
          subject:          state.subject,
          duration,
          durationMinutes:  Math.round(duration / 60),
          focusSeconds,
          focusMinutes:     Math.round(focusSeconds / 60),
          pauseCount:       state.pauseCount,
          focusQuality,
          retentionBonus,
          sessionId:        state.sessionId,
        },
      };
    }

    case 'DISMISS_SUMMARY':
      return { ...INIT, subject: state.subject };

    default:
      return state;
  }
}

// ── Focus quality helpers ──────────────────────────────────────────────────

function _focusQuality(durationSec, pauseCount) {
  // 1.0 = perfect focus, 0.0 = very scattered
  // Penalise frequent pauses relative to session length
  const durationMin = durationSec / 60;
  if (durationMin < 1) return 0.5;
  const pauseRate = pauseCount / Math.max(durationMin, 1); // pauses per minute
  const quality   = Math.max(0, Math.min(1, 1.0 - pauseRate * 0.5));
  return Math.round(quality * 100) / 100;
}

function _retentionBonus(focusMinutes, focusQuality) {
  // Rough estimate of memory consolidation bonus %
  if (focusMinutes < 15)  return 0;
  if (focusMinutes < 45)  return Math.round(focusMinutes * 0.4 * focusQuality);
  if (focusMinutes <= 90) return Math.round(focusMinutes * 0.6 * focusQuality * 1.2);
  return Math.round(focusMinutes * 0.6 * focusQuality * 0.8); // saturation
}

// ── Context ────────────────────────────────────────────────────────────────

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const [state,   dispatch] = useReducer(reducer, INIT);
  const intervalRef          = useRef(null);

  // Tick every second while running
  useEffect(() => {
    if (state.phase === 'running') {
      intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [state.phase]);

  const actions = {
    setSubject:     useCallback((s) => dispatch({ type: 'SET_SUBJECT', subject: s }), []),
    start:          useCallback(() => dispatch({ type: 'START' }), []),
    pause:          useCallback(() => dispatch({ type: 'PAUSE' }), []),
    resume:         useCallback(() => dispatch({ type: 'RESUME' }), []),
    stop:           useCallback(() => dispatch({ type: 'STOP' }), []),
    dismiss90Alert: useCallback(() => dispatch({ type: 'DISMISS_90' }), []),
    dismissSummary: useCallback(() => dispatch({ type: 'DISMISS_SUMMARY' }), []),
  };

  return (
    <TimerContext.Provider value={{ state, actions }}>
      {children}
    </TimerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used inside <TimerProvider>');
  return ctx;
}
