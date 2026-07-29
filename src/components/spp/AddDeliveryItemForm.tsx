"use client";

import { useState } from "react";
import type { DeliveryTask } from "@/lib/spp-queries";
import { DELIVERY_STATUS_LABEL, DELIVERY_YEARS, deliveryYearLabel } from "@/lib/delivery-meta";

interface AddDeliveryItemFormProps {
  defaultYear: number;
  systems: string[];
  owners: string[];
  onCreated: (task: DeliveryTask) => void;
  onCancel: () => void;
}

const EMPTY = {
  title: "",
  system: "",
  next_step: "",
  owner: "",
  start_date: "",
  end_date: "",
  cost_k: "",
  benefit_k: "",
  status: "not_started",
};

// Inline "Add Item" panel for the delivery plan. Only the initiative name is
// required — everything else can be filled in later via the editable cells.
export function AddDeliveryItemForm({ defaultYear, systems, owners, onCreated, onCancel }: AddDeliveryItemFormProps) {
  const [year, setYear] = useState(defaultYear);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function numberOrNull(raw: string): number | null {
    const trimmed = raw.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setError("Initiative name is required.");
      return;
    }
    if (form.cost_k.trim() && numberOrNull(form.cost_k) === null) {
      setError("Cost must be a number.");
      return;
    }
    if (form.benefit_k.trim() && numberOrNull(form.benefit_k) === null) {
      setError("Benefit must be a number.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_year: year,
          title,
          system: form.system.trim() || null,
          next_step: form.next_step.trim() || null,
          owner: form.owner.trim() || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          cost_k: numberOrNull(form.cost_k),
          benefit_k: numberOrNull(form.benefit_k),
          status: form.status,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
      onCreated(payload.task as DeliveryTask);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add the item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-surface border border-accent-blue/30 rounded-lg p-4 space-y-3"
      aria-label="Add delivery plan item"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">New Delivery Item</h3>
        <button type="button" onClick={onCancel} className="text-[11px] text-text-secondary hover:text-foreground">
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label="Year">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground"
          >
            {DELIVERY_YEARS.map((y) => (
              <option key={y} value={y}>
                {deliveryYearLabel(y)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Initiative" className="lg:col-span-2">
          <input
            autoFocus
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={300}
            placeholder="e.g. Consolidate vendor pricing"
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground"
          />
        </Field>

        <Field label="System">
          <input
            value={form.system}
            onChange={(e) => set("system", e.target.value)}
            maxLength={50}
            list="delivery-systems"
            placeholder="ERP, CRM, People…"
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground"
          />
          <datalist id="delivery-systems">
            {systems.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>

        <Field label="Next Step" className="sm:col-span-2">
          <input
            value={form.next_step}
            onChange={(e) => set("next_step", e.target.value)}
            maxLength={300}
            placeholder="What happens first"
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground"
          />
        </Field>

        <Field label="Owner">
          <input
            value={form.owner}
            onChange={(e) => set("owner", e.target.value)}
            maxLength={50}
            list="delivery-owners"
            placeholder="M, K…"
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground"
          />
          <datalist id="delivery-owners">
            {owners.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground"
          >
            {Object.entries(DELIVERY_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Start">
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => set("start_date", e.target.value)}
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground"
          />
        </Field>

        <Field label="End">
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => set("end_date", e.target.value)}
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground"
          />
        </Field>

        <Field label="Cost ($K)">
          <input
            type="number"
            step="any"
            value={form.cost_k}
            onChange={(e) => set("cost_k", e.target.value)}
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground font-mono"
          />
        </Field>

        <Field label="Benefit ($K)">
          <input
            type="number"
            step="any"
            value={form.benefit_k}
            onChange={(e) => set("benefit_k", e.target.value)}
            className="w-full border border-border-custom rounded px-1.5 py-1 text-[11px] bg-background text-foreground font-mono"
          />
        </Field>
      </div>

      {error && (
        <p role="alert" className="text-[11px] text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-accent-blue text-white text-[11px] font-medium px-3 py-1.5 rounded hover:bg-accent-blue/90 disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add Item"}
        </button>
        <span className="text-[10px] text-text-secondary">
          Only the initiative name is required — the rest is editable in the table.
        </span>
      </div>
    </form>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-[10px] uppercase tracking-wide text-text-secondary ${className}`}>
      {label}
      {children}
    </label>
  );
}
