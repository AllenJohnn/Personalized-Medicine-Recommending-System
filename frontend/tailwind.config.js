/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1020',
        sand: '#efe7db',
        moss: '#6fb39c',
        coral: '#d95f4a',
        smoke: '#8d97aa',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(4, 10, 24, 0.18)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
