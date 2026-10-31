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
        foreground: "var(--text-primary)",
        border: "var(--border)",
        surface: {
          DEFAULT: "var(--surface)",
          card: "var(--surface)",
        },
        text: {
          primary: "var(--text-primary)",
          muted: "var(--text-muted)",
        },
        canvas: {
          DEFAULT: "#F7F5F0",
          subtle: "#F7F5F0",
          card: "#FFFFFF",
          muted: "#EFECE6",
        },
        ink: {
          DEFAULT: "#1B2430",
          secondary: "#5B6572",
          tertiary: "#5B6572",
          border: "#E2DED5",
        },
        accent: {
          DEFAULT: "#1F5F5B", // Deep teal
          hover: "#184B48",
          light: "#EBF3F2",
          border: "#C2D7D5",
        },
        status: {
          green: "#2F7D4F",
          greenBg: "#EEF7F2",
          greenBorder: "#BDE2CC",
          amber: "#B7791F",
          amberBg: "#FEF7EC",
          amberBorder: "#F6D9A0",
          red: "#B3342E",
          redBg: "#FDF2F2",
          redBorder: "#F5C2C0",

          // Backward-compatible semantic aliases
          pending: "#B7791F",
          pendingBg: "#FEF7EC",
          pendingBorder: "#F6D9A0",
          accepted: "#2F7D4F",
          acceptedBg: "#EEF7F2",
          acceptedBorder: "#BDE2CC",
          declined: "#B3342E",
          declinedBg: "#FDF2F2",
          declinedBorder: "#F5C2C0",
          expired: "#5B6572",
          expiredBg: "#F0EFEA",
          expiredBorder: "#E2DED5",
          urgencyHigh: "#B3342E",
          urgencyMedium: "#B7791F",
          urgencyLow: "#2F7D4F",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Source Serif 4", "Georgia", "serif"],
        sans: ["var(--font-sans)", "IBM Plex Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        DEFAULT: "6px",
        none: "0px",
        sm: "6px",
        md: "6px",
        lg: "6px",
        xl: "6px",
        full: "9999px",
      },
      boxShadow: {
        none: "none",
        subtle: "none",
        card: "none",
        xs: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
      },
    },
  },
  plugins: [],
};

export default config;

