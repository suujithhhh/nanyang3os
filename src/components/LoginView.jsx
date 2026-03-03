/**
 * LoginView — Simple email-based login (no Firebase auth).
 * Extracts the name from the email (before @) and saves as currentUser in localStorage.
 */

import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { BookOpen, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginView({ onAuthenticated }) {
  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) { setError('Please enter your email address.'); return; }
    if (!trimmed.includes('@')) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    setError('');

    // Extract name from email (before @)
    const name = trimmed.split('@')[0];

    // Save to localStorage
    localStorage.setItem('currentUser', trimmed);
    localStorage.setItem('currentUserName', name);

    // Small delay for UX feel
    setTimeout(() => {
      onAuthenticated({ uid: trimmed, name, email: trimmed, photo: null });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden">

      {/* ── Ambient glow blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[80px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ── Card ── */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden">

          {/* ── Header ── */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-slate-800/60">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-lg shadow-indigo-500/30">
                <BookOpen size={22} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-50">
              Exce<span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">learn</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              AI-powered student learning companion
            </p>
          </div>

          {/* ── Body ── */}
          <div className="px-8 py-8 flex flex-col gap-5">

            <div className="text-center">
              <p className="text-base font-semibold text-slate-200">Welcome back 👋</p>
              <p className="text-sm text-slate-500 mt-1">Enter your email to continue to your dashboard</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400 animate-fade-in">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* ── Email form ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  autoFocus
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl',
                  'bg-gradient-to-r from-indigo-600 to-indigo-500',
                  'text-white font-semibold text-sm',
                  'hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200',
                  'shadow-lg shadow-indigo-500/20',
                  loading && 'opacity-60 cursor-not-allowed'
                )}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Entering…
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Info note */}
            <p className="text-center text-xs text-slate-600 font-mono leading-relaxed">
              No password needed · Your email is used as your unique study profile ID
            </p>
          </div>

          {/* ── Footer ── */}
          <div className="px-8 py-4 border-t border-slate-800/60 text-center">
            <p className="text-[10px] text-slate-600 font-mono">
              ExceeLearn · AI-Powered Study Platform · Your data is private
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
