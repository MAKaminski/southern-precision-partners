"use client";

import { useState } from "react";

type FieldType = "text" | "number" | "date";

interface EditableCellProps {
  id: string;
  field: string;
  value: string | number | null;
  type?: FieldType;
  placeholder?: string;
  align?: "left" | "right" | "center";
  mono?: boolean;
  onSaved?: (value: string | number | null) => void;
}

// Generic inline-editable table cell backed by PATCH /api/delivery/[id].
// Click-to-edit for text/number; always-editable native input for dates.
// Optimistic update with revert-on-failure, matching DeliveryStatusSelect.
export function EditableCell({ id, field, value, type = "text", placeholder = "—", align = "left", mono = false, onSaved }: EditableCellProps) {
  const [val, setVal] = useState(value);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value === null || value === undefined ? "" : String(value));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  const fontClass = mono ? "font-mono" : "";

  async function save(next: string | number | null) {
    const prev = val;
    setVal(next);
    setSaving(true);
    setError(false);
    try {
      const res = await fetch(`/api/delivery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
      onSaved?.(next);
    } catch {
      setVal(prev);
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  function commit() {
    setEditing(false);
    let next: string | number | null;
    if (type === "number") {
      const trimmed = draft.trim();
      if (trimmed === "") {
        next = null;
      } else {
        const n = Number(trimmed);
        if (!Number.isFinite(n)) {
          setDraft(val === null ? "" : String(val));
          return;
        }
        next = n;
      }
    } else {
      next = draft.trim() === "" ? null : draft.trim();
    }
    if (next === val) return;
    save(next);
  }

  function cancel() {
    setDraft(val === null || val === undefined ? "" : String(val));
    setEditing(false);
  }

  if (type === "date") {
    return (
      <div className={`inline-flex items-center gap-1 ${alignClass}`}>
        <input
          type="date"
          aria-label={field}
          value={(val as string) ?? ""}
          disabled={saving}
          onChange={(e) => save(e.target.value || null)}
          className={`bg-transparent text-[11px] border border-transparent hover:border-border-custom rounded px-1 py-0.5 focus:outline-none focus:border-accent-blue/40 ${fontClass} ${saving ? "opacity-60" : ""}`}
        />
        {error && <span className="text-[9px] text-red-600" title="Save failed">!</span>}
      </div>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(val === null || val === undefined ? "" : String(val));
          setEditing(true);
        }}
        disabled={saving}
        className={`${alignClass} w-full hover:bg-surface rounded px-1 py-0.5 -mx-1 ${fontClass} ${saving ? "opacity-60" : ""}`}
      >
        {val === null || val === undefined || val === "" ? (
          <span className="text-text-secondary">{placeholder}</span>
        ) : (
          <span className="text-foreground">{type === "number" ? `$${Number(val).toLocaleString()}K` : val}</span>
        )}
        {error && <span className="ml-1 text-[9px] text-red-600" title="Save failed">!</span>}
      </button>
    );
  }

  return (
    <input
      autoFocus
      type={type === "number" ? "number" : "text"}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
        if (e.key === "Escape") cancel();
      }}
      className={`w-full bg-background border border-accent-blue/40 rounded px-1 py-0.5 text-[11px] ${alignClass} ${fontClass} focus:outline-none`}
    />
  );
}
