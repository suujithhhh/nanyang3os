import React, { useState, useEffect } from 'react';
import LoginView from './components/LoginView';
import AppLayout from './components/AppLayout';
import { TimerProvider } from './contexts/TimerContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { cn } from './lib/utils';

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-3">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Clear data & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Inner app ─────────────────────────────────────────────────────────────────
function AppInner() {
  const { user, login, logout } = useAuth();
  const [appVisible, setAppVisible] = useState(false);

  useEffect(() => {
    if (user) {
      const t = setTimeout(() => setAppVisible(true), 50);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setAppVisible(false), 0);
    return () => clearTimeout(t);
  }, [user]);

  const handleAuthenticated = (userData) => {
    login(userData);
  };

  const handleLogout = () => {
    setAppVisible(false);
    setTimeout(() => logout(), 300);
  };

  const userData = user ? {
    uid:   user.uid,
    name:  user.name || user.email?.split('@')[0] || 'Student',
    email: user.email || '',
    photo: user.photo || null,
  } : null;

  if (!user) {
    return <LoginView onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className={cn('transition-opacity duration-500', appVisible ? 'opacity-100' : 'opacity-0')}>
      <ErrorBoundary>
        <AppLayout onLogout={handleLogout} user={userData} />
      </ErrorBoundary>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TimerProvider>
          <AppInner />
        </TimerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
