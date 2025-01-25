const path = require("path");

/** @type {import('tailwindcss').Config} */
export default {
  presets: [require("../drone-hub-lib/tailwind.config.js")],
  content: [
    path.join(__dirname, './index.html'),
    path.join(__dirname, './src/**/*.{vue,js,ts,jsx,tsx}'),
    path.join(__dirname, '../drone-hub-lib/src/**/*.{vue,js,ts,jsx,tsx}'),
  ],
  plugins: [],
};