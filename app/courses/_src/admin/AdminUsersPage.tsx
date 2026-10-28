"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { SUPABASE_URL } from "../config";
import { grantDaysSchema } from "../lib/validation";
import { formatDate } from "../lib/format";
import type { AdminProfile } from "../lib/types";

/**
 * Users list with access expiry and the "grant days" action. Reading all
 * users' emails requires the service role, so the list comes from a tiny
 * admin-only edge function; the grant itself is validated and executed there
 * too (RLS prevents students from touching other rows — this page is only
 * reachable for role='admin', re-verified server-side).
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: e } = await supabase()
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (e) {
      setError(e.message);
      setUsers([]);
      return;
    }
    // Emails are not in profiles; fetch the auth admin list via the edge function.
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/admin-list-users`,
      {
        headers: { Authorization: `Bearer ${(await supabase().auth.getSession()).data.session?.access_token}` },
      },
    );
    const body = (await res.json().catch(() => ({}))) as {
      users?: { id: string; email: string }[];
    };
    const emailById = new Map((body.users ?? []).map((u) => [u.id, u.email] as const));
    setUsers(((data ?? []) as AdminProfile[]).map((p) => ({ ...p, email: emailById.get(p.id) ?? "" })));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q),
    );
  }, [users, query]);

  async function grant(userId: string, daysRaw: string) {
    setError(null);
    setOk(null);
    const parsed = grantDaysSchema.safeParse({ user_id: userId, days: daysRaw });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusyId(userId);
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/admin-grant-days`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase().auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(parsed.data),
      },
    );
    const body = (await res.json().catch(() => ({}))) as { error?: string; ok?: string };
    setBusyId(null);
    if (!res.ok) {
      setError(body.error ?? "Could not grant days.");
      return;
    }
    setOk(body.ok ?? "Days granted.");
    void load();
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ok ? <p className="text-sm text-emerald-600">{ok}</p> : null}

      <input
        className="input max-w-xs"
        placeholder="Search by email or name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {users === null ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Access expires</th>
                <th className="px-4 py-2">Grant days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2">
                    <p className="font-medium">{u.full_name || "—"}</p>
                    <p className="text-xs text-zinc-500">{u.email || u.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`badge ${
                        u.role === "admin"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatDate(u.access_expires_at)}</td>
                  <td className="px-4 py-2">
                    <form
                      className="flex items-center gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const days = new FormData(e.currentTarget).get("days");
                        void grant(u.id, String(days ?? ""));
                      }}
                    >
                      <input type="hidden" name="user_id" value={u.id} />
                      <input
                        name="days"
                        type="number"
                        min={1}
                        max={3650}
                        defaultValue={30}
                        className="input w-20 px-2 py-1"
                        aria-label={`Grant days to ${u.email}`}
                      />
                      <button className="btn-outline px-3 py-1 text-xs" disabled={busyId === u.id}>
                        Grant
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
