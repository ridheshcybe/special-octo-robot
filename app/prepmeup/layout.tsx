import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./prepmeup.css";

export const metadata: Metadata = {
  title: "PrepMeUp AI — B.Tech CSE AI/ML Semester 1 Learning Platform",
  description:
    "Syllabus-aligned notes, past papers, quizzes, AI doubt solving, Python coding lab, simulations, and progress tracking for engineering students.",
  openGraph: {
    title: "PrepMeUp AI — B.Tech CSE AI/ML Semester 1 Learning Platform",
    description:
      "Syllabus-aligned notes, past papers, quizzes, AI doubt solving, Python coding lab, simulations, and progress tracking for engineering students.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
};

export default function PrepMeUpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pmu-root selection:bg-[#ff3b1d] selection:text-[#08080a]">
      {children}
    </div>
  );
}
