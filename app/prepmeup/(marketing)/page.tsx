import Link from "next/link";
import { PrepMeUpNav } from "../_components/PrepMeUpNav";
import { PrepMeUpFooter } from "../_components/PrepMeUpFooter";
import { CalendarBookingScheduler } from "../_components/CalendarBookingScheduler";
import { PrepMeUpHero3D } from "../_components/PrepMeUpHero3D";

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
      desc: "Linear algebra, rank and echelon forms, multivariable calculus, ordinary differential equations, and vector calculus.",
      modules: "5 modules • LaTeX notes",
      badge: "Semester 1 core",
    },
    {
      name: "Basic Electrical & Electronics Engg",
      slug: "basic-electrical-and-electronics-engineering",
      code: "CSE1002",
      desc: "DC/AC theorems, PN junction diodes, rectifiers, BJT & MOSFET switches/amplifiers, and op-amps.",
      modules: "5 modules • Lab manual",
      badge: "Hardware labs",
    },
    {
      name: "Computer Organization & Architecture",
      slug: "computer-organization-and-architecture",
      code: "CSE1003",
      desc: "Von Neumann vs Harvard, 8 great ideas, Booth multiplication, instruction pipelining, and cache hierarchy.",
      modules: "5 modules • Assignments",
      badge: "Core architecture",
    },
    {
      name: "Fundamentals of Web Technologies",
      slug: "fundamentals-of-web-technologies",
      code: "CSE1004",
      desc: "Internet protocols, HTTP/HTTPS, semantic HTML5, modern CSS3 flexbox/grid, JavaScript DOM, and full-stack deployment.",
      modules: "5 modules • Practicals",
      badge: "Full-stack labs",
    },
    {
      name: "Python Programming",
      slug: "python-programming",
      code: "CSE1005",
      desc: "Dynamic typing, control flow, functions, dictionaries, regex, OOP design, and scientific computing (NumPy & Pandas).",
      modules: "5 modules • Exercises",
      badge: "Coding lab",
    },
    {
      name: "Indian Science, Engg & Technology",
      slug: "indian-science-engineering-and-technology",
      code: "CSE1006",
      desc: "Ancient Indian mathematics, Sulba Sutras geometry, Panini formal linguistics, metallurgy (Wootz steel), and water harvesting.",
      modules: "5 modules • IKS foundations",
      badge: "Knowledge systems",
    },
  ];

  const features = [
    {
      title: "LaTeX-rendered study notes",
      desc: "Handcrafted chapter notes with mathematical derivations, matrices, and syntax-highlighted code.",
      tag: "Notes & derivations",
    },
    {
      title: "1:1 human mentorship & career guidance",
      desc: "Exclusive to Tier 2 (₹199): 1:1 human mentor sessions, resume/GitHub portfolio reviews, and career roadmap guidance.",
      tag: "Tier 2 pass",
    },
    {
      title: "Past papers & question explorer",
      desc: "Paper and solution sources are not available yet. Use your institution's original materials until source-backed resources are added.",
      tag: "Catalog status",
    },
    {
      title: "Topic-wise quiz arena",
      desc: "Rapid conceptual MCQs and numericals with instant submission confirmation and explanations.",
      tag: "Practice arena",
    },
    {
      title: "Syllabus AI assistant",
      desc: "Clarification of proofs, equations, and code syntax trained specifically on your B.Tech syllabus.",
      tag: "AI assistant",
    },
    {
      title: "Python coding lab",
      desc: "Browser-based Python environment with test cases, execution feedback, and syntax guidance.",
      tag: "Interactive lab",
    },
    {
      title: "BEE & Python simulations",
      desc: "Interactive circuit models and Python call-stack tracers to inspect computational flow.",
      tag: "Simulations",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Email verification sign-in",
      desc: "One-click 6-digit access code sent directly to your student email. Fast, secure, and passwordless.",
    },
    {
      num: "02",
      title: "Select your semester subject",
      desc: "Immediate access to ACM, Python, BEE, and COA arranged cleanly in modular syllabi.",
    },
    {
      num: "03",
      title: "Review high-yield notes",
      desc: "Read syllabus-aligned LaTeX notes and derivations distilled down to essential academic concepts.",
    },
    {
      num: "04",
      title: "Practice available quizzes",
      desc: "Practice available quizzes. Source-backed university papers and solution keys are not available yet.",
    },
    {
      num: "05",
      title: "Study assistance & mentorship",
      desc: "Get instant doubt clarification or opt for direct 1:1 human mentor support via Tier 2 / Tier 3.",
    },
    {
      num: "06",
      title: "Track semester progress",
      desc: "Monitor topic mastery, review problem sets, and prepare steadily for semester examinations.",
    },
  ];

  const faqs = [
    {
      q: "How does the 3-tier financial model work?",
      a: "Tier 1 (₹99) provides basic access (all six currently listed Semester 1 subjects, LaTeX notes, paper resources, quizzes, and simulations). Tier 2 (₹199) unlocks premium AI help, 1 included 1:1 human video session, and career roadmap guidance. Tier 3 (₹499) unlocks 1:1 live video mentorship sessions with calendar booking and subject mentors.",
    },
    {
      q: "Is career support included in all plans?",
      a: "No. Internship and career support (resume and portfolio review) is provided only in the Tier 2 (₹199) package.",
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
      <section className="pmu-section" style={{ overflow: "hidden", position: "relative" }}>
        <PrepMeUpHero3D showCanvas={false} />

        <div className="pmu-container" style={{ position: "relative", textAlign: "center" }}>
          <div style={{ maxWidth: "54rem", marginLeft: "auto", marginRight: "auto" }}>
            <div>
              <div className="pmu-pill-accent">
                <span
                  style={{
                    width: "0.375rem",
                    height: "0.375rem",
                    borderRadius: "9999px",
                    backgroundColor: "#C2331B",
                  }}
                />
                <span>B.Tech CSE AI/ML • Semester 1 curriculum</span>
              </div>
            </div>

            <h1 className="pmu-hero-title">
              PrepMeUp <span style={{ color: "#C2331B" }}>AI</span>
            </h1>

            <p
              style={{
                maxWidth: "40rem",
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "1.25rem",
                fontSize: "1.0625rem",
                lineHeight: 1.6,
                color: "#6F6B62",
              }}
            >
              The academic copilot for engineering students. LaTeX-typeset notes across 6 core subjects, interactive browser simulations, and structured faculty mentorship.
            </p>

            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.875rem",
              }}
            >
              <Link href="/prepmeup/subjects" className="pmu-btn-primary">
                Explore Semester 1
              </Link>
              <Link href="/prepmeup/tracks" className="pmu-btn-secondary">
                View learning tracks
              </Link>
            </div>

            {/* Metrics Bar */}
            <div className="pmu-metrics-grid">
              <div>
                <p style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1, color: "#1C1A17" }}>
                  6
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "#6F6B62" }}>
                  Core subjects
                </p>
              </div>
              <div>
                <p style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1, color: "#1C1A17" }}>
                  30
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "#6F6B62" }}>
                  Curriculum modules
                </p>
              </div>
              <div>
                <p style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1, color: "#1C1A17" }}>
                  93
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "#6F6B62" }}>
                  Topic notes
                </p>
              </div>
              <div>
                <p style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1, color: "#1C1A17" }}>
                  17
                </p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "#6F6B62" }}>
                  Interactive simulations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKS UNDER CONSTRUCTION BANNER */}
      <section style={{ borderBottom: "1px solid #E8E4DB", backgroundColor: "#F4F2ED", padding: "1.5rem" }}>
        <div className="pmu-container">
          <div className="pmu-card" style={{ padding: "1.25rem 1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
            <div>
              <span className="pmu-badge" style={{ backgroundColor: "#F6E7E3", color: "#C2331B", borderColor: "#E8E4DB" }}>
                Under construction • Coming soon
              </span>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#1C1A17", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                CyberSecurity &amp; Cloud Computing (AWS) tracks
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#6F6B62", margin: 0 }}>
                Both tracks are under construction. Semester 1 B.Tech CSE AI/ML is available now.
              </p>
            </div>
            <Link href="/prepmeup/tracks" className="pmu-btn-secondary">
              View tracks
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SUBJECTS SECTION */}
      <section id="subjects" className="pmu-section">
        <div className="pmu-container">
          <div style={{ maxWidth: "42rem" }}>
            <SectionEyebrow>Curriculum</SectionEyebrow>
            <h2 className="pmu-section-title">Semester 1 subjects</h2>
            <p className="pmu-section-lead">
              Coursework aligned with engineering syllabus patterns, LaTeX mathematical derivations, and practical lab assignments.
            </p>
          </div>

          <div className="pmu-grid-3" style={{ marginTop: "2.5rem" }}>
            {subjects.map((sub) => (
              <div key={sub.code} className="pmu-card">
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span className="font-mono" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6F6B62" }}>
                      {sub.code}
                    </span>
                    <span className="pmu-badge">{sub.badge}</span>
                  </div>
                  <h3
                    style={{
                      marginTop: "0.875rem",
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "#1C1A17",
                    }}
                  >
                    {sub.name}
                  </h3>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", lineHeight: 1.55, color: "#6F6B62" }}>
                    {sub.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #E8E4DB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#6F6B62" }}>{sub.modules}</span>
                  <Link
                    href={`/prepmeup/subjects/${sub.slug}`}
                    style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#C2331B", textDecoration: "none" }}
                  >
                    Open notes →
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
            <SectionEyebrow centered>Curriculum tools</SectionEyebrow>
            <h2 className="pmu-section-title">Built for engineering coursework</h2>
            <p className="pmu-section-lead">
              Targeted study tools focused on academic concepts, laboratory simulators, and structured doubt clearing.
            </p>
          </div>

          <div className="pmu-grid-4" style={{ marginTop: "2.5rem" }}>
            {features.map((feat) => (
              <div key={feat.title} className="pmu-card">
                <div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "#C2331B",
                      textTransform: "uppercase",
                    }}
                  >
                    {feat.tag}
                  </span>
                  <h3
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "1.0625rem",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "#1C1A17",
                    }}
                  >
                    {feat.title}
                  </h3>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", lineHeight: 1.55, color: "#6F6B62" }}>
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
            <SectionEyebrow>Workflow</SectionEyebrow>
            <h2 className="pmu-section-title">How PrepMeUp AI works</h2>
            <p className="pmu-section-lead">
              A structured study cadence from initial onboarding to end-semester examinations.
            </p>
          </div>

          <div className="pmu-grid-3" style={{ marginTop: "2.5rem" }}>
            {steps.map((step) => (
              <div
                key={step.num}
                style={{
                  position: "relative",
                  borderLeft: "2px solid #E8E4DB",
                  paddingLeft: "1.25rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                }}
              >
                <span style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1, color: "#C2331B" }}>
                  {step.num}
                </span>
                <h3
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    color: "#1C1A17",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ marginTop: "0.375rem", fontSize: "0.8125rem", lineHeight: 1.55, color: "#6F6B62" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section id="pricing" className="pmu-section">
        <div className="pmu-container">
          <div style={{ textAlign: "center", maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
            <SectionEyebrow centered>Semester passes</SectionEyebrow>
            <h2 className="pmu-section-title">Tier 1 (₹99) • Tier 2 (₹199) • Tier 3 (₹499)</h2>
            <p className="pmu-section-lead">
              Select an option based on your study requirements: self-paced coursework, AI assistance with career support, or live video mentorship sessions.
            </p>
          </div>

          <div className="pmu-grid-3" style={{ marginTop: "2.5rem", alignItems: "stretch" }}>
            {/* TIER 1: ₹99 Basic Access */}
            <div className="pmu-card-pricing">
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "#1C1A17" }}>
                    Tier 1: Basic access
                  </span>
                  <span className="pmu-badge">Self-paced</span>
                </div>

                <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1, color: "#1C1A17" }}>
                    ₹99
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "#6F6B62" }}>/ semester</span>
                </div>

                <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", lineHeight: 1.55, color: "#6F6B62" }}>
                  Self-paced study across all six currently listed Semester 1 subjects, notes, quizzes, and simulations.
                </p>

                <ul
                  style={{
                    marginTop: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                    fontSize: "0.8125rem",
                    color: "#1C1A17",
                    listStyle: "none",
                    padding: 0,
                  }}
                >
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> Six currently listed Semester 1 subjects</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> LaTeX study notes and derivations</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> Topic-wise practice quizzes</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> Interactive BEE and Python simulations</li>
                  <li style={{ color: "#6F6B62" }}><span style={{ color: "#6F6B62", marginRight: "0.375rem" }}>•</span> 1:1 mentorship not included</li>
                  <li style={{ color: "#6F6B62" }}><span style={{ color: "#6F6B62", marginRight: "0.375rem" }}>•</span> Career portfolio review not included</li>
                </ul>
              </div>

              <div style={{ marginTop: "1.75rem", paddingTop: "1rem", borderTop: "1px solid #E8E4DB" }}>
                <Link href="/prepmeup/checkout?tier=tier1" className="pmu-btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  Select Tier 1 (₹99)
                </Link>
              </div>
            </div>

            {/* TIER 2: ₹199 */}
            <div className="pmu-card-pricing" style={{ borderColor: "#C2331B", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: "-0.75rem",
                  right: "1.25rem",
                  borderRadius: "9999px",
                  backgroundColor: "#F6E7E3",
                  border: "1px solid #E8E4DB",
                  padding: "0.2rem 0.75rem",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "#C2331B",
                }}
              >
                Recommended
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "#C2331B" }}>
                    Tier 2: AI + career
                  </span>
                  <span className="pmu-badge pmu-badge-accent">Popular</span>
                </div>

                <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1, color: "#1C1A17" }}>
                    ₹199
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "#6F6B62" }}>/ semester</span>
                </div>

                <ul
                  style={{
                    marginTop: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                    fontSize: "0.8125rem",
                    color: "#1C1A17",
                    listStyle: "none",
                    padding: 0,
                  }}
                >
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> All Tier 1 access included</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> 24/7 syllabus AI doubt copilot</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> Python lab with test feedback</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> 1 included 1:1 video mentorship session</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> Career and resume guidance</li>
                </ul>
              </div>

              <div style={{ marginTop: "1.75rem", paddingTop: "1rem", borderTop: "1px solid #E8E4DB" }}>
                <Link href="/prepmeup/checkout?tier=tier2" className="pmu-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  Select Tier 2 (₹199)
                </Link>
              </div>
            </div>

            {/* TIER 3: ₹499 */}
            <div className="pmu-card-pricing">
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", color: "#1C1A17" }}>
                    Tier 3: 1:1 Mentorship pass
                  </span>
                  <span className="pmu-badge">Mentorship</span>
                </div>

                <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
                  <span style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1, color: "#1C1A17" }}>
                    ₹499
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "#6F6B62" }}>/ semester</span>
                </div>

                <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", lineHeight: 1.55, color: "#6F6B62" }}>
                  Direct video sessions with subject mentors for detailed problem resolution.
                </p>

                <ul
                  style={{
                    marginTop: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                    fontSize: "0.8125rem",
                    color: "#1C1A17",
                    listStyle: "none",
                    padding: 0,
                  }}
                >
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> Direct 1:1 live video sessions</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> Interactive calendar booking</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> Subject mentors across Maths, BEE, Python, COA</li>
                  <li><span style={{ color: "#C2331B", fontWeight: 600, marginRight: "0.375rem" }}>—</span> All Tier 1 and Tier 2 features included</li>
                </ul>
              </div>

              <div style={{ marginTop: "1.75rem", paddingTop: "1rem", borderTop: "1px solid #E8E4DB" }}>
                <Link href="/prepmeup/checkout?tier=tier3" className="pmu-btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                  Select Tier 3 (₹499)
                </Link>
              </div>
            </div>
          </div>

          {/* Squad Bundle Callout */}
          <div
            className="pmu-card"
            style={{
              marginTop: "2rem",
              padding: "1.5rem 1.75rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.25rem",
              backgroundColor: "#F4F2ED",
            }}
          >
            <div style={{ maxWidth: "42rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="pmu-badge">
                  3-student squad pass
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#6F6B62", fontWeight: 600 }}>
                  ₹449 total (₹149 / student)
                </span>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1C1A17" }}>
                Study squad bundle for 3 students
              </h3>
              <p style={{ marginTop: "4px", fontSize: "0.875rem", color: "#6F6B62", lineHeight: 1.5 }}>
                Your Tier 2 pass activates immediately, and your receipt includes 2 invite codes for your study partners to redeem.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <Link href="/prepmeup/checkout?tier=tier2_squad" className="pmu-btn-primary">
                Get squad pass (₹449)
              </Link>
              <Link href="/prepmeup/checkout?tier=tier2&code=EXAM50" className="pmu-btn-secondary">
                Redeem invite code
              </Link>
            </div>
          </div>

          {/* Interactive Calendar Scheduler */}
          <div style={{ marginTop: "3rem" }}>
            <CalendarBookingScheduler initialTier="guest" />
          </div>

          {/* Catalog Inventory */}
          <div
            style={{
              marginTop: "3rem",
              padding: "1.75rem",
              borderRadius: "10px",
              border: "1px solid #E8E4DB",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <span className="pmu-badge">Catalog inventory</span>
                <h3 style={{ marginTop: "0.375rem", fontSize: "1.25rem", fontWeight: 700, color: "#1C1A17" }}>
                  Semester 1 curriculum inventory
                </h3>
              </div>
              <span className="font-mono" style={{ fontSize: "12px", color: "#6F6B62" }}>
                6 subjects • 30 modules • 93 topic notes • 17 simulators
              </span>
            </div>

            <div className="pmu-grid-3">
              {[
                {
                  spec: "30 modules and 93 LaTeX topic notes across ACM (16), BEE (17), COA (18), Web Technologies (15), Python (17), and IKS (10).",
                  title: "Syllabus note coverage",
                  meta: "CSE1001 – CSE1006",
                },
                {
                  spec: "17 interactive browser simulators covering Ohm's Law, KCL/KVL circuits, AC oscilloscopes, Python call stacks, and CPU pipelines.",
                  title: "Visual laboratory tools",
                  meta: "BEE, COA, Web, ACM, Python & IKS",
                },
                {
                  spec: "Python coding environment with test case evaluation, timed topic quizzes, and syllabus-grounded AI doubt assistance.",
                  title: "Assessment & practice",
                  meta: "Quizzes • Coding lab • AI assistance",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: "1.25rem",
                    borderRadius: "8px",
                    border: "1px solid #E8E4DB",
                    backgroundColor: "#F4F2ED",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <p style={{ fontSize: "0.8125rem", lineHeight: 1.55, color: "#1C1A17" }}>
                    {item.spec}
                  </p>
                  <div style={{ borderTop: "1px solid #E8E4DB", paddingTop: "0.625rem" }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#C2331B" }}>{item.title}</div>
                    <div className="font-mono" style={{ fontSize: "0.6875rem", color: "#6F6B62" }}>{item.meta}</div>
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
            <SectionEyebrow centered>Frequently asked questions</SectionEyebrow>
            <h2 className="pmu-section-title">Common questions</h2>
          </div>

          <div
            style={{
              marginTop: "2.5rem",
              maxWidth: "48rem",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                style={{
                  paddingTop: "1.25rem",
                  paddingBottom: "1.25rem",
                  borderTop: idx === 0 ? "none" : "1px solid #E8E4DB",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 700,
                    color: "#1C1A17",
                  }}
                >
                  {faq.q}
                </h3>
                <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", lineHeight: 1.6, color: "#6F6B62" }}>
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
