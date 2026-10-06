/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#f4f4eb', 
          dark: '#0a1d37', // Deep Navy Blue 
          accentYellow: '#f5df75', 
          accentBlue: '#a9d6d5', 
          cardGrey: '#e3e4d8', 
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem', 
      }
    },
  },
  plugins: [],
}