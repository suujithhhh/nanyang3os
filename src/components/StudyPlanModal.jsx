import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { SUBJECT_META, SUBJECT_CHAPTERS } from '../data/subjectData';
import {
  X, Sparkles, Calendar, Clock, Target, CheckCircle2,
  Loader2, BookOpen, Flame, ChevronRight, Zap,
} from 'lucide-react';

// ── Generate an AI study plan based on subject data ──────────────────────────

function generatePlan(subjectCode) {
  const meta = SUBJECT_META[subjectCode];
  const chapters = SUBJECT_CHAPTERS[subjectCode] || [];
  const critical = chapters.filter(c => c.status === 'critical').sort((a, b) => a.stability - b.stability);
  const review   = chapters.filter(c => c.status === 'review');
  const good     = chapters.filter(c => c.status === 'good');

  const days = Math.min(meta.daysToExam, 7);
  const plan = [];

  // Day 1-2: critical chapters (lowest stability first)
  critical.forEach((ch, i) => {
    if (i < 2) {
      plan.push({
        day: i + 1,
        label: `Day ${i + 1}`,
        focus: ch.title,
        chapterNum: ch.num,
        duration: '2h',
        tasks: [
          `Re-read Lecture notes on ${ch.topics[0]} and ${ch.topics[1]}`,
          `Complete 10 practice problems (focus: ${ch.topics[2] || ch.topics[0]})`,
          `Review Quiz ${ch.num.replace('CH ', '')} mistakes with AI Mentor`,
        ],
        priority: 'critical',
        stability: ch.stability,
      });
    }
  });

  // Fill remaining days with review → good
  const remaining = [...review, ...good];
  remaining.forEach((ch) => {
    const dayNum = plan.length + 1;
    if (dayNum <= days) {
      plan.push({
        day: dayNum,
        label: `Day ${dayNum}`,
        focus: ch.title,
        chapterNum: ch.num,
        duration: ch.status === 'review' ? '1.5h' : '45 min',
        tasks: [
          `Quick recap of ${ch.topics[0]} and ${ch.topics[1]}`,
          `${ch.status === 'review' ? '5 practice problems' : '3 flashcard drills'}`,
        ],
        priority: ch.status,
        stability: ch.stability,
      });
    }
  });

  // Final day: mock exam
  if (plan.length < days) {
    plan.push({
      day: plan.length + 1,
      label: `Day ${plan.length + 1}`,
      focus: 'Mock Exam',
      chapterNum: 'ALL',
      duration: '3h',
      tasks: [
        'Full past paper under timed conditions',
        'Review all flagged critical chapters',
        'AI Mentor Q&A session on weak areas',
      ],
      priority: 'exam',
      stability: null,
    });
  }

  return plan.slice(0, days);
}

const PRIORITY_STYLE = {
  critical: { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    label: 'Critical'  },
  review:   { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  label: 'Review'    },
  good:     { color: 'text-sky-400',    bg: 'bg-sky-500/10',    border: 'border-sky-500/30',    label: 'Good'      },
  mastered: { color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',label: 'Mastered'  },
  exam:     { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', label: 'Mock Exam' },
};

// ── Typing animation ─────────────────────────────────────────────────────────

function TypedText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return <span>{displayed}<span className="animate-pulse">|</span></span>;
}

// ── Study Plan Modal ─────────────────────────────────────────────────────────

export default function StudyPlanModal({ subjectCode, onClose }) {
  const [generating, setGenerating] = useState(true);
  const [plan, setPlan] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const meta = SUBJECT_META[subjectCode] || {};

  useEffect(() => {
    const t = setTimeout(() => {
      setPlan(generatePlan(subjectCode));
      setGenerating(false);
    }, 1600);
    return () => clearTimeout(t);
  }, [subjectCode]);

  const dayPlan = plan[selectedDay];
  const pStyle = dayPlan ? PRIORITY_STYLE[dayPlan.priority] : PRIORITY_STYLE.good;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/60 bg-slate-900/60">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">AI Study Plan Generator</p>
            <h2 className="text-base font-bold text-slate-100 leading-tight truncate">
              {meta.code} · {meta.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              <Flame size={12} />
              {meta.daysToExam}d to exam
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>

          {generating ? (
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="relative">
                <Loader2 size={36} className="text-indigo-400 animate-spin" />
                <div className="absolute inset-0 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-mono text-indigo-300">
                  <TypedText text="Analysing your knowledge gaps and exam timeline…" />
                </p>
                <p className="text-xs text-slate-600 mt-2 font-mono">
                  Spaced repetition · prerequisite graph · quiz history · lecture coverage
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* AI Summary */}
              <div className="p-4 rounded-xl bg-indigo-500/8 border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-indigo-400" />
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">AI Analysis</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on your quiz history, notebook interactions and lecture coverage, I've built a{' '}
                  <span className="text-indigo-300 font-semibold">{plan.length}-day optimised plan</span> prioritising your{' '}
                  {SUBJECT_CHAPTERS[subjectCode]?.filter(c => c.status === 'critical').length || 0} critical gaps.
                  Spaced repetition intervals are applied to consolidate mastered chapters without wasting revision time.
                </p>
              </div>

              {/* Day tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {plan.map((d, i) => {
                  const s = PRIORITY_STYLE[d.priority];
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(i)}
                      className={cn(
                        'flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-mono transition-all duration-150',
                        selectedDay === i
                          ? cn(s.bg, s.border, s.color)
                          : 'bg-slate-800/50 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      )}
                    >
                      <span className="font-bold">{d.label}</span>
                      <span className="text-[9px] opacity-70 truncate max-w-[60px]">{d.focus.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Day detail */}
              {dayPlan && (
                <div className={cn('rounded-xl p-5 border', pStyle.bg, pStyle.border)}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border', pStyle.color, pStyle.bg, pStyle.border)}>
                          {pStyle.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{dayPlan.chapterNum}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-100">{dayPlan.focus}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono shrink-0 text-slate-400">
                      <Clock size={12} />
                      {dayPlan.duration}
                    </div>
                  </div>

                  {/* Stability indicator */}
                  {dayPlan.stability !== null && (
                    <div className="flex items-center gap-2 mb-4">
                      <Target size={12} className={pStyle.color} />
                      <span className="text-xs text-slate-500">Current stability:</span>
                      <span className={cn('text-xs font-bold', pStyle.color)}>{dayPlan.stability}%</span>
                      <div className="flex-1 h-1 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${dayPlan.stability}%`, background: dayPlan.priority === 'critical' ? '#ef4444' : dayPlan.priority === 'review' ? '#f59e0b' : '#10b981' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tasks */}
                  <div className="flex flex-col gap-2">
                    {dayPlan.tasks.map((task, ti) => (
                      <div key={ti} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <div className={cn('w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5', pStyle.border)}>
                          <span className={cn('text-[8px] font-bold', pStyle.color)}>{ti + 1}</span>
                        </div>
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Export / Accept strip */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all">
                  <Calendar size={14} />
                  Export to Calendar
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/60 transition-all"
                >
                  <CheckCircle2 size={14} />
                  Accept Plan
                </button>
              </div>

              {/* Responsible AI footer */}
              <p className="text-[10px] text-slate-700 font-mono text-center leading-relaxed">
                This plan is AI-generated based on your learning data. You can adjust timings and override any recommendation.
                Grounded in: quiz results · lecture PDF coverage · spaced repetition algorithm.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
