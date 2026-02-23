/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0f0f14",
          card: "#1a1a23",
          border: "#2a2a35",
        },
        purple: {
          accent: "#a855f7",
          dark: "#7c3aed",
        },
        red: {
          accent: "#7f1d1d",
          dark: "#5f0f0f",
        },
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(168, 85, 247, 0.3)",
        "glow-red": "0 0 20px rgba(127, 29, 29, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
