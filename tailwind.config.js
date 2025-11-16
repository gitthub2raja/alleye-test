/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.css",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "var(--primary-color)",
        "primary-dark": "var(--primary-dark-color)",
        secondary: "var(--secondary-color)",
        background: "var(--background-color)",
        sidebar: "var(--sidebar-color)",
        "sidebar-accent": "var(--sidebar-accent-color)",
        "text-main": "var(--text-main-color)",
        "text-secondary": "var(--text-secondary-color)",
        card: "var(--card-color)",
        border: "var(--border-color)",
        highlight: "var(--highlight-color)",
        "highlight-secondary": "var(--highlight-secondary-color)",
        danger: "var(--danger-color)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-scale": "fade-in-scale 0.2s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in-scale": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
