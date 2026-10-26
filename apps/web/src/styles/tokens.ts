/**
 * PraanSetu Design Tokens
 * Follows ARCHITECTURE.md and README design guidelines:
 * Calm, clinical, paper-like warm off-white background, deep ink text,
 * muted clinical forest green accent, zero flashy animations, high readability.
 */

export const tokens = {
  colors: {
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
      DEFAULT: "#1e3a2f", // Muted clinical forest green
      hover: "#142720",
      light: "#e8f0ec",
      border: "#c3d9cf",
    },
    status: {
      pending: "#d97706",
      pendingBg: "#fef3c7",
      pendingBorder: "#fde68a",
      accepted: "#15803d",
      acceptedBg: "#dcfce7",
      acceptedBorder: "#bbf7d0",
      declined: "#b91c1c",
      declinedBg: "#fee2e2",
      declinedBorder: "#fecaca",
      expired: "#71717a",
      expiredBg: "#f4f4f5",
      expiredBorder: "#e4e4e7",
    },
  },
  typography: {
    heading: "font-serif tracking-tight",
    body: "font-sans text-[15px] leading-relaxed text-ink",
    code: "font-mono font-medium tracking-wide",
  },
  borders: {
    subtle: "border border-ink-border",
    card: "border border-stone-200/80 rounded-lg",
  },
} as const;
