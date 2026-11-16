/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ieee: {
          blue: '#00629B',
          dark: '#002855',
          light: '#00A3E0',
          accent: '#EAAA00'
        }
      }
    },
  },
  plugins: [],
}
