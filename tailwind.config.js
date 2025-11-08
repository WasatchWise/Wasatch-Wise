/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'sanctuary-green': '#2A5F3E',
        'kindness-coral': '#FF6B6B',
        'dignity-purple': '#6C5CE7',
        'shield-blue': '#4A90E2',
        'trust-teal': '#17C0EB',
        'anonymous-indigo': '#5F27CD',
        'caution-amber': '#FFA502',
        'secure-slate': '#2C3E50',
        'surface-primary': '#FFFFFF',
        'surface-secondary': '#F8F9FA',
        'surface-tertiary': '#E9ECEF',
        'surface-private': '#F8F7FF',
      }
    }
  },
  plugins: [],
}
