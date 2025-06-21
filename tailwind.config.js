/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '375px', // Extra small screens like Galaxy S24
      },
      spacing: {
        'safe-area-top': 'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
};