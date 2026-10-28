"use client";
import { formatDate } from "../lib/format";

export default function AccessBadge({
  active,
  daysLeft,
  expiresAt,
}: {
  active: boolean;
  daysLeft: number;
  expiresAt?: string | null;
}) {
  if (!active) {
    return (
      <span className="badge bg-zinc-100 text-zinc-600">
        🔒 No active pass
        {expiresAt ? ` · expired ${formatDate(expiresAt)}` : ""}
      </span>
    );
  }
  return (
    <span className="badge bg-emerald-50 text-emerald-700">
      ✅ {daysLeft} {daysLeft === 1 ? "day" : "days"} left
    </span>
  );
}
