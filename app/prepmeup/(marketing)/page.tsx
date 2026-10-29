import Link from "next/link";
import { PrepMeUpNav } from "../_components/PrepMeUpNav";
import { PrepMeUpFooter } from "../_components/PrepMeUpFooter";
import { PricingClaimForm } from "../_components/PricingClaimForm";
import { VideoSessionBookingForm } from "../_components/VideoSessionBookingForm";

function SectionEyebrow({ children, centered = false }: { children: string; centered?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: centered ? "center" : "flex-start" }}>
      <p className="pmu-eyebrow">
        <span className="pmu-eyebrow-dot" aria-hidden="true" />
        <span>{children}</span>
      </p>
    </div>
  );
}

export default function PrepMeUpLandingPage() {
  const subjects = [
    {
      name: "Applied Computational Mathematics",
      slug: "applied-computational-mathematics",
      code: "CSE1001",
      desc: "Linear Algebra, Rank & Echelon forms, Multivariable Calculus, Ordinary Differential Equations, and Vector Calculus.",
      modules: "5 Modules • LaTeX Notes",
      badge: "Semester 1 Core",
    },
    {
      name: "Basic Electrical & Electronics Engg",
      slug: "basic-electrical-and-electronics-engineering",
      code: "CSE1002",
      desc: "DC/AC theorems, PN junction diodes, rectifiers, BJT & MOSFET switches/amplifiers, and Op-Amps.",
      modules: "5 Modules + Lab Manual",
      badge: "Hardware Labs",
    },
    {
      name: "Computer Organization & Architecture",
      slug: "computer-organization-and-architecture",
      code: "CSE1003",
      desc: "Von Neumann vs Harvard, 8 Great Ideas, Booth multiplication, instruction pipelining, and cache hierarchy.",
      modules: "5 Modules + Assignments",
      badge: "Core Architecture",
    },
    {
      name: "Fundamentals of Web Technologies",
      slug: "fundamentals-of-web-technologies",
      code: "CSE1004",
      desc: "Internet protocols, HTTP/HTTPS, semantic HTML5, modern CSS3 flexbox/grid, JavaScript DOM, and full-stack deployment.",
      modules: "5 Modules + Practicals",
      badge: "Full-Stack Labs",
    },
    {
      name: "Python Programming",
      slug: "python-programming",
      code: "CSE1005",
      desc: "Dynamic typing, control flow, functions, dictionaries, regex, OOP design, and scientific computing (NumPy & Pandas).",
      modules: "5 Modules + Exercises",
      badge: "Coding Lab",
    },
    {
      name: "Indian Science, Engg & Technology",
      slug: "indian-science-engineering-and-technology",
      code: "CSE1006",
      desc: "Ancient Indian mathematics, Sulba Sutras geometry, Panini formal linguistics, metallurgy (Wootz steel), and water harvesting.",
      modules: "4 Modules • IKS Foundations",
      badge: "Knowledge Systems",
    },
  ];

  const features = [
    {
      title: "LaTeX-Rendered Study Notes",
      desc: "Handcrafted chapter notes with crisp mathematical derivations, matrices, and syntax-highlighted code.",
      tag: "Notes & Derivations",
      icon: "📄",
    },
    {
      title: "1:1 Human + Internship & Career Support",
      desc: "Exclusive to Tier 2 (₹199): direct 1:1 human mentor sessions, resume/GitHub portfolio reviews, internship referrals, and career roadmap guidance.",
      tag: "Only in ₹199 Tier 2",
      icon: "🚀",
    },
    {
      title: "Past Papers & PYQ Explorer",
      desc: "Categorized past year questions with complete step-by-step marking scheme answers and frequent exam tags.",
      tag: "Exam Solved",
      icon: "📚",
    },
    {
      title: "Topic-Wise Quiz Arena",
      desc: "Rapid conceptual MCQs and numericals with instant submission confirmation and full faculty explanations.",
      tag: "Test Arena",
      icon: "⚡",
    },
    {
      title: "24/7 AI Doubt Solver",
      desc: "Instant breakdown of dense proofs, equations, or code syntax trained specifically on your B.Tech syllabus.",
      tag: "AI Copilot",
      icon: "🤖",
    },
    {
      title: "Python Coding Lab",
      desc: "Browser-based Python environment with explicit Input/Output examples, unit test grading, and error explanations.",
      tag: "Interactive Lab",
      icon: "💻",
    },
    {
      title: "BEE & Python Simulations",
      desc: "Visual circuit interactive models and Python call-stack tracers to understand what equations actually do.",
      tag: "Simulations",
      icon: "🔬",
    },
    {
      title: "SGPA, CGPA & Rank Tools",
      desc: "Free 10-point AICTE SGPA/CGPA calculators and Gaussian cohort rank & percentile estimators.",
      tag: "Free Utilities",
      icon: "🎯",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "WhatsApp Number Signup",
      desc: "One-click OTP login via your Indian WhatsApp number. No passwords, no verification link delays.",
    },
    {
      num: "02",
      title: "Select Semester 1",
      desc: "Immediate access to ACM, Python, BEE, and COA arranged cleanly in modular syllabi.",
    },
    {
      num: "03",
      title: "Learn & Review High-Yield Notes",
      desc: "Read university-specific LaTeX notes and derivations distilled down to exam-essential concepts.",
    },
    {
      num: "04",
      title: "Solve Past Papers & Quizzes",
      desc: "Practice previous year questions unit-by-unit with step-by-step marking rubrics.",
    },
    {
      num: "05",
      title: "Premium AI + 1:1 Human Support",
      desc: "Get instant 24/7 AI clarification or upgrade to Tier 2 (₹199) for direct 1:1 human mentor support.",
    },
    {
      num: "06",
      title: "Track Progress & Secure Your 9+ CGPA",
      desc: "Monitor chapter mastery, calculate internal requirements, and ace your end-sems.",
    },
  ];

  const faqs = [
    {
      q: "How does the 3-Tier Financial Model work?",
      a: "Tier 0 gives the first 10 students 100% FREE access as our Founding Beta Testers in exchange for direct product feedback and testimonials. Tier 1 (₹99) unlocks Basic Access (all six currently listed subjects, available LaTeX notes, PYQs, quizzes, and simulations). Tier 2 (₹199) unlocks Premium AI Help + 1:1 Human Support + Exclusive Internship & Career Support.",
    },
    {
      q: "Is Internship and Career Support included in all plans?",
      a: "No — Internship and Career Support (1:1 resume & GitHub portfolio reviews, AI/ML internship referrals, GSoC/hackathon prep, and career roadmap mentorship) is provided ONLY in the Tier 2 (₹199) package.",
    },
    {
      q: "Are the SGPA/CGPA and Rank Percentile calculators free?",
      a: "Yes! Both the SGPA & Multi-Semester CGPA Calculator and the Batch Rank & Percentile Predictor are 100% free and accessible directly from the top navigation bar without logging in.",
    },
    {
      q: "What subjects are included in Semester 1?",
      a: "All passes cover the six currently listed Semester 1 subjects: Applied Computational Mathematics (CSE1001), Basic Electrical and Electronics Engineering (CSE1002), Computer Organization and Architecture (CSE1003), Fundamentals of Web Technologies (CSE1004), Python Programming (CSE1005), and Indian Science, Engineering and Technology (CSE1006). Access includes available materials; some topic notes are not available yet.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PrepMeUpNav />

      {/* 1. HERO SECTION */}
      <section className="pmu-section" style={{ overflow: "hidden" }}>
        <div className="pmu-glow" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        <div className="pmu-container" style={{ position: "relative", textAlign: "center" }}>
          <div style={{ maxWidth: "56rem", marginLeft: "auto", marginRight: "auto" }}>
            <div>
              <div className="pmu-pill-accent">
                <span
                  style={{
                    width: "0.4375rem",
                    height: "0.4375rem",
                    borderRadius: "9999px",
                    backgroundColor: "#ff3b1d",
                  }}
                />
                <span>B.Tech CSE AI/ML • Semester 1</span>
              </div>
            </div>

            <h1 className="pmu-hero-title">
              PREPMEUP <span style={{ color: "#ff3b1d" }}>AI</span>
            </h1>

            <p
              style={{
                maxWidth: "46rem",
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "1.5rem",
                fontSize: "1.0625rem",
                lineHeight: 1.65,
                color: "#a19f95",
              }}
            >
              The dedicated academic learning copilot for first-year engineering students.
              LaTeX-typeset notes, solved PYQs, adaptive quizzes, interactive simulations,
              and <strong>Tier 0 Free Beta Access (First 10)</strong>, <strong>Tier 1 Basic Access (₹99)</strong>,
              or <strong>Tier 2 (₹199): Premium AI + 1:1 Human Support + Exclusive Internship &amp; Career Support</strong>.
            </p>

            <div
              style={{
                marginTop: "2.25rem",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <Link href="#pricing" className="pmu-btn-primary">
                Claim Tier 0 Free Beta / View Pricing →
              </Link>
              <Link href="/prepmeup/tools/cgpa" className="pmu-btn-secondary">
                🎯 SGPA &amp; CGPA Calculator
              </Link>
              <Link href="/prepmeup/tools/rank-percentile" className="pmu-btn-secondary">
                🏆 Exam Rank &amp; Percentile Predictor
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pmu-metrics-grid">
              <div>
                <p className="font-display" style={{ fontSize: "2.25rem", lineHeight: 1, color: "#ff3b1d" }}>
                  ₹0
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#807f78" }}>
                  Tier 0: First 10 Free
                </p>
              </div>
              <div>
                <p className="font-display" style={{ fontSize: "2.25rem", lineHeight: 1, color: "#f3f1ea" }}>
                  ₹99
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#807f78" }}>
                  Tier 1: Basic Access
                </p>
              </div>
              <div>
                <p className="font-display" style={{ fontSize: "2.25rem", lineHeight: 1, color: "#ff3b1d" }}>
                  ₹199
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#807f78" }}>
                  Tier 2: AI + 1:1 Human
                </p>
              </div>
              <div>
                <p className="font-display" style={{ fontSize: "2.25rem", lineHeight: 1, color: "#f3f1ea" }}>
                  24/7
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#807f78" }}>
                  AI + Human Mentors
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HIGH-VISIBILITY ACADEMIC CALCULATORS SPOTLIGHT */}
      <section id="calculators" className="pmu-section" style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem", backgroundColor: "#0c0c10" }}>
        <div className="pmu-container">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <SectionEyebrow>100% Free Academic Utilities • No Login Needed</SectionEyebrow>
              <h2 className="pmu-section-title">SGPA, CGPA &amp; Exam Rank Calculators</h2>
              <p className="pmu-section-lead">
                Instantly compute your Semester 1 SGPA, multi-semester cumulative CGPA, or predict your batch rank and percentile.
              </p>
            </div>
          </div>

          <div className="pmu-grid-2">
            <div className="pmu-card-highlight" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="pmu-badge">🎯 10-Point AICTE Formula</span>
                  <span className="font-mono" style={{ fontSize: "12px", color: "#4ade80", fontWeight: 700 }}>
                    SGPA + Multi-Sem CGPA
                  </span>
                </div>
                <h3 className="font-display" style={{ marginTop: "1rem", fontSize: "1.875rem", textTransform: "uppercase", color: "#f3f1ea" }}>
                  SGPA &amp; Cumulative CGPA Calculator
                </h3>
                <p style={{ marginTop: "0.625rem", fontSize: "0.875rem", lineHeight: 1.65, color: "#a19f95" }}>
                  Map your subject credits and expected letter grades (O, A+, A, B+) to compute your exact Semester SGPA and combine multiple semesters to project your overall B.Tech CGPA.
                </p>
              </div>
              <Link href="/prepmeup/tools/cgpa" className="pmu-btn-primary" style={{ width: "100%" }}>
                Open SGPA &amp; CGPA Calculator →
              </Link>
            </div>

            <div className="pmu-card-highlight" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.5rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="pmu-badge">🏆 Gaussian Cohort Curve</span>
                  <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d", fontWeight: 700 }}>
                    Instant Percentile &amp; Rank
                  </span>
                </div>
                <h3 className="font-display" style={{ marginTop: "1rem", fontSize: "1.875rem", textTransform: "uppercase", color: "#f3f1ea" }}>
                  Exam Rank &amp; Percentile Predictor
                </h3>
                <p style={{ marginTop: "0.625rem", fontSize: "0.875rem", lineHeight: 1.65, color: "#a19f95" }}>
                  Enter your internal assessment or end-sem score, class average, and batch size to predict your exact cohort percentile and estimated rank standing.
                </p>
              </div>
              <Link href="/prepmeup/tools/rank-percentile" className="pmu-btn-primary" style={{ width: "100%" }}>
                Open Exam Rank &amp; Percentile Predictor →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SUBJECTS SECTION */}
      <section id="subjects" className="pmu-section">
        <div className="pmu-container">
          <div style={{ maxWidth: "42rem" }}>
            <SectionEyebrow>Curriculum</SectionEyebrow>
            <h2 className="pmu-section-title">Semester 1 Subjects</h2>
            <p className="pmu-section-lead">
              Comprehensive coverage designed specifically around university syllabus patterns, LaTeX mathematical derivations, and practical labs.
            </p>
          </div>

          <div className="pmu-grid-3" style={{ marginTop: "3rem" }}>
            {subjects.map((sub) => (
              <div key={sub.code} className="pmu-card">
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span className="font-mono" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#807f78" }}>
                      {sub.code}
                    </span>
                    <span className="pmu-badge">{sub.badge}</span>
                  </div>
                  <h3
                    className="font-display"
                    style={{
                      marginTop: "1rem",
                      fontSize: "1.25rem",
                      lineHeight: 1.2,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      color: "#f3f1ea",
                    }}
                  >
                    {sub.name}
                  </h3>
                  <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", lineHeight: 1.6, color: "#807f78" }}>
                    {sub.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(243,241,234,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#807f78" }}>{sub.modules}</span>
                  <Link
                    href={`/prepmeup/subjects/${sub.slug}`}
                    style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ff3b1d", textDecoration: "none" }}
                  >
                    Open Notes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="pmu-section">
        <div className="pmu-container">
          <div style={{ textAlign: "center", maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }}>
            <SectionEyebrow centered>Everything You Need</SectionEyebrow>
            <h2 className="pmu-section-title">Engineered For Engineering Top Grades</h2>
            <p className="pmu-section-lead">
              No fluff, no 40-hour repetitive generic bootcamps. Just pure exam-focused preparation with AI tools and 1-on-1 live mentorship.
            </p>
          </div>

          <div className="pmu-grid-4" style={{ marginTop: "3rem" }}>
            {features.map((feat) => (
              <div key={feat.title} className="pmu-card">
                <div>
                  <div style={{ fontSize: "1.75rem", marginBottom: "0.875rem", lineHeight: 1 }}>
                    {feat.icon}
                  </div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#ff3b1d",
                    }}
                  >
                    {feat.tag}
                  </span>
                  <h3
                    className="font-display"
                    style={{
                      marginTop: "0.375rem",
                      fontSize: "1.1875rem",
                      lineHeight: 1.2,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      color: "#f3f1ea",
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p style={{ marginTop: "0.625rem", fontSize: "0.8125rem", lineHeight: 1.6, color: "#807f78" }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="pmu-section">
        <div className="pmu-container">
          <div style={{ maxWidth: "42rem" }}>
            <SectionEyebrow>Step By Step</SectionEyebrow>
            <h2 className="pmu-section-title">How PrepMeUp AI Works</h2>
            <p className="pmu-section-lead">
              From joining in seconds to walking into final exams with absolute confidence.
            </p>
          </div>

          <div className="pmu-grid-3" style={{ marginTop: "3rem" }}>
            {steps.map((step) => (
              <div
                key={step.num}
                style={{
                  position: "relative",
                  borderLeft: "2px solid rgba(255,59,29,0.35)",
                  paddingLeft: "1.5rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                }}
              >
                <span className="font-display" style={{ fontSize: "2rem", lineHeight: 1, color: "#ff3b1d" }}>
                  {step.num}
                </span>
                <h3
                  className="font-display"
                  style={{
                    marginTop: "0.625rem",
                    fontSize: "1.1875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    color: "#f3f1ea",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", lineHeight: 1.6, color: "#807f78" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION: TIER 0 (FREE BETA), TIER 1 (₹99 BASIC), TIER 2 (₹199 PREMIUM AI + 1:1 HUMAN) */}
      <section id="pricing" className="pmu-section">
        <div className="pmu-container">
          <div style={{ textAlign: "center", maxWidth: "46rem", marginLeft: "auto", marginRight: "auto" }}>
            <SectionEyebrow centered>Student-First 3-Tier Financial Model</SectionEyebrow>
            <h2 className="pmu-section-title">Tier 0 (Free Beta) • Tier 1 (₹99) • Tier 2 (₹199)</h2>
            <p className="pmu-section-lead">
              First 10 students join FREE as our Beta Testers &amp; Testimonials Cohort. Or unlock Tier 1 Basic Access (₹99) and Tier 2 Premium AI Help + 1:1 Human Support (₹199).
            </p>
          </div>

          <div className="pmu-grid-3" style={{ marginTop: "3rem", alignItems: "stretch" }}>
            {/* TIER 0: First 10 Students FREE (Beta Testers & Testimonials) */}
            <div className="pmu-card-highlight">
              <div
                style={{
                  position: "absolute",
                  top: "-0.875rem",
                  right: "1.5rem",
                  borderRadius: "9999px",
                  backgroundColor: "#ff3b1d",
                  padding: "0.25rem 0.875rem",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#08080a",
                }}
              >
                Tier 0 • First 10 Students FREE
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ff3b1d" }}>
                    Tier 0: Beta &amp; Testimonials
                  </span>
                  <span className="pmu-badge">First 10 Only</span>
                </div>

                <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
                  <span className="font-display" style={{ fontSize: "3rem", lineHeight: 1, color: "#ff3b1d" }}>
                    ₹0
                  </span>
                  <span style={{ fontSize: "0.9375rem", color: "#807f78", textDecoration: "line-through" }}>
                    ₹199
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "#4ade80", fontWeight: 700 }}>100% FREE</span>
                </div>

                <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", lineHeight: 1.55, color: "#a19f95" }}>
                  Reserved for our first 10 founding beta testers. Unlock full access free in exchange for honest product feedback &amp; a student testimonial:
                </p>

                <div style={{ marginTop: "1rem" }}>
                  <PricingClaimForm />
                </div>
              </div>
            </div>

            {/* TIER 1: ₹99 Basic Access */}
            <div className="pmu-card-pricing">
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f3f1ea" }}>
                    Tier 1: Basic Access
                  </span>
                  <span className="pmu-badge">Self-Paced</span>
                </div>

                <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span className="font-display" style={{ fontSize: "3rem", lineHeight: 1, color: "#f3f1ea" }}>
                    ₹99
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "#807f78" }}>/ full semester</span>
                </div>

                <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", lineHeight: 1.55, color: "#a19f95" }}>
                  Self-paced study across all six currently listed Semester 1 subjects. Some topic notes are not available yet.
                </p>

                <ul
                  style={{
                    marginTop: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    fontSize: "0.8125rem",
                    color: "#a19f95",
                    listStyle: "none",
                    padding: 0,
                  }}
                >
                  <li><span style={{ color: "#ff3b1d", fontWeight: 700 }}>✓</span> All Six Currently Listed Semester 1 Subjects</li>
                  <li><span style={{ color: "#ff3b1d", fontWeight: 700 }}>✓</span> Available LaTeX Study Notes (Sample + Non-Sample)</li>
                  <li><span style={{ color: "#ff3b1d", fontWeight: 700 }}>✓</span> Solved University Past Papers (PYQ Key)</li>
                  <li><span style={{ color: "#ff3b1d", fontWeight: 700 }}>✓</span> Topic-wise Practice Quizzes &amp; Grading</li>
                  <li><span style={{ color: "#ff3b1d", fontWeight: 700 }}>✓</span> Interactive BEE &amp; Python Simulations</li>
                  <li style={{ color: "#52525b" }}><span style={{ color: "#52525b", fontWeight: 700 }}>✕</span> No 1:1 Human Mentorship (Tier 2 Only)</li>
                  <li style={{ color: "#52525b" }}><span style={{ color: "#52525b", fontWeight: 700 }}>✕</span> No Internship &amp; Career Support (₹199 Only)</li>
                </ul>
              </div>

              <div style={{ marginTop: "2rem", paddingTop: "1rem" }}>
                <Link href="/prepmeup/checkout?tier=tier1" className="pmu-btn-secondary" style={{ width: "100%" }}>
                  Pay ₹99 via Razorpay (Tier 1) →
                </Link>
              </div>
            </div>

            {/* TIER 2: ₹199 Premium AI Help + 1:1 Human Support + Exclusive Internship & Career Support */}
            <div className="pmu-card-pricing" style={{ borderColor: "rgba(255,106,61,0.65)", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: "-0.875rem",
                  right: "1.5rem",
                  borderRadius: "9999px",
                  backgroundColor: "#4ade80",
                  padding: "0.25rem 0.875rem",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#08080a",
                }}
              >
                ★ Includes Internship &amp; Career Support
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ff6a3d" }}>
                    Tier 2: AI + 1:1 + Career
                  </span>
                  <span className="pmu-badge pmu-badge-accent">₹199 Exclusive</span>
                </div>

                <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span className="font-display" style={{ fontSize: "3rem", lineHeight: 1, color: "#f3f1ea" }}>
                    ₹199
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "#ff6a3d", fontWeight: 600 }}>
                    / semester (All-In + Career)
                  </span>
                </div>

                <ul
                  style={{
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    fontSize: "0.78rem",
                    color: "#d4d2c8",
                    listStyle: "none",
                    padding: 0,
                  }}
                >
                  <li><span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span> <strong>Everything in Tier 1 (₹99) Included</strong></li>
                  <li><span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span> <strong>Unlimited 24/7 Premium AI Doubt Copilot</strong></li>
                  <li><span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span> <strong>Python Lab + AI Line-by-Line Debugger</strong></li>
                  <li><span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span> <strong>30-minute 1:1 Human Video Mentorship</strong></li>
                  <li
                    style={{
                      marginTop: "2px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid rgba(74,222,128,0.35)",
                      backgroundColor: "rgba(34,197,94,0.1)",
                      color: "#86efac",
                    }}
                  >
                    <span style={{ color: "#4ade80", fontWeight: 800 }}>★ ONLY IN ₹199:</span>{" "}
                    <strong>Internship &amp; Career Support</strong> (Resume &amp; GitHub Review, Referrals &amp; Roadmap)
                  </li>
                </ul>

                <div style={{ marginTop: "0.75rem", borderTop: "1px solid rgba(243,241,234,0.1)", paddingTop: "0.875rem" }}>
                  <VideoSessionBookingForm />
                </div>
              </div>
            </div>
          </div>

          {/* Founding Beta Testers & Testimonials Wall */}
          <div
            style={{
              marginTop: "3.5rem",
              padding: "2rem",
              borderRadius: "1rem",
              border: "1px solid rgba(243,241,234,0.12)",
              backgroundColor: "#111114",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <span className="pmu-badge pmu-badge-accent">Founding Beta Cohort (Tier 0 Testimonials)</span>
                <h3 className="font-display" style={{ marginTop: "0.5rem", fontSize: "1.65rem", textTransform: "uppercase", color: "#f3f1ea" }}>
                  What Our First 10 Beta Testers Say
                </h3>
              </div>
              <span className="font-mono" style={{ fontSize: "12px", color: "#4ade80", fontWeight: 700 }}>
                ★ 4.9 / 5.0 Verified Beta Feedback
              </span>
            </div>

            <div className="pmu-grid-3">
              {[
                {
                  quote: "The rendered LaTeX derivations for Cayley-Hamilton and RK4 in ACM-101 saved me hours before my mid-sem exam.",
                  author: "Aarav K. • Beta Seat #01",
                  meta: "B.Tech CSE AI/ML • Sem 1",
                },
                {
                  quote: "Interactive BEE KVL/KCL simulations plus the 1:1 human mentor call made mesh analysis click in 20 minutes.",
                  author: "Sneha R. • Beta Seat #02",
                  meta: "B.Tech CSE AI/ML • Sem 1",
                },
                {
                  quote: "Having sample Input/Output test cases and step-by-step error explanations in the Python lab is a game changer.",
                  author: "Rohan M. • Beta Seat #03",
                  meta: "B.Tech CSE AI/ML • Sem 1",
                },
              ].map((item) => (
                <div
                  key={item.author}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(243,241,234,0.08)",
                    backgroundColor: "#08080a",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "0.875rem",
                  }}
                >
                  <p style={{ fontSize: "0.8125rem", lineHeight: 1.6, color: "#d4d2c8", fontStyle: "italic" }}>
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div style={{ borderTop: "1px solid rgba(243,241,234,0.08)", paddingTop: "0.625rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ff6a3d" }}>{item.author}</div>
                    <div className="font-mono" style={{ fontSize: "0.6875rem", color: "#807f78" }}>{item.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="pmu-section">
        <div className="pmu-container">
          <div style={{ textAlign: "center", maxWidth: "42rem", marginLeft: "auto", marginRight: "auto" }}>
            <SectionEyebrow centered>Frequently Asked Questions</SectionEyebrow>
            <h2 className="pmu-section-title">Got Questions? We Have Answers.</h2>
          </div>

          <div
            style={{
              marginTop: "3rem",
              maxWidth: "52rem",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                style={{
                  paddingTop: "1.5rem",
                  paddingBottom: "1.5rem",
                  borderTop: idx === 0 ? "none" : "1px solid rgba(243,241,234,0.1)",
                }}
              >
                <h3
                  className="font-display"
                  style={{
                    fontSize: "1.1875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    color: "#f3f1ea",
                  }}
                >
                  {faq.q}
                </h3>
                <p style={{ marginTop: "0.625rem", fontSize: "0.875rem", lineHeight: 1.65, color: "#807f78" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <PrepMeUpFooter />
    </div>
  );
}
