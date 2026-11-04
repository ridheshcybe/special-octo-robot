"use client";

import { cx } from "@/lib/cx";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { errorMessage, revalidateSite, uploadAsset } from "./api";
import { AdminCard, AdminField, AdminNotice } from "./ui";

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "image";
  hint?: string;
  placeholder?: string;
  /** span the full grid width */
  full?: boolean;
};

export type CrudRow = { id: number } & Record<string, unknown>;

type CrudListProps = {
  table: string;
  title: string;
  hint?: string;
  orderBy?: string;
  fields: CrudField[];
  defaults: Record<string, unknown>;
  /** field rendered as the row heading */
  rowTitle: string;
  /** small uppercase meta line under the heading */
  metaFields?: string[];
  uploadFolder?: string;
  addLabel?: string;
};

type Notice = { tone: "ok" | "err"; text: string } | null;

/**
 * One editor for every ordered content list.
 *
 * Rows load from the table, edits are held locally, and each row saves itself —
 * so a half-finished edit never touches the live site. Add / delete / reorder
 * write straight through, then rewrite `sort_order` for the whole list so the
 * order is always dense and deterministic.
 */
export function CrudList({
  table,
  title,
  hint,
  orderBy = "sort_order",
  fields,
  defaults,
  rowTitle,
  metaFields = [],
  uploadFolder = "uploads",
  addLabel = "Add item",
}: CrudListProps) {
  const [rows, setRows] = useState<CrudRow[] | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy, { ascending: true });
      if (error) throw error;
      setRows((data ?? []) as CrudRow[]);
      setFatal(null);
    } catch (err) {
      setFatal(errorMessage(err));
      setRows([]);
    }
  }, [table, orderBy]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = (id: number, name: string, value: unknown) => {
    setRows((prev) => prev?.map((row) => (row.id === id ? { ...row, [name]: value } : row)) ?? prev);
  };

  const writeOrder = async (list: CrudRow[]) => {
    const supabase = createClient();
    await Promise.all(
      list.map((row, i) => supabase.from(table).update({ [orderBy]: i }).eq("id", row.id)),
    );
  };

  const saveRow = async (row: CrudRow) => {
    setBusy(`save-${row.id}`);
    setNotice(null);
    try {
      const supabase = createClient();
      const { id, ...values } = row;
      const { error } = await supabase.from(table).update(values).eq("id", id);
      if (error) throw error;
      await revalidateSite();
      setNotice({ tone: "ok", text: "Saved — the site is updated." });
      await load();
    } catch (err) {
      setNotice({ tone: "err", text: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const addRow = async () => {
    setBusy("add");
    setNotice(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from(table)
        .insert({ ...defaults, [orderBy]: rows?.length ?? 0 });
      if (error) throw error;
      await load();
      await revalidateSite();
    } catch (err) {
      setNotice({ tone: "err", text: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const removeRow = async (row: CrudRow) => {
    const label = String(row[rowTitle] ?? "this item");
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
    setBusy(`delete-${row.id}`);
    setNotice(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from(table).delete().eq("id", row.id);
      if (error) throw error;
      const remaining = (rows ?? []).filter((r) => r.id !== row.id);
      setRows(remaining);
      await writeOrder(remaining);
      await revalidateSite();
      await load();
    } catch (err) {
      setNotice({ tone: "err", text: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const moveRow = async (index: number, dir: -1 | 1) => {
    const list = [...(rows ?? [])];
    const target = index + dir;
    if (!list[index] || !list[target]) return;
    [list[index], list[target]] = [list[target], list[index]];
    setRows(list);
    setBusy("order");
    setNotice(null);
    try {
      await writeOrder(list);
      await revalidateSite();
      await load();
    } catch (err) {
      setNotice({ tone: "err", text: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const onUpload = async (row: CrudRow, name: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(`upload-${row.id}`);
    setNotice(null);
    try {
      const url = await uploadAsset(file, uploadFolder);
      patch(row.id, name, url);
      setNotice({ tone: "ok", text: "Uploaded — press Save to publish it." });
    } catch (err) {
      setNotice({ tone: "err", text: errorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const renderControl = (row: CrudRow, field: CrudField) => {
    const value = row[field.name];

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            className="admin-textarea"
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => patch(row.id, field.name, e.target.value)}
          />
        );

      case "number":
        return (
          <input
            className="admin-input"
            type="number"
            placeholder={field.placeholder}
            value={typeof value === "number" ? value : Number(value) || 0}
            onChange={(e) => patch(row.id, field.name, Number(e.target.value))}
          />
        );

      case "checkbox":
        return (
          <label className="admin-check">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => patch(row.id, field.name, e.target.checked)}
            />
            <span>{Boolean(value) ? "Visible on the site" : "Hidden"}</span>
          </label>
        );

      case "image": {
        const url = typeof value === "string" && value ? value : "";
        return (
          <div className="admin-tag-list">
            <input
              className="admin-input"
              placeholder="/assets/projects/project-01.jpg or a Storage URL"
              value={url}
              onChange={(e) => patch(row.id, field.name, e.target.value)}
            />
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="admin-thumb" src={url} alt="" />
            ) : (
              <p className="admin-hint">
                Empty — the site falls back to the bundled asset, then to the placeholder.
              </p>
            )}
            <div className="admin-drop">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onUpload(row, field.name, e)}
                disabled={busy === `upload-${row.id}`}
              />
              <span className="admin-hint">Uploads to the portfolio-assets bucket.</span>
            </div>
          </div>
        );
      }

      default:
        return (
          <input
            className="admin-input"
            type="text"
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : value == null ? "" : String(value)}
            onChange={(e) => patch(row.id, field.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="admin-body">
      {fatal ? <AdminNotice tone="err">{fatal}</AdminNotice> : null}
      {notice ? <AdminNotice tone={notice.tone}>{notice.text}</AdminNotice> : null}

      <AdminCard
        title={title}
        hint={hint}
        actions={
          <button
            className="admin-btn admin-btn-primary"
            type="button"
            onClick={addRow}
            disabled={busy === "add" || Boolean(fatal)}
          >
            {busy === "add" ? "Adding…" : addLabel}
          </button>
        }
      >
        {rows === null ? (
          <p className="admin-hint">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="admin-empty">Nothing here yet. Add the first item.</p>
        ) : (
          <ul className="admin-list">
            {rows.map((row, i) => (
              <li className="admin-row" key={row.id}>
                <div className="admin-row-main" style={{ flex: 1 }}>
                  <div className="admin-row-head">
                    <div>
                      <p className="admin-row-title">
                        <span className="admin-index">{String(i + 1).padStart(2, "0")}</span>
                        {String(row[rowTitle] || "Untitled")}
                      </p>
                      {metaFields.length ? (
                        <p className="admin-row-meta">
                          {metaFields
                            .map((name) => String(row[name] ?? ""))
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>

                    <div className="admin-row-actions">
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        type="button"
                        aria-label="Move up"
                        onClick={() => moveRow(i, -1)}
                        disabled={i === 0 || busy === "order"}
                      >
                        ↑
                      </button>
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        type="button"
                        aria-label="Move down"
                        onClick={() => moveRow(i, 1)}
                        disabled={i === rows.length - 1 || busy === "order"}
                      >
                        ↓
                      </button>
                      <button
                        className="admin-btn admin-btn-sm"
                        type="button"
                        onClick={() => saveRow(row)}
                        disabled={busy === `save-${row.id}`}
                      >
                        {busy === `save-${row.id}` ? "Saving…" : "Save"}
                      </button>
                      <button
                        className={cx("admin-btn", "admin-btn-sm", "admin-btn-danger")}
                        type="button"
                        onClick={() => removeRow(row)}
                        disabled={busy === `delete-${row.id}`}
                      >
                        {busy === `delete-${row.id}` ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="admin-grid" style={{ marginTop: "1.5rem" }}>
                    {fields.map((field) => (
                      <AdminField
                        key={field.name}
                        label={field.label}
                        hint={field.hint}
                        full={field.full}
                      >
                        {renderControl(row, field)}
                      </AdminField>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
