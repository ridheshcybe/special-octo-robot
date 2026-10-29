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
  tier0Price: number;
  tier0SeatsLimit: number;
  tier0Active: boolean;
  tier1Price: number;
  tier1ValidityDays: number;
  tier2Price: number;
  tier2CareerSupportActive: boolean;
  tier2Features: string[];
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
  tier: "tier2" | "tier1";
  topic: string;
  slot: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "live_now";
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Active GUI Tab
  const [activeTab, setActiveTab] = useState<
    "subjects" | "notes" | "pricing" | "sessions" | "pyqs" | "branding" | "cms"
  >("subjects");

  // Data state from centralized manage API
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [pastPapers, setPastPapers] = useState<AdminPyq[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [cmsInfo, setCmsInfo] = useState<any>(null);

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
  const [newPyqSubject, setNewPyqSubject] = useState("ACM-101");
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
        setActivities(json.data.activities || []);
        setCmsInfo(json.cms);
      }
    } catch {}
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
        } else {
          router.replace("/prepmeup/admin/login");
        }
      })
      .catch(() => {
        router.replace("/prepmeup/admin/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

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
                  subject_code: "ACM-101",
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
            {/* Tier 0 Config */}
            <div className="pmu-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="pmu-badge">Tier 0 (Free Beta)</span>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#4ade80", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={settings.tier0Active}
                    onChange={(e) => setSettings({ ...settings, tier0Active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div>
                <label className="pmu-label">Price in INR (₹)</label>
                <input
                  type="number"
                  value={settings.tier0Price}
                  disabled
                  className="pmu-input font-mono"
                  style={{ opacity: 0.8 }}
                />
              </div>

              <div>
                <label className="pmu-label">Max Free Beta Seats</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.tier0SeatsLimit}
                  onChange={(e) => setSettings({ ...settings, tier0SeatsLimit: Number(e.target.value) })}
                  className="pmu-input font-mono"
                />
              </div>

              <p style={{ fontSize: "12px", color: "#a19f95", lineHeight: 1.5 }}>
                First 10 students receive 100% free access in exchange for testimonials and feedback.
              </p>
            </div>

            {/* Tier 1 Config */}
            <div className="pmu-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="pmu-badge">Tier 1 (Basic Access)</span>
                <span className="font-display" style={{ fontSize: "20px", color: "#f3f1ea" }}>
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
            <div className="pmu-card-highlight" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="pmu-badge pmu-badge-accent">Tier 2 (Pro + Career)</span>
                <span className="font-display" style={{ fontSize: "24px", color: "#ff3b1d" }}>
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
                  style={{ color: "#ff3b1d", fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#4ade80", fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={settings.tier2CareerSupportActive}
                    onChange={(e) => setSettings({ ...settings, tier2CareerSupportActive: e.target.checked })}
                  />
                  <span>★ Include Internship &amp; Career Support (Only in Tier 2)</span>
                </label>
              </div>

              <p style={{ fontSize: "12px", color: "#d4d2c8", lineHeight: 1.5 }}>
                Unlocks unlimited AI doubt resolution, 1:1 human mentorship sessions, and exclusive resume &amp; referral reviews.
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
        <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                1:1 Mentorship &amp; Career Schedule
              </h2>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "2px" }}>
                Track which sessions have been Given / Completed, manage Google Meet links, and contact students.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSessionModal(true)}
              className="pmu-btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              + Schedule 1:1 Session
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
                  <option value="Applied Computational Mathematics (ACM-101)">ACM-101: Applied Mathematics</option>
                  <option value="Python Programming (PYT-102)">PYT-102: Python Programming</option>
                  <option value="Basic Electrical Engineering (BEE-103)">BEE-103: Circuit Theorems</option>
                  <option value="Computer Architecture (COA-104)">COA-104: Pipelining &amp; Memory</option>
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
                <input type="text" value={newPyqTitle} onChange={(e) => setNewPyqTitle(e.target.value)} placeholder="e.g. Winter 2025 ACM-101 End-Sem Model Paper" className="pmu-input" required />
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
