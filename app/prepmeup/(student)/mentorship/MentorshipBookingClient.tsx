"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MentorshipSlot, MentorshipSessionItem } from "@/app/prepmeup/_lib/trackStore";

interface Props {
  availableSlots: MentorshipSlot[];
  initialSessions: MentorshipSessionItem[];
  isLoggedIn: boolean;
}

export function MentorshipBookingClient({ availableSlots, initialSessions, isLoggedIn }: Props) {
  const [slots, setSlots] = useState<MentorshipSlot[]>(availableSlots);
  const [sessions, setSessions] = useState<MentorshipSessionItem[]>(initialSessions);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(availableSlots[0]?.id || "");
  const [sessionType, setSessionType] = useState<string>("quantum_interview_prep");
  const [studentNotes, setStudentNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setFeedback({ type: "error", message: "Please log in with student email OTP first to book a session." });
      return;
    }
    if (!selectedSlotId) {
      setFeedback({ type: "error", message: "Please select an available faculty time slot." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/prepmeup/mentorship/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlotId,
          sessionType,
          studentNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to book mentorship session.");
      }

      setSessions((prev) => [data.session, ...prev]);
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlotId));
      setSelectedSlotId(slots.filter((s) => s.id !== selectedSlotId)[0]?.id || "");
      setFeedback({
        type: "success",
        message: "✓ 1-on-1 session requested! Dr. Vaidya will review your topic notes and confirm the meeting link.",
      });
      setStudentNotes("");
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/prepmeup/mentorship/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (data.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, status: "cancelled" } : s))
        );
      }
    } catch {}
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {feedback && (
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: feedback.type === "success" ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 59, 29, 0.1)",
            border: `1px solid ${feedback.type === "success" ? "#00e676" : "#ff3b1d"}`,
            borderRadius: "8px",
            color: feedback.type === "success" ? "#00e676" : "#ff6a3d",
            fontSize: "14px",
            fontFamily: "monospace",
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Booking Form Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Step 1: Session Selector & Details */}
        <div className="pmu-card" style={{ padding: "30px" }}>
          <span className="pmu-badge">Step 1</span>
          <h2 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "10px" }}>
            Select Mentorship Objective
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {[
              {
                id: "quantum_interview_prep",
                title: "Quantum Algorithm Interview Prep",
                desc: "Mock technical interview on Grover search, circuit complexity, and Qiskit SDK coding questions.",
              },
              {
                id: "quantum_doubt_clearing",
                title: "Complex Quantum Doubt Clearing",
                desc: "1-on-1 derivations of density matrices, partial trace, teleportation protocol, and Bell inequality proofs.",
              },
              {
                id: "career_guidance",
                title: "Research & Industry Career Guidance",
                desc: "Discuss quantum computing master's/PhD programs, Q-NEXT/IBM quantum fellowships, and portfolio advice.",
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setSessionType(item.id)}
                style={{
                  padding: "14px 18px",
                  backgroundColor: sessionType === item.id ? "rgba(255, 59, 29, 0.1)" : "#08080a",
                  border: `1px solid ${sessionType === item.id ? "#ff3b1d" : "rgba(243, 241, 234, 0.08)"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: sessionType === item.id ? "#ff6a3d" : "#f3f1ea" }}>
                    {item.title}
                  </span>
                  {sessionType === item.id && <span style={{ color: "#ff3b1d" }}>✓</span>}
                </div>
                <p style={{ fontSize: "12px", color: "#807f78", marginTop: "4px", lineHeight: "1.5" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Available Slots & Notes Form */}
        <div className="pmu-card" style={{ padding: "30px" }}>
          <span className="pmu-badge">Step 2</span>
          <h2 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "10px" }}>
            Faculty Time Slot &amp; Agenda
          </h2>

          <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
            <div>
              <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                Available 45-Minute Slots ({slots.length})
              </label>

              {slots.length === 0 ? (
                <div style={{ padding: "14px", backgroundColor: "#08080a", borderRadius: "8px", color: "#807f78", fontSize: "13px", marginTop: "6px" }}>
                  No open slots currently available. Please check back as faculty adds new slots weekly.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px", maxHeight: "190px", overflowY: "auto" }}>
                  {slots.map((s) => {
                    const dt = new Date(s.startAt);
                    const formatted = dt.toLocaleString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    });
                    const isSelected = selectedSlotId === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSlotId(s.id)}
                        style={{
                          padding: "10px 14px",
                          backgroundColor: isSelected ? "#17171b" : "#08080a",
                          border: `1px solid ${isSelected ? "#00e676" : "rgba(243, 241, 234, 0.08)"}`,
                          borderRadius: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        <span style={{ color: isSelected ? "#00e676" : "#f3f1ea", fontWeight: isSelected ? "bold" : "normal" }}>
                          📅 {formatted} IST
                        </span>
                        <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                          {s.durationMinutes} min
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                What specific topic or code do you want to cover?
              </label>
              <textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="e.g. I need help implementing Grover's 3-qubit diffusion operator in Qiskit, and I have a question on equation 4.2."
                required
                rows={3}
                style={{
                  width: "100%",
                  marginTop: "6px",
                  padding: "10px 14px",
                  backgroundColor: "#08080a",
                  border: "1px solid rgba(243, 241, 234, 0.12)",
                  borderRadius: "6px",
                  color: "#f3f1ea",
                  fontSize: "13px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || slots.length === 0}
              className="pmu-btn-primary"
              style={{ width: "100%", padding: "14px", marginTop: "6px" }}
            >
              {isSubmitting ? "Reserving Slot..." : "Request 1:1 Faculty Session →"}
            </button>
          </form>
        </div>
      </div>

      {/* Existing Sessions Dashboard */}
      <div className="pmu-card" style={{ padding: "30px" }}>
        <h2 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase" }}>
          My Mentorship Sessions ({sessions.length})
        </h2>
        <p style={{ fontSize: "13px", color: "#807f78", marginTop: "4px" }}>
          Private 1-on-1 sessions booked under your student account.
        </p>

        {sessions.length === 0 ? (
          <div style={{ marginTop: "16px", padding: "24px", backgroundColor: "#08080a", borderRadius: "8px", textAlign: "center", color: "#807f78", fontSize: "14px" }}>
            You have no active mentorship requests. Select an available slot above to schedule your first 1:1 session.
          </div>
        ) : (
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {sessions.map((sess) => {
              const dt = new Date(sess.scheduledAt);
              const formattedDate = dt.toLocaleString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Kolkata",
              });

              const isConfirmed = sess.status === "confirmed";

              return (
                <div
                  key={sess.id}
                  style={{
                    padding: "20px",
                    backgroundColor: "#08080a",
                    border: `1px solid ${isConfirmed ? "rgba(0, 230, 118, 0.4)" : "rgba(243, 241, 234, 0.1)"}`,
                    borderRadius: "8px",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        className="pmu-badge"
                        style={{
                          backgroundColor:
                            sess.status === "confirmed"
                              ? "rgba(0, 230, 118, 0.15)"
                              : sess.status === "requested"
                              ? "rgba(255, 106, 61, 0.15)"
                              : "#17171b",
                          color:
                            sess.status === "confirmed"
                              ? "#00e676"
                              : sess.status === "requested"
                              ? "#ff6a3d"
                              : "#807f78",
                        }}
                      >
                        {sess.status.toUpperCase()}
                      </span>
                      <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                        {sess.sessionType.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>

                    <h3 className="font-display" style={{ fontSize: "18px", color: "#f3f1ea", marginTop: "8px" }}>
                      With {sess.instructorName}
                    </h3>
                    <div className="font-mono" style={{ fontSize: "13px", color: "#00e676", marginTop: "2px" }}>
                      📅 {formattedDate} IST ({sess.durationMinutes} min)
                    </div>

                    <p style={{ fontSize: "13px", color: "#807f78", marginTop: "6px" }}>
                      <strong>Your Goal:</strong> {sess.studentNotes}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {isConfirmed && sess.meetingUrl && (
                      <a
                        href={sess.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pmu-btn-primary"
                        style={{ padding: "8px 18px", fontSize: "12px", textDecoration: "none" }}
                      >
                        Join Google Meet ↗
                      </a>
                    )}
                    {sess.status === "requested" && (
                      <button
                        onClick={() => handleCancelSession(sess.id)}
                        className="pmu-btn-secondary"
                        style={{ padding: "8px 14px", fontSize: "12px", color: "#ff3b1d", borderColor: "#ff3b1d" }}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
