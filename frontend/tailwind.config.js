/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fefe',
          100: '#ccfbfb',
          200: '#99f5f5',
          300: '#5eeaea',
          400: '#2de0e0',
          500: '#13ecec',
          600: '#0ecece',
          700: '#09a8a8',
          800: '#077a7a',
          900: '#055959',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        brand: {
          dark: '#0d1b1b',
          muted: '#4c9a9a',
          border: '#cfe7e7',
          surface: '#f6f8f8',
        },
        success: {
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          500: '#EF4444',
          600: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};
