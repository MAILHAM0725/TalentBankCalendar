import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213D",
        paper: "#EEF1F6",
        card: "#FFFFFF",
        line: "#D8DCE3",
        slate: "#5B6472",
        gold: "#C9A227",
        "gold-deep": "#8C6D1F",
        published: "#2F7A4D",
        "published-bg": "#E7F2EC",
        soldout: "#B8720B",
        "soldout-bg": "#FBF0DE",
        cancelled: "#B23A48",
        "cancelled-bg": "#FBEAEC",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        ledger: "0 1px 0 rgba(20,33,61,0.06), 0 8px 24px -12px rgba(20,33,61,0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
