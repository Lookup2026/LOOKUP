/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lookup': {
          'black': '#000000',
          'dark': '#111111',
          'gray': '#1a1a1a',
          'light-gray': '#2a2a2a',
          'white': '#ffffff',
          'accent': '#00ff88',
        }
      }
    },
  },
  plugins: [],
}
