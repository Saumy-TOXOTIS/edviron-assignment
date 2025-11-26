/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        sky: '#06b6d4',
        sand: '#f8fafc',
        slate: '#1e293b',
      },
    },
  },
  plugins: [],
};
