"use client";

import { useState } from "react";

const STATUSES = [
  { value: "not_started", label: "Not Started", className: "bg-surface text-text-secondary border-border-custom" },
  { value: "in_progress", label: "In Progress", className: "bg-accent-blue/10 text-accent-blue border-accent-blue/20" },
  { value: "blocked", label: "Blocked", className: "bg-accent-amber/10 text-accent-amber border-accent-amber/20" },
  { value: "done", label: "Done", className: "bg-accent-green/10 text-accent-green border-accent-green/20" },
] as const;

type Status = (typeof STATUSES)[number]["value"];

export function DeliveryStatusSelect({ id, initial }: { id: string; initial: Status }) {
  const [status, setStatus] = useState<Status>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const current = STATUSES.find((s) => s.value === status) ?? STATUSES[0];

  async function update(next: Status) {
    const prev = status;
    setStatus(next);
    setSaving(true);
    setError(false);
    try {
      const res = await fetch(`/api/delivery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setStatus(prev);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative inline-flex items-center gap-1">
      <select
        aria-label="Task status"
        value={status}
        disabled={saving}
        onChange={(e) => update(e.target.value as Status)}
        className={`appearance-none text-[10px] font-medium pl-2 pr-5 py-1 rounded border cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent-blue/40 ${current.className} ${saving ? "opacity-60" : ""}`}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value} className="bg-background text-foreground">
            {s.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 text-[8px] opacity-60">▼</span>
      {error && <span className="text-[9px] text-red-600" title="Save failed">!</span>}
    </div>
  );
}
