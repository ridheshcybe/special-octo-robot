"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ContentProtection } from "../_components/ContentProtection";
import { DailyNotificationBanner } from "../_components/DailyNotificationBanner";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/prepmeup/dashboard", icon: "📊" },
  { label: "1:1 Mentorship", href: "/prepmeup/sessions", icon: "📅" },
  { label: "Subjects", href: "/prepmeup/subjects", icon: "📚" },
  { label: "AI Doubt Solver", href: "/prepmeup/doubts", icon: "🤖" },
  { label: "Quizzes", href: "/prepmeup/quizzes", icon: "⚡" },
  { label: "Coding Lab", href: "/prepmeup/coding", icon: "💻" },
  { label: "Simulations", href: "/prepmeup/simulations", icon: "🔬" },
  { label: "Progress", href: "/prepmeup/progress", icon: "📈" },
  { label: "SGPA Calculator", href: "/prepmeup/tools/cgpa", icon: "🎯" },
  { label: "Rank & Percentile", href: "/prepmeup/tools/rank-percentile", icon: "🏆" },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{
    phone?: string;
    fullName?: string;
    college?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/prepmeup/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser({
            phone: data.user.phone,
            fullName: data.user.profile?.fullName,
            college: data.user.profile?.college,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/prepmeup/auth/logout", { method: "POST" });
    router.push("/prepmeup/login");
  };

  return (
    <div className="pmu-student-shell">
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="pmu-student-sidebar">
        <div>
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(243,241,234,0.1)",
              paddingBottom: "1rem",
            }}
          >
            <Link href="/prepmeup" className="pmu-brand-logo">
              <span className="pmu-brand-mark">P</span>
              <span className="pmu-brand-title">
                PREPMEUP <span style={{ color: "#ff3b1d" }}>AI</span>
              </span>
            </Link>
          </div>

          {/* Student Status Badge */}
          <div
            style={{
              marginTop: "1rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(255,59,29,0.3)",
              backgroundColor: "rgba(255,59,29,0.06)",
              padding: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#ff3b1d",
                }}
              >
                Semester 1 Active
              </span>
              <span
                style={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "9999px",
                  backgroundColor: "#ff3b1d",
                }}
              />
            </div>
            <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", fontWeight: 600, color: "#f3f1ea" }}>
              B.Tech CSE AI/ML
            </p>
            <p style={{ fontSize: "0.6875rem", color: "#807f78" }}>Engineering Pass (Active)</p>
          </div>

          {/* Navigation Links */}
          <nav
            style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}
            aria-label="Student Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/prepmeup/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    borderRadius: "0.375rem",
                    padding: "0.5625rem 0.75rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderLeft: active ? "2px solid #ff3b1d" : "2px solid transparent",
                    backgroundColor: active ? "#17171b" : "transparent",
                    color: active ? "#f3f1ea" : "#807f78",
                    transition: "background-color 0.2s ease, color 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "1rem" }} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Backlinks Footer */}
        <div style={{ borderTop: "1px solid rgba(243,241,234,0.1)", paddingTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  height: "2rem",
                  width: "2rem",
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  backgroundColor: "#17171b",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#ff3b1d",
                }}
              >
                {user?.fullName?.slice(0, 2).toUpperCase() || "ST"}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#f3f1ea",
                  }}
                >
                  {user?.fullName || "Student Account"}
                </p>
                <p
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "0.6875rem",
                    color: "#807f78",
                  }}
                >
                  {user?.phone || "WhatsApp Verified"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#807f78" }}
              title="Log Out"
            >
              Sign out
            </button>
          </div>
          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.6875rem",
              color: "#807f78",
            }}
          >
            <Link href="/prepmeup" className="hover:text-[#ff3b1d]">
              Home
            </Link>
            <Link href="/" className="hover:text-[#f3f1ea]">
              Portfolio ↗
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Viewport */}
      <div className="pmu-student-main-wrap">
        <DailyNotificationBanner />
        {/* Topbar */}
        <header className="pmu-student-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden"
              style={{
                display: "flex",
                height: "2rem",
                width: "2rem",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.25rem",
                border: "1px solid rgba(243,241,234,0.15)",
                color: "#f3f1ea",
              }}
              aria-label="Toggle Navigation Drawer"
            >
              <svg style={{ width: "1rem", height: "1rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#807f78",
              }}
            >
              Semester 1 &gt;
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#f3f1ea",
              }}
            >
              {NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label ?? "Student Hub"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              className="hidden sm:flex"
              style={{
                alignItems: "center",
                gap: "0.375rem",
                borderRadius: "9999px",
                border: "1px solid rgba(243,241,234,0.15)",
                backgroundColor: "#111114",
                padding: "0.25rem 0.75rem",
                fontSize: "0.6875rem",
                color: "#807f78",
              }}
            >
              <span
                style={{
                  width: "0.375rem",
                  height: "0.375rem",
                  borderRadius: "9999px",
                  backgroundColor: "#10b981",
                }}
              />
              Verified Syllabus 2025–26
            </span>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                borderRadius: "0.25rem",
                border: "1px solid rgba(243,241,234,0.15)",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#807f78",
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div
            className="lg:hidden"
            style={{
              borderBottom: "1px solid rgba(243,241,234,0.1)",
              backgroundColor: "#111114",
              padding: "1rem 1.25rem",
            }}
          >
            <nav style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.5rem" }}>
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      borderRadius: "0.375rem",
                      padding: "0.5rem 0.625rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      backgroundColor: active ? "#ff3b1d" : "transparent",
                      color: active ? "#08080a" : "#807f78",
                    }}
                  >
                    <span>{item.icon}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <main className="pmu-student-content">
          <ContentProtection studentName={user?.fullName} studentPhone={user?.phone}>
            {children}
          </ContentProtection>
        </main>
      </div>
    </div>
  );
}
