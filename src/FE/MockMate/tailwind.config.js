/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#FF6B00", // Brand Orange
        "primary-dark": "#0ea5e9", // Kept original
        "primary-light": "#FFF3E0", // Light Orange background
        "secondary": "#0F172A", // Deep Navy Blue
        "secondary-light": "#475569", // Slate 600
        "accent-blue": "#E0F2FE", // Light Blue background
        "background-light": "#FFFFFF",
        "background-subtle": "#F8F9FA",
        "background-dark": "#101922", // Kept original
        "card-border": "#E2E8F0", // Slate 200
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #FF6B00 0%, #FF8F33 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(15, 23, 42, 0.05)',
        'glow-orange': '0 4px 20px rgba(255, 107, 0, 0.25)',
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
