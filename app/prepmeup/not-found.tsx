import Link from "next/link";

export default function PrepMeUpNotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: 'var(--font-onest, "Onest", sans-serif)',
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          backgroundColor: "#111114",
          border: "1px solid rgba(243, 241, 234, 0.15)",
          padding: "3.5rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-anton, "Anton", sans-serif)',
            fontSize: "clamp(4.5rem, 10vw, 6.5rem)",
            color: "#ff3b1d",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
          }}
        >
          404
        </div>
        <div
          style={{
            fontFamily: 'var(--font-anton, "Anton", sans-serif)',
            fontSize: "1.35rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Resource Not Indexed
        </div>
        <p
          style={{
            color: "#807f78",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          The subject module, syllabus unit, past paper, or quiz identifier you requested does not exist or has been archived.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            width: "100%",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/prepmeup/dashboard"
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "0.85rem 1.5rem",
              backgroundColor: "#ff3b1d",
              color: "#ffffff",
              border: "none",
              fontFamily: 'var(--font-anton, "Anton", sans-serif)',
              fontSize: "1rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textAlign: "center",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/prepmeup/subjects"
            style={{
              flex: 1,
              minWidth: "140px",
              padding: "0.85rem 1.5rem",
              backgroundColor: "transparent",
              color: "#f3f1ea",
              border: "1px solid rgba(243, 241, 234, 0.2)",
              fontFamily: 'var(--font-anton, "Anton", sans-serif)',
              fontSize: "1rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textAlign: "center",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            All Subjects
          </Link>
        </div>
      </div>
    </div>
  );
}
