/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './**/*.{ts,tsx}',
    '!./node_modules/**',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Fredoka', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#4F46E5',
          purple: '#7C3AED',
          pink: '#EC4899',
          yellow: '#F59E0B',
          green: '#10B981',
          orange: '#F97316',
        },
      },
    },
  },
  plugins: [],
};