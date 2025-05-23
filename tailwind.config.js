/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#4B66F3',
        secondary: '#F3F4F6',
      },
      boxShadow: {
        'custom': '0 4px 15px rgba(0, 0, 0, 0.05)',
      },
      textShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
} 