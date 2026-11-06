/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0A0E17',
          card: '#111827',
          cardBorder: '#1F2937',
          cardHover: '#1E293B',
          primary: '#06B6D4', // cyan-500
          accent: '#3B82F6',  // blue-500
          danger: '#EF4444',  // red-500
          warning: '#F59E0B', // amber-500
          success: '#10B981', // emerald-500
          purple: '#8B5CF6',
          textMuted: '#9CA3AF',
          textLight: '#F3F4F6'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'cyber-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.4)',
        'cyber-red': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
        'cyber-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}

