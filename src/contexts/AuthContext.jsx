/**
 * AuthContext — simple localStorage-based auth, no Firebase.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

function readUserFromStorage() {
  try {
    const email = localStorage.getItem('currentUser');
    const name  = localStorage.getItem('currentUserName');
    // Must be a valid email (contains @)
    if (email && email.includes('@')) {
      return { uid: email, name: name || email.split('@')[0], email, photo: null };
    }
  } catch {
    // ignore
  }
  // Clear anything invalid
  try {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserName');
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUserFromStorage);

  const getIdToken = useCallback(async () => {
    try { return localStorage.getItem('currentUser') || ''; } catch { return ''; }
  }, []);

  const login = useCallback((userData) => {
    try {
      localStorage.setItem('currentUser', userData.email);
      localStorage.setItem('currentUserName', userData.name);
    } catch {
      // ignore
    }
    setUser({ uid: userData.email, name: userData.name, email: userData.email, photo: null });
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserName');
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: false, getIdToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
