/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: 'fn-',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Neue Haas Unica', 'Helvetica', 'sans-serif']
      }
    },
  },
  plugins: [],
}
