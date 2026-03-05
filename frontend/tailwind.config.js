/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mcneeseBlue: "#0033a0",
        mcneeseGold: "#f9c80e",
      },
    },
  },
  plugins: [],
};
