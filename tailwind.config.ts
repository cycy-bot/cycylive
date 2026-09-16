import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0B0817",
        nebula: "#0D0A17",
        card: "#141022",
        violet: "#7B38FF",
        "violet-light": "#B57CFF",
        lilac: "#E0B3FF",
        ink: "#F5F1FF",
        "ink-soft": "#CFC6E8",
        glow: "#A15CFF",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(161, 92, 255, 0.25)",
        "glow-sm": "0 0 20px rgba(161, 92, 255, 0.18)",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-8px) translateX(4px)" },
          "100%": { transform: "translateY(0px) translateX(0px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        drift: "drift 7s ease-in-out infinite",
        "spin-slow": "spin-slow 40s linear infinite",
        rise: "rise 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
