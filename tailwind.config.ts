import type { Config } from 'tailwindcss';
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'emerald-950': '#022c22',
        'emerald-900': '#064e3b',
        'emerald-800': '#065f46',
        'gold-500': '#D4AF37',
        'gold-400': '#e5c354',
        'gold-600': '#b5952f',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        serif: ['var(--font-playfair)', 'ui-serif', 'Georgia'],
      },
    },
  },
  plugins: [],
};
export default config;
