// filepath: d:\Kreno\tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.jsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{},
      fontFamily:{
        cthin: ['Comfortaa-Light', 'sans-serif'],
        cregular: ['Comfortaa-Regular', 'sans-serif'],
        cmedium: ['Comfortaa-Medium', 'sans-serif'],
        csemibold: ['Comfortaa-SemiBold', 'sans-serif'],
        cbold: ['Comfortaa-Bold', 'sans-serif'],
      }
    },
  },
  plugins: [],
};