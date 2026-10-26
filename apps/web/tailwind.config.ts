import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        canvas: {
          DEFAULT: "#fbfbf9",
          subtle: "#f4f3ef",
          card: "#ffffff",
          muted: "#ecebe4",
        },
        ink: {
          DEFAULT: "#18181b",
          secondary: "#52525b",
          tertiary: "#71717a",
          border: "#e4e4e7",
        },
        accent: {
          DEFAULT: "#1e3a2f", // Deep clinical forest green
          hover: "#142720",
          light: "#e8f0ec",
          border: "#c3d9cf",
        },
        status: {
          pending: "#d97706",
          pendingBg: "#fef3c7",
          accepted: "#15803d",
          acceptedBg: "#dcfce7",
          declined: "#b91c1c",
          declinedBg: "#fee2e2",
          expired: "#71717a",
          expiredBg: "#f4f4f5",
          urgencyHigh: "#dc2626",
          urgencyMedium: "#f59e0b",
          urgencyLow: "#16a34a",
        },
      },
      fontFamily: {
        serif: ["Merriweather", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
