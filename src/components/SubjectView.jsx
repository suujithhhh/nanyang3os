import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { SUBJECT_META, SUBJECT_CHAPTERS } from '../data/subjectData';
import KnowledgeRadar from './KnowledgeRadar';
import QuizSimulator from './QuizSimulator';
import StudyPlanModal from './StudyPlanModal';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  HelpCircle,
  Play,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  LayoutGrid,
  Radar,
  Brain,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

// ── Fetch live stability scores ───────────────────────────────────────────────
async function fetchStability(subject, token) {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/stability/${subject}`, {
      headers: { 'X-User-ID': token },
    });
    if (!res.ok) return null;
    return await res.json(); // { subject, assessed, chapters: [...] }
  } catch {
    return null;
  }
}

const STATUS_META = {
  mastered: { label: 'Mastered', variant: 'success', icon: CheckCircle2 },
  good:     { label: 'Good',     variant: 'sky',     icon: TrendingUp   },
  review:   { label: 'Review',   variant: 'warning', icon: Minus        },
  critical: { label: 'Critical', variant: 'danger',  icon: Flame        },
};

const SUBJECT_TABS = [
  { id: 'overview', label: 'Chapters',   icon: LayoutGrid },
  { id: 'radar',    label: 'Gap Radar',  icon: Radar      },
  { id: 'quiz',     label: 'Practice',   icon: Brain      },
];

// ── Stability Bar ─────────────────────────────────────────────────────────────

function StabilityBar({ value, color, animate }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 120);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="relative h-2 w-full rounded-full bg-slate-800/80">
      <div
        className="h-full rounded-full"
        style={{
          width: `${animate ? width : value}%`,
          background: color,
          boxShadow: `0 0 8px ${color}60`,
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </div>
  );
}

// ── Why Tooltip ───────────────────────────────────────────────────────────────

// Source-type badge colours
const SOURCE_BADGE = {
  quiz_history: { label: 'Quiz History',   color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  pdf_keywords: { label: 'PDF Analysis',   color: 'text-indigo-400  bg-indigo-500/15  border-indigo-500/30'  },
  baseline:     { label: 'Baseline',        color: 'text-slate-400   bg-slate-700/40   border-slate-600/40'   },
};

function WhyTooltip({ subjectCode, chapterId, fallbackSource }) {
  const { getIdToken } = useAuth();
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState(null);   // null = not yet fetched
  const [error,   setError]   = useState(false);
  const fetchedRef = useRef(false);

  const handleOpen = async () => {
    setOpen(true);
    // Only fetch once per mount, and only if we have the needed info
    if (fetchedRef.current || !subjectCode || !chapterId || !API_BASE) return;
    fetchedRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const token = await getIdToken();
      const res = await fetch(
        `${API_BASE}/api/stability/${subjectCode}/${chapterId}`,
        { headers: { 'X-User-ID': token } }
      );
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const badge = data ? (SOURCE_BADGE[data.data_source] || SOURCE_BADGE.baseline) : null;

  // Split the why_explanation on newlines for nicer rendering
  const lines = data?.why_explanation
    ? data.why_explanation.split('\n').filter(Boolean)
    : [];

  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={handleOpen}
        onMouseLeave={() => setOpen(false)}
        onClick={() => { if (open) setOpen(false); else handleOpen(); }}
        className="flex items-center gap-0.5 text-[10px] font-mono text-slate-600 hover:text-indigo-400 transition-colors"
        aria-label="Why this insight?"
      >
        <HelpCircle size={11} />
        <span>Why?</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-72 rounded-xl bg-slate-800 border border-slate-700/60 shadow-2xl p-3 animate-fade-in pointer-events-none">

          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
              Why this score?
            </p>
            {badge && (
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <p className="text-[10px] text-slate-400 font-mono animate-pulse">
              Loading FSRS data…
            </p>
          )}

          {/* Error fallback */}
          {error && !loading && (
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {fallbackSource}
            </p>
          )}

          {/* Live FSRS data */}
          {data && !loading && (
            <>
              {/* FSRS value pills */}
              <div className="flex gap-1.5 mb-2 flex-wrap">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-sky-300 border border-slate-600/40">
                  S = {data.S}d
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-amber-300 border border-slate-600/40">
                  D = {data.D}/10
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-emerald-300 border border-slate-600/40">
                  R = {Math.round(data.R * 100)}%
                </span>
                {data.reviews > 0 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/40">
                    {data.reviews} review{data.reviews !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Plain-English explanation lines */}
              <ul className="flex flex-col gap-1">
                {lines.map((line, i) => (
                  <li key={i} className="text-[10px] text-slate-300 leading-snug font-mono">
                    {line}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Caret */}
          <div className="absolute -bottom-1.5 left-3 w-3 h-3 rotate-45 bg-slate-800 border-b border-r border-slate-700/60" />
        </div>
      )}
    </div>
  );
}

// ── Chapter Card ──────────────────────────────────────────────────────────────

function ChapterCard({ ch, index, onPractice, subjectCode }) {
  const meta = STATUS_META[ch.status];
  const StatusIcon = meta.icon;
  const TrendIcon = ch.trend === 'up' ? TrendingUp : ch.trend === 'down' ? TrendingDown : Minus;
  const trendColor = ch.trend === 'up' ? 'text-emerald-400' : ch.trend === 'down' ? 'text-red-400' : 'text-slate-500';

  return (
    <div
      className={cn(
        'relative rounded-xl p-5 flex flex-col gap-4 group',
        'bg-slate-900/70 backdrop-blur-sm border',
        ch.borderColor,
        'hover:-translate-y-1 hover:shadow-2xl transition-all duration-300'
      )}
      style={{
        boxShadow: `inset 0 0 40px ${ch.glowColor}`,
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest mb-0.5">{ch.num}</p>
          <h3 className="text-base font-semibold text-slate-100 leading-snug">{ch.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{ch.subtitle}</p>
        </div>
        <Badge variant={meta.variant} className="shrink-0 flex items-center gap-1">
          <StatusIcon size={10} />
          {meta.label}
        </Badge>
      </div>

      {/* Stability bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">Knowledge Stability</span>
          <div className="flex items-center gap-1.5">
            <TrendIcon size={11} className={trendColor} />
            <span className="text-xs font-semibold" style={{ color: ch.barColor }}>{ch.stability}%</span>
            <WhyTooltip subjectCode={subjectCode} chapterId={ch.id} fallbackSource={ch.whySource} />
          </div>
        </div>
        <StabilityBar value={ch.stability} color={ch.barColor} animate />
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5">
        {ch.topics.map(t => (
          <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50">
            {t}
          </span>
        ))}
      </div>

      {/* Footer meta */}
      <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-800/50 pt-3">
        <span className="flex items-center gap-1 font-mono"><FileText size={10} />{ch.lectures} lectures</span>
        <span className="flex items-center gap-1 font-mono"><Target size={10} />Quiz: {ch.quizScore}%</span>
        <span className="flex items-center gap-1 font-mono"><Clock size={10} />{ch.lastStudied}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className={cn(
          'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium',
          'bg-slate-800/50 text-slate-500 border border-slate-700/40',
          'group-hover:text-slate-200 group-hover:border-slate-600/60 group-hover:bg-slate-800/80 transition-all duration-150'
        )}>
          <Play size={11} className="fill-current" />
          Open Chapter
        </button>
        <button
          onClick={() => onPractice && onPractice(ch)}
          className={cn(
            'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium',
            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
            'hover:bg-indigo-500/20 hover:text-indigo-300 transition-all duration-150'
          )}
        >
          <Brain size={11} />
          Quiz
        </button>
      </div>
    </div>
  );
}

// ── Subject Switcher ──────────────────────────────────────────────────────────

function SubjectSwitcher({ currentCode, onChange }) {
  const subjects = Object.keys(SUBJECT_META);
  const idx = subjects.indexOf(currentCode);

  const prev = () => { if (idx > 0) onChange(subjects[idx - 1]); };
  const next = () => { if (idx < subjects.length - 1) onChange(subjects[idx + 1]); };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        disabled={idx === 0}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={15} />
      </button>
      <div className="flex gap-1">
        {subjects.map((code) => (
          <button
            key={code}
            onClick={() => onChange(code)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all duration-150 border',
              currentCode === code
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
            )}
          >
            {code}
          </button>
        ))}
      </div>
      <button
        onClick={next}
        disabled={idx === subjects.length - 1}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ── Subject Header ────────────────────────────────────────────────────────────

function SubjectHeader({ subjectCode, onBack, onChangeSubject, onStudyPlan }) {
  const meta     = SUBJECT_META[subjectCode];
  const chapters = SUBJECT_CHAPTERS[subjectCode] || [];
  const critical = chapters.filter(c => c.status === 'critical').length;
  const avgStab  = Math.round(chapters.reduce((s, c) => s + c.stability, 0) / (chapters.length || 1));

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Home
        </button>
        <SubjectSwitcher currentCode={subjectCode} onChange={onChangeSubject} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br shadow-md', meta.gradient, meta.shadowColor)}>
              <BookOpen size={19} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-500 tracking-widest">{meta.code}</p>
              <h1 className="text-3xl font-bold text-slate-50 tracking-tight leading-none">
                <span className="gradient-text">{meta.title}</span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            {meta.totalModules} modules · {meta.completedModules} completed ·{' '}
            <span className={cn('font-medium', meta.examTextColor)}>{critical} critical gap{critical !== 1 ? 's' : ''}</span> identified by AI
          </p>
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap">
          <div className="rounded-xl px-4 py-3 bg-slate-900/70 border border-slate-700/50 text-center min-w-[68px]">
            <p className="text-xl font-bold text-slate-50">{meta.progress}%</p>
            <p className="text-[10px] text-slate-500 font-mono">Progress</p>
          </div>
          <div className={cn('rounded-xl px-4 py-3 bg-slate-900/70 border text-center min-w-[68px]', meta.examBorderColor)}>
            <p className={cn('text-xl font-bold', meta.avgStabilityColor)}>{avgStab}%</p>
            <p className="text-[10px] text-slate-500 font-mono">Avg Stability</p>
          </div>
          <div className="rounded-xl px-4 py-3 bg-slate-900/70 border border-slate-700/50 text-center min-w-[68px]">
            <p className="text-xl font-bold text-slate-50">{meta.daysToExam}</p>
            <p className="text-[10px] text-slate-500 font-mono">Days to Exam</p>
          </div>
          <button
            onClick={onStudyPlan}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all text-sm font-semibold shrink-0"
          >
            <Sparkles size={14} />
            AI Study Plan
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page Transition Wrapper ───────────────────────────────────────────────────

function PageTransition({ children, keyProp }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 0);
    const t2 = setTimeout(() => setVisible(true), 30);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [keyProp]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {children}
    </div>
  );
}

// ── SubjectView (default export) ──────────────────────────────────────────────

export default function SubjectView({ subjectCode: initialCode = 'SC1007', onBack }) {
  const { getIdToken } = useAuth();

  const [subjectCode, setSubjectCode] = useState(initialCode);
  const [activeTab, setActiveTab]     = useState('overview');
  const [practiceChapter, setPracticeChapter] = useState(null);
  const [showStudyPlan, setShowStudyPlan]     = useState(false);

  // Live stability scores from backend
  const [liveScores,   setLiveScores]   = useState(null);  // null = loading, {} = loaded
  const [scoreAssessed, setScoreAssessed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync if parent changes subjectCode
  useEffect(() => { setSubjectCode(initialCode); }, [initialCode]);

  // Fetch stability scores whenever subject changes or quiz completes
  useEffect(() => {
    setLiveScores(null);
    getIdToken().then(token => fetchStability(subjectCode, token)).then(data => {
      if (data && data.chapters?.length) {
        const map = {};
        data.chapters.forEach(ch => { map[ch.chapter_id] = ch; });
        setLiveScores(map);
        setScoreAssessed(data.assessed);
      } else {
        setLiveScores({});
        setScoreAssessed(false);
      }
    });
  }, [subjectCode, getIdToken, refreshKey]);

  // Merge live scores into static chapter data
  const baseChapters = SUBJECT_CHAPTERS[subjectCode] || [];
  const chapters = baseChapters.map(ch => {
    const live = liveScores?.[ch.id];
    if (!live || !scoreAssessed) return ch;
    return {
      ...ch,
      stability: live.stability,
      status:    live.status,
      barColor:  live.bar_color,
      // Update border/glow to match live score colour
      borderColor: live.stability < 50 ? 'border-red-500/50'
                 : live.stability < 60 ? 'border-amber-500/40'
                 : live.stability < 75 ? 'border-sky-500/40'
                 : 'border-emerald-500/40',
      glowColor: live.stability < 50 ? 'rgba(239,68,68,0.14)'
               : live.stability < 60 ? 'rgba(245,158,11,0.12)'
               : live.stability < 75 ? 'rgba(14,165,233,0.12)'
               : 'rgba(16,185,129,0.12)',
    };
  });

  const criticalChapters = chapters.filter(c => c.status === 'critical');

  const handlePractice = (ch) => {
    setPracticeChapter(ch);
    setActiveTab('quiz');
  };

  return (
    <>
      {showStudyPlan && (
        <StudyPlanModal subjectCode={subjectCode} onClose={() => setShowStudyPlan(false)} />
      )}

      <PageTransition keyProp={subjectCode}>

        {/* ── Live Stability Banner ── */}
        {liveScores === null && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-[11px] font-mono text-slate-500 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
            Analysing lecture PDF content for stability scores…
          </div>
        )}
        {liveScores !== null && scoreAssessed && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Stability scores calculated from your uploaded lecture PDFs · live
          </div>
        )}
        {liveScores !== null && !scoreAssessed && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-[11px] font-mono text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
            Showing baseline scores · upload a lecture PDF to get content-aware stability
          </div>
        )}

        <SubjectHeader
          subjectCode={subjectCode}
          onBack={onBack}
          onChangeSubject={(code) => { setSubjectCode(code); setActiveTab('overview'); setPracticeChapter(null); }}
          onStudyPlan={() => setShowStudyPlan(true)}
        />

        {/* ── Subject Tabs ── */}
        <div className="flex items-center gap-1 mb-6 border-b border-slate-800/50 pb-0">
          {SUBJECT_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 -mb-px',
                  isActive
                    ? 'border-indigo-500 text-indigo-300'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                )}
              >
                <Icon size={14} />
                {tab.label}
                {tab.id === 'overview' && criticalChapters.length > 0 && (
                  <span className="ml-1 text-[9px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                    {criticalChapters.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <PageTransition keyProp={`${subjectCode}-${activeTab}`}>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {chapters.map((ch, i) => (
                <ChapterCard key={ch.id} ch={ch} index={i} onPractice={handlePractice} subjectCode={subjectCode} />
              ))}
            </div>
          )}

          {/* Gap Radar tab */}
          {activeTab === 'radar' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <KnowledgeRadar subjectCode={subjectCode} liveChapters={liveScores && Object.keys(liveScores).length > 0 ? chapters : null} />
              {/* Critical chapters summary */}
              <div className="flex flex-col gap-4">
                <div className="rounded-xl p-5 bg-slate-900/70 border border-slate-700/50 backdrop-blur-sm">
                  <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Target size={14} className="text-red-400" />
                    Priority Action List
                  </h3>
                  <div className="flex flex-col gap-3">
                    {chapters
                      .slice()
                      .sort((a, b) => a.stability - b.stability)
                      .map((ch, i) => {
                        const isWeak = ch.stability < 50;
                        return (
                          <div key={ch.id} className={cn(
                            'flex items-center gap-3 p-3 rounded-xl border',
                            isWeak
                              ? 'bg-red-500/8 border-red-500/20'
                              : ch.stability < 70
                                ? 'bg-amber-500/8 border-amber-500/20'
                                : 'bg-emerald-500/8 border-emerald-500/20'
                          )}>
                            <span className={cn(
                              'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0',
                              isWeak ? 'text-red-400 bg-red-500/20' : ch.stability < 70 ? 'text-amber-400 bg-amber-500/20' : 'text-emerald-400 bg-emerald-500/20'
                            )}>
                              #{i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-200 truncate">{ch.num} · {ch.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1 rounded-full bg-slate-800">
                                  <div className="h-full rounded-full" style={{ width: `${ch.stability}%`, background: ch.barColor }} />
                                </div>
                                <span className="text-[10px] font-mono shrink-0" style={{ color: ch.barColor }}>{ch.stability}%</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePractice(ch)}
                              className="shrink-0 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg hover:bg-indigo-500/20 transition-all"
                            >
                              Practice
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz / Practice tab */}
          {activeTab === 'quiz' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chapter selector */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Brain size={14} className="text-indigo-400" />
                  Select Chapter to Practice
                </h3>
                {chapters.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setPracticeChapter(ch)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150',
                      practiceChapter?.id === ch.id
                        ? 'bg-indigo-500/15 border-indigo-500/40'
                        : 'bg-slate-900/60 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/40'
                    )}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ch.barColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-200">{ch.num} · {ch.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Quiz score: {ch.quizScore}% · Stability: {ch.stability}%</p>
                    </div>
                    {ch.stability < 50 && (
                      <span className="text-[9px] font-mono text-red-400 bg-red-500/15 border border-red-500/25 px-1.5 py-0.5 rounded-full shrink-0">
                        critical
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Quiz panel */}
              <div>
                <QuizSimulator
                  subjectCode={subjectCode}
                  chapterId={practiceChapter?.id || null}
                  chapterTitle={practiceChapter ? `${practiceChapter.num} · ${practiceChapter.title}` : 'General Practice'}
                  onQuizComplete={() => {
                    setRefreshKey(k => k + 1);
                    setActiveTab('overview');
                  }}
                />
              </div>
            </div>
          )}

        </PageTransition>
      </PageTransition>
    </>
  );
}

export { PageTransition };
