import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart2,
  Bot,
  BookMarked,
  Calendar,
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  HelpCircle,
  Lightbulb,
  Loader2,
  Sparkles,
  User,
  X,
  FileText,
} from 'lucide-react';

// ── Agent Context Data ────────────────────────────────────────────────────────

const AGENT_CONTEXTS = {
  home: {
    analyse: {
      text: '3 critical gaps found.',
      detail: 'SC1007 Recursion (41%), SC1007 Graph Algorithms (29%), and MH1810 Vector Spaces (33%) are below the 50% stability threshold.',
      whySource: 'Global knowledge model · all quiz results + notebook interaction signals · updated 2 min ago',
      badge: '3 gaps',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    plan: {
      text: 'Optimizing week 8.',
      detail: 'Prioritising SC1007 exam prep (2 days). Scheduled: Mon Graph BFS/DFS review · Tue Recursion drills · Wed mock exam.',
      whySource: 'Exam calendar (SC1007 in 2d) + Spaced Repetition algorithm · last updated on sync',
      badge: 'Week 8',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    mentor: {
      text: 'Global RAG index ready.',
      detail: 'All 5 subject lecture PDFs indexed (SC1007 18 lec, MH1810 12 lec, SC2001 14 lec, SC2002 12 lec, SC2005 9 lec). Ask me anything.',
      whySource: 'Bridge Extension sync · last full index built 2 min ago from uploaded lecture PDFs',
      badge: 'Ready',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  },
  SC1007: {
    analyse: {
      text: 'Mapping gaps in Recursion.',
      detail: 'Recursion stability at 41% — base cases and memoization flagged weak. Quiz 3 score was 52%. Recommend 2 targeted sessions.',
      whySource: 'Quiz 3 result (52%) + Lecture 8 PDF interaction heatmap showing low engagement on slides 14–22',
      badge: 'CH03',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    plan: {
      text: 'Focusing on Pointers.',
      detail: 'CH01 Pointers is your strongest anchor (82%). Plan: reinforce Recursion (CH03) using Pointers as a conceptual bridge before tackling Graph Algorithms (CH06).',
      whySource: 'Prerequisite dependency map (Pointers → Recursion → Graph DFS) + spaced repetition scheduler',
      badge: 'CH01→CH03',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    mentor: {
      text: 'Grounded in Lecture 5.',
      detail: 'Context loaded: SC1007 Lecture 5 (Binary Trees), Lecture 8 (Recursion), Quiz 3 & 4 results. Ask me to explain any concept or quiz question.',
      whySource: 'RAG context window: SC1007 Lecture PDFs 1–18 + notebook annotations · Bridge Extension index',
      badge: 'Lec 5',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
  },
  MH1810: {
    analyse: {
      text: '2 critical gaps in MH1810.',
      detail: 'CH06 Orthogonality (33%) and CH05 Eigenvalues (44%) are below threshold. 9 days to exam — start tonight with Gram-Schmidt.',
      whySource: 'Quiz 5 (55%) + Quiz 6 (41%) results · Lecture 11–15 PDF engagement heatmap',
      badge: 'CH05,CH06',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    plan: {
      text: '9-day exam sprint ready.',
      detail: 'Days 1-2: Orthogonality. Days 3-4: Eigenvalues. Days 5-6: Determinants. Day 7: Matrices review. Days 8-9: Mock exam + targeted drill.',
      whySource: 'Exam calendar (MH1810 in 9d) + spaced repetition intervals + prerequisite dependency map',
      badge: '9-Day Plan',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    mentor: {
      text: 'Grounded in Lectures 11–15.',
      detail: 'Context loaded: MH1810 Eigenvalues (Lec 11–13), Orthogonality (Lec 14–15), Quiz 5 & 6 mistakes. Ask about Gram-Schmidt, characteristic polynomial, or QR decomposition.',
      whySource: 'RAG context window: MH1810 Lecture PDFs 1–15 + notebook annotations · Bridge Extension index',
      badge: 'Lec 11–15',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
  },
  SC2001: {
    analyse: {
      text: '2 critical gaps in SC2001.',
      detail: 'CH06 NP-Completeness (38%) and CH04 Dynamic Programming (47%) are below threshold. 21 days gives time to close both.',
      whySource: 'Quiz 4 (54%) + Quiz 6 (44%) results · Lectures 9–12 and 16–17 flagged in PDF heatmap',
      badge: 'CH04,CH06',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    plan: {
      text: 'Week-by-week sprint planned.',
      detail: 'Week 1: CH04 DP + CH06 NP. Week 2: CH03 Greedy + CH05 Graph review. Week 3: Full mock exam + spaced repetition.',
      whySource: 'Exam calendar (SC2001 in 21d) + knowledge dependency graph + spaced repetition algorithm',
      badge: '3-Week Plan',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    mentor: {
      text: 'Grounded in Lectures 9–17.',
      detail: 'Context loaded: SC2001 DP (Lec 9–12), Graph (Lec 13–15), NP (Lec 16–17). Ask about memoization, Dijkstra, P vs NP, or any algorithm concept.',
      whySource: 'RAG context window: SC2001 Lecture PDFs 1–17 + notebook annotations · Bridge Extension index',
      badge: 'Lec 9–17',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
  },
  SC2002: {
    analyse: {
      text: 'Behavioural patterns weak.',
      detail: 'CH06 Behavioural Patterns at 43%. Observer vs Strategy distinction unclear based on Quiz 6 (49%). 28 days — room to close all gaps systematically.',
      whySource: 'Quiz 6 result (49%) · Lecture 14–16 PDF engagement low · quiz error pattern analysis',
      badge: 'CH06',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    plan: {
      text: 'Design patterns sprint.',
      detail: 'Week 1: Behavioural (CH06) + Structural (CH05). Week 2: Creational (CH04) + SOLID (CH03). Week 3–4: UML practice + full design exercise.',
      whySource: 'Exam calendar (SC2002 in 28d) + pattern dependency map + spaced repetition scheduler',
      badge: '4-Week Plan',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    mentor: {
      text: 'Grounded in Lectures 14–16.',
      detail: 'Context loaded: SC2002 Behavioural Patterns (Lec 14–16), Structural (Lec 11–13). Ask about Observer, Strategy, Adapter, Decorator, or any GoF pattern.',
      whySource: 'RAG context window: SC2002 Lecture PDFs 1–16 + notebook annotations · Bridge Extension index',
      badge: 'Lec 14–16',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
  },
  SC2005: {
    analyse: {
      text: '3 critical gaps in SC2005.',
      detail: 'CH05 Memory Hierarchy (35%), CH04 ISA (41%), CH03 CPU Architecture (48%) all below threshold. 35 days — enough time if you start this week.',
      whySource: 'Quiz 3 (53%) + Quiz 4 (46%) + Quiz 5 (40%) · Lectures 5–12 PDF heatmap showing low engagement',
      badge: 'CH03–CH05',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    plan: {
      text: '5-week recovery plan.',
      detail: 'Week 1: Memory Hierarchy + ISA. Week 2: CPU Architecture. Week 3: I/O review. Week 4: Digital Logic & Data Representation light review. Week 5: Mock exam.',
      whySource: 'Exam calendar (SC2005 in 35d) + prerequisite graph (Logic → CPU → Memory) + spaced repetition',
      badge: '5-Week Plan',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    mentor: {
      text: 'Grounded in Lectures 5–12.',
      detail: 'Context loaded: SC2005 CPU Architecture (Lec 5–7), ISA/MIPS (Lec 8–10), Memory Hierarchy (Lec 11–12). Ask about cache, virtual memory, RISC/CISC, or MIPS instructions.',
      whySource: 'RAG context window: SC2005 Lecture PDFs 1–14 + notebook annotations · Bridge Extension index',
      badge: 'Lec 5–12',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
  },
};

const AGENT_TABS = [
  { id: 'analyse', label: 'Analyse',  icon: BarChart2,  color: 'text-red-400',     activeColor: 'border-red-500/50 bg-red-500/10'     },
  { id: 'plan',    label: 'Plan',     icon: Calendar,   color: 'text-indigo-400',  activeColor: 'border-indigo-500/50 bg-indigo-500/10' },
  { id: 'mentor',  label: 'Mentor',   icon: BookMarked, color: 'text-emerald-400', activeColor: 'border-emerald-500/50 bg-emerald-500/10' },
];

// ── Why Tooltip ───────────────────────────────────────────────────────────────

function WhyTooltip({ source }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 px-2 py-0.5 rounded-lg transition-all ml-1"
        aria-label="Why this insight?"
      >
        <HelpCircle size={13} />
        <span>Why?</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-[60] w-72 rounded-xl bg-slate-800 border border-slate-700/60 shadow-2xl p-3 pointer-events-none">
          <p className="text-[10px] font-mono text-indigo-400 mb-1 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={9} /> Data Source
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">{source}</p>
          <div className="absolute -bottom-1.5 left-3 w-3 h-3 rotate-45 bg-slate-800 border-b border-r border-slate-700/60" />
        </div>
      )}
    </div>
  );
}

// ── Real AI engine — calls FastAPI backend ────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function fetchAgentReply(agent, userQuery, subject, token) {
  if (!API_BASE) throw new Error('No backend configured. The AI agents require a backend server.');
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-ID': token,
    },
    body: JSON.stringify({
      user_query: userQuery,
      agent,
      subject: subject === 'home' ? null : subject,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }
  return res.json(); // { reply, agent, sources, rag_used }
}

async function fetchDocumentCount(subject, token) {
  if (!API_BASE) return null;
  try {
    const params = new URLSearchParams();
    if (subject && subject !== 'home') params.set('subject', subject);
    const url = `${API_BASE}/api/documents?${params.toString()}`;
    const res = await fetch(url, {
      headers: { 'X-User-ID': token },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.count ?? 0;
  } catch {
    return null;
  }
}

// ── RAG Status Banner (Mentor tab only) ──────────────────────────────────────

function RagStatusBanner({ context, getToken }) {
  const [docCount, setDocCount] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    getToken().then(token => fetchDocumentCount(context, token)).then((count) => {
      if (!cancelled) {
        setDocCount(count);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [context, getToken]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-[10px] font-mono text-slate-500">
        <Loader2 size={11} className="animate-spin" />
        Checking RAG index…
      </div>
    );
  }

  if (docCount === null) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Backend offline — answers from general knowledge only
      </div>
    );
  }

  if (docCount === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/40 text-[10px] font-mono text-slate-400">
        <FileText size={11} className="shrink-0" />
        No PDFs indexed yet — upload a lecture PDF to ground answers
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      RAG active · {docCount} PDF{docCount !== 1 ? 's' : ''} indexed
      {context !== 'home' ? ` for ${context}` : ' across all subjects'}
    </div>
  );
}

// ── Chat Bubble ───────────────────────────────────────────────────────────────

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-3 items-start', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-indigo-600' : 'bg-gradient-to-br from-indigo-600 to-sky-500'
      )}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>
      <div className="max-w-[85%] flex flex-col gap-1.5">
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-indigo-600/25 border border-indigo-500/30 text-indigo-100'
            : 'bg-indigo-950/60 border border-indigo-500/20 text-slate-200'
        )}>
          {msg.text}
        </div>
        {/* Source citations — only on agent messages */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {msg.sources.map((s, i) => (
              <span
                key={i}
                className="text-xs font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full"
              >
                📄 {s.title || s.source}{s.page ? ` p.${s.page}` : ''}
              </span>
            ))}
          </div>
        )}
        {/* RAG indicator */}
        {!isUser && msg.rag_used === false && (
          <p className="text-xs font-mono text-slate-500 px-1">
            ⚠ No lecture PDFs matched — answered from general knowledge
          </p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-sky-500 flex items-center justify-center">
        <Bot size={14} className="text-white" />
      </div>
      <div className="bg-indigo-950/60 border border-indigo-500/20 rounded-2xl px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.8s' }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Agent Dock ────────────────────────────────────────────────────────────────

export default function AgentDock({ context = 'home' }) {
  const { getIdToken } = useAuth();

  const [activeTab, setActiveTab]   = useState('analyse');
  const [expanded,  setExpanded]    = useState(false);
  const [dismissed, setDismissed]   = useState(false);
  const [input,     setInput]       = useState('');
  const [chats,     setChats]       = useState({});   // keyed by tab
  const [typing,    setTyping]      = useState(false);
  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  // Reset chat dismiss state when context changes
  useEffect(() => { setDismissed(false); }, [context]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, typing]);

  if (dismissed) return null;

  const ctx     = AGENT_CONTEXTS[context] ?? AGENT_CONTEXTS.home;
  const tabCfg  = AGENT_TABS.find(t => t.id === activeTab);
  const data    = ctx[activeTab];
  const TabIcon = tabCfg.icon;
  const tabChat = chats[activeTab] || [];

  const handleSend = async () => {
    const q = input.trim();
    if (!q || typing) return;

    const userMsg = { role: 'user', text: q };
    setChats(prev => ({ ...prev, [activeTab]: [...(prev[activeTab] || []), userMsg] }));
    setInput('');
    setTyping(true);

    try {
      const token = await getIdToken();
      const reply = await fetchAgentReply(activeTab, q, context, token);
      const agentMsg = {
        role:     'agent',
        text:     reply.reply,
        sources:  reply.sources,
        rag_used: reply.rag_used,
      };
      setChats(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), agentMsg],
      }));
    } catch (err) {
      const errorMsg = {
        role: 'agent',
        text: `⚠ Could not reach the AI backend. Make sure the server is running on port 8000.\n\nError: ${err.message}`,
        sources: [],
        rag_used: false,
      };
      setChats(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), errorMsg],
      }));
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (expanded) setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-3">
      <div className={cn(
        'rounded-2xl border border-indigo-500/40 shadow-[0_8px_48px_rgba(99,102,241,0.25)]',
        'bg-slate-950/90 backdrop-blur-2xl',
        'overflow-hidden transition-all duration-300 ease-in-out',
        'ring-1 ring-indigo-500/20'
      )}>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2.5 border-b border-indigo-500/20">
          <div className="flex items-center gap-2 mr-2 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bot size={15} className="text-white" />
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400 hidden sm:inline tracking-widest uppercase">
              {context === 'home' ? 'Global' : context}
            </span>
          </div>

          {AGENT_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasChat  = (chats[tab.id] || []).length > 0;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 border',
                  isActive
                    ? cn(tab.activeColor, tab.color)
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                )}
              >
                <Icon size={14} />
                {tab.label}
                {hasChat && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-500/50" />
                )}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
              title={expanded ? 'Collapse' : 'Expand chat'}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Insight Row (always visible) ── */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className={cn('shrink-0 flex items-center justify-center w-9 h-9 rounded-xl', tabCfg.activeColor)}>
            <TabIcon size={17} className={tabCfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-semibold text-slate-100">{data.text}</p>
              <span className={cn('text-xs font-mono px-2.5 py-0.5 rounded-full border', data.badgeColor)}>
                {data.badge}
              </span>
              <WhyTooltip source={data.whySource} />
            </div>
            {!expanded && (
              <p className="text-sm text-slate-400 mt-0.5 truncate">{data.detail}</p>
            )}
          </div>
          {!expanded && (
            <button
              onClick={() => { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 150); }}
              className="shrink-0 text-xs font-semibold text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 bg-indigo-500/15 px-3 py-1.5 rounded-xl transition-colors"
            >
              Chat ↑
            </button>
          )}
        </div>

        {/* ── Expanded: chat history + input ── */}
        {expanded && (
          <div className="border-t border-indigo-500/20">
            {/* RAG status banner — Mentor tab only */}
            {activeTab === 'mentor' && (
              <div className="px-4 pt-3">
                <RagStatusBanner context={context} getToken={getIdToken} />
              </div>
            )}
            {/* Chat history */}
            <div
              className="px-4 py-3 flex flex-col gap-3 overflow-y-auto"
              style={{ maxHeight: '320px', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
            >
              {tabChat.length === 0 && (
                <p className="text-sm text-slate-500 font-mono text-center py-4">
                  Ask the {tabCfg.label} agent anything about your {context === 'home' ? 'learning overview' : context} →
                </p>
              )}
              {tabChat.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
              {typing && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-1">
              <div className="flex gap-2 items-center bg-indigo-950/50 border border-indigo-500/25 rounded-2xl px-4 py-3 focus-within:border-indigo-400/60 focus-within:bg-indigo-950/70 transition-all">
                <Lightbulb size={15} className="text-slate-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask the ${tabCfg.label} agent…`}
                  className="flex-1 bg-transparent text-base text-slate-200 placeholder:text-slate-600 focus:outline-none"
                  disabled={typing}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || typing}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all',
                    input.trim() && !typing
                      ? 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/40 hover:bg-indigo-500/30'
                      : 'text-slate-600 cursor-not-allowed'
                  )}
                >
                  {typing ? <Loader2 size={14} className="animate-spin" /> : <CornerDownLeft size={14} />}
                  {typing ? 'Thinking…' : 'Send'}
                </button>
              </div>
              <p className="text-xs text-slate-600 font-mono mt-2 text-center">
                Grounded in lecture PDFs + quiz results · Bridge Extension RAG
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
