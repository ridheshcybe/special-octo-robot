import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./prepmeup.css";
import "katex/dist/katex.min.css";
import { PrepMeUpHero3D } from "./_components/PrepMeUpHero3D";

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
  themeColor: "#FAF9F6",
};

export default function PrepMeUpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pmu-root selection:bg-[#F6E7E3] selection:text-[#C2331B]">
      <PrepMeUpHero3D showCanvas={false} />
      {children}
    </div>
  );
}
