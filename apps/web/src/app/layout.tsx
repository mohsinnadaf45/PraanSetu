import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";

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
    <html lang="en" className="h-full bg-[#fbfbf9]">
      <body className="h-full antialiased font-sans text-stone-900 bg-[#fbfbf9]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
