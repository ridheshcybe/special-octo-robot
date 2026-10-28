"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { errorMessage, revalidateSite, uploadAsset } from "./api";
import { AdminCard, AdminField, AdminNotice } from "./ui";

export type SettingsField =
  | { kind: "text"; name: string; label: string; hint?: string; placeholder?: string; full?: boolean }
  | { kind: "textarea"; name: string; label: string; hint?: string; placeholder?: string; full?: boolean }
  | { kind: "number"; name: string; label: string; hint?: string; full?: boolean }
  | { kind: "list"; name: string; label: string; hint?: string; addLabel?: string; full?: boolean }
  | {
      kind: "asset";
      name: string;
      label: string;
      hint?: string;
      accept: "image" | "video";
      folder: string;
      full?: boolean;
    };

type SettingsRow = { id: number } & Record<string, unknown>;
type Notice = { tone: "ok" | "err"; text: string } | null;

/**
 * Editor for the `site_settings` singleton.
 *
 * The same component powers Settings, the Story heading/body and the hero
 * media screen — each passes the subset of fields it owns.
 */
export function SettingsForm({
  title,
  hint,
  fields,
  children,
}: {
  title: string;
  hint?: string;
  fields: SettingsField[];
  children?: React.ReactNode;
}) {
  const [row, setRow] = useState<SettingsRow | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      setRow((data as SettingsRow) ?? { id: 1 });
      setFatal(null);
    } catch (err) {
      setFatal(errorMessage(err));
      setRow({ id: 1 });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = (name: string, value: unknown) => {
    setRow((prev) => ({ ...(prev ?? { id: 1 }), [name]: value }));
  };

  const save = async () => {
    if (!row) return;
    setSaving(true);
    setNotice(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("site_settings").upsert({ ...row, id: 1 });
      if (error) throw error;
      await revalidateSite();
      setNotice({ tone: "ok", text: "Saved — the site is updated." });
      await load();
    } catch (err) {
      setNotice({ tone: "err", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (
    name: string,
    accept: "image" | "video",
    folder: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(name);
    setNotice(null);
    try {
      const url = await uploadAsset(file, folder);
      patch(name, url);
      setNotice({
        tone: "ok",
        text: `Uploaded ${accept === "video" ? "video" : "image"} — press Save to publish it.`,
      });
    } catch (err) {
      setNotice({ tone: "err", text: errorMessage(err) });
    } finally {
      setUploading(null);
    }
  };

  const renderField = (field: SettingsField) => {
    const value = row?.[field.name];

    switch (field.kind) {
      case "textarea":
        return (
          <textarea
            className="admin-textarea"
            placeholder={field.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => patch(field.name, e.target.value)}
          />
        );

      case "number":
        return (
          <input
            className="admin-input"
            type="number"
            value={typeof value === "number" ? value : Number(value) || 0}
            onChange={(e) => patch(field.name, Number(e.target.value))}
          />
        );

      case "list": {
        const items = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="admin-tag-list">
            {items.map((item, i) => (
              <div className="admin-tag-row" key={i}>
                <span className="admin-tag-idx">{String(i + 1).padStart(2, "0")}</span>
                <input
                  className="admin-input"
                  value={item}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = e.target.value;
                    patch(field.name, next);
                  }}
                />
                <button
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  type="button"
                  aria-label="Remove"
                  onClick={() => patch(field.name, items.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="admin-btn admin-btn-sm"
              type="button"
              onClick={() => patch(field.name, [...items, ""])}
            >
              {field.addLabel ?? "Add word"}
            </button>
          </div>
        );
      }

      case "asset": {
        const url = typeof value === "string" && value ? value : "";
        return (
          <div className="admin-tag-list">
            <input
              className="admin-input"
              placeholder="/assets/hero/portrait.png or a Storage URL"
              value={url}
              onChange={(e) => patch(field.name, e.target.value)}
            />
            {url && field.accept === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="admin-thumb" src={url} alt="" />
            ) : null}
            {url && field.accept === "video" ? (
              <video className="admin-thumb" src={url} muted loop playsInline controls />
            ) : null}
            {!url ? (
              <p className="admin-hint">
                Empty — the site falls back to the bundled asset in public/assets/.
              </p>
            ) : null}
            <div className="admin-drop">
              <input
                type="file"
                accept={field.accept === "video" ? "video/*" : "image/*"}
                onChange={(e) => onUpload(field.name, field.accept, field.folder, e)}
                disabled={uploading === field.name}
              />
              <span className="admin-hint">
                {uploading === field.name ? "Uploading…" : "Uploads to the portfolio-assets bucket."}
              </span>
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
            onChange={(e) => patch(field.name, e.target.value)}
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
            onClick={save}
            disabled={saving || !row || Boolean(fatal)}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        }
      >
        {row === null ? (
          <p className="admin-hint">Loading…</p>
        ) : (
          <div className="admin-grid">
            {fields.map((field) => (
              <AdminField
                key={field.name}
                label={field.label}
                hint={field.hint}
                full={field.kind === "textarea" || field.kind === "list" || field.kind === "asset" || Boolean(field.full)}
              >
                {renderField(field)}
              </AdminField>
            ))}
          </div>
        )}
      </AdminCard>

      {children}
    </div>
  );
}
