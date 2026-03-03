import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// ── Clear stale Firebase auth keys from old sessions (keep currentUser) ───────
const AUTH_VERSION = 'v2';
if (localStorage.getItem('auth_version') !== AUTH_VERSION) {
  const keysToRemove = Object.keys(localStorage).filter(k =>
    k.startsWith('firebase') ||
    k.startsWith('firebaseui')
  );
  keysToRemove.forEach(k => localStorage.removeItem(k));
  localStorage.setItem('auth_version', AUTH_VERSION);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
