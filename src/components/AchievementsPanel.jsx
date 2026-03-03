import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Trophy, Flame, Star, Zap, BookOpen, Target, TrendingUp, Lock, CheckCircle2 } from 'lucide-react';

// ── Achievement data ──────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  {
    id: 'streak7',    icon: Flame,      color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30',
    title: '7-Day Streak',      desc: 'Study 7 days in a row',           earned: true,  earnedDate: '28 Feb',
  },
  {
    id: 'streak9',    icon: Flame,      color: 'text-red-400',    bg: 'bg-red-500/15',    border: 'border-red-500/30',
    title: '9-Day Streak',      desc: 'Current active streak!',          earned: true,  earnedDate: 'Today',
  },
  {
    id: 'firstquiz',  icon: Target,     color: 'text-emerald-400',bg: 'bg-emerald-500/15',border: 'border-emerald-500/30',
    title: 'Quiz Ace',          desc: 'Score 90%+ on any quiz',          earned: true,  earnedDate: '14 Feb',
  },
  {
    id: 'mastered1',  icon: Star,       color: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/30',
    title: 'First Master',      desc: 'Reach 80%+ stability in a chapter',earned: true, earnedDate: '20 Feb',
  },
  {
    id: 'allsubjects',icon: BookOpen,   color: 'text-sky-400',    bg: 'bg-sky-500/15',    border: 'border-sky-500/30',
    title: 'Polymath',          desc: 'Study all 5 subjects in one week', earned: true,  earnedDate: '24 Feb',
  },
  {
    id: 'hours50',    icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30',
    title: '50 Hours',          desc: 'Accumulate 50 study hours',        earned: true,  earnedDate: '22 Feb',
  },
  {
    id: 'streak21',   icon: Flame,      color: 'text-slate-500',  bg: 'bg-slate-800/40',  border: 'border-slate-700/40',
    title: '21-Day Streak',     desc: 'Study 21 days in a row',           earned: false, progress: 9, target: 21,
  },
  {
    id: 'mastered5',  icon: Trophy,     color: 'text-slate-500',  bg: 'bg-slate-800/40',  border: 'border-slate-700/40',
    title: 'Full Mastery',      desc: 'Master all chapters in any subject',earned: false,progress: 2, target: 6,
  },
  {
    id: 'hours100',   icon: Zap,        color: 'text-slate-500',  bg: 'bg-slate-800/40',  border: 'border-slate-700/40',
    title: '100 Hours',         desc: 'Accumulate 100 study hours',       earned: false, progress: 87, target: 100,
  },
];

// ── Badge Card ───────────────────────────────────────────────────────────────

function AchievementBadge({ ach, compact = false }) {
  const [hover, setHover] = useState(false);
  const Icon = ach.icon;

  if (compact) {
    return (
      <div className="relative"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer',
          ach.earned ? cn(ach.bg, ach.border) : 'bg-slate-800/40 border-slate-700/40',
          hover && 'scale-110'
        )}>
          {ach.earned
            ? <Icon size={18} className={ach.color} />
            : <Lock size={14} className="text-slate-600" />
          }
        </div>
        {hover && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded-xl bg-slate-800 border border-slate-700/60 shadow-2xl px-3 py-2 pointer-events-none">
            <p className="text-xs font-semibold text-slate-100">{ach.title}</p>
            <p className="text-[10px] text-slate-500">{ach.desc}</p>
            {ach.earned && <p className="text-[10px] text-emerald-400 mt-0.5">Earned {ach.earnedDate}</p>}
            {!ach.earned && ach.progress !== undefined && (
              <p className="text-[10px] text-indigo-400 mt-0.5">{ach.progress}/{ach.target}</p>
            )}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-slate-800 border-b border-r border-slate-700/60" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border transition-all duration-150',
      ach.earned ? cn(ach.bg, ach.border) : 'bg-slate-800/30 border-slate-700/30 opacity-60'
    )}>
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border',
        ach.earned ? cn(ach.bg, ach.border) : 'bg-slate-800/60 border-slate-700/40'
      )}>
        {ach.earned
          ? <Icon size={16} className={ach.color} />
          : <Lock size={13} className="text-slate-600" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={cn('text-xs font-semibold', ach.earned ? 'text-slate-100' : 'text-slate-500')}>
            {ach.title}
          </p>
          {ach.earned && <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />}
        </div>
        <p className="text-[10px] text-slate-500 truncate">{ach.desc}</p>
        {!ach.earned && ach.progress !== undefined && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${(ach.progress / ach.target) * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-600">{ach.progress}/{ach.target}</span>
          </div>
        )}
      </div>
      {ach.earned && (
        <span className="text-[10px] text-slate-600 font-mono shrink-0">{ach.earnedDate}</span>
      )}
    </div>
  );
}

// ── Streak Flame Bar ─────────────────────────────────────────────────────────

function StreakBar({ streak = 9 }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // Last 7 days — mark first `streak % 7` as active (simplified)
  const active = Math.min(streak, 7);
  return (
    <div className="flex items-center gap-1.5">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center border transition-all',
            i < active
              ? 'bg-orange-500/20 border-orange-500/40'
              : 'bg-slate-800/50 border-slate-700/40'
          )}>
            {i < active
              ? <Flame size={13} className="text-orange-400" />
              : <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            }
          </div>
          <span className="text-[9px] font-mono text-slate-600">{d}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────────────

export default function AchievementsPanel({ compact = false }) {
  const earned = ACHIEVEMENTS.filter(a => a.earned);
  const locked = ACHIEVEMENTS.filter(a => !a.earned);
  const streak = 9;

  if (compact) {
    return (
      <div className="rounded-xl p-4 bg-slate-900/70 border border-slate-700/50 backdrop-blur-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">Achievements</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{earned.length}/{ACHIEVEMENTS.length} earned</span>
        </div>
        {/* Streak */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/8 border border-orange-500/20">
          <Flame size={22} className="text-orange-400 shrink-0" />
          <div>
            <p className="text-lg font-bold text-slate-50 leading-none">{streak} <span className="text-sm font-normal text-orange-400">day streak</span></p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">12 days to beat your record (21)</p>
          </div>
        </div>
        {/* Compact badge row */}
        <div className="flex gap-1.5 flex-wrap">
          {ACHIEVEMENTS.map(a => <AchievementBadge key={a.id} ach={a} compact />)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5 bg-slate-900/70 border border-slate-700/50 backdrop-blur-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Trophy size={15} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">Achievements & Streaks</h3>
          </div>
          <p className="text-xs text-slate-500">{earned.length} of {ACHIEVEMENTS.length} unlocked</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl">
          <Flame size={14} />
          {streak}
        </div>
      </div>

      {/* Streak bar */}
      <div>
        <p className="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-wider">This Week</p>
        <StreakBar streak={streak} />
        <p className="text-[10px] text-slate-600 font-mono mt-2">
          Keep going — 12 more days to beat your record streak of 21 days!
        </p>
      </div>

      {/* Earned */}
      <div>
        <p className="text-[10px] font-mono text-emerald-500 mb-2 uppercase tracking-wider">✓ Earned</p>
        <div className="flex flex-col gap-1.5">
          {earned.map(a => <AchievementBadge key={a.id} ach={a} />)}
        </div>
      </div>

      {/* Locked */}
      <div>
        <p className="text-[10px] font-mono text-slate-600 mb-2 uppercase tracking-wider">🔒 In Progress</p>
        <div className="flex flex-col gap-1.5">
          {locked.map(a => <AchievementBadge key={a.id} ach={a} />)}
        </div>
      </div>
    </div>
  );
}
