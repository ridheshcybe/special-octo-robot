"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ContentProtection } from "../_components/ContentProtection";
import { DailyNotificationBanner } from "../_components/DailyNotificationBanner";

const NAV_ITEMS = [
  { label: "Home", href: "/prepmeup/dashboard" },
  { label: "Subjects", href: "/prepmeup/subjects" },
  { label: "Tracks", href: "/prepmeup/tracks" },
  { label: "AI Tutor", href: "/prepmeup/doubts" },
  { label: "Quizzes", href: "/prepmeup/quizzes" },
  { label: "Coding Lab", href: "/prepmeup/coding" },
  { label: "Simulations", href: "/prepmeup/simulations" },
  { label: "Mentorship", href: "/prepmeup/sessions" },
];

const MOBILE_BOTTOM_NAV = [
  { label: "Home", href: "/prepmeup/dashboard" },
  { label: "Subjects", href: "/prepmeup/subjects" },
  { label: "AI Tutor", href: "/prepmeup/doubts" },
  { label: "Progress", href: "/prepmeup/progress" },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{
    phone?: string;
    email?: string;
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
            email: data.user.email,
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
    <div className="pmu-student-shell" style={{ backgroundColor: "#FAF9F6", color: "#1C1A17" }}>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="pmu-student-sidebar" style={{ backgroundColor: "#FFFFFF", borderRight: "1px solid #E8E4DB" }}>
        <div>
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #E8E4DB",
              paddingBottom: "1rem",
            }}
          >
            <Link href="/prepmeup" className="pmu-brand-logo">
              <span className="pmu-brand-mark">P</span>
              <span className="pmu-brand-title">
                PrepMeUp <span>AI</span>
              </span>
            </Link>
          </div>

          {/* Student Status Badge */}
          <div
            style={{
              marginTop: "1rem",
              borderRadius: "8px",
              border: "1px solid #E8E4DB",
              backgroundColor: "#F4F2ED",
              padding: "0.875rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: "#C2331B",
                }}
              >
                Semester 1 Active
              </span>
              <span
                style={{
                  width: "0.375rem",
                  height: "0.375rem",
                  borderRadius: "9999px",
                  backgroundColor: "#C2331B",
                }}
              />
            </div>
            <p style={{ marginTop: "0.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#1C1A17" }}>
              B.Tech CSE AI/ML
            </p>
            <p style={{ fontSize: "0.75rem", color: "#6F6B62" }}>Engineering coursework</p>
          </div>

          {/* Navigation Links */}
          <nav
            style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}
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
                    borderRadius: "6px",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.8125rem",
                    fontWeight: active ? 600 : 500,
                    backgroundColor: active ? "#F6E7E3" : "transparent",
                    color: active ? "#C2331B" : "#6F6B62",
                    textDecoration: "none",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                  }}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Backlinks Footer */}
        <div style={{ borderTop: "1px solid #E8E4DB", paddingTop: "1rem" }}>
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
                  backgroundColor: "#F6E7E3",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#C2331B",
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
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#1C1A17",
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
                    color: "#6F6B62",
                  }}
                >
                  {user?.phone ? "WhatsApp Verified" : (user?.email ? "Email Verified" : "Student Account")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "#6F6B62",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
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
              fontSize: "0.75rem",
              color: "#6F6B62",
            }}
          >
            <Link href="/prepmeup" className="hover:text-[#C2331B]">
              Home
            </Link>
            <Link href="/" className="hover:text-[#1C1A17]">
              Portfolio ↗
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Viewport */}
      <div className="pmu-student-main-wrap">
        <DailyNotificationBanner />
        {/* Topbar */}
        <header className="pmu-student-topbar" style={{ backgroundColor: "rgba(255, 255, 255, 0.94)", borderBottom: "1px solid #E8E4DB" }}>
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
                border: "1px solid #E8E4DB",
                color: "#1C1A17",
                background: "#FFFFFF",
                cursor: "pointer",
              }}
              aria-label="Toggle Navigation Drawer"
            >
              <svg style={{ width: "1rem", height: "1rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span
              style={{
                fontSize: "0.8125rem",
                color: "#6F6B62",
              }}
            >
              Semester 1 &gt;
            </span>
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "#1C1A17",
              }}
            >
              {NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label ?? "Student portal"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              className="hidden sm:flex"
              style={{
                alignItems: "center",
                gap: "0.375rem",
                borderRadius: "9999px",
                border: "1px solid #E8E4DB",
                backgroundColor: "#F4F2ED",
                padding: "0.25rem 0.75rem",
                fontSize: "0.6875rem",
                color: "#6F6B62",
              }}
            >
              <span
                style={{
                  width: "0.375rem",
                  height: "0.375rem",
                  borderRadius: "9999px",
                  backgroundColor: "#1F7A4D",
                }}
              />
              Academic syllabus 2026-27
            </span>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                borderRadius: "6px",
                border: "1px solid #E8E4DB",
                backgroundColor: "#FFFFFF",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "#6F6B62",
                cursor: "pointer",
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
              borderBottom: "1px solid #E8E4DB",
              backgroundColor: "#FFFFFF",
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
                      borderRadius: "6px",
                      padding: "0.5rem 0.625rem",
                      fontSize: "0.8125rem",
                      fontWeight: active ? 600 : 500,
                      backgroundColor: active ? "#F6E7E3" : "transparent",
                      color: active ? "#C2331B" : "#6F6B62",
                      textDecoration: "none",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <main className="pmu-student-content" style={{ paddingBottom: "72px" }}>
          <ContentProtection studentName={user?.fullName} studentPhone={user?.phone}>
            {children}
          </ContentProtection>
        </main>

        {/* Mobile 4-item bottom nav */}
        <nav
          aria-label="Mobile navigation"
          className="md:hidden"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #E8E4DB",
            padding: "8px 4px",
          }}
        >
          {MOBILE_BOTTOM_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textAlign: "center",
                  padding: "8px 4px",
                  fontSize: "12px",
                  fontWeight: active ? 600 : 500,
                  color: active ? "#C2331B" : "#6F6B62",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
