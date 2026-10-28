/**
 * The audience is India, so all live-session times display in IST regardless
 * of the device timezone. Schedules are stored as timestamptz (UTC), so this
 * is purely presentation.
 */
const IST_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatIst(iso: string | null): string {
  if (!iso) return "—";
  return IST_FORMATTER.format(new Date(iso)) + " IST";
}

/** Countdown pieces until the target; all zeros once passed. */
export function countdownTo(iso: string): { days: number; hours: number; minutes: number; seconds: number; over: boolean } {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, over: true };
  const totalSec = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    over: false,
  };
}

/** Live "mm:ss until open/end" label for short timers. */
export function mmss(untilMs: number): string {
  const s = Math.max(0, Math.floor(untilMs / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
