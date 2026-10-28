import type { Metadata, Viewport } from "next";
import { Anton, Onest } from "next/font/google";
import type { ReactNode } from "react";
import { AdaptiveGrid } from "@/components/AdaptiveGrid";
import { RemGrid } from "@/components/RemGrid";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

const DESCRIPTION =
  "AI/ML developer and researcher building full-stack products solo — frontend, backend, and the AI that powers them.";

export const metadata: Metadata = {
  title: "Ridhesh Walavalkar — AI/ML Developer & Researcher",
  description: DESCRIPTION,
  openGraph: {
    title: "Ridhesh Walavalkar — AI/ML Developer & Researcher",
    description: DESCRIPTION,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
};

/**
 * Motion classes start hidden only once this flag is set, so the page renders
 * complete, visible HTML without JavaScript.
 */
const JS_FLAG = `document.documentElement.classList.add("js");if(location.pathname.indexOf("/courses")!==0)document.documentElement.classList.add("rem-grid");`;

const NOSCRIPT_CSS = `<style>
.preloader{display:none}
.rv-fade{opacity:1 !important;transform:none !important}
.rv-lines .rv-in,.rv-mask .rv-in{opacity:1 !important;transform:none !important}
.js [data-split]{visibility:visible !important}
</style>`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${onest.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
        <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
        <AdaptiveGrid />
        <RemGrid />
        {children}
      </body>
    </html>
  );
}
