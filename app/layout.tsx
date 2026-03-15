import type { Metadata } from "next";
import "./globals.css";
import { CursorGlow } from "@/components/ui/cursor-glow";
import { PageTransition } from "@/components/global/page-transition";

export const metadata: Metadata = {
  title: "HireIQ – AI-Powered Hiring Intelligence",
  description: "AI-driven mock interviews, resume scoring, and smart candidate ranking. Stop guessing and start hiring smarter with HireIQ.",
  keywords: ["AI interviews", "resume scoring", "hiring platform", "candidate ranking", "Gemini AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans">
      <head>
        {/* Preload critical above-the-fold assets */}
        <link
          rel="preload"
          href="/assets/backgrounds/hero-bg.jpeg"
          as="image"
        />
        <link
          rel="preload"
          href="/assets/animations/loading-orb.webm"
          as="video"
          type="video/webm"
        />
      </head>
      <body className="antialiased min-h-screen relative font-sans text-slate-200">
        <CursorGlow />
        <div className="noise-overlay" />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
