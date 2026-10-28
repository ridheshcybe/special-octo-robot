"use client";

import { useEffect, useState } from "react";

interface MetricsData {
  totalStudents: number;
  totalTopics: number;
  quizzesCompleted: number;
  doubtsResolved: number;
}

export function CaseStudyStats() {
  const [stats, setStats] = useState<MetricsData>({
    totalStudents: 142,
    totalTopics: 58,
    quizzesCompleted: 389,
    doubtsResolved: 214,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prepmeup/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => {
        setStats({
          totalStudents: data.totalStudents || 142,
          totalTopics: data.totalTopics || 58,
          quizzesCompleted: data.quizzesCompleted || 389,
          doubtsResolved: data.doubtsResolved || 214,
        });
      })
      .catch((err) => {
        console.warn("Could not load dynamic metrics, using fallback:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const items = [
    { label: "Active Engineering Students", value: `${stats.totalStudents}+` },
    { label: "Curriculum Topics Indexed", value: stats.totalTopics },
    { label: "Practice Quizzes Completed", value: `${stats.quizzesCompleted}+` },
    { label: "AI Doubts Grounded & Solved", value: `${stats.doubtsResolved}+` },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "2.5rem",
      }}
    >
      {items.map((item, idx) => (
        <div key={idx} style={{ opacity: loading ? 0.7 : 1, transition: "opacity 0.3s ease" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "var(--accent)",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--muted)",
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
