import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";
import { TextReveal } from "@/components/site/TextReveal";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ContactFooter } from "@/components/site/ContactFooter";
import { getSiteContent } from "@/lib/content";
import { CaseStudyStats } from "./CaseStudyStats";

export const metadata: Metadata = {
  title: "PrepMeUp AI — Case Study | Ridhesh Walavalkar",
  description:
    "Architectural case study of PrepMeUp AI: Multimodal Vision/OCR, RAG grounding on university curricula, browser-native circuit simulations, and atomic payment reconciliation.",
  openGraph: {
    title: "PrepMeUp AI — Architectural Deep Dive",
    description:
      "How I engineered a production-grade, brutalist exam prep assistant for university engineering students solo.",
    type: "article",
  },
};

export default async function PrepMeUpCaseStudyPage() {
  const content = await getSiteContent();

  return (
    <SmoothScroll>
      <header className="site-nav">
        <nav>
          <Link className="logo" href="/" aria-label="Ridhesh Walavalkar — home">
            <span className="logo-badge">RW</span>
            <span className="logo-name">Ridhesh Walavalkar</span>
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/#projects">← Back to Portfolio</Link>
            </li>
            <li>
              <Link href="/prepmeup" target="_blank" className="t-accent" style={{ color: "var(--accent)" }}>
                Launch Platform ↗
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main style={{ paddingTop: "8rem", paddingBottom: "6rem" }}>
        {/* HERO SECTION */}
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem 5rem" }}>
          <Reveal as="div">
            <Eyebrow>Case Study / Full-Stack AI Platform</Eyebrow>
          </Reveal>
          <h1
            className="t-display"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.5rem, 8vw, 6.5rem)",
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              marginTop: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            PREPMEUP AI
          </h1>
          <p
            className="t-lead"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
              color: "var(--muted)",
              maxWidth: "800px",
              lineHeight: 1.6,
              marginBottom: "2.5rem",
            }}
          >
            An autonomous, university-aligned exam preparation platform engineered for B.Tech students.
            Combines multimodal vision OCR, RAG grounded to exact syllabus modules, browser-native BEE
            circuit engines, and instantaneous WhatsApp OTP authentication.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              alignItems: "center",
              borderTop: "1px solid var(--line)",
              paddingTop: "2rem",
            }}
          >
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                Role & Stack
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                Solo Architect / Next.js 16, Supabase, Groq Llama 3.2 Vision, Razorpay
              </span>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "1rem" }}>
              <Link
                href="/prepmeup"
                target="_blank"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.85rem 1.75rem",
                  background: "var(--accent)",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  textTransform: "uppercase",
                  fontSize: "1rem",
                  letterSpacing: "0.05em",
                }}
              >
                Launch Live App ↗
              </Link>
            </div>
          </div>
        </section>

        {/* METRICS HYDRATION STRIP */}
        <section
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            padding: "3.5rem 2rem",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <CaseStudyStats />
          </div>
        </section>

        {/* ARCHITECTURAL BREAKDOWN */}
        <section style={{ maxWidth: "1200px", margin: "5rem auto 0", padding: "0 2rem" }}>
          <Reveal as="div">
            <Eyebrow>System Architecture</Eyebrow>
          </Reveal>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              margin: "1rem 0 3rem",
            }}
          >
            Engineering Constraints & Solutions
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {/* CARD 1: RAG & VISION */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                padding: "2.5rem 2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  color: "var(--accent)",
                }}
              >
                01
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", textTransform: "uppercase" }}>
                Multimodal Vision & Curriculum RAG
              </h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Engineering students frequently ask doubts containing complex circuit diagrams or handwritten equations.
                PrepMeUp ingests base64 visual payloads directly into Groq Llama-3.2-11b-vision-preview for zero-latency OCR.
                Extracted queries are automatically cross-referenced against syllabus modules and published notes before synthesis.
                If out-of-syllabus, the model explicitly flags its source as general knowledge.
              </p>
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--line)",
                  fontSize: "0.8rem",
                  color: "var(--accent)",
                  fontFamily: "monospace",
                }}
              >
                LLAMA-3.2-11B-VISION / POSTGRES VECTOR / ZERO HALLUCINATION
              </div>
            </div>

            {/* CARD 2: BROWSER-NATIVE SIMULATORS */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                padding: "2.5rem 2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  color: "var(--accent)",
                }}
              >
                02
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", textTransform: "uppercase" }}>
                Zero-Dependency Browser Visualizers
              </h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Rather than relying on resource-intensive backend WebGL runtimes or remote sandboxes,
                10 interactive visualizers for Basic Electrical Engineering (KVL/KCL, AC phasors, RLC resonance, Thevenin equivalents)
                and Python execution flow (recursion call stack, memory pointers, loop iterations) run entirely client-side
                using pure SVG, HTML Canvas, and React state machines.
              </p>
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--line)",
                  fontSize: "0.8rem",
                  color: "var(--accent)",
                  fontFamily: "monospace",
                }}
              >
                HTML CANVAS 2D / VECTOR SVG / REACT STATE HOOKS / 60 FPS
              </div>
            </div>

            {/* CARD 3: AUTH & PAYMENTS */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                padding: "2.5rem 2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "2rem",
                  color: "var(--accent)",
                }}
              >
                03
              </span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", textTransform: "uppercase" }}>
                WhatsApp OTP & Razorpay Reconciliation
              </h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: "0.95rem" }}>
                Engineered frictionless passwordless onboarding tailored to Indian university students via 6-digit WhatsApp OTPs
                delivered through the Meta Cloud API. Monetization is secured via Razorpay Orders and HMAC-SHA256 signature verification
                with an atomic server counter granting the first 10 students 100% free lifetime access before locking.
              </p>
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--line)",
                  fontSize: "0.8rem",
                  color: "var(--accent)",
                  fontFamily: "monospace",
                }}
              >
                META CLOUD API / HMAC-SHA256 WEBHOOK / POSTGRES CONCURRENCY
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section style={{ maxWidth: "1200px", margin: "6rem auto 2rem", padding: "0 2rem" }}>
          <div
            style={{
              background: "linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)",
              border: "1px solid var(--line-strong)",
              padding: "4rem 3rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <Eyebrow>Live Production Deployment</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                maxWidth: "700px",
              }}
            >
              Experience PrepMeUp AI in Action
            </h2>
            <p style={{ color: "var(--muted)", maxWidth: "550px", lineHeight: 1.6 }}>
              Test the multimodal doubt solver, interact with circuit simulators, and explore the complete semester syllabus.
            </p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link
                href="/prepmeup"
                target="_blank"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1rem 2.5rem",
                  background: "var(--accent)",
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  textTransform: "uppercase",
                  fontSize: "1.1rem",
                  letterSpacing: "0.05em",
                }}
              >
                Launch PrepMeUp AI ↗
              </Link>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1rem 2.5rem",
                  background: "transparent",
                  border: "1px solid var(--line-strong)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-display)",
                  textTransform: "uppercase",
                  fontSize: "1.1rem",
                  letterSpacing: "0.05em",
                }}
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <ContactFooter contact={content.contact} social={content.social} />
    </SmoothScroll>
  );
}
