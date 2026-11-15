import type { Metadata, Viewport } from "next";
import "@fontsource-variable/national-park";
import "@fontsource-variable/literata";
import "@fontsource-variable/literata/wght-italic.css";
import "./globals.css";
import { TesterMode } from "@/components/TesterMode";

export const metadata: Metadata = {
  title: "Sonder — Come inward",
  description:
    "A guided climb through research-backed personality questions and what you're working through right now. At the top: a written portrait of how you think, work, love, and grow.",
  openGraph: {
    title: "Sonder — Come inward",
    description:
      "A guided climb through research-backed questions. At the top: a written portrait of how you think, work, love, and grow.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#213F35",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <TesterMode />
      </body>
    </html>
  );
}
