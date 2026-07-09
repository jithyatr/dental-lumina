import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter_Tight } from "next/font/google";
import "./globals.css";

// Only the family behind the hero h1 (`font-display`) is preloaded. Preloading
// every family put ~183KB of woff2 on the critical path before first paint.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body copy. Still self-hosted and still swaps in; it just no longer emits a
// <link rel="preload"> that competes with the hero image.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Dental Implants — Lumina Dental Care",
  description:
    "Strong, natural, long-lasting dental implants. Restore your confidence and oral health with implants that look, feel, and function just like your natural teeth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${interTight.variable} antialiased`}
    >
      <body className="bg-white text-navy font-sans">{children}</body>
    </html>
  );
}
