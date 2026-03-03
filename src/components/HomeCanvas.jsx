import React from 'react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import ActivityHeatmap from './ActivityHeatmap';
import AchievementsPanel from './AchievementsPanel';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Code2,
  Play,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const EXAMS = [
  {
    id: 'SC1007',
    code: 'SC1007',
    title: 'Data Structures & Algorithms',
    daysLeft: 2,
    date: 'Wed, 4 Mar 2026',
    time: '09:00 AM',
    venue: 'Hall A · Seat 23',
    urgency: 'critical',   // red
    topics: ['Heap Sort', 'Graph Traversal', 'Dynamic Programming'],
    readiness: 58,
  },
  {
    id: 'MH1810',
    code: 'MH1810',
    title: 'Linear Algebra',
    daysLeft: 9,
    date: 'Wed, 11 Mar 2026',
    time: '02:00 PM',
    venue: 'Hall B · Seat 07',
    urgency: 'warning',    // amber
    topics: ['Eigenvalues', 'Matrix Decomposition', 'Vector Spaces'],
    readiness: 74,
  },
];

const CONTINUE_LEARNING = [
  {
    id: 'cl1',
    code: 'SC1007',
    chapter: 'CH 04',
    title: 'Binary Trees',
    subtitle: 'Traversal Methods & BST Operations',
    progress: 68,
    timeLeft: '14 min left',
    color: 'from-red-600/80 to-rose-500/60',
    borderColor: 'border-red-500/40',
    icon: Code2,
    lastOpen: '2h ago',
  },
  {
    id: 'cl2',
    code: 'MH1810',
    chapter: 'CH 06',
    title: 'Eigenvalues & Eigenvectors',
    subtitle: 'Characteristic Polynomial & Diagonalisation',
    progress: 32,
    timeLeft: '28 min left',
    color: 'from-indigo-600/80 to-violet-500/60',
    borderColor: 'border-indigo-500/40',
    icon: Zap,
    lastOpen: '5h ago',
  },
  {
    id: 'cl3',
    code: 'SC2001',
    chapter: 'CH 03',
    title: 'Divide & Conquer',
    subtitle: 'Merge Sort, Quick Sort & Recurrences',
    progress: 85,
    timeLeft: '5 min left',
    color: 'from-sky-600/80 to-cyan-500/60',
    borderColor: 'border-sky-500/40',
    icon: TrendingUp,
    lastOpen: '1d ago',
  },
  {
    id: 'cl4',
    code: 'SC2002',
    chapter: 'CH 07',
    title: 'Design Patterns',
    subtitle: 'Observer, Strategy & Factory Patterns',
    progress: 20,
    timeLeft: '40 min left',
    color: 'from-violet-600/80 to-purple-500/60',
    borderColor: 'border-violet-500/40',
    icon: Users,
    lastOpen: '2d ago',
  },
];

const MASTERY_SUBJECTS = [
  { code: 'SC1007', label: 'DSA',      value: 58, color: '#EF4444' },
  { code: 'MH1810', label: 'Lin. Alg', value: 74, color: '#6366f1' },
  { code: 'SC2001', label: 'Algo',     value: 81, color: '#0ea5e9' },
  { code: 'SC2002', label: 'OOD',      value: 60, color: '#8b5cf6' },
  { code: 'SC2005', label: 'CompOrg',  value: 45, color: '#10b981' },
];

const GLOBAL_MASTERY = 64; // %

// ── Donut Chart (pure SVG) ────────────────────────────────────────────────────

function DonutChart({ value = 64, size = 160, stroke = 18 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  // Stability colour bands
  const color = value >= 75 ? '#10b981' : value >= 50 ? '#6366f1' : '#EF4444';
  const glowId = `donutGlow-${value}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`donutGrad-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#1e293b"
        strokeWidth={stroke}
      />

      {/* Filled arc */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={`url(#donutGrad-${value})`}
        strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        filter={`url(#${glowId})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />

      {/* Centre text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#f8fafc" fontSize="28" fontWeight="700" fontFamily="Inter, sans-serif">
        {value}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="Inter, sans-serif" letterSpacing="1">
        STABILITY
      </text>
    </svg>
  );
}

// ── Exam Card ─────────────────────────────────────────────────────────────────

function ExamCard({ exam }) {
  const isCritical = exam.urgency === 'critical';
  return (
    <div className={cn(
      'relative rounded-xl p-5 flex flex-col gap-3 overflow-hidden',
      'bg-slate-900/70 backdrop-blur-sm',
      isCritical
        ? 'border border-red-500/50 shadow-lg shadow-red-500/10'
        : 'border border-amber-500/40 shadow-lg shadow-amber-500/10'
    )}>
      {/* Glow top-left corner */}
      <div
        className="pointer-events-none absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${isCritical ? '#EF4444' : '#f59e0b'} 0%, transparent 70%)` }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
            isCritical ? 'bg-red-500/20' : 'bg-amber-500/20'
          )}>
            <AlertTriangle size={15} className={isCritical ? 'text-red-400' : 'text-amber-400'} />
          </span>
          <div>
            <p className="text-xs font-mono text-slate-400 tracking-wider">{exam.code}</p>
            <p className="text-sm font-semibold text-slate-100 leading-tight">{exam.title}</p>
          </div>
        </div>

        {/* Days pill */}
        <div className={cn(
          'shrink-0 flex flex-col items-center justify-center rounded-xl px-3 py-1.5 border',
          isCritical
            ? 'bg-red-500/15 border-red-500/40 text-red-300'
            : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
        )}>
          <span className="text-xl font-bold leading-none">{exam.daysLeft}</span>
          <span className="text-[10px] font-mono leading-tight">days</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {exam.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {exam.time}
        </span>
      </div>

      {/* Readiness */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Readiness</span>
          <span className={isCritical ? 'text-red-400' : 'text-amber-400'}>{exam.readiness}%</span>
        </div>
        <div className="relative h-1.5 w-full rounded-full bg-slate-800">
          <div
            className={cn('h-full rounded-full transition-all duration-700', isCritical ? 'bg-red-500' : 'bg-amber-500')}
            style={{ width: `${exam.readiness}%` }}
          />
        </div>
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5">
        {exam.topics.map(t => (
          <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Continue Learning Card ────────────────────────────────────────────────────

function ContinueLearningCard({ item }) {
  const Icon = item.icon;
  return (
    <div className={cn(
      'relative flex-shrink-0 w-64 rounded-xl p-4 flex flex-col gap-3 cursor-pointer group',
      'bg-slate-900/70 backdrop-blur-sm border',
      item.borderColor,
      'hover:-translate-y-1 hover:shadow-xl transition-all duration-200'
    )}>
      {/* Gradient top strip */}
      <div className={cn('absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r', item.color)} />

      {/* Icon + code */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br', item.color)}>
            <Icon size={15} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500">{item.code}</p>
            <p className="text-xs font-semibold text-slate-400">{item.chapter}</p>
          </div>
        </div>
        <span className="text-[10px] text-slate-600 font-mono">{item.lastOpen}</span>
      </div>

      {/* Title */}
      <div>
        <h4 className="text-sm font-semibold text-slate-100 leading-snug">{item.title}</h4>
        <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{item.subtitle}</p>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>{item.timeLeft}</span>
          <span>{item.progress}%</span>
        </div>
        <div className="relative h-1 w-full rounded-full bg-slate-800">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r', item.color)}
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>

      {/* Play button */}
      <button className={cn(
        'flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-medium',
        'bg-slate-800/60 text-slate-400 border border-slate-700/50',
        'group-hover:text-slate-200 group-hover:border-slate-600/60 transition-all duration-150'
      )}>
        <Play size={11} className="fill-current" />
        Continue
      </button>
    </div>
  );
}

// ── Global Mastery Panel ──────────────────────────────────────────────────────

function GlobalMasteryPanel() {
  return (
    <div className={cn(
      'rounded-xl p-5 flex flex-col gap-5',
      'bg-slate-900/70 backdrop-blur-sm border border-indigo-500/25 shadow-lg shadow-indigo-500/5'
    )}>
      {/* Title */}
      <div>
        <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-0.5">Global Mastery</p>
        <h3 className="text-base font-semibold text-slate-100">Knowledge Stability</h3>
      </div>

      {/* Donut */}
      <div className="flex flex-col items-center gap-2">
        <DonutChart value={GLOBAL_MASTERY} size={160} stroke={18} />
        <p className="text-xs text-slate-500 text-center">
          Across <span className="text-slate-300 font-medium">5 subjects</span> · This semester
        </p>
      </div>

      {/* Per-subject bars */}
      <div className="flex flex-col gap-2.5">
        {MASTERY_SUBJECTS.map(s => (
          <div key={s.code}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-mono text-slate-400">{s.code}</span>
              <span className="text-slate-400">{s.value}%</span>
            </div>
            <div className="relative h-1.5 w-full rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.value}%`, background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-800/60 pt-3">
        <span className="font-mono">Spaced Repetition Active</span>
        <span className="flex items-center gap-1 text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          live
        </span>
      </div>
    </div>
  );
}

// ── Stats Row ─────────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Courses Enrolled', value: '5',  icon: BookOpen, color: 'text-indigo-400', border: 'border-indigo-500/20' },
  { label: 'Hours Learned',    value: '87', icon: Clock,     color: 'text-sky-400',    border: 'border-sky-500/20'    },
  { label: 'Achievements',     value: '12', icon: Trophy,    color: 'text-amber-400',  border: 'border-amber-500/20'  },
  { label: 'Streak (days)',    value: '9',  icon: Star,      color: 'text-emerald-400',border: 'border-emerald-500/20'},
];

function StatCard({ stat }) {
  const Icon = stat.icon;
  return (
    <div className={cn(
      'rounded-xl p-4 flex items-center gap-3',
      'bg-slate-900/70 backdrop-blur-sm border',
      stat.border,
      'hover:border-opacity-60 transition-all duration-200'
    )}>
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/70">
        <Icon size={18} className={stat.color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-50 leading-none">{stat.value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
      </div>
    </div>
  );
}

// ── Home Canvas (exported) ─────────────────────────────────────────────────────

export { ExamCard, ContinueLearningCard, GlobalMasteryPanel, StatCard, ActivityHeatmap, AchievementsPanel, EXAMS, CONTINUE_LEARNING, STATS };
