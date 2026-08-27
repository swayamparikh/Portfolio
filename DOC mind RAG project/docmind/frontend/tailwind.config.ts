import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        signal: "#E10600",
        graphite: "#1A1A1A",
        muted: "#6B6B6B",
        hairline: "#EAEAEA",
        surface: "#FAFAFA",
        success: "#16A34A",
        warning: "#D97706",
        console: {
          bg: "#0A0A0A",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        instrument: "10px",
      },
      boxShadow: {
        "red-glow": "0 0 0 1px #E10600, 0 0 12px rgba(225,6,0,0.25)",
        "white-glow": "0 0 0 1px #FFFFFF, 0 0 12px rgba(255,255,255,0.25)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-red": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        scan: "scan 1.6s linear infinite",
        "pulse-red": "pulse-red 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
