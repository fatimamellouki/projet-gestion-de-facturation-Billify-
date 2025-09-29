/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // pas 'media'
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'group-hover:opacity-100',
    'opacity-0',
    'translate-y-4',
    'group-hover:translate-y-0',
    'transition-opacity',
    'transition-transform'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

