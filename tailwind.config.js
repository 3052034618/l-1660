/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: { DEFAULT: '#0F2B46', dark: '#0A1628' },
        accent: { DEFAULT: '#00D4AA', light: '#33DDBB', dark: '#00A388', glow: 'rgba(0, 212, 170, 0.3)' },
        alert: { yellow: '#F5A623', orange: '#FF6B35', red: '#E63946' },
        surface: { card: 'rgba(15, 43, 70, 0.6)', hover: 'rgba(0, 212, 170, 0.08)' },
        txt: { primary: '#E8EDF2', secondary: '#8BA3BC' },
      },
      fontFamily: {
        sans: ['Noto Sans SC', '-apple-system', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
