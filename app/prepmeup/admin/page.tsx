"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { RichMathMarkdown } from "@/app/prepmeup/_components/RichMathMarkdown";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

interface PlatformSettings {
  brandName: string;
  tickerText: string;
  tickerActive: boolean;
  accentColor: string;
  aiProvider: string;
  maintenanceMode: boolean;
  tier0Price?: number;
  tier0SeatsLimit?: number;
  tier0Active?: boolean;
  tier1Price: number;
  tier1ValidityDays: number;
  tier2Price: number;
  tier2CareerSupportActive: boolean;
  tier2Features: string[];
  tier3Price: number;
  tier3UnlimitedSessions: boolean;
  tier3Features: string[];
}

interface CalendarSlot {
  id: string;
  dayOfWeek: string;
  timeSlot: string;
  mentorName: string;
  meetUrl: string;
  isActive: boolean;
  capacity: number;
}

interface AdminSubject {
  id: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  credit_units: number;
  icon: string;
  is_published: boolean;
  module_count: number;
}

interface AdminModule {
  id: string;
  subject_code: string;
  module_number: number;
  title: string;
  description: string;
  is_published: boolean;
}

interface AdminNote {
  id: string;
  subject_code: string;
  module_number: number;
  title: string;
  reading_time_min: number;
  is_sample: boolean;
  is_published: boolean;
  content: string;
  updated_at: string;
}

interface AdminPyq {
  id: string;
  subject_code: string;
  exam_year: number;
  exam_type: string;
  title: string;
  question_paper_url: string;
  solution_markdown: string;
  is_published: boolean;
}

interface AdminSession {
  id: string;
  studentName: string;
  whatsapp: string;
  tier: "tier3" | "tier2" | "tier1";
  topic: string;
  slot: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "live_now" | "cancelled";
  meetUrl: string;
  notes: string;
  updatedAt: string;
}

interface AdminActivity {
  id: string;
  timestamp: string;
  collection: string;
  itemTitle: string;
  action: "created" | "updated" | "deleted" | "published" | "verified";
  details: string;
  author: string;
}

interface AnalyticsData {
  metrics: {
    totalRegisteredUsers: number;
    onlineUsersCount: number;
    activeTodayCount: number;
    emailRegistrationsCount: number;
    phoneRegistrationsCount: number;
    totalQuizzesCompleted: number;
    totalDoubtsResolved: number;
    totalCodeSubmissions: number;
    totalStudyHours: number;
    paidStudentsCount: number;
    tier1Count: number;
    tier2Count: number;
    tier3Count: number;
    conversionRatePercent: number;
    subjectBreakdown: Array<{
      code: string;
      title: string;
      attempts: number;
      activeLearners: number;
      avgScore: number;
    }>;
  };
  users: Array<{
    id: string;
    name: string;
    target: string;
    type: "email" | "phone";
    college: string;
    branch: string;
    role: "student" | "admin";
    tier: string;
    registeredAt: string;
    lastSeenAt: string;
    lastActivity: string;
    currentPath: string;
    isOnline: boolean;
    stats: {
      quizzesCompleted: number;
      doubtsAsked: number;
      codingSubmissions: number;
      studyMinutes: number;
    };
  }>;
  activities: Array<{
    id: string;
    userId: string;
    userName: string;
    userTarget: string;
    actionType: string;
    title: string;
    details: string;
    subjectCode?: string;
    timestamp: string;
  }>;
}

function formatRelativeTime(isoString: string): string {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    if (diff < 60 * 1000) return "Just now";
    const mins = Math.floor(diff / (60 * 1000));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  } catch {
    return "Recently";
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Active GUI Tab
  const [activeTab, setActiveTab] = useState<
    "analytics" | "subjects" | "notes" | "pricing" | "sessions" | "pyqs" | "branding" | "cms"
  >("analytics");

  // Data state from centralized manage API
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [pastPapers, setPastPapers] = useState<AdminPyq[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [newSlotDay, setNewSlotDay] = useState("Monday");
  const [newSlotTime, setNewSlotTime] = useState("06:00 PM – 06:45 PM IST");
  const [newSlotMentor, setNewSlotMentor] = useState("Senior Subject Mentor (IIT / VIT)");
  const [newSlotMeet, setNewSlotMeet] = useState("https://meet.google.com/pmu-vip-room");
  const [cmsInfo, setCmsInfo] = useState<any>(null);

  // App-wide Analytics & Live User Telemetry
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userFilterTier, setUserFilterTier] = useState<"all" | "online" | "paid" | "free">("all");

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/analytics");
      const json = await res.json();
      if (json.ok) {
        setAnalytics(json);
      }
    } catch {} finally {
      setAnalyticsLoading(false);
    }
  };

  // Status Message
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubTitle, setNewSubTitle] = useState("");
  const [newSubIcon, setNewSubIcon] = useState("📘");
  const [newSubCredits, setNewSubCredits] = useState(4);
  const [newSubDesc, setNewSubDesc] = useState("");

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<AdminNote> | null>(null);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSessName, setNewSessName] = useState("");
  const [newSessPhone, setNewSessPhone] = useState("");
  const [newSessTopic, setNewSessTopic] = useState("★ Internship & Career Support (Resume, GitHub & Referrals)");
  const [newSessSlot, setNewSessSlot] = useState("Today, 7:00 PM – 7:30 PM IST");

  const [showPyqModal, setShowPyqModal] = useState(false);
  const [newPyqSubject, setNewPyqSubject] = useState("CSE1001");
  const [newPyqYear, setNewPyqYear] = useState(2025);
  const [newPyqType, setNewPyqType] = useState("End-Semester Examination");
  const [newPyqTitle, setNewPyqTitle] = useState("");
  const [newPyqSolution, setNewPyqSolution] = useState("");

  const loadAllAdminData = async () => {
    try {
      const res = await fetch("/api/prepmeup/admin/manage");
      const json = await res.json();
      if (json.ok && json.data) {
        setSettings(json.data.settings);
        setSubjects(json.data.subjects || []);
        setModules(json.data.modules || []);
        setNotes(json.data.notes || []);
        setPastPapers(json.data.pastPapers || []);
        setSessions(json.data.sessions || []);
        setCalendarSlots(json.data.calendarSlots || []);
        setActivities(json.data.activities || []);
        setCmsInfo(json.cms);
      }
    } catch {} finally {
      loadAnalytics();
    }
  };

  useEffect(() => {
    fetch("/api/prepmeup/admin/me")
      .then((res) => {
        if (!res.ok) {
          router.replace("/prepmeup/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.ok && data.admin) {
          setAdmin(data.admin);
          loadAllAdminData();
          loadAnalytics();
        } else {
          router.replace("/prepmeup/admin/login");
        }
      })
      .catch(() => {
        router.replace("/prepmeup/admin/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!admin) return;
    const interval = setInterval(() => {
      fetch("/api/prepmeup/admin/analytics")
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) setAnalytics(d);
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [admin]);

  const handleLogout = async () => {
    await fetch("/api/prepmeup/admin/logout", { method: "POST" });
    router.push("/prepmeup/admin/login");
  };

  const notify = (text: string, type: "success" | "error" = "success") => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const executeAction = async (action: string, payload: any) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Action failed");
      }
      loadAllAdminData();
      return json;
    } catch (err: any) {
      notify(err.message, "error");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // 1. Subject actions
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode.trim() || !newSubTitle.trim()) return;
    await executeAction("add_subject", {
      code: newSubCode.trim().toUpperCase(),
      title: newSubTitle.trim(),
      icon: newSubIcon,
      credit_units: newSubCredits,
      description: newSubDesc,
      is_published: true,
    });
    setShowSubjectModal(false);
    setNewSubCode("");
    setNewSubTitle("");
    notify(`Subject ${newSubCode} created successfully!`);
  };

  const handleDeleteSubject = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete subject ${code}?`)) return;
    await executeAction("delete_subject", { id });
    notify(`Subject ${code} removed.`);
  };

  // 2. Note actions
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote?.title) return;
    if (editingNote.id) {
      await executeAction("update_note", editingNote);
      notify(`Note "${editingNote.title}" updated.`);
    } else {
      await executeAction("add_note", editingNote);
      notify(`New note "${editingNote.title}" published!`);
    }
    setShowNoteModal(false);
    setEditingNote(null);
  };

  const handleDeleteNote = async (id: string, title: string) => {
    if (!confirm(`Delete study note "${title}"?`)) return;
    await executeAction("delete_note", { id });
    notify(`Note "${title}" deleted.`);
  };

  // 3. Pricing Settings actions
  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await executeAction("update_settings", settings);
    notify("Pricing tiers & financial parameters saved live!");
  };

  // 4. Session actions
  const handleToggleSlot = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_calendar_slot", payload: { id } }),
      });
      const json = await res.json();
      if (json.ok) {
        setCalendarSlots(json.calendarSlots);
        setStatusMsg({ type: "success", text: "Toggled slot active availability." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Failed to toggle slot." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm("Are you sure you want to remove this calendar availability slot?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_calendar_slot", payload: { id } }),
      });
      const json = await res.json();
      if (json.ok) {
        setCalendarSlots(json.calendarSlots);
        setStatusMsg({ type: "success", text: "Availability slot deleted." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Failed to delete slot." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_calendar_slot",
          payload: {
            dayOfWeek: newSlotDay,
            timeSlot: newSlotTime,
            mentorName: newSlotMentor,
            meetUrl: newSlotMeet,
            isActive: true,
            capacity: 1,
          },
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setCalendarSlots(json.calendarSlots);
        setShowSlotModal(false);
        setStatusMsg({ type: "success", text: "Added new calendar availability slot!" });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Failed to add slot." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSession = async (id: string) => {
    await executeAction("toggle_session", { id });
    notify("1:1 Mentorship session status updated!");
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessName.trim() || !newSessPhone.trim()) return;
    await executeAction("add_session", {
      studentName: newSessName.trim(),
      whatsapp: newSessPhone.trim(),
      topic: newSessTopic,
      slot: newSessSlot,
      status: "scheduled",
    });
    setShowSessionModal(false);
    setNewSessName("");
    setNewSessPhone("");
    notify(`1:1 Session for ${newSessName} scheduled!`);
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Delete this mentorship session?")) return;
    await executeAction("delete_session", { id });
    notify("Session removed.");
  };

  // 5. Past Paper actions
  const handleAddPyq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPyqTitle.trim()) return;
    await executeAction("add_pyq", {
      subject_code: newPyqSubject,
      exam_year: newPyqYear,
      exam_type: newPyqType,
      title: newPyqTitle.trim(),
      solution_markdown: newPyqSolution,
    });
    setShowPyqModal(false);
    setNewPyqTitle("");
    setNewPyqSolution("");
    notify("PYQ & Model Solution added.");
  };

  const handleDeletePyq = async (id: string) => {
    if (!confirm("Delete this past paper archive?")) return;
    await executeAction("delete_pyq", { id });
    notify("PYQ deleted.");
  };

  // 6. Platform Settings actions
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await executeAction("update_settings", settings);
    notify("Platform branding & display configurations saved!");
  };

  // 7. Directus CMS Sync
  const handleSyncCms = async () => {
    await executeAction("sync_cms", {});
    notify("Directus CMS cache revalidated & synced!");
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-xs text-[#807f78]">
        Verifying administrative privileges…
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="pmu-container" style={{ paddingTop: "2rem", paddingBottom: "5rem", maxWidth: "1380px" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          borderBottom: "1px solid rgba(243,241,234,0.1)",
          paddingBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span className="pmu-brand-mark" style={{ width: "1.5rem", height: "1.5rem", fontSize: "0.75rem" }}>
              P
            </span>
            <span className="pmu-eyebrow">Unified Administration Portal</span>
          </div>
          <h1 className="pmu-section-title" style={{ marginTop: "0.5rem", fontSize: "32px" }}>
            Admin &amp; Content Management Control Center
          </h1>
          <p style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "#807f78" }}>
            Logged in as <strong style={{ color: "#f3f1ea" }}>{admin.email}</strong> • Role:{" "}
            <span style={{ fontFamily: "monospace", color: "#ff3b1d", textTransform: "uppercase" }}>
              {admin.role}
            </span>
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/prepmeup/admin/content-studio" className="pmu-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}>
            🎨 Split-Pane Studio →
          </Link>
          <Link href="/prepmeup" className="pmu-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.75rem" }}>
            View Public Site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              borderRadius: "0.375rem",
              backgroundColor: "rgba(70,8,9,0.6)",
              border: "1px solid rgba(239,68,68,0.4)",
              padding: "0.5rem 1rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#fca5a5",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {statusMsg && (
        <div
          style={{
            marginTop: "1.25rem",
            padding: "12px 18px",
            borderRadius: "8px",
            border: statusMsg.type === "success" ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(239,68,68,0.4)",
            backgroundColor: statusMsg.type === "success" ? "rgba(3,46,21,0.35)" : "rgba(70,8,9,0.35)",
            color: statusMsg.type === "success" ? "#86efac" : "#fca5a5",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{statusMsg.text}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Primary GUI Navigation Tabs */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          borderBottom: "1px solid #26262c",
          paddingBottom: "12px",
        }}
      >
        {[
          {
            id: "analytics" as const,
            label: `📊 Live Users & App Stats ${analytics?.metrics?.onlineUsersCount ? `(${analytics.metrics.onlineUsersCount} Online)` : ""}`,
          },
          { id: "subjects" as const, label: `📚 Subjects (${subjects.length})` },
          { id: "notes" as const, label: `📝 Notes & LaTeX (${notes.length})` },
          { id: "pricing" as const, label: "🏷️ Pricing & Tiers (GUI)" },
          { id: "sessions" as const, label: `📅 1:1 Mentorship (${sessions.length})` },
          { id: "pyqs" as const, label: `📑 Solved PYQs (${pastPapers.length})` },
          { id: "branding" as const, label: "⚙️ Site Branding & Colors" },
          { id: "cms" as const, label: "🔄 Directus CMS & Logs" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                border: active ? "1px solid #ff3b1d" : "1px solid #26262c",
                backgroundColor: active ? "#ff3b1d" : "#111114",
                color: active ? "#08080a" : "#a19f95",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 0: APP-WIDE ANALYTICS, REGISTERED USERS & LIVE ONLINE TELEMETRY
          ========================================================================= */}
      {activeTab === "analytics" && (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Header Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                  Platform Overview &amp; Live Telemetry
                </h2>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                    backgroundColor: "rgba(34,197,94,0.15)",
                    border: "1px solid rgba(34,197,94,0.4)",
                    color: "#4ade80",
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }}></span>
                  {analytics?.metrics?.onlineUsersCount || 0} Students Online
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "4px" }}>
                Comprehensive real-time student registrations, active sessions, study engagement, and canonical subject metrics.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={loadAnalytics}
                disabled={analyticsLoading}
                className="pmu-btn-secondary"
                style={{ padding: "8px 14px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>🔄</span>
                {analyticsLoading ? "Refreshing..." : "Refresh Telemetry"}
              </button>
            </div>
          </div>

          {/* KPI Stat Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Card 1: Registered Users */}
            <div className="pmu-card" style={{ padding: "20px", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", color: "#a19f95", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Total Registered Students
                </span>
                <span style={{ fontSize: "18px" }}>👥</span>
              </div>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "#f3f1ea", fontFamily: "var(--font-mono, monospace)" }}>
                  {analytics?.metrics?.totalRegisteredUsers ?? 0}
                </span>
                <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700, backgroundColor: "rgba(34,197,94,0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                  Verified Real Accounts
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#807f78", marginTop: "8px" }}>
                {analytics?.metrics?.emailRegistrationsCount ?? 0} via Email • {analytics?.metrics?.phoneRegistrationsCount ?? 0} via WhatsApp
              </p>
            </div>

            {/* Card 2: Online & Active Users */}
            <div className="pmu-card" style={{ padding: "20px", border: "1px solid rgba(34,197,94,0.3)", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", color: "#86efac", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Live Presence &amp; Online
                </span>
                <span style={{ fontSize: "18px" }}>🟢</span>
              </div>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "#4ade80", fontFamily: "var(--font-mono, monospace)" }}>
                  {analytics?.metrics?.onlineUsersCount ?? 0}
                </span>
                <span style={{ fontSize: "13px", color: "#f3f1ea", fontWeight: 600 }}>Active Right Now</span>
              </div>
              <p style={{ fontSize: "12px", color: "#807f78", marginTop: "8px" }}>
                {analytics?.metrics?.activeTodayCount ?? 0} active students in the last 24 hours
              </p>
            </div>

            {/* Card 3: Academic Activity & Quizzes */}
            <div className="pmu-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", color: "#a19f95", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Academic Submissions
                </span>
                <span style={{ fontSize: "18px" }}>🎯</span>
              </div>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "#f3f1ea", fontFamily: "var(--font-mono, monospace)" }}>
                  {analytics?.metrics?.totalQuizzesCompleted ?? 0}
                </span>
                <span style={{ fontSize: "13px", color: "#a19f95" }}>Quizzes Taken</span>
              </div>
              <p style={{ fontSize: "12px", color: "#807f78", marginTop: "8px" }}>
                {analytics?.metrics?.totalDoubtsResolved ?? 0} AI Doubts • {analytics?.metrics?.totalCodeSubmissions ?? 0} Code Sandbox Runs
              </p>
            </div>

            {/* Card 4: Paid Enrollments & Study Time */}
            <div className="pmu-card" style={{ padding: "20px", border: "1px solid rgba(255,59,29,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", color: "#ff8c73", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Paid Subscribers &amp; Tiers
                </span>
                <span style={{ fontSize: "18px" }}>💎</span>
              </div>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "#ff3b1d", fontFamily: "var(--font-mono, monospace)" }}>
                  {analytics?.metrics?.paidStudentsCount ?? 0}
                </span>
                <span style={{ fontSize: "11px", color: "#ff3b1d", fontWeight: 700, backgroundColor: "rgba(255,59,29,0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                  {analytics?.metrics?.conversionRatePercent ?? 0}% Conv.
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#807f78", marginTop: "8px" }}>
                {analytics?.metrics?.tier3Count ?? 0} VIP (₹499) • {analytics?.metrics?.tier2Count ?? 0} Pro (₹199) • {analytics?.metrics?.tier1Count ?? 0} Basic (₹99) • {analytics?.metrics?.totalStudyHours ?? 0}h Studied
              </p>
            </div>
          </div>

          {/* Registered Users & Live Presence Directory Table */}
          <div className="pmu-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "20px" }}>
              <div>
                <h3 className="font-display" style={{ fontSize: "18px", color: "#f3f1ea", textTransform: "uppercase" }}>
                  Student Directory &amp; Real-time Presence
                </h3>
                <p style={{ fontSize: "12px", color: "#807f78", marginTop: "2px" }}>
                  Inspect who is registered, currently online, their active session path, and engagement history.
                </p>
              </div>

              {/* Filters & Search */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Search student, email, phone..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pmu-input font-mono"
                  style={{ width: "220px", padding: "6px 12px", fontSize: "12px" }}
                />

                <div style={{ display: "flex", gap: "4px", backgroundColor: "#08080a", padding: "3px", borderRadius: "6px", border: "1px solid #26262c" }}>
                  {[
                    { id: "all", label: "All" },
                    { id: "online", label: "🟢 Online" },
                    { id: "paid", label: "💎 Paid" },
                    { id: "free", label: "Free Students" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setUserFilterTier(f.id as any)}
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        fontWeight: 600,
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: userFilterTier === f.id ? "#ff3b1d" : "transparent",
                        color: userFilterTier === f.id ? "#08080a" : "#a19f95",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User List Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #26262c", color: "#807f78", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 10px" }}>Student</th>
                    <th style={{ padding: "12px 10px" }}>Contact</th>
                    <th style={{ padding: "12px 10px" }}>Status &amp; Last Seen</th>
                    <th style={{ padding: "12px 10px" }}>Current Activity / Page</th>
                    <th style={{ padding: "12px 10px" }}>Plan / Tier</th>
                    <th style={{ padding: "12px 10px" }}>Stats</th>
                    <th style={{ padding: "12px 10px" }}>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.users || [])
                    .filter((u) => {
                      if (userSearchTerm) {
                        const term = userSearchTerm.toLowerCase();
                        const match =
                          u.name.toLowerCase().includes(term) ||
                          u.target.toLowerCase().includes(term) ||
                          u.college?.toLowerCase().includes(term) ||
                          u.branch?.toLowerCase().includes(term);
                        if (!match) return false;
                      }
                      if (userFilterTier === "online") return u.isOnline;
                      if (userFilterTier === "paid") return u.tier.includes("Tier");
                      if (userFilterTier === "free") return u.tier.includes("Free");
                      return true;
                    })
                    .map((user) => (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: "1px solid #1c1c22",
                          backgroundColor: user.isOnline ? "rgba(34,197,94,0.02)" : "transparent",
                        }}
                      >
                        {/* Student Name & Avatar */}
                        <td style={{ padding: "12px 10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ position: "relative" }}>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  backgroundColor: "#26262c",
                                  color: "#f3f1ea",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                }}
                              >
                                {user.name.slice(0, 1).toUpperCase()}
                              </div>
                              {user.isOnline && (
                                <span
                                  style={{
                                    position: "absolute",
                                    bottom: "-1px",
                                    right: "-1px",
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: "#22c55e",
                                    border: "2px solid #111114",
                                  }}
                                />
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#f3f1ea", display: "flex", alignItems: "center", gap: "6px" }}>
                                {user.name}
                                {user.role === "admin" && (
                                  <span style={{ fontSize: "9px", padding: "1px 4px", borderRadius: "3px", backgroundColor: "rgba(255,59,29,0.2)", color: "#ff8c73", fontWeight: 700 }}>
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "11px", color: "#807f78" }}>
                                {user.branch || "B.Tech CSE"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: "12px 10px", fontFamily: "var(--font-mono, monospace)", color: "#d1cfc7", fontSize: "11px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            {user.type === "email" ? "✉️" : "📱"} {user.target}
                          </span>
                        </td>

                        {/* Status & Last Seen */}
                        <td style={{ padding: "12px 10px" }}>
                          {user.isOnline ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                backgroundColor: "rgba(34,197,94,0.15)",
                                color: "#4ade80",
                                fontWeight: 700,
                                fontSize: "11px",
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                              Online Now
                            </span>
                          ) : (
                            <span style={{ color: "#807f78", fontSize: "11px" }}>
                              {formatRelativeTime(user.lastSeenAt)}
                            </span>
                          )}
                        </td>

                        {/* Current Activity / Page */}
                        <td style={{ padding: "12px 10px", maxWidth: "240px" }}>
                          <div style={{ color: "#f3f1ea", fontWeight: 500, fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user.lastActivity || "Active session"}
                          </div>
                          <div style={{ color: "#ff3b1d", fontSize: "10px", fontFamily: "var(--font-mono, monospace)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {user.currentPath || "/prepmeup"}
                          </div>
                        </td>

                        {/* Plan / Tier */}
                        <td style={{ padding: "12px 10px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 600,
                              backgroundColor: user.tier.includes("Tier 2")
                                ? "rgba(255,59,29,0.15)"
                                : user.tier.includes("Tier 1")
                                ? "rgba(59,130,246,0.15)"
                                : "rgba(255,255,255,0.06)",
                              color: user.tier.includes("Tier 2")
                                ? "#ff8c73"
                                : user.tier.includes("Tier 1")
                                ? "#93c5fd"
                                : "#a19f95",
                              border: user.tier.includes("Tier 2")
                                ? "1px solid rgba(255,59,29,0.3)"
                                : user.tier.includes("Tier 1")
                                ? "1px solid rgba(59,130,246,0.3)"
                                : "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {user.tier}
                          </span>
                        </td>

                        {/* Stats */}
                        <td style={{ padding: "12px 10px", fontSize: "11px", color: "#a19f95" }}>
                          <span style={{ color: "#f3f1ea", fontWeight: 600 }}>{user.stats.quizzesCompleted}</span> Qs •{" "}
                          <span style={{ color: "#f3f1ea", fontWeight: 600 }}>{user.stats.doubtsAsked}</span> D •{" "}
                          <span style={{ color: "#f3f1ea", fontWeight: 600 }}>{user.stats.codingSubmissions}</span> C
                        </td>

                        {/* Registered Date */}
                        <td style={{ padding: "12px 10px", fontSize: "11px", color: "#807f78", whiteSpace: "nowrap" }}>
                          {new Date(user.registeredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Two-Column Telemetry: Canonical Subject Breakdown & Real-Time Feed */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
            {/* Subject Telemetry Grid (Strictly CSE1001 to CSE1006) */}
            <div className="pmu-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: "16px", color: "#f3f1ea", textTransform: "uppercase" }}>
                    Curriculum Subject Engagement (CSE1001–CSE1006)
                  </h3>
                  <p style={{ fontSize: "12px", color: "#807f78" }}>
                    Student engagement and quiz completion across DYPIU Semester 1 curriculum.
                  </p>
                </div>
                <span style={{ fontSize: "11px", color: "#ff3b1d", fontWeight: 700 }}>6 Official Subjects</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(analytics?.metrics?.subjectBreakdown || []).map((sub) => (
                  <div
                    key={sub.code}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      backgroundColor: "#0d0d10",
                      border: "1px solid #1f1f26",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "11px", fontWeight: 700, color: "#ff3b1d" }}>
                          {sub.code}
                        </span>
                        <span style={{ fontSize: "12px", color: "#f3f1ea", fontWeight: 600 }}>
                          {sub.title}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700 }}>
                        {sub.avgScore}% Avg Score
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#807f78" }}>
                      <span>{sub.attempts} Quiz Submissions</span>
                      <span>{sub.activeLearners} Active Learners</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: "6px", width: "100%", height: "4px", backgroundColor: "#1c1c22", borderRadius: "2px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(100, (sub.attempts / 150) * 100)}%`,
                          height: "100%",
                          backgroundColor: "#ff3b1d",
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Global Activity Feed */}
            <div className="pmu-card" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 className="font-display" style={{ fontSize: "16px", color: "#f3f1ea", textTransform: "uppercase" }}>
                    Live Activity Stream
                  </h3>
                  <p style={{ fontSize: "12px", color: "#807f78" }}>
                    Real-time audit events across logins, quizzes, doubts, and code.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#4ade80",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(34,197,94,0.15)",
                  }}
                >
                  LIVE FEED
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "440px" }}>
                {(analytics?.activities || []).map((act) => {
                  const icon =
                    act.actionType === "quiz" ? "🎯" :
                    act.actionType === "doubt" ? "💡" :
                    act.actionType === "code" ? "⚡" :
                    act.actionType === "login" ? "🔑" : "📖";

                  return (
                    <div
                      key={act.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#0d0d10",
                        border: "1px solid #1a1a20",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "6px" }}>
                          <span style={{ fontWeight: 600, color: "#f3f1ea", fontSize: "12px" }}>
                            {act.userName}
                          </span>
                          <span style={{ fontSize: "10px", color: "#807f78", whiteSpace: "nowrap" }}>
                            {formatRelativeTime(act.timestamp)}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#ff8c73", marginTop: "1px", fontWeight: 500 }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#807f78", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {act.details}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: SUBJECTS & CURRICULUM GUI
          ========================================================================= */}
      {activeTab === "subjects" && (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                Curriculum Subjects Management
              </h2>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "2px" }}>
                Add, modify, or remove B.Tech subjects, credit weighting, icons, and syllabi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSubjectModal(true)}
              className="pmu-btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              + Add New Subject
            </button>
          </div>

          <div className="pmu-grid-2">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="pmu-card"
                style={{ padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "24px" }}>{sub.icon}</span>
                      <div>
                        <span className="font-mono" style={{ fontSize: "12px", fontWeight: 700, color: "#ff3b1d" }}>
                          {sub.code}
                        </span>
                        <h3 className="font-display" style={{ fontSize: "19px", color: "#f3f1ea", textTransform: "uppercase" }}>
                          {sub.title}
                        </h3>
                      </div>
                    </div>
                    <span
                      className="font-mono"
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        backgroundColor: sub.is_published ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                        color: sub.is_published ? "#4ade80" : "#fca5a5",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {sub.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p style={{ marginTop: "10px", fontSize: "13px", color: "#a19f95", lineHeight: 1.5 }}>
                    {sub.description}
                  </p>

                  <div style={{ marginTop: "12px", display: "flex", gap: "12px", fontSize: "11px", color: "#807f78", fontFamily: "monospace" }}>
                    <span>Credits: <strong>{sub.credit_units}</strong></span>
                    <span>•</span>
                    <span>Modules: <strong>{modules.filter((m) => m.subject_code === sub.code).length || sub.module_count || 4}</strong></span>
                    <span>•</span>
                    <span>Notes: <strong>{notes.filter((n) => n.subject_code === sub.code).length}</strong></span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #26262c", paddingTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Link
                    href={`/prepmeup/subjects/${sub.slug}`}
                    className="pmu-btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "11px" }}
                  >
                    View Subject Page ↗
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(sub.id, sub.code)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: "1px solid rgba(239,68,68,0.3)",
                      backgroundColor: "rgba(70,8,9,0.3)",
                      color: "#fca5a5",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Delete ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: STUDY NOTES & LATEX GUI
          ========================================================================= */}
      {activeTab === "notes" && (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                Academic Study Notes &amp; LaTeX Formatter
              </h2>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "2px" }}>
                Add, edit markdown derivations, toggle free sample previews, and manage study materials.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingNote({
                  subject_code: "CSE1001",
                  module_number: 1,
                  title: "",
                  reading_time_min: 15,
                  is_sample: true,
                  is_published: true,
                  content: "### 1. New Concept & Theorem\nGoverning equation:\n$$A = U \\Sigma V^T$$",
                });
                setShowNoteModal(true);
              }}
              className="pmu-btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              + Create New Study Note
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                  padding: "16px 20px",
                  borderRadius: "8px",
                  border: "1px solid #26262c",
                  backgroundColor: "#08080a",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className="pmu-badge">{note.subject_code}</span>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                      Unit 0{note.module_number}
                    </span>
                    <strong style={{ fontSize: "15px", color: "#f3f1ea" }}>{note.title}</strong>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "3px",
                        backgroundColor: note.is_sample ? "rgba(255,59,29,0.15)" : "rgba(34,197,94,0.15)",
                        color: note.is_sample ? "#ff3b1d" : "#4ade80",
                      }}
                    >
                      {note.is_sample ? "Free Sample" : "Semester Pass"}
                    </span>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "12px", color: "#807f78" }}>
                    Reading Time: ~{note.reading_time_min} mins • Updated: {new Date(note.updated_at).toLocaleDateString("en-IN")}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote(note);
                      setShowNoteModal(true);
                    }}
                    className="pmu-btn-primary"
                    style={{ padding: "6px 14px", fontSize: "11px" }}
                  >
                    Edit &amp; LaTeX Preview ✎
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id, note.title)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: "1px solid rgba(239,68,68,0.3)",
                      backgroundColor: "rgba(70,8,9,0.3)",
                      color: "#fca5a5",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Delete ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PRICING & FINANCIAL TIERS CONFIGURATOR (GUI)
          ========================================================================= */}
      {activeTab === "pricing" && settings && (
        <form onSubmit={handleSavePricing} style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
              Financial Model &amp; Pricing Tiers (GUI Configurator)
            </h2>
            <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "2px" }}>
              Live adjustment of prices, student limits, access validity, and package perks across the site.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {/* Tier 1 Config */}
            <div className="pmu-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="pmu-badge">Tier 1: Basic Foundation</span>
                <span className="font-display" style={{ fontSize: "22px", color: "#f3f1ea" }}>
                  ₹{settings.tier1Price}
                </span>
              </div>

              <div>
                <label className="pmu-label">Tier 1 Price in INR (₹)</label>
                <input
                  type="number"
                  min={10}
                  max={999}
                  value={settings.tier1Price}
                  onChange={(e) => setSettings({ ...settings, tier1Price: Number(e.target.value) })}
                  className="pmu-input font-mono"
                />
              </div>

              <div>
                <label className="pmu-label">Access Duration (Days)</label>
                <input
                  type="number"
                  min={30}
                  max={365}
                  value={settings.tier1ValidityDays}
                  onChange={(e) => setSettings({ ...settings, tier1ValidityDays: Number(e.target.value) })}
                  className="pmu-input font-mono"
                />
              </div>

              <p style={{ fontSize: "12px", color: "#a19f95", lineHeight: 1.5 }}>
                Provides full Semester 1 core curriculum access, PYQs, and interactive simulations.
              </p>
            </div>

            {/* Tier 2 Config */}
            <div className="pmu-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="pmu-badge pmu-badge-accent">Tier 2: Pro + Career</span>
                <span className="font-display" style={{ fontSize: "22px", color: "#ff6a3d" }}>
                  ₹{settings.tier2Price}
                </span>
              </div>

              <div>
                <label className="pmu-label">Tier 2 Price in INR (₹)</label>
                <input
                  type="number"
                  min={50}
                  max={1999}
                  value={settings.tier2Price}
                  onChange={(e) => setSettings({ ...settings, tier2Price: Number(e.target.value) })}
                  className="pmu-input font-mono"
                  style={{ color: "#ff6a3d", fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#4ade80", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={settings.tier2CareerSupportActive}
                    onChange={(e) => setSettings({ ...settings, tier2CareerSupportActive: e.target.checked })}
                  />
                  <span>★ Include Internship &amp; Career Review</span>
                </label>
              </div>

              <p style={{ fontSize: "12px", color: "#a19f95", lineHeight: 1.5 }}>
                Includes 24/7 AI Doubt Copilot, Python Lab Debugger, and 1 Included 1:1 Video Mentorship session.
              </p>
            </div>

            {/* Tier 3 Config: VIP Unlimited 1:1 */}
            <div className="pmu-card-highlight" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px", borderColor: "rgba(255,59,29,0.7)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="pmu-badge pmu-badge-accent" style={{ backgroundColor: "#ff3b1d", color: "#08080a" }}>
                  Tier 3: Premium 1:1 VIP
                </span>
                <span className="font-display" style={{ fontSize: "26px", color: "#ff3b1d" }}>
                  ₹{settings.tier3Price || 499}
                </span>
              </div>

              <div>
                <label className="pmu-label">Tier 3 Price in INR (₹)</label>
                <input
                  type="number"
                  min={99}
                  max={4999}
                  value={settings.tier3Price || 499}
                  onChange={(e) => setSettings({ ...settings, tier3Price: Number(e.target.value) })}
                  className="pmu-input font-mono"
                  style={{ color: "#ff3b1d", fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#4ade80", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={settings.tier3UnlimitedSessions ?? true}
                    onChange={(e) => setSettings({ ...settings, tier3UnlimitedSessions: e.target.checked })}
                  />
                  <span>★ UNLIMITED 1:1 Live Video Mentorship Sessions</span>
                </label>
              </div>

              <p style={{ fontSize: "12px", color: "#d4d2c8", lineHeight: 1.5 }}>
                Top VIP Tier: Unlocks unlimited student calendar bookings on Google Meet, dedicated subject mentors, and fast-track career coaching.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="pmu-btn-primary"
            style={{ width: "260px", padding: "12px" }}
          >
            {actionLoading ? "Saving…" : "Save Pricing Configuration →"}
          </button>
        </form>
      )}

      {/* =========================================================================
          TAB 4: 1:1 MENTORSHIP & CAREER SESSIONS GUI
          ========================================================================= */}
      {activeTab === "sessions" && (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* SECTION A: CALENDAR AVAILABILITY SLOTS (ADMIN SCHEDULING CONTROL) */}
          <div
            style={{
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid rgba(255,59,29,0.3)",
              backgroundColor: "#0d0d10",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <div>
                <span className="pmu-badge pmu-badge-accent">Live Student Calendar Feeder</span>
                <h3 className="font-display" style={{ fontSize: "18px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "4px" }}>
                  Active Calendar Availability Slots ({calendarSlots.length})
                </h3>
                <p style={{ fontSize: "12px", color: "#807f78", margin: 0 }}>
                  Time slots configured here appear directly in the student booking scheduler for 1:1 sessions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSlotModal(true)}
                className="pmu-btn-primary"
                style={{ padding: "8px 16px", fontSize: "12px" }}
              >
                + Add Calendar Slot
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
              {calendarSlots.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: slot.isActive ? "1px solid rgba(74,222,128,0.3)" : "1px solid #1f1f24",
                    backgroundColor: slot.isActive ? "rgba(34,197,94,0.03)" : "#08080a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff3b1d" }}>
                        {slot.dayOfWeek}
                      </span>
                      <strong style={{ fontSize: "13px", color: "#f3f1ea" }}>{slot.timeSlot}</strong>
                    </div>
                    <div style={{ fontSize: "11px", color: "#a19f95", marginTop: "3px" }}>
                      {slot.mentorName}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                      Meet: <a href={slot.meetUrl} target="_blank" rel="noreferrer" style={{ color: "#ff6a3d" }}>Link ↗</a>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleSlot(slot.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: slot.isActive ? "1px solid #4ade80" : "1px solid #52525b",
                        backgroundColor: slot.isActive ? "rgba(74,222,128,0.15)" : "#18181b",
                        color: slot.isActive ? "#4ade80" : "#71717a",
                      }}
                    >
                      {slot.isActive ? "ACTIVE" : "PAUSED"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        cursor: "pointer",
                        border: "1px solid rgba(239,68,68,0.3)",
                        backgroundColor: "rgba(239,68,68,0.1)",
                        color: "#fca5a5",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: BOOKED SESSIONS ROSTER */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                Booked 1:1 Student Mentorship Sessions ({sessions.length})
              </h2>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "2px" }}>
                Track student bookings across Tier 3 VIP, Tier 2 Pro, and Tier 1. Manage status and Google Meet links.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSessionModal(true)}
              className="pmu-btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              + Schedule Manual Session
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sessions.map((sess) => {
              const isCompleted = sess.status === "completed";
              const isLive = sess.status === "live_now";

              return (
                <div
                  key={sess.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    padding: "16px 20px",
                    borderRadius: "8px",
                    border: isCompleted ? "1px solid rgba(34,197,94,0.3)" : isLive ? "1px solid rgba(239,68,68,0.4)" : "1px solid #26262c",
                    backgroundColor: isCompleted ? "rgba(34,197,94,0.04)" : isLive ? "rgba(239,68,68,0.06)" : "#08080a",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: "15px", color: "#f3f1ea" }}>{sess.studentName}</strong>
                      <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                        {sess.whatsapp}
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: isCompleted ? "rgba(34,197,94,0.18)" : isLive ? "rgba(239,68,68,0.18)" : "rgba(255,106,61,0.18)",
                          color: isCompleted ? "#4ade80" : isLive ? "#f87171" : "#ff6a3d",
                        }}
                      >
                        {isCompleted ? "GIVEN / COMPLETED" : isLive ? "LIVE NOW" : "SCHEDULED"}
                      </span>
                    </div>
                    <div style={{ marginTop: "4px", fontSize: "13px", color: sess.topic.includes("Career") ? "#86efac" : "#d4d2c8", fontWeight: 600 }}>
                      {sess.topic}
                    </div>
                    <div style={{ marginTop: "2px", fontSize: "12px", color: "#807f78" }}>
                      Slot: <span className="font-mono" style={{ color: "#f3f1ea" }}>{sess.slot}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <a
                      href={`https://wa.me/${sess.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="pmu-btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "11px" }}
                    >
                      WhatsApp ↗
                    </a>
                    <a
                      href={sess.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="pmu-btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "11px", color: "#ff6a3d", borderColor: "rgba(255,59,29,0.3)" }}
                    >
                      Google Meet 🎥
                    </a>
                    <button
                      type="button"
                      onClick={() => handleToggleSession(sess.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: isCompleted ? "1px solid #26262c" : "1px solid #4ade80",
                        backgroundColor: isCompleted ? "#17171b" : "rgba(34,197,94,0.15)",
                        color: isCompleted ? "#a19f95" : "#4ade80",
                      }}
                    >
                      {isCompleted ? "Reopen as Scheduled" : "✓ Mark as Given"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(sess.id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "4px",
                        border: "1px solid rgba(239,68,68,0.3)",
                        backgroundColor: "rgba(70,8,9,0.3)",
                        color: "#fca5a5",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: PAST PAPERS & PYQS GUI
          ========================================================================= */}
      {activeTab === "pyqs" && (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                University Past Papers &amp; Model Solutions (PYQs)
              </h2>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "2px" }}>
                Upload semester archives, model solutions, and marking rubrics.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPyqModal(true)}
              className="pmu-btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              + Add Past Paper
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pastPapers.map((pyq) => (
              <div
                key={pyq.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                  padding: "16px 20px",
                  borderRadius: "8px",
                  border: "1px solid #26262c",
                  backgroundColor: "#08080a",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="pmu-badge">{pyq.subject_code}</span>
                    <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d", fontWeight: 700 }}>
                      {pyq.exam_year} • {pyq.exam_type}
                    </span>
                  </div>
                  <h4 style={{ marginTop: "6px", fontSize: "15px", fontWeight: 700, color: "#f3f1ea" }}>
                    {pyq.title}
                  </h4>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleDeletePyq(pyq.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: "1px solid rgba(239,68,68,0.3)",
                      backgroundColor: "rgba(70,8,9,0.3)",
                      color: "#fca5a5",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Delete ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: PLATFORM BRANDING & COLORS GUI
          ========================================================================= */}
      {activeTab === "branding" && settings && (
        <form onSubmit={handleSaveBranding} style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
              Platform Branding &amp; Visual Customization (GUI)
            </h2>
            <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "2px" }}>
              Customize site name, announcement ticker, theme accent colors, and AI engine model.
            </p>
          </div>

          <div className="pmu-grid-2">
            <div className="pmu-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="pmu-label">Platform Name</label>
                <input
                  type="text"
                  value={settings.brandName}
                  onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                  className="pmu-input"
                />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label className="pmu-label">Top Banner Announcement Ticker</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#4ade80" }}>
                    <input
                      type="checkbox"
                      checked={settings.tickerActive}
                      onChange={(e) => setSettings({ ...settings, tickerActive: e.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={settings.tickerText}
                  onChange={(e) => setSettings({ ...settings, tickerText: e.target.value })}
                  className="pmu-input"
                  style={{ fontSize: "12px" }}
                />
              </div>

              <div>
                <label className="pmu-label">Primary Theme Accent Color</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    style={{ width: "44px", height: "36px", border: "none", borderRadius: "4px", cursor: "pointer", background: "transparent" }}
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="pmu-input font-mono"
                    style={{ width: "120px" }}
                  />
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["#ff3b1d", "#ff6a3d", "#3b82f6", "#10b981", "#8b5cf6"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSettings({ ...settings, accentColor: c })}
                        style={{ height: "24px", width: "24px", borderRadius: "4px", backgroundColor: c, border: "1px solid #26262c", cursor: "pointer" }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pmu-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="pmu-label">Primary AI Tutor Engine</label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                  className="pmu-input"
                  style={{ fontSize: "12px" }}
                >
                  <option value="Groq LLaMA 3.3 70B (Ultra-Low Latency)">Groq LLaMA 3.3 70B (Ultra-Low Latency)</option>
                  <option value="Meta LLaMA 4 Scout (17B-16E)">Meta LLaMA 4 Scout (17B-16E)</option>
                  <option value="Google Gemini 2.5 Flash">Google Gemini 2.5 Flash</option>
                </select>
              </div>

              <div>
                <label className="pmu-label">System Availability</label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#f3f1ea", marginTop: "6px" }}>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  />
                  <span>Enable Maintenance Mode (Restricts public student access)</span>
                </label>
              </div>

              <div style={{ padding: "12px", borderRadius: "6px", backgroundColor: "#08080a", border: "1px solid #26262c", fontSize: "12px", color: "#807f78" }}>
                Razorpay Standard Gateway: <strong style={{ color: "#4ade80" }}>Active</strong> (Key: <span className="font-mono">rzp_test_Ts9610P4fzFXE5</span>)
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="pmu-btn-primary"
            style={{ width: "240px", padding: "12px" }}
          >
            {actionLoading ? "Saving…" : "Save Platform Branding →"}
          </button>
        </form>
      )}

      {/* =========================================================================
          TAB 7: DIRECTUS CMS & ACTIVITY LOG
          ========================================================================= */}
      {activeTab === "cms" && (
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "24px" }}>
          {cmsInfo && (
            <div
              className="pmu-card"
              style={{ padding: "22px 26px", border: "1px solid rgba(34,197,94,0.35)", backgroundColor: "rgba(3,46,21,0.2)" }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <span className="pmu-badge" style={{ backgroundColor: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.4)" }}>
                    ● Directus CMS Live
                  </span>
                  <div style={{ marginTop: "8px", fontSize: "18px", fontWeight: 700, color: "#f3f1ea" }}>
                    {cmsInfo.url}
                  </div>
                  <div style={{ fontSize: "12px", color: "#a19f95", marginTop: "2px" }}>
                    Version: {cmsInfo.version} • Latency: {cmsInfo.latencyMs}ms • Synced: {cmsInfo.lastSyncTimestamp}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <a
                    href={cmsInfo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="pmu-btn-secondary"
                    style={{ padding: "8px 14px", fontSize: "11px" }}
                  >
                    Open Directus Admin ↗
                  </a>
                  <button
                    type="button"
                    onClick={handleSyncCms}
                    className="pmu-btn-primary"
                    style={{ padding: "8px 16px", fontSize: "11px" }}
                  >
                    Sync &amp; Revalidate Site ↻
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pmu-card" style={{ padding: "26px" }}>
            <h3 className="font-display" style={{ fontSize: "20px", textTransform: "uppercase", color: "#f3f1ea", marginBottom: "14px" }}>
              Administrative Activity Audit Feed ("What Was Updated &amp; When")
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    border: "1px solid #26262c",
                    backgroundColor: "#08080a",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="pmu-badge" style={{ color: "#ff6a3d" }}>{act.collection}</span>
                      <strong style={{ fontSize: "13.5px", color: "#f3f1ea" }}>{act.itemTitle}</strong>
                      <span className="font-mono" style={{ fontSize: "10px", color: "#4ade80" }}>{act.action}</span>
                    </div>
                    <p style={{ marginTop: "4px", fontSize: "12px", color: "#807f78" }}>
                      {act.details}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "11px", color: "#807f78", fontFamily: "monospace" }}>
                    <div>{act.timestamp}</div>
                    <div>By: {act.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* 1. Add Subject Modal */}
      {showSubjectModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ width: "100%", maxWidth: "480px", borderRadius: "12px", border: "1px solid #ff3b1d", backgroundColor: "#111114", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 className="font-display" style={{ fontSize: "20px", textTransform: "uppercase", color: "#f3f1ea" }}>
                Add New Curriculum Subject
              </h3>
              <button type="button" onClick={() => setShowSubjectModal(false)} style={{ background: "transparent", border: "none", color: "#a19f95", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            <form onSubmit={handleAddSubject} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="pmu-label">Subject Code (e.g. DAA-201)</label>
                <input type="text" value={newSubCode} onChange={(e) => setNewSubCode(e.target.value)} className="pmu-input font-mono" required />
              </div>
              <div>
                <label className="pmu-label">Subject Title</label>
                <input type="text" value={newSubTitle} onChange={(e) => setNewSubTitle(e.target.value)} className="pmu-input" required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="pmu-label">Icon Emoji</label>
                  <input type="text" value={newSubIcon} onChange={(e) => setNewSubIcon(e.target.value)} className="pmu-input" style={{ width: "70px" }} />
                </div>
                <div>
                  <label className="pmu-label">Credit Units</label>
                  <input type="number" min={1} max={6} value={newSubCredits} onChange={(e) => setNewSubCredits(Number(e.target.value))} className="pmu-input font-mono" />
                </div>
              </div>
              <div>
                <label className="pmu-label">Syllabus Overview Description</label>
                <textarea value={newSubDesc} onChange={(e) => setNewSubDesc(e.target.value)} className="pmu-input" style={{ minHeight: "80px", fontSize: "12px" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowSubjectModal(false)} className="pmu-btn-secondary" style={{ flex: 1, padding: "10px" }}>Cancel</button>
                <button type="submit" className="pmu-btn-primary" style={{ flex: 1, padding: "10px" }}>Save Subject →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Note Editor & Preview Modal */}
      {showNoteModal && editingNote && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ width: "100%", maxWidth: "880px", maxHeight: "90vh", borderRadius: "12px", border: "1px solid #ff3b1d", backgroundColor: "#111114", padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 className="font-display" style={{ fontSize: "22px", textTransform: "uppercase", color: "#f3f1ea" }}>
                {editingNote.id ? "Edit Study Note & LaTeX Formula" : "Author New Study Note"}
              </h3>
              <button type="button" onClick={() => { setShowNoteModal(false); setEditingNote(null); }} style={{ background: "transparent", border: "none", color: "#a19f95", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>

            <form onSubmit={handleSaveNote} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="pmu-label">Subject Code</label>
                  <select
                    value={editingNote.subject_code}
                    onChange={(e) => setEditingNote({ ...editingNote, subject_code: e.target.value })}
                    className="pmu-input"
                  >
                    {subjects.map((s) => (
                      <option key={s.code} value={s.code}>{s.code}: {s.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="pmu-label">Module Number</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={editingNote.module_number || 1}
                    onChange={(e) => setEditingNote({ ...editingNote, module_number: Number(e.target.value) })}
                    className="pmu-input font-mono"
                  />
                </div>
                <div>
                  <label className="pmu-label">Access Gating</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#f3f1ea", marginTop: "8px" }}>
                    <input
                      type="checkbox"
                      checked={editingNote.is_sample}
                      onChange={(e) => setEditingNote({ ...editingNote, is_sample: e.target.checked })}
                    />
                    <span>Free Sample Preview</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="pmu-label">Note Title</label>
                <input
                  type="text"
                  value={editingNote.title || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="pmu-input"
                  required
                />
              </div>

              <div>
                <label className="pmu-label">Markdown &amp; LaTeX Equations</label>
                <textarea
                  value={editingNote.content || ""}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="pmu-input font-mono"
                  style={{ minHeight: "220px", fontSize: "13px", lineHeight: 1.6 }}
                  required
                />
              </div>

              {/* Real-Time Live LaTeX Preview */}
              <div style={{ padding: "16px", borderRadius: "8px", border: "1px solid #26262c", backgroundColor: "#08080a" }}>
                <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700, textTransform: "uppercase" }}>
                  Real-Time Live LaTeX Preview
                </span>
                <div style={{ marginTop: "10px" }}>
                  <RichMathMarkdown content={editingNote.content || ""} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => { setShowNoteModal(false); setEditingNote(null); }} className="pmu-btn-secondary" style={{ flex: 1, padding: "10px" }}>Cancel</button>
                <button type="submit" className="pmu-btn-primary" style={{ flex: 1, padding: "10px" }}>Save &amp; Publish Live →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Session Modal */}
      {showSessionModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ width: "100%", maxWidth: "480px", borderRadius: "12px", border: "1px solid #ff3b1d", backgroundColor: "#111114", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 className="font-display" style={{ fontSize: "20px", textTransform: "uppercase", color: "#f3f1ea" }}>
                Schedule 1:1 Mentorship Session
              </h3>
              <button type="button" onClick={() => setShowSessionModal(false)} style={{ background: "transparent", border: "none", color: "#a19f95", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            <form onSubmit={handleAddSession} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="pmu-label">Student Name</label>
                <input type="text" value={newSessName} onChange={(e) => setNewSessName(e.target.value)} className="pmu-input" required />
              </div>
              <div>
                <label className="pmu-label">WhatsApp Contact</label>
                <input type="tel" value={newSessPhone} onChange={(e) => setNewSessPhone(e.target.value)} className="pmu-input font-mono" required />
              </div>
              <div>
                <label className="pmu-label">Topic / Focus</label>
                <select value={newSessTopic} onChange={(e) => setNewSessTopic(e.target.value)} className="pmu-input" style={{ fontSize: "12px" }}>
                  <option value="★ Internship & Career Support (Resume, GitHub & Referrals)">★ Internship &amp; Career Support (Resume, GitHub &amp; Referrals)</option>
                  <option value="Applied Computational Mathematics (CSE1001)">CSE1001: Applied Mathematics</option>
                  <option value="Basic Electrical and Electronics Engineering (CSE1002)">CSE1002: Basic Electrical &amp; Electronics</option>
                  <option value="Computer Organization and Architecture (CSE1003)">CSE1003: Computer Architecture</option>
                  <option value="Fundamentals of Web Technologies (CSE1004)">CSE1004: Web Technologies</option>
                  <option value="Python Programming (CSE1005)">CSE1005: Python Programming</option>
                  <option value="Indian Science, Engineering and Technology (CSE1006)">CSE1006: Indian Science &amp; Technology</option>
                </select>
              </div>
              <div>
                <label className="pmu-label">Time Slot</label>
                <select value={newSessSlot} onChange={(e) => setNewSessSlot(e.target.value)} className="pmu-input" style={{ fontSize: "12px" }}>
                  <option value="Today, 7:00 PM – 7:30 PM IST">Today, 7:00 PM – 7:30 PM IST</option>
                  <option value="Today, 9:00 PM – 9:30 PM IST">Today, 9:00 PM – 9:30 PM IST</option>
                  <option value="Tomorrow, 6:00 PM – 6:30 PM IST">Tomorrow, 6:00 PM – 6:30 PM IST</option>
                  <option value="Direct WhatsApp + Weekend Deep-Dive">Direct WhatsApp + Weekend Deep-Dive</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowSessionModal(false)} className="pmu-btn-secondary" style={{ flex: 1, padding: "10px" }}>Cancel</button>
                <button type="submit" className="pmu-btn-primary" style={{ flex: 1, padding: "10px" }}>Schedule Session →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add PYQ Modal */}
      {showPyqModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ width: "100%", maxWidth: "560px", borderRadius: "12px", border: "1px solid #ff3b1d", backgroundColor: "#111114", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 className="font-display" style={{ fontSize: "20px", textTransform: "uppercase", color: "#f3f1ea" }}>
                Add Solved University Past Paper (PYQ)
              </h3>
              <button type="button" onClick={() => setShowPyqModal(false)} style={{ background: "transparent", border: "none", color: "#a19f95", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
            <form onSubmit={handleAddPyq} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="pmu-label">Subject</label>
                  <select value={newPyqSubject} onChange={(e) => setNewPyqSubject(e.target.value)} className="pmu-input">
                    {subjects.map((s) => (
                      <option key={s.code} value={s.code}>{s.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="pmu-label">Exam Year</label>
                  <input type="number" min={2020} max={2026} value={newPyqYear} onChange={(e) => setNewPyqYear(Number(e.target.value))} className="pmu-input font-mono" />
                </div>
                <div>
                  <label className="pmu-label">Exam Type</label>
                  <select value={newPyqType} onChange={(e) => setNewPyqType(e.target.value)} className="pmu-input" style={{ fontSize: "11px" }}>
                    <option value="End-Semester Examination">End-Sem</option>
                    <option value="Mid-Semester Test 1">Mid-Sem 1</option>
                    <option value="Mid-Semester Test 2">Mid-Sem 2</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="pmu-label">Exam Title</label>
                <input type="text" value={newPyqTitle} onChange={(e) => setNewPyqTitle(e.target.value)} placeholder="e.g. Winter 2025 CSE1001 End-Sem Model Paper" className="pmu-input" required />
              </div>
              <div>
                <label className="pmu-label">Model Solution LaTeX &amp; Marking Rubric</label>
                <textarea value={newPyqSolution} onChange={(e) => setNewPyqSolution(e.target.value)} placeholder="### Q1 Model Solution\n$$A^{-1} = \frac{1}{\det(A)}\text{adj}(A)$$" className="pmu-input font-mono" style={{ minHeight: "120px", fontSize: "12px" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowPyqModal(false)} className="pmu-btn-secondary" style={{ flex: 1, padding: "10px" }}>Cancel</button>
                <button type="submit" className="pmu-btn-primary" style={{ flex: 1, padding: "10px" }}>Save PYQ Archive →</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
