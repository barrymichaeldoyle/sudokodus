const { white, black, primary } = require('./src/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        white,
        black,
        primary,
      },
      boxShadow: {
        custom: '0px 4px 32px 0px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
