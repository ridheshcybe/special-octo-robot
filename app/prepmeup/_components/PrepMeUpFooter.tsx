import Link from "next/link";

export function PrepMeUpFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid #E8E4DB",
        backgroundColor: "#F4F2ED",
        paddingTop: "4rem",
        paddingBottom: "3rem",
      }}
    >
      <div className="pmu-container">
        <div className="pmu-grid-4" style={{ gap: "2.5rem" }}>
          <div style={{ gridColumn: "span 2 / span 2" }} className="md:col-span-2">
            <Link href="/prepmeup" className="pmu-brand-logo">
              <span className="pmu-brand-mark" style={{ width: "1.625rem", height: "1.625rem", fontSize: "0.75rem" }}>
                P
              </span>
              <span className="pmu-brand-title" style={{ fontSize: "1.0625rem" }}>
                PrepMeUp <span>AI</span>
              </span>
            </Link>
            <p
              style={{
                marginTop: "0.875rem",
                maxWidth: "24rem",
                fontSize: "0.875rem",
                lineHeight: 1.6,
                color: "#6F6B62",
              }}
            >
              The academic copilot for B.Tech CSE AI/ML Semester 1 students.
              High-yield notes, PYQ analysis, AI doubt solver, and interactive lab practice.
            </p>
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.75rem",
                color: "#6F6B62",
              }}
            >
              <span>Created with conviction by</span>
              <Link
                href="/"
                style={{ color: "#1C1A17", textDecoration: "underline" }}
                className="hover:text-[#C2331B]"
              >
                Ridhesh Walavalkar
              </Link>
            </div>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'var(--font-onest), "Onest", sans-serif',
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "#1C1A17",
              }}
            >
              Navigation
            </p>
            <ul
              style={{
                marginTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
                fontSize: "0.8125rem",
                color: "#6F6B62",
              }}
            >
              <li>
                <Link href="/prepmeup#subjects" className="hover:text-[#1C1A17]">
                  Semester 1 Subjects
                </Link>
              </li>
              <li>
                <Link href="/prepmeup#features" className="hover:text-[#1C1A17]">
                  Feature Suite
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/pricing" className="hover:text-[#1C1A17]">
                  Pricing &amp; Passes
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/dashboard" className="hover:text-[#1C1A17]">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/admin" className="hover:text-[#1C1A17]">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'var(--font-onest), "Onest", sans-serif',
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "#1C1A17",
              }}
            >
              Legal &amp; Merchant
            </p>
            <ul
              style={{
                marginTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.625rem",
                fontSize: "0.8125rem",
                color: "#6F6B62",
              }}
            >
              <li>
                <Link href="/prepmeup/terms" className="hover:text-[#1C1A17]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/privacy" className="hover:text-[#1C1A17]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/refunds" className="hover:text-[#1C1A17]">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/pricing-policy" className="hover:text-[#1C1A17]">
                  Pricing &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/contact" className="hover:text-[#1C1A17]">
                  Merchant Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            marginTop: "3.5rem",
            paddingTop: "2rem",
            borderTop: "1px solid #E8E4DB",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.75rem",
            color: "#6F6B62",
          }}
        >
          <p>© {new Date().getFullYear()} PrepMeUp AI. All rights reserved.</p>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link href="/" className="hover:text-[#1C1A17]">
              Portfolio Home ↗
            </Link>
            <Link href="/prepmeup#subjects" className="hover:text-[#1C1A17]">
              Curriculum &amp; Syllabus ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
