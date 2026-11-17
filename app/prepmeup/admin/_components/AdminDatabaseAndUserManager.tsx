"use client";

import React, { useEffect, useState } from "react";

interface ManagedUser {
  id: string;
  name: string;
  target: string;
  type: "email" | "phone";
  college: string;
  branch: string;
  role: "student" | "admin";
  tier: string;
  isBanned?: boolean;
  registeredAt?: string;
  lastSeenAt?: string;
}

export function AdminDatabaseAndUserManager({
  users,
  onRefresh,
}: {
  users: ManagedUser[];
  onRefresh: () => void;
}) {
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Database Explorer state
  const [dbOpen, setDbOpen] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [tables, setTables] = useState<Record<string, any[]>>({});
  const [activeTable, setActiveTable] = useState<string>("local_users");
  const [tableFilter, setTableFilter] = useState("");

  const loadDatabase = async () => {
    setDbLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/database");
      const data = await res.json();
      if (data.ok && data.tables) {
        setTables(data.tables);
        const firstKey = Object.keys(data.tables)[0];
        if (firstKey && !data.tables[activeTable]) {
          setActiveTable(firstKey);
        }
      }
    } catch {}
    setDbLoading(false);
  };

  useEffect(() => {
    if (dbOpen) {
      loadDatabase();
    }
  }, [dbOpen]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/prepmeup/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_user",
          userId: editingUser.id,
          updates: {
            name: editingUser.name,
            target: editingUser.target,
            type: editingUser.target.includes("@") ? "email" : "phone",
            college: editingUser.college,
            branch: editingUser.branch,
            tier: editingUser.tier,
            role: editingUser.role,
            isBanned: Boolean(editingUser.isBanned),
          },
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg(`Saved changes for ${editingUser.name}`);
        setEditingUser(null);
        onRefresh();
        if (dbOpen) loadDatabase();
      } else {
        setStatusMsg(data.error || "Failed to update user.");
      }
    } catch {
      setStatusMsg("Network error while saving user.");
    }
    setSaving(false);
  };

  const handleToggleBan = async (u: ManagedUser) => {
    const nextBan = !u.isBanned;
    setStatusMsg(null);
    try {
      const res = await fetch("/api/prepmeup/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_ban",
          userId: u.id,
          isBanned: nextBan,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg(`${u.name} has been ${nextBan ? "banned" : "unbanned"}.`);
        onRefresh();
        if (dbOpen) loadDatabase();
      }
    } catch {}
  };

  const handleDeleteUser = async (u: ManagedUser) => {
    if (!window.confirm(`Permanently delete user "${u.name}" (${u.target})?`)) return;
    setStatusMsg(null);
    try {
      const res = await fetch("/api/prepmeup/admin/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_user",
          userId: u.id,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg(`Deleted user ${u.name}.`);
        onRefresh();
        if (dbOpen) loadDatabase();
      }
    } catch {}
  };

  const rows = (tables[activeTable] || []).filter((r) =>
    !tableFilter.trim()
      ? true
      : JSON.stringify(r).toLowerCase().includes(tableFilter.trim().toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Bar: User Management + Database Explorer Toggle */}
      <div
        className="pmu-card"
        style={{
          padding: "20px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
        }}
      >
        <div>
          <h3
            className="font-display"
            style={{ fontSize: "18px", textTransform: "uppercase", color: "#f3f1ea", margin: 0 }}
          >
            User Management &amp; Database Explorer
          </h3>
          <p style={{ fontSize: "12px", color: "#807f78", marginTop: "4px", marginBottom: 0 }}>
            Edit student names, phone numbers, emails, tiers, ban/unban accounts, or inspect raw database tables.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDbOpen(!dbOpen)}
          className={dbOpen ? "pmu-btn-primary" : "pmu-btn-secondary"}
          style={{ padding: "8px 14px", fontSize: "12px" }}
        >
          {dbOpen ? "Hide Database Explorer" : "Open Database Explorer"}
        </button>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            backgroundColor: "rgba(34, 197, 94, 0.12)",
            border: "1px solid rgba(34, 197, 94, 0.35)",
            color: "#4ade80",
            fontSize: "12px",
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* Quick User Edit / Ban Actions Table */}
      <div className="pmu-card" style={{ padding: "20px 24px", overflowX: "auto" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#807f78", marginBottom: "12px", textTransform: "uppercase" }}>
          Manage Accounts ({users.length})
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #26262c", textAlign: "left", color: "#807f78" }}>
              <th style={{ padding: "8px" }}>Name</th>
              <th style={{ padding: "8px" }}>Email / Phone</th>
              <th style={{ padding: "8px" }}>College / Branch</th>
              <th style={{ padding: "8px" }}>Tier &amp; Role</th>
              <th style={{ padding: "8px" }}>Status</th>
              <th style={{ padding: "8px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid rgba(243,241,234,0.06)" }}>
                <td style={{ padding: "10px 8px", color: "#f3f1ea", fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: "10px 8px", color: "#a19f95", fontFamily: "monospace" }}>{u.target}</td>
                <td style={{ padding: "10px 8px", color: "#807f78" }}>
                  {u.college || "—"} • {u.branch || "B.Tech"}
                </td>
                <td style={{ padding: "10px 8px", color: "#f3f1ea" }}>
                  {u.tier} ({u.role})
                </td>
                <td style={{ padding: "10px 8px" }}>
                  {u.isBanned ? (
                    <span style={{ color: "#f87171", fontWeight: 700, fontSize: "11px" }}>BANNED</span>
                  ) : (
                    <span style={{ color: "#4ade80", fontWeight: 600, fontSize: "11px" }}>ACTIVE</span>
                  )}
                </td>
                <td style={{ padding: "10px 8px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ display: "inline-flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setEditingUser({ ...u })}
                      className="pmu-btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleBan(u)}
                      className="pmu-btn-secondary"
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        color: u.isBanned ? "#4ade80" : "#fbbf24",
                      }}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u)}
                      className="pmu-btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "11px", color: "#f87171" }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <form
            onSubmit={handleSaveUser}
            className="pmu-card"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <h3 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", textTransform: "uppercase", margin: 0 }}>
              Edit User Account
            </h3>
            <div>
              <label className="pmu-label">Full Name</label>
              <input
                type="text"
                className="pmu-input"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="pmu-label">Email or Phone Number</label>
              <input
                type="text"
                className="pmu-input font-mono"
                value={editingUser.target}
                onChange={(e) => setEditingUser({ ...editingUser, target: e.target.value })}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="pmu-label">College</label>
                <input
                  type="text"
                  className="pmu-input"
                  value={editingUser.college}
                  onChange={(e) => setEditingUser({ ...editingUser, college: e.target.value })}
                />
              </div>
              <div>
                <label className="pmu-label">Branch</label>
                <input
                  type="text"
                  className="pmu-input"
                  value={editingUser.branch}
                  onChange={(e) => setEditingUser({ ...editingUser, branch: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="pmu-label">Tier</label>
                <select
                  className="pmu-input"
                  value={editingUser.tier}
                  onChange={(e) => setEditingUser({ ...editingUser, tier: e.target.value })}
                >
                  <option value="Free Student">Free Student</option>
                  <option value="Tier 1 Pass (₹99)">Tier 1 Pass (₹99)</option>
                  <option value="Tier 2 Pro (₹199)">Tier 2 Pro (₹199)</option>
                  <option value="Tier 3 VIP Unlimited (₹499)">Tier 3 VIP Unlimited (₹499)</option>
                </select>
              </div>
              <div>
                <label className="pmu-label">Role</label>
                <select
                  className="pmu-input"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value as "student" | "admin" })
                  }
                >
                  <option value="student">student</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="pmu-btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="pmu-btn-primary" style={{ flex: 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Database Explorer */}
      {dbOpen && (
        <div className="pmu-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {Object.keys(tables).map((tName) => (
                <button
                  key={tName}
                  type="button"
                  onClick={() => setActiveTable(tName)}
                  className={activeTable === tName ? "pmu-btn-primary" : "pmu-btn-secondary"}
                  style={{ padding: "6px 12px", fontSize: "11.5px" }}
                >
                  {tName} ({tables[tName]?.length || 0})
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Filter rows..."
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                className="pmu-input font-mono"
                style={{ width: "200px", padding: "6px 10px", fontSize: "12px" }}
              />
              <button
                type="button"
                onClick={loadDatabase}
                disabled={dbLoading}
                className="pmu-btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                {dbLoading ? "Loading..." : "Refresh DB"}
              </button>
            </div>
          </div>

          <pre
            className="font-mono"
            style={{
              maxHeight: "460px",
              overflow: "auto",
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: "#08080a",
              border: "1px solid #26262c",
              fontSize: "11.5px",
              color: "#f3f1ea",
              margin: 0,
            }}
          >
            {JSON.stringify(rows, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
