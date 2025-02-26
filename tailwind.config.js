/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Open Sans', 'sans-serif'],
        'oswald': ['Oswald', 'sans-serif'],
        'lobster': ['"Lobster Two"', 'cursive'],
      },
      colors: {
        primary: {
          DEFAULT: '#FF6B00', // Orange
          light: '#FF8A3D',
          dark: '#E05A00',
        },
        secondary: {
          DEFAULT: '#1E3A5F', // Dark Blue
          light: '#2C5282',
          dark: '#152A45',
        },
        darkblue: {
          DEFAULT: '#1E3A5F',
          light: '#2C5282',
          dark: '#152A45',
        },
      },
      backgroundColor: {
        'dark-blue': '#1E3A5F',
        'darker-blue': '#152A45',
        'lighter-blue': '#2C5282',
      },
    },
  },
  plugins: [],
}