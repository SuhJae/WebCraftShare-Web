/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
  content: ['./*.html', './src/**/*.{vue,js,ts,jsx,tsx}'], // updated from purge to content
  darkMode: 'media',
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    fontFamily: {
      sans: ['Mona Sans', 'Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      // transitionDuration: {
      //   '500': '500ms',
      // },
    }
  },
  plugins: [],
}
