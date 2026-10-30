"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface CalendarSlot {
  id: string;
  dayOfWeek: string;
  timeSlot: string;
  mentorName: string;
  meetUrl: string;
  isActive: boolean;
  capacity: number;
}

export interface BookedSession {
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
}

const TOPICS = [
  "★ Internship & Career Support (Resume, GitHub & Referrals)",
  "★ Python AI Lab Coding & Line-by-Line Debugging",
  "★ ACM (CSE1001) Proofs, Cayley-Hamilton & SVD",
  "★ BEE (CSE1002) Circuit Theorems & AC Phasors",
  "★ COA (CSE1003) Architecture & Cache Memory",
  "★ End-Semester Strategy & University Past Paper Solving",
];

export function CalendarBookingScheduler({
  initialTier = "guest",
  studentNameProp = "",
  whatsappProp = "",
}: {
  initialTier?: string;
  studentNameProp?: string;
  whatsappProp?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"book" | "my_sessions">("book");
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [mySessions, setMySessions] = useState<BookedSession[]>([]);
  const [userTier, setUserTier] = useState<string>(initialTier);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [fullName, setFullName] = useState(studentNameProp);
  const [whatsapp, setWhatsapp] = useState(whatsappProp);
  const [notes, setNotes] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookedSession | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Generate next 7 days for the date picker
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
    const dayFullName = d.toLocaleDateString("en-IN", { weekday: "long" });
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    const dayNum = d.getDate();
    const isoDate = d.toISOString().slice(0, 10);
    return {
      index: i,
      dayName,
      dayFullName,
      month,
      dayNum,
      isoDate,
      isToday: i === 0,
      isTomorrow: i === 1,
    };
  });

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/sessions");
      const json = await res.json();
      if (json.ok) {
        setSlots(json.activeSlots || []);
        if (json.activeSlots?.length > 0 && !selectedSlotId) {
          setSelectedSlotId(json.activeSlots[0].id);
        }
        if (json.studentSessions) {
          setMySessions(json.studentSessions);
        }
        if (json.studentTier) {
          setUserTier(json.studentTier);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const selectedDateObj = dates[selectedDateIndex] || dates[0];
  const chosenSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    const cleanedPhone = whatsapp.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanedPhone) && !whatsapp.includes("@")) {
      setBookingError("Please enter a valid 10-digit Indian WhatsApp mobile number or email.");
      return;
    }

    // If student is guest or Tier 1 without 1:1 inclusion, redirect to checkout
    if (userTier !== "tier3" && userTier !== "tier2") {
      const slotString = chosenSlot
        ? `${selectedDateObj.dayName}, ${chosenSlot.timeSlot}`
        : `${selectedDateObj.isoDate}`;
      const qs = new URLSearchParams({
        tier: "tier3",
        topic: selectedTopic,
        slot: slotString,
        phone: cleanedPhone,
      });
      router.push(`/prepmeup/checkout?${qs.toString()}`);
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch("/api/prepmeup/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim() || "Engineering Student",
          whatsapp: cleanedPhone ? `+91${cleanedPhone}` : whatsapp.trim(),
          tier: userTier,
          slotId: chosenSlot?.id,
          date: selectedDateObj.isoDate,
          time: chosenSlot?.timeSlot || "Flexible",
          topic: selectedTopic,
          notes: notes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to book session.");
      }

      setBookingSuccess(json.session);
      setMySessions((prev) => [json.session, ...prev]);
    } catch (err: any) {
      setBookingError(err.message || "Something went wrong while booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div
      style={{
        borderRadius: "1rem",
        border: "1px solid rgba(255,59,29,0.25)",
        backgroundColor: "#0d0d10",
        padding: "clamp(1.25rem, 3vw, 2rem)",
        position: "relative",
      }}
    >
      {/* Header Strip */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.5rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid rgba(243,241,234,0.08)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <span
              style={{
                borderRadius: "4px",
                backgroundColor: "rgba(255,59,29,0.15)",
                color: "#ff3b1d",
                padding: "2px 8px",
                fontSize: "0.6875rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              📅 1:1 Live Interactive Scheduler
            </span>
            {userTier === "tier3" ? (
              <span
                style={{
                  borderRadius: "4px",
                  backgroundColor: "rgba(74,222,128,0.15)",
                  color: "#4ade80",
                  padding: "2px 8px",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                ★ Tier 3 VIP • Unlimited 1:1 Sessions Active
              </span>
            ) : userTier === "tier2" ? (
              <span
                style={{
                  borderRadius: "4px",
                  backgroundColor: "rgba(255,106,61,0.15)",
                  color: "#ff6a3d",
                  padding: "2px 8px",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                }}
              >
                Tier 2 • 1 Included Session
              </span>
            ) : (
              <span
                style={{
                  borderRadius: "4px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#a19f95",
                  padding: "2px 8px",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                }}
              >
                Direct Admin Scheduling
              </span>
            )}
          </div>
          <h3
            className="font-display"
            style={{ fontSize: "1.5rem", color: "#f3f1ea", textTransform: "uppercase", margin: 0 }}
          >
            Book 1:1 Live Video Mentorship
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#a19f95", margin: "0.25rem 0 0" }}>
            Connect 1:1 on Google Meet with senior engineering mentors for code reviews, math proofs, and career roadmap.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", gap: "6px", backgroundColor: "#17171b", padding: "4px", borderRadius: "8px" }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab("book");
              setBookingSuccess(null);
            }}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              backgroundColor: activeTab === "book" ? "#ff3b1d" : "transparent",
              color: activeTab === "book" ? "#08080a" : "#a19f95",
            }}
          >
            Calendar Booking
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("my_sessions")}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              backgroundColor: activeTab === "my_sessions" ? "#ff3b1d" : "transparent",
              color: activeTab === "my_sessions" ? "#08080a" : "#a19f95",
            }}
          >
            My Sessions ({mySessions.length})
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 1: CALENDAR BOOKING
          ===================================================================== */}
      {activeTab === "book" && (
        <>
          {bookingSuccess ? (
            <div
              style={{
                borderRadius: "0.75rem",
                border: "1px solid rgba(74,222,128,0.4)",
                backgroundColor: "rgba(34,197,94,0.06)",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(74,222,128,0.2)",
                  color: "#4ade80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  margin: "0 auto 1rem",
                }}
              >
                ✓
              </div>
              <h4 className="font-display" style={{ fontSize: "1.5rem", color: "#f3f1ea", textTransform: "uppercase" }}>
                1:1 Live Mentorship Confirmed!
              </h4>
              <p style={{ fontSize: "0.9375rem", color: "#86efac", marginTop: "0.5rem" }}>
                Topic: <strong>{bookingSuccess.topic}</strong>
              </p>
              <div
                style={{
                  margin: "1.25rem auto",
                  maxWidth: "460px",
                  padding: "1rem",
                  borderRadius: "8px",
                  backgroundColor: "#111114",
                  border: "1px solid rgba(243,241,234,0.1)",
                  textAlign: "left",
                  fontSize: "0.8125rem",
                  color: "#d4d2c8",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <span style={{ color: "#807f78" }}>Slot &amp; Date: </span>
                  <strong style={{ color: "#f3f1ea" }}>{bookingSuccess.slot}</strong>
                </div>
                <div>
                  <span style={{ color: "#807f78" }}>Student Name: </span>
                  <strong style={{ color: "#f3f1ea" }}>{bookingSuccess.studentName}</strong>
                </div>
                <div>
                  <span style={{ color: "#807f78" }}>Status: </span>
                  <span
                    style={{
                      borderRadius: "4px",
                      padding: "2px 6px",
                      backgroundColor: "rgba(74,222,128,0.15)",
                      color: "#4ade80",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                    }}
                  >
                    SCHEDULED
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
                <a
                  href={bookingSuccess.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pmu-btn-primary"
                  style={{ padding: "10px 20px" }}
                >
                  Join Google Meet Room 🎥
                </a>
                <button
                  type="button"
                  onClick={() => setBookingSuccess(null)}
                  className="pmu-btn-secondary"
                  style={{ padding: "10px 20px" }}
                >
                  Schedule Another Session +
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookSession} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* STEP 1: DATE PICKER STRIP */}
              <div>
                <label className="pmu-label" style={{ marginBottom: "0.5rem", display: "block" }}>
                  1. Select Preferred Date
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    gap: "8px",
                  }}
                >
                  {dates.map((d) => {
                    const isSelected = d.index === selectedDateIndex;
                    return (
                      <button
                        key={d.isoDate}
                        type="button"
                        onClick={() => setSelectedDateIndex(d.index)}
                        style={{
                          padding: "10px 6px",
                          borderRadius: "8px",
                          border: isSelected ? "2px solid #ff3b1d" : "1px solid #26262c",
                          backgroundColor: isSelected ? "rgba(255,59,29,0.12)" : "#141418",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "3px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: isSelected ? "#ff3b1d" : "#807f78",
                            fontWeight: 700,
                          }}
                        >
                          {d.isToday ? "TODAY" : d.isTomorrow ? "TMRW" : d.dayName}
                        </span>
                        <span
                          className="font-display"
                          style={{
                            fontSize: "1.35rem",
                            lineHeight: 1,
                            color: isSelected ? "#f3f1ea" : "#a19f95",
                          }}
                        >
                          {d.dayNum}
                        </span>
                        <span style={{ fontSize: "0.6875rem", color: "#666" }}>{d.month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: AVAILABLE TIME SLOTS (FROM ADMIN PANEL) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                  <label className="pmu-label" style={{ margin: 0 }}>
                    2. Select Live Time Slot (IST)
                  </label>
                  <span style={{ fontSize: "0.75rem", color: "#ff6a3d" }}>
                    {slots.length} Admin-Verified Slots
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {slots.map((s) => {
                    const isSelected = s.id === selectedSlotId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSlotId(s.id)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "8px",
                          border: isSelected ? "1.5px solid #ff3b1d" : "1px solid #1f1f24",
                          backgroundColor: isSelected ? "rgba(255,59,29,0.08)" : "#111114",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            className="font-mono"
                            style={{
                              fontSize: "0.8125rem",
                              fontWeight: 700,
                              color: isSelected ? "#ff3b1d" : "#f3f1ea",
                            }}
                          >
                            {s.timeSlot}
                          </span>
                          <span
                            style={{
                              fontSize: "0.625rem",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: isSelected ? "#ff3b1d" : "#1f1f24",
                              color: isSelected ? "#08080a" : "#4ade80",
                              fontWeight: 700,
                            }}
                          >
                            {isSelected ? "SELECTED" : "AVAILABLE"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#a19f95", marginTop: "2px" }}>
                          {s.mentorName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: TOPIC SELECTION */}
              <div>
                <label className="pmu-label" style={{ marginBottom: "0.5rem", display: "block" }}>
                  3. Mentorship Focus / Subject
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="pmu-input"
                  style={{ backgroundColor: "#111114", cursor: "pointer" }}
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t} style={{ backgroundColor: "#111114", color: "#f3f1ea" }}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 4: STUDENT DETAILS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
                <div>
                  <label className="pmu-label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="pmu-input"
                  />
                </div>
                <div>
                  <label className="pmu-label">WhatsApp Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="10-digit Indian WhatsApp number"
                    className="pmu-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="pmu-label">Specific Questions or Doubts for Mentor (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Reviewing my Python binary search code and discussing Cayley-Hamilton proof."
                  rows={2}
                  className="pmu-input"
                  style={{ resize: "vertical" }}
                />
              </div>

              {bookingError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#fca5a5",
                    fontSize: "0.8125rem",
                  }}
                >
                  {bookingError}
                </div>
              )}

              {/* ACTION BUTTON */}
              <div>
                {userTier === "tier3" ? (
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="pmu-btn-primary"
                    style={{ width: "100%", padding: "14px", fontSize: "0.9375rem" }}
                  >
                    {bookingLoading ? "Confirming 1:1 Session…" : "✓ Confirm 1:1 Session (Tier 3 VIP Free) →"}
                  </button>
                ) : userTier === "tier2" ? (
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="pmu-btn-primary"
                    style={{ width: "100%", padding: "14px", fontSize: "0.9375rem" }}
                  >
                    {bookingLoading ? "Booking Included Session…" : "✓ Book Included 1:1 Human Mentor Session →"}
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="pmu-btn-primary"
                      style={{ width: "100%", padding: "14px", fontSize: "0.9375rem" }}
                    >
                      Book 1:1 Session &amp; Unlock Tier 3 VIP (₹499) →
                    </button>
                    <span style={{ textAlign: "center", fontSize: "0.75rem", color: "#807f78" }}>
                      Includes UNLIMITED 1:1 Live Video Sessions + Pro AI + Full Semester Pass
                    </span>
                  </div>
                )}
              </div>
            </form>
          )}
        </>
      )}

      {/* =====================================================================
          TAB 2: MY BOOKED SESSIONS
          ===================================================================== */}
      {activeTab === "my_sessions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {mySessions.length === 0 ? (
            <div style={{ padding: "3rem 1rem", textAlign: "center", color: "#807f78" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
              <p style={{ fontSize: "0.9375rem", color: "#d4d2c8", margin: 0 }}>
                No active 1:1 sessions scheduled yet.
              </p>
              <p style={{ fontSize: "0.8125rem", marginTop: "0.25rem" }}>
                Switch to the Calendar Booking tab to reserve your live Google Meet call.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("book")}
                className="pmu-btn-secondary"
                style={{ marginTop: "1rem", padding: "8px 16px", fontSize: "0.8125rem" }}
              >
                Book Your First 1:1 Call →
              </button>
            </div>
          ) : (
            mySessions.map((sess) => {
              const isLive = sess.status === "live_now";
              const isCompleted = sess.status === "completed";

              return (
                <div
                  key={sess.id}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "8px",
                    border: isLive
                      ? "1.5px solid rgba(239,68,68,0.5)"
                      : isCompleted
                      ? "1px solid rgba(74,222,128,0.3)"
                      : "1px solid #26262c",
                    backgroundColor: isLive
                      ? "rgba(239,68,68,0.06)"
                      : isCompleted
                      ? "rgba(74,222,128,0.04)"
                      : "#111114",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 800,
                          borderRadius: "4px",
                          padding: "2px 6px",
                          backgroundColor: isLive
                            ? "rgba(239,68,68,0.2)"
                            : isCompleted
                            ? "rgba(74,222,128,0.2)"
                            : "rgba(255,106,61,0.2)",
                          color: isLive ? "#f87171" : isCompleted ? "#4ade80" : "#ff6a3d",
                        }}
                      >
                        {isLive ? "LIVE NOW 🔴" : isCompleted ? "COMPLETED ✓" : "SCHEDULED"}
                      </span>
                      <span style={{ fontSize: "0.8125rem", color: "#a19f95" }}>{sess.slot}</span>
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: sess.topic.includes("Career") ? "#86efac" : "#f3f1ea",
                      }}
                    >
                      {sess.topic}
                    </div>
                    {sess.notes && (
                      <div style={{ marginTop: "4px", fontSize: "0.75rem", color: "#807f78" }}>
                        Note: {sess.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <a
                      href={sess.meetUrl || "https://meet.google.com/pmu-vip-room"}
                      target="_blank"
                      rel="noreferrer"
                      className="pmu-btn-primary"
                      style={{ padding: "8px 16px", fontSize: "0.8125rem" }}
                    >
                      {isLive ? "Join Live Call Now 🎥" : "Google Meet Link 🎥"}
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
