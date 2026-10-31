/**
 * PraanSetu Design Tokens
 * Conforming to quiet dashboard theme:
 * Background #F7F5F0, Surface #FFFFFF, Border #E2DED5,
 * Primary Text #1B2430, Muted Text #5B6572,
 * Accent Deep Teal #1F5F5B (hover #184B48),
 * Green #2F7D4F, Amber #B7791F, Red #B3342E.
 * 6px border radius, flat styling, Source Serif 4 + IBM Plex Sans + IBM Plex Mono.
 */

export const tokens = {
  colors: {
    background: "#F7F5F0",
    surface: "#FFFFFF",
    border: "#E2DED5",
    text: {
      primary: "#1B2430",
      muted: "#5B6572",
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
      amber: "#B7791F",
      red: "#B3342E",
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
    },
  },
  typography: {
    heading: "font-serif tracking-tight text-ink",
    body: "font-sans text-[15px] leading-relaxed text-ink",
    code: "font-mono font-medium tracking-wide",
  },
  borders: {
    subtle: "border border-ink-border rounded-md",
    card: "border border-ink-border rounded-md",
  },
} as const;

