/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        'surface-dim': '#f1f5f9',
        'surface-card': '#ffffff',
        'border-light': '#e2e8f0',
        'text-main': '#0f172a',
        'text-muted': '#64748b',
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#006970',
          800: '#004f54',
          900: '#00363a',
          950: '#002022',
        },
        primary: {
          DEFAULT: '#006970',
          dark: '#004f54',
          light: '#0d9488',
          container: '#ccfbf1',
          dim: '#00dbe9',
          fixed: '#7df4ff',
        },
        secondary: {
          DEFAULT: '#334155',
          container: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
