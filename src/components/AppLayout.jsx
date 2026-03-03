import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import UploadModal from './UploadModal';
import SmartTimer from './SmartTimer';
import {
  ExamCard,
  ContinueLearningCard,
  GlobalMasteryPanel,
  StatCard,
  ActivityHeatmap,
  EXAMS,
  CONTINUE_LEARNING,
  STATS,
} from './HomeCanvas';
import AchievementsPanel from './AchievementsPanel';
import SubjectView, { PageTransition } from './SubjectView';
import AgentDock from './AgentDock';
import {
  BookOpen,
  LayoutDashboard,
  Trophy,
  Settings,
  Bell,
  Search,
  ChevronRight,
  LogOut,
  Menu,
  Upload,
  RefreshCw,
  NotebookPen,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses',   label: 'My Courses',    icon: BookOpen },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'settings',  label: 'Settings',    icon: Settings },
];

// Smart Notebooks — one per subject
// pulse: true = active breath ring; alertColor = ring colour
const NOTEBOOKS = [
  {
    id: 'SC1007',
    code: 'SC1007',
    title: 'Data Structures & Algorithms',
    pulse: true,
    alertColor: '#EF4444',   // red pulse as spec'd
    ringColor: '#EF4444',
    dotColor: 'bg-red-500',
    lastSync: '2m ago',
    pages: 34,
    status: 'active',
  },
  {
    id: 'MH1810',
    code: 'MH1810',
    title: 'Linear Algebra',
    pulse: true,
    alertColor: '#6366f1',
    ringColor: '#6366f1',
    dotColor: 'bg-indigo-500',
    lastSync: '18m ago',
    pages: 21,
    status: 'active',
  },
  {
    id: 'SC2001',
    code: 'SC2001',
    title: 'Algorithm Design & Analysis',
    pulse: true,
    alertColor: '#0ea5e9',
    ringColor: '#0ea5e9',
    dotColor: 'bg-sky-500',
    lastSync: '1h ago',
    pages: 18,
    status: 'active',
  },
  {
    id: 'SC2002',
    code: 'SC2002',
    title: 'Object-Oriented Design',
    pulse: false,
    alertColor: '#8b5cf6',
    ringColor: '#8b5cf6',
    dotColor: 'bg-violet-500',
    lastSync: '3h ago',
    pages: 12,
    status: 'idle',
  },
  {
    id: 'SC2005',
    code: 'SC2005',
    title: 'Computer Organisation',
    pulse: false,
    alertColor: '#10b981',
    ringColor: '#10b981',
    dotColor: 'bg-emerald-500',
    lastSync: '1d ago',
    pages: 9,
    status: 'idle',
  },
];


// Sync overlay message sequence
const SYNC_MESSAGES = [
  { delay: 0,    text: 'Connecting to NTULearn & LAMS…'                      },
  { delay: 900,  text: 'Fetching lecture access logs & quiz attempts…'        },
  { delay: 1800, text: 'Pulling annotation signals from Smart Notebooks…'     },
  { delay: 2700, text: 'Recalculating stability scores…'                      },
  { delay: 3500, text: 'Notebooks updated ✓'                                  },
];

// ── Breath Ring ───────────────────────────────────────────────────────────────

function BreathRing({ color, active }) {
  if (!active) return null;
  return (
    <>
      <span className="breath-ring"  style={{ color }} />
      <span className="breath-ring-2" style={{ color }} />
    </>
  );
}

// ── Notebook Row ──────────────────────────────────────────────────────────────

function NotebookRow({ nb, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group text-left',
        isActive
          ? 'bg-slate-800/70 border border-slate-700/60'
          : 'hover:bg-slate-800/40'
      )}
    >
      {/* Dot with breath rings */}
      <div className="relative flex items-center justify-center shrink-0 w-7 h-7">
        <BreathRing color={nb.ringColor} active={nb.pulse} />
        <span className={cn('relative z-10 w-2.5 h-2.5 rounded-full', nb.dotColor)} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold text-slate-100 leading-tight truncate">
          {nb.code}
        </p>
        <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
          {nb.title}
        </p>
      </div>

      {/* Pages badge */}
      <span className="shrink-0 text-[10px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors">
        {nb.pages}p
      </span>
    </button>
  );
}

// ── Sync Overlay ─────────────────────────────────────────────────────────────

function SyncOverlay({ onDone }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = [];
    SYNC_MESSAGES.forEach((m, i) => {
      timers.push(setTimeout(() => setMsgIndex(i), m.delay));
    });
    // Show last message (done) then close
    timers.push(setTimeout(() => setDone(true), 3500));
    timers.push(setTimeout(() => onDone(), 4200));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div className="sync-overlay fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/80 backdrop-blur-md">
      <div className="glass rounded-2xl px-10 py-10 max-w-md w-full mx-4 flex flex-col items-center gap-6 shadow-2xl border border-slate-700/40">
        {/* Icon */}
        <div className="relative flex items-center justify-center w-16 h-16">
          {!done ? (
            <Loader2 size={40} className="text-indigo-400 animate-spin" />
          ) : (
            <CheckCircle2 size={40} className="text-emerald-400" />
          )}
          {/* outer glow ring */}
          <span
            className="absolute inset-0 rounded-full opacity-20"
            style={{ background: !done ? 'radial-gradient(circle, #6366f1 0%, transparent 70%)' : 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-1">
            Excelearn · Bridge Extension
          </p>
          <h3 className="text-xl font-bold text-slate-50">
            {done ? 'Sync Complete' : 'Syncing Data…'}
          </h3>
        </div>

        {/* Message ticker */}
        <div className="w-full bg-slate-900/60 rounded-xl px-5 py-4 border border-slate-800/60 min-h-[52px] flex items-center">
          <p
            key={msgIndex}
            className="text-sm font-mono text-indigo-300 animate-fade-in"
          >
            <span className="text-slate-500 mr-2">{'>'}</span>
            {SYNC_MESSAGES[msgIndex]?.text}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-mono">
            <span>Notebooks synced</span>
            <span>{done ? '5/5' : `${msgIndex + 1}/5`}</span>
          </div>
          <Progress value={done ? 100 : ((msgIndex + 1) / SYNC_MESSAGES.length) * 80} />
        </div>

        {/* Notebook list */}
        <div className="w-full grid grid-cols-5 gap-2">
          {NOTEBOOKS.map((nb, i) => (
            <div key={nb.id} className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300',
                i <= msgIndex ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800/60 text-slate-600'
              )}>
                {nb.code.slice(-4)}
              </div>
              {i <= msgIndex && (
                <CheckCircle2 size={10} className="text-indigo-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main AppLayout ────────────────────────────────────────────────────────────

export default function AppLayout({ onLogout, user }) {
  const displayName  = user?.name  || 'Student';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const [activeNav,      setActiveNav]      = useState('dashboard');
  const [activeNotebook, setActiveNotebook] = useState('SC1007');
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [syncing,        setSyncing]        = useState(false);
  const [syncToast,      setSyncToast]      = useState(null);
  const [lastSyncTime,   setLastSyncTime]   = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  // 'home' | 'SC1007' — which main view is shown
  const [currentView,    setCurrentView]    = useState('home');

  const handleSync = () => {
    if (syncing) return;
    setSyncing(true);
  };

  const handleSyncDone = () => {
    setSyncing(false);
    setLastSyncTime(new Date());
    setSyncToast({ message: '5 notebooks updated · Stability recalculated ✓', type: 'success' });
    setTimeout(() => setSyncToast(null), 4000);
  };

  // Navigate into any subject view
  const handleOpenSubject = (code) => {
    const supported = ['SC1007', 'MH1810', 'SC2001', 'SC2002', 'SC2005'];
    if (supported.includes(code)) setCurrentView(code);
  };

  // Navigate back to home
  const handleBackToHome = () => setCurrentView('home');

  return (
    <div className="flex min-h-screen bg-[#020617] animate-fade-in" style={{ isolation: 'isolate' }}>

      {/* ── Upload Modal ── */}
      {uploadModalOpen && (
        <UploadModal
          subject={currentView !== 'home' ? currentView : null}
          onClose={() => setUploadModalOpen(false)}
        />
      )}

      {/* ── Sync Overlay ── */}
      {syncing && <SyncOverlay onDone={handleSyncDone} />}

      {/* ── Mobile sidebar backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════ */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-30 w-72 flex flex-col glass border-r border-slate-800/50 overflow-y-auto',
          'transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto'
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-md shadow-indigo-500/30">
            <span className="text-white font-bold text-lg select-none">E</span>
          </div>
          <div>
            <p className="font-bold text-base text-slate-50 leading-none">
              Exce<span className="gradient-text">learn</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">Platform</p>
          </div>
        </div>

        {/* ── Main Navigation ── */}
        <nav className="px-3 pt-4 pb-2 space-y-1 shrink-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setSidebarOpen(false);
                  if (item.id === 'dashboard') setCurrentView('home');
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <Icon size={17} />
                {item.label}
                {isActive && <ChevronRight size={13} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* ── Divider ── */}
        <div className="mx-4 my-3 h-px bg-slate-800/70" />

        {/* ── Smart Notebooks ── */}
        <div className="px-3 flex-1">
          {/* Section header */}
          <div className="flex items-center gap-2 px-3 mb-3">
            <NotebookPen size={14} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
              Smart Notebooks
            </span>
            {/* live indicator */}
            <span className="ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 font-mono">live</span>
            </span>
          </div>

          {/* Notebook rows */}
          <div className="space-y-0.5">
            {NOTEBOOKS.map((nb) => (
              <NotebookRow
                key={nb.id}
                nb={nb}
                isActive={activeNotebook === nb.id}
                onClick={() => { setActiveNotebook(nb.id); handleOpenSubject(nb.id); setSidebarOpen(false); }}
              />
            ))}
          </div>

          {/* Last sync footer */}
          <p className="mt-3 px-3 text-[10px] text-slate-600 font-mono">
            Last full sync ·{' '}
            {lastSyncTime
              ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : NOTEBOOKS[0].lastSync}
          </p>
        </div>

        {/* ── Smart Timer ── */}
        <div className="mx-3 my-3 h-px bg-slate-800/70" />
        <SmartTimer />

        {/* ── User / Logout ── */}
        <div className="px-3 py-4 border-t border-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 font-mono truncate">{displayEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:text-red-300 hover:bg-red-500/20 hover:border-red-400/40 transition-all duration-150"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Global Header ── */}
        <header className="sticky top-0 z-10 glass border-b border-slate-800/50 px-5 py-3 flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors p-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search courses, modules…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          {/* ── Header action buttons ── */}
          <div className="ml-auto flex items-center gap-2">

            {/* Upload Lecture PDF */}
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-slate-800/70 text-slate-300 border border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-100 hover:border-slate-600/60"
            >
              <Upload size={15} />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>

            {/* Sync Data */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30',
                'hover:bg-indigo-600/30 hover:text-indigo-200 hover:border-indigo-400/40',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'active:scale-[0.97]'
              )}
            >
              <RefreshCw
                size={15}
                className={cn('transition-transform', syncing && 'animate-spin')}
              />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(v => !v)}
                className="relative text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-xl hover:bg-slate-800/60"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl z-50 overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
                    <span className="text-sm font-semibold text-slate-100">Notifications</span>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-slate-300 text-xs font-mono">dismiss all</button>
                  </div>
                  {[
                    { icon: '🎯', title: 'SC1007 exam in 5 days', sub: 'Heap Sort chapter not reviewed yet', time: '2m ago', color: 'text-red-400' },
                    { icon: '🧠', title: 'New insight available', sub: 'Your Binary Tree stability dropped 8%', time: '1h ago', color: 'text-amber-400' },
                    { icon: '✅', title: 'Study plan updated', sub: 'Mentor agent refreshed your weekly plan', time: '3h ago', color: 'text-emerald-400' },
                    { icon: '📄', title: 'PDF indexed', sub: 'week9_lecture.pdf ready for RAG queries', time: '1d ago', color: 'text-indigo-400' },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors border-b border-slate-800/30 last:border-0">
                      <span className="text-lg shrink-0 mt-0.5">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${n.color}`}>{n.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{n.sub}</p>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono shrink-0">{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto pb-32">

          {/* ── SUBJECT VIEW ── */}
          {currentView !== 'home' && (
            <SubjectView subjectCode={currentView} onBack={handleBackToHome} />
          )}

          {/* ── COURSES VIEW ── */}
          {currentView === 'home' && activeNav === 'courses' && (
            <PageTransition keyProp="courses">
              <div className="max-w-3xl space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-50">My Courses</h1>
                  <p className="mt-1 text-slate-400 text-sm">5 courses enrolled this semester</p>
                </div>
                <div className="space-y-3">
                  {NOTEBOOKS.map((nb) => {
                    const PROGRESS = { SC1007: 72, MH1810: 61, SC2001: 45, SC2002: 60, SC2005: 38 };
                    const EXAMS_BY = { SC1007: 'Wed, 4 Mar 2026', MH1810: 'Wed, 11 Mar 2026', SC2001: 'Fri, 20 Mar 2026', SC2002: 'Mon, 24 Mar 2026', SC2005: 'Wed, 1 Apr 2026' };
                    const progress = PROGRESS[nb.id] ?? 50;
                    return (
                      <div
                        key={nb.id}
                        onClick={() => { handleOpenSubject(nb.id); setActiveNav('dashboard'); }}
                        className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900/70 border border-slate-700/50 hover:border-slate-500/60 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      >
                        {/* Dot */}
                        <div className="flex items-center justify-center w-10 h-10 shrink-0">
                          <span className={cn('w-4 h-4 rounded-full', nb.dotColor)} />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-slate-500">{nb.code}</span>
                            <Badge variant={nb.pulse ? 'default' : 'outline'} className="text-[10px]">
                              {nb.pulse ? 'Active' : 'Idle'}
                            </Badge>
                          </div>
                          <p className="text-base font-semibold text-slate-100 truncate">{nb.title}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1">
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Progress</span>
                                <span className="text-slate-300 font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} />
                            </div>
                          </div>
                        </div>
                        {/* Exam date */}
                        <div className="hidden sm:flex flex-col items-end shrink-0 gap-1">
                          <span className="text-[10px] font-mono text-slate-500">Exam</span>
                          <span className="text-xs text-slate-300 font-medium">{EXAMS_BY[nb.id]}</span>
                          <span className="text-[10px] font-mono text-slate-600">{nb.pages} pages · {nb.lastSync}</span>
                        </div>
                        {/* Arrow */}
                        <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </PageTransition>
          )}

          {/* ── ACHIEVEMENTS VIEW ── */}
          {currentView === 'home' && activeNav === 'achievements' && (
            <PageTransition keyProp="achievements">
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-slate-50">Achievements</h1>
                  <p className="mt-1 text-slate-400 text-sm">Your learning milestones and streaks</p>
                </div>
                <AchievementsPanel />
              </div>
            </PageTransition>
          )}

          {/* ── SETTINGS VIEW ── */}
          {currentView === 'home' && activeNav === 'settings' && (
            <PageTransition keyProp="settings">
              <div className="max-w-2xl space-y-6">
                <h1 className="text-3xl font-bold text-slate-50">Settings</h1>
                {[{title:'Account', items:['Display name','Email address','Profile photo']},{title:'Notifications', items:['Exam reminders','Study plan updates','PDF index alerts']},{title:'Appearance', items:['Dark mode (always on)','Accent color','Font size']},{title:'Integrations', items:['Azure Search endpoint','Gemini API key','Blob Storage']},].map(section => (
                  <div key={section.title} className="rounded-2xl bg-slate-900/70 border border-slate-700/50 overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-800/50">
                      <h2 className="text-sm font-semibold text-slate-300">{section.title}</h2>
                    </div>
                    {section.items.map(item => (
                      <div key={item} className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition-colors border-b border-slate-800/20 last:border-0">
                        <span className="text-sm text-slate-300">{item}</span>
                        <span className="text-xs text-indigo-400 font-mono cursor-pointer hover:underline">Edit</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </PageTransition>
          )}

          {/* ── HOME OVERVIEW ── */}
          {currentView === 'home' && activeNav !== 'settings' && activeNav !== 'courses' && activeNav !== 'achievements' && (
          <PageTransition keyProp="home">
          {/* Two-column canvas: left content + right rail */}
          <div className="flex gap-6 items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="flex-1 min-w-0 space-y-8">

              {/* Welcome */}
              <div>
                <h1 className="text-4xl font-bold text-slate-50 tracking-tight">
                  Welcome, <span className="gradient-text">{displayName.split(' ')[0]}</span> 👋
                </h1>
                <p className="mt-2 text-slate-400">
                  You have{' '}
                  <span className="text-slate-200 font-medium">4 active courses</span>{' '}
                  and a{' '}
                  <span className="text-emerald-400 font-medium">9-day streak</span>. Keep it up!
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {STATS.map((s) => <StatCard key={s.label} stat={s} />)}
              </div>

              {/* ── Upcoming Exams ── */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-100">Upcoming Exams</h2>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      {EXAMS.length} upcoming
                    </span>
                  </div>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    View calendar
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXAMS.map((e) => <ExamCard key={e.id} exam={e} />)}
                </div>
              </section>

              {/* ── Continue Learning ── */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-100">Continue Learning</h2>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                {/* Horizontal scroll strip */}
                <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                  {CONTINUE_LEARNING.map((item) => (
                    <ContinueLearningCard key={item.id} item={item} />
                  ))}
                </div>
              </section>

              {/* ── Active Notebook highlight ── */}
              {activeNotebook && (() => {
                const nb = NOTEBOOKS.find(n => n.id === activeNotebook);
                return nb ? (
                  <div
                    className="rounded-xl p-5 flex items-center gap-5 border-l-4 bg-slate-900/70 backdrop-blur-sm border border-slate-700/50"
                    style={{ borderLeftColor: nb.ringColor }}
                  >
                    <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                      <BreathRing color={nb.ringColor} active={nb.pulse} />
                      <span className={cn('relative z-10 w-3 h-3 rounded-full', nb.dotColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-slate-500 mb-0.5">Active Smart Notebook</p>
                      <p className="text-lg font-semibold text-slate-100">{nb.code} · {nb.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{nb.pages} pages · synced {nb.lastSync}</p>
                    </div>
                    <Badge variant={nb.pulse ? 'default' : 'outline'}>
                      {nb.pulse ? 'Live' : 'Idle'}
                    </Badge>
                  </div>
                ) : null;
              })()}


            </div>{/* end LEFT COLUMN */}

            {/* ── RIGHT RAIL — Global Mastery + Heatmap + Achievements ── */}
            <div className="hidden xl:flex xl:flex-col w-72 shrink-0 sticky top-6 gap-4">
              <GlobalMasteryPanel />
              <ActivityHeatmap compact />
              <AchievementsPanel compact />
            </div>

          </div>
          </PageTransition>
          )}{/* end home view */}
        </main>



        {/* ── Sync Toast ── */}
        {syncToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-900/90 border border-emerald-500/40 shadow-2xl backdrop-blur-md">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span className="text-sm font-medium text-emerald-200">{syncToast.message}</span>
            </div>
          </div>
        )}

      </div>

      {/* ── Agent Dock — rendered at root level so fixed positioning works on all pages ── */}
      <AgentDock context={currentView} />

    </div>
  );
}
