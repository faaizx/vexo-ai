/** Tailwind config for the Vexo AI site. Regenerate CSS with: npm run build:css */
module.exports = {
  darkMode: 'class',
  content: ['./public/**/*.html', './server/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          dark: '#0B0F19',
          darker: '#06090F',
          card: '#111827',
          border: '#1F2937',
        },
      },
    },
  },
  plugins: [],
};
