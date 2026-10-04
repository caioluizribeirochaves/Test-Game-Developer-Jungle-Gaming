/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pirate: {
          dark: '#0c1724',
          navy: '#122438',
          blue: '#1c3a5e',
          wood: '#6d451b',
          woodDark: '#44260b',
          gold: '#dfa837',
          goldLight: '#f6d365',
          goldDark: '#9c6f16',
          parchment: '#f7edd2',
          danger: '#c0392b',
          success: '#27ae60',
        },
      },
      fontFamily: {
        pirate: ['Pirata One', 'Cinzel', 'MedievalSharp', 'Georgia', 'serif'],
        ui: ['Cinzel', 'Trebuchet MS', 'sans-serif'],
      },
      screens: {
        'xs': '420px',
      },
    },
  },
  plugins: [],
}
