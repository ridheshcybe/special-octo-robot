"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { planInputSchema } from "../lib/validation";
import { useAdminTable } from "./useAdminData";
import type { Plan } from "../lib/types";

const EMPTY = { id: "", name: "", price_inr: "", duration_days: "", active: true };

export default function AdminPlansPage() {
  const { rows: plans, error, refetch } = useAdminTable<Plan>("plans", {
    column: "price_inr",
    ascending: true,
  });
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setOk(null);

    const parsed = planInputSchema.safeParse({
      name: form.name,
      price_inr: form.price_inr,
      duration_days: form.duration_days,
      active: form.active,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setBusy(true);
    const { error: err } = form.id
      ? await supabase().from("plans").update(parsed.data).eq("id", Number(form.id))
      : await supabase().from("plans").insert(parsed.data);
    setBusy(false);

    if (err) {
      setFormError(err.message);
      return;
    }
    setOk(form.id ? "Plan updated." : "Plan created.");
    setForm(EMPTY);
    refetch();
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this plan? Past payments keep their amount.")) return;
    const { error: err } = await supabase().from("plans").delete().eq("id", id);
    if (err) setFormError(err.message);
    refetch();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={save} className="card space-y-3 self-start">
        <h2 className="font-semibold">{form.id ? "Edit plan" : "New plan"}</h2>
        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
        {ok ? <p className="text-sm text-emerald-600">{ok}</p> : null}

        <div>
          <label className="label" htmlFor="p-name">Name</label>
          <input
            id="p-name"
            className="input"
            required
            placeholder="30-day pass"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="p-price">Price (₹)</label>
            <input
              id="p-price"
              className="input"
              type="number"
              min={1}
              max={200}
              required
              value={form.price_inr}
              onChange={(e) => setForm({ ...form, price_inr: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="p-days">Duration (days)</label>
            <input
              id="p-days"
              className="input"
              type="number"
              min={1}
              required
              value={form.duration_days}
              onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active (buyable)
        </label>

        <div className="flex gap-2">
          <button className="btn-primary" disabled={busy}>
            {busy ? "Saving…" : form.id ? "Save changes" : "Create plan"}
          </button>
          {form.id ? (
            <button type="button" className="btn-outline" onClick={() => setForm(EMPTY)}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {plans === null ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : plans.length === 0 ? (
          <p className="card text-sm text-zinc-500">No plans yet.</p>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="card flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  ₹{plan.price_inr} · {plan.duration_days} days
                </p>
                <p className="text-xs text-zinc-500">
                  {plan.name} ·{" "}
                  {plan.active ? (
                    <span className="badge bg-emerald-50 text-emerald-700">active</span>
                  ) : (
                    <span className="badge bg-zinc-100 text-zinc-600">inactive</span>
                  )}
                </p>
              </div>
              <button
                className="btn-outline text-xs"
                onClick={() =>
                  setForm({
                    id: String(plan.id),
                    name: plan.name,
                    price_inr: String(plan.price_inr),
                    duration_days: String(plan.duration_days),
                    active: plan.active,
                  })
                }
              >
                Edit
              </button>
              <button className="btn-danger text-xs" onClick={() => void remove(plan.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
