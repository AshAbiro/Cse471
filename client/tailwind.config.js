/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B1B2B",
        sand: "#F6EFE6",
        coral: "#FF6B4A",
        teal: "#0FA3B1"
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Source Sans 3'", "sans-serif"]
      }
    }
  },
  plugins: []
};
