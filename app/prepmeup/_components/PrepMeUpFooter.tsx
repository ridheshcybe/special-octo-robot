import Link from "next/link";

export function PrepMeUpFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(243,241,234,0.1)",
        backgroundColor: "#08080a",
        paddingTop: "4.5rem",
        paddingBottom: "3.5rem",
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
                PREPMEUP <span style={{ color: "#ff3b1d" }}>AI</span>
              </span>
            </Link>
            <p
              style={{
                marginTop: "0.875rem",
                maxWidth: "24rem",
                fontSize: "0.875rem",
                lineHeight: 1.65,
                color: "#807f78",
              }}
            >
              The dedicated academic copilot for B.Tech CSE AI/ML Semester 1 students.
              High-yield notes, PYQ analysis, AI doubt solver, and interactive lab practice.
            </p>
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.75rem",
                color: "#807f78",
              }}
            >
              <span>Created with conviction by</span>
              <Link
                href="/"
                style={{ color: "#f3f1ea", textDecoration: "underline" }}
                className="hover:text-[#ff3b1d]"
              >
                Ridhesh Walavalkar
              </Link>
            </div>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'var(--font-anton), "Anton", sans-serif',
                fontSize: "0.9375rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#f3f1ea",
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
                color: "#807f78",
              }}
            >
              <li>
                <Link href="/prepmeup#subjects" className="hover:text-[#f3f1ea]">
                  Semester 1 Subjects
                </Link>
              </li>
              <li>
                <Link href="/prepmeup#features" className="hover:text-[#f3f1ea]">
                  Feature Suite
                </Link>
              </li>
              <li>
                <Link href="/prepmeup#pricing" className="hover:text-[#f3f1ea]">
                  Semester Pass (₹99)
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/dashboard" className="hover:text-[#f3f1ea]">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/admin" className="hover:text-[#f3f1ea]">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'var(--font-anton), "Anton", sans-serif',
                fontSize: "0.9375rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#f3f1ea",
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
                color: "#807f78",
              }}
            >
              <li>
                <Link href="/prepmeup/terms" className="hover:text-[#f3f1ea]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/privacy" className="hover:text-[#f3f1ea]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/refunds" className="hover:text-[#f3f1ea]">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/pricing-policy" className="hover:text-[#f3f1ea]">
                  Pricing &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/prepmeup/contact" className="hover:text-[#f3f1ea]">
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
            borderTop: "1px solid rgba(243,241,234,0.1)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.75rem",
            color: "#807f78",
          }}
        >
          <p>© {new Date().getFullYear()} PrepMeUp AI. All rights reserved.</p>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link href="/" className="hover:text-[#f3f1ea]">
              Portfolio Home ↗
            </Link>
            <Link href="/prepmeup#subjects" className="hover:text-[#f3f1ea]">
              Curriculum &amp; Syllabus ↗
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
