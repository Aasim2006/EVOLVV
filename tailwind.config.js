/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        smoke: "#111111",
        graphite: "#1A1A1A",
        mist: "#A3A3A3",
        bone: "#F6F4EF"
      },
      fontFamily: {
        display: ["var(--font-space)", "Inter", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 60px rgba(255,255,255,0.12)"
      }
    }
  },
  plugins: []
};
