/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff4ec',
          100: '#ffe5d0',
          200: '#ffc9a0',
          300: '#ffa366',
          400: '#ff8c3a',
          500: '#FF6B00',
          600: '#e05c00',
          700: '#b84a00',
          800: '#8c3900',
          900: '#6a2b00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
