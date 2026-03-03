/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        background: '#020617',   // slate-950
        foreground: '#f8fafc',   // slate-50
        card: 'rgba(15,23,42,0.6)',
        primary: {
          DEFAULT: '#6366f1',    // indigo-500
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#1e293b',    // slate-800
          foreground: '#94a3b8', // slate-400
        },
        border: 'rgba(148,163,184,0.15)',
        accent: {
          DEFAULT: '#0ea5e9',    // sky-500
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'fade-out': 'fadeOut 0.4s ease forwards',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
