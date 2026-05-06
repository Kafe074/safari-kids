/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        safari: {
          green:  '#2E7D32',
          yellow: '#F9A825',
          orange: '#E65100',
          cream:  '#FFF8E1',
        }
      }
    }
  },
  plugins: []
}
