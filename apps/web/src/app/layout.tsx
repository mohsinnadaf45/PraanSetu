import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const fontSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PraanSetu — Organ Allocation & Match Coordination",
  description: "Secure, tamper-evident organ donor and recipient matching platform conforming to NOTTO guidelines and the DPDP Act.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full bg-[#F7F5F0] ${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}
    >
      <body className="h-full antialiased font-sans text-[#1B2430] bg-[#F7F5F0]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

