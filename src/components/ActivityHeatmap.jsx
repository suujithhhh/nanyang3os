import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Flame, TrendingUp, Calendar, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Generate 16 weeks × 7 days of mock activity data ─────────────────────────
function generateHeatmapData() {
  const weeks = 16;
  const days = 7;
  const data = [];
  // Simulate realistic learning patterns: active weekdays, quiet weekends, some gaps
  const patterns = [
    // week 1-3: moderate
    ...Array(3).fill(null).map(() => [2,3,4,3,2,0,0]),
    // week 4: low activity (reading week)
    [1,1,0,0,1,0,0],
    // week 5-7: ramp up
    ...Array(3).fill(null).map(() => [3,4,5,4,3,1,0]),
    // week 8: inactivity gap
    [0,0,0,0,0,0,0],
    // week 9-11: back strong
    ...Array(3).fill(null).map(() => [4,5,5,4,5,2,1]),
    // week 12: peak exam prep
    [5,5,5,5,5,4,3],
    // week 13-14: moderate
    ...Array(2).fill(null).map(() => [3,4,3,4,3,1,0]),
    // week 15-16: current weeks (partial)
    [4,5,5,4,3,0,0],
    [5,5,4,0,0,0,0],
  ];

  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < days; d++) {
      const level = Math.min(5, Math.max(0, (patterns[w]?.[d] ?? 0) + Math.round((Math.random() - 0.5) * 0.8)));
      week.push({ level, minutes: level * 22 + Math.round(Math.random() * 10) });
    }
    data.push(week);
  }
  return data;
}

const HEATMAP_DATA = generateHeatmapData();

// Total study days & minutes
const totalDays = HEATMAP_DATA.flat().filter(d => d.level > 0).length;
const totalMinutes = HEATMAP_DATA.flat().reduce((s, d) => s + d.minutes, 0);
const currentStreak = 9; // days

const LEVEL_COLORS = [
  'bg-slate-800/60',          // 0 – none
  'bg-indigo-900/70',         // 1 – minimal
  'bg-indigo-700/70',         // 2 – light
  'bg-indigo-500/80',         // 3 – moderate
  'bg-indigo-400',            // 4 – strong
  'bg-indigo-300',            // 5 – peak
];

const LEVEL_BORDER = [
  'border-slate-700/30',
  'border-indigo-800/40',
  'border-indigo-600/40',
  'border-indigo-500/50',
  'border-indigo-400/50',
  'border-indigo-300/60',
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Week labels (W1 … W16)
const WEEK_LABELS = Array.from({ length: 16 }, (_, i) => `W${i + 1}`);

// ── Tooltip Cell ─────────────────────────────────────────────────────────────

function HeatCell({ level, minutes, week, day }) {
  const [hover, setHover] = useState(false);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="relative">
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          'w-4 h-4 rounded-sm border cursor-pointer transition-all duration-100',
          LEVEL_COLORS[level],
          LEVEL_BORDER[level],
          hover && 'scale-125 z-10 brightness-125'
        )}
      />
      {hover && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap rounded-lg bg-slate-800 border border-slate-700/60 shadow-xl px-2.5 py-1.5 pointer-events-none">
          <p className="text-[10px] font-mono text-slate-300">{dayNames[day]}, {WEEK_LABELS[week]}</p>
          <p className="text-[10px] text-indigo-400 font-semibold">
            {level === 0 ? 'No activity' : `${minutes} min studied`}
          </p>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-slate-800 border-b border-r border-slate-700/60" />
        </div>
      )}
    </div>
  );
}

// ── Inactivity Gap Banner ────────────────────────────────────────────────────

function GapBanner() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/25 text-xs">
      <Zap size={13} className="text-amber-400 shrink-0" />
      <span className="text-amber-300">
        <span className="font-semibold">Inactivity gap detected</span>
        {' '}— Week 8 (7 days, 0 sessions). AI has adjusted your spaced-repetition schedule to recover stability.
      </span>
    </div>
  );
}

// ── Monthly Calendar ──────────────────────────────────────────────────────────

function MonthlyCalendar() {
  const today = new Date(2026, 2, 3); // March 3 2026 (matches app date)
  const [offset, setOffset] = useState(0); // 0 = current month

  const viewDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  // First day of month (0=Sun…6=Sat), convert to Mon-first (0=Mon)
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build flat array of cells (nulls for padding + day numbers)
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Activity level per day — derive from HEATMAP_DATA by mapping week/day index
  // For simplicity, deterministically assign levels based on day number
  const getLevel = (day) => {
    if (!day) return -1;
    // Use the flat heatmap data cyclically
    const flat = HEATMAP_DATA.flat();
    return flat[(day * 7 + month * 3) % flat.length]?.level ?? 0;
  };

  const isToday = (day) =>
    day &&
    offset === 0 &&
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3 bg-slate-900/70 backdrop-blur-sm border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-indigo-400" />
          <span className="text-xs font-semibold text-slate-100">Monthly Activity</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOffset(o => o - 1)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="text-[11px] font-mono text-slate-400 min-w-[80px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={() => setOffset(o => Math.min(o + 1, 0))}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-all disabled:opacity-30"
            disabled={offset >= 0}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="flex items-center justify-center h-5">
            <span className="text-[9px] font-mono text-slate-600">{d}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          const level = getLevel(day);
          return (
            <div
              key={i}
              className={cn(
                'relative flex items-center justify-center rounded-md h-7 text-[10px] font-mono transition-all',
                !day && 'opacity-0 pointer-events-none',
                day && level === 0 && 'text-slate-600 hover:bg-slate-800/60',
                day && level === 1 && 'bg-indigo-900/50 text-indigo-400',
                day && level === 2 && 'bg-indigo-800/60 text-indigo-300',
                day && level === 3 && 'bg-indigo-600/60 text-indigo-200',
                day && level === 4 && 'bg-indigo-500/70 text-white',
                day && level === 5 && 'bg-indigo-400/80 text-white font-bold',
                isToday(day) && 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900',
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1">
          <Flame size={11} className="text-orange-400" />
          <span className="text-xs font-bold text-slate-200">{currentStreak}</span>
          <span className="text-[10px] text-slate-500 font-mono">day streak</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={11} className="text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">{Math.round(totalMinutes / 60)}h</span>
          <span className="text-[10px] text-slate-500 font-mono">total</span>
        </div>
      </div>
    </div>
  );
}

// ── Main ActivityHeatmap ─────────────────────────────────────────────────────

export default function ActivityHeatmap({ compact = false }) {
  // In compact mode render the monthly calendar instead
  if (compact) return <MonthlyCalendar />;

  // In compact mode show only the last 8 weeks
  const displayData = HEATMAP_DATA;
  const displayLabels = compact ? WEEK_LABELS.slice(-8) : WEEK_LABELS;
  const cellSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const legendSize = compact ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <div className={cn(
      'rounded-xl flex flex-col gap-3 bg-slate-900/70 backdrop-blur-sm border border-slate-700/50',
      compact ? 'p-4' : 'p-5 gap-4'
    )}>
      {/* Header */}
      <div className={cn('flex items-center justify-between', compact && 'flex-col items-start gap-2')}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Calendar size={compact ? 13 : 15} className="text-indigo-400" />
            <h3 className={cn('font-semibold text-slate-100', compact ? 'text-xs' : 'text-sm')}>Learning Timeline</h3>
          </div>
          <p className="text-[10px] text-slate-500">{compact ? 'Last 8 weeks' : '16-week activity — Semester 2, 2025/26'}</p>
        </div>
        <div className={cn('flex gap-3 text-right shrink-0', compact && 'w-full justify-between text-left')}>
          <div>
            <div className="flex items-center gap-1">
              <Flame size={11} className="text-orange-400" />
              <span className={cn('font-bold text-slate-50', compact ? 'text-sm' : 'text-base')}>{currentStreak}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">streak</p>
          </div>
          <div>
            <p className={cn('font-bold text-slate-50', compact ? 'text-sm' : 'text-base')}>{totalDays}</p>
            <p className="text-[10px] text-slate-500 font-mono">active days</p>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <TrendingUp size={11} className="text-emerald-400" />
              <span className={cn('font-bold text-slate-50', compact ? 'text-sm' : 'text-base')}>{Math.round(totalMinutes / 60)}h</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">total</p>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {/* Day labels column */}
          <div className={cn('flex flex-col gap-0.5 shrink-0', compact ? 'pt-4' : 'pt-5')}>
            {DAY_LABELS.map((d, i) => (
              <div key={i} className={cn(cellSize, 'flex items-center justify-center')}>
                <span className="text-[8px] text-slate-600 font-mono">{i % 2 === 0 ? d : ''}</span>
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="flex gap-0.5">
            {displayData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {/* Week label */}
                <div className={cn('flex items-center justify-center', compact ? 'h-4' : 'h-5')}>
                  <span className="text-[8px] text-slate-600 font-mono">
                    {wi % 2 === 0 ? displayLabels[wi] : ''}
                  </span>
                </div>
                {/* Day cells */}
                {week.map((day, di) => (
                  <HeatCell
                    key={di}
                    level={day.level}
                    minutes={day.minutes}
                    week={wi}
                    day={di}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
        <span>Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className={cn(legendSize, 'rounded-sm border', c, LEVEL_BORDER[i])} />
        ))}
        <span>More</span>
      </div>

      {/* Gap banner — only in full mode */}
      {!compact && <GapBanner />}
    </div>
  );
}
