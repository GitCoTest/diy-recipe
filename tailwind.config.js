/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        sacramento: ['Sacramento', 'cursive'],
        dancing: ['Dancing Script', 'cursive'],
        pacifico: ['Pacifico', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
        fredoka: ['Fredoka One', 'cursive'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        custom: {
          pale: '#f8fbda',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f2',
          200: '#faf5e9',
          300: '#f6f0e0',
          400: '#f0e8d3',
          500: '#e8dcc2',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          125: '#fae8f1', // Very pale pink, closer to white
          150: '#f8e4ee', // Slightly more pink but still very pale
          200: '#fbb6ce',
          300: '#f687b3',
          400: '#ed64a6',
          500: '#d53f8c',
        },
        yellow: {
          25: '#fffef7',
          50: '#fefce8',
          75: '#fef9c3',
          100: '#fef3c7',
          150: '#fed7aa',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
    },
  },
  plugins: [],
};
