import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuroraBackground } from "@/components/ui/aurora-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gemini Deep Research",
    template: "%s | Gemini Deep Research",
  },
  description:
    "AI-powered deep research assistant built with Google Gemini. Explore topics, synthesize information, and generate comprehensive research reports.",
  keywords: [
    "AI research",
    "Gemini",
    "Google AI",
    "research assistant",
    "deep research",
    "AI analysis",
  ],
  authors: [{ name: "Gemini Deep Research" }],
  creator: "Gemini Deep Research",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Gemini Deep Research",
    description:
      "AI-powered deep research assistant built with Google Gemini",
    siteName: "Gemini Deep Research",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gemini Deep Research",
    description:
      "AI-powered deep research assistant built with Google Gemini",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <AuroraBackground showRadialGradient>
          {children}
        </AuroraBackground>
      </body>
    </html>
  );
}
