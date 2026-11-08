import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './public/**/*.html',
    './web/public/**/*.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'vexo-mint': '#00FF9D',
        'vexo-dark': '#050505',
        'vexo-glass': 'rgba(255, 255, 255, 0.05)',
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          root: '#080C14',
          surface: '#0B0F19',
          card: '#0F172A',
          border: '#1E293B',
          terminal: '#05080E',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
      },
      backgroundSize: {
        'cyber-grid': '24px 24px',
      },
    },
  },
  plugins: [],
};

export default config;
