"use client";

import { useState } from "react";
import type { Customer } from "@/lib/spp-queries";

type ContactField = "email" | "phone" | "address_line1" | "city" | "state" | "zip" | "primary_store";

const FIELD_LABEL: Record<ContactField, string> = {
  email: "Email",
  phone: "Phone",
  address_line1: "Address",
  city: "City",
  state: "State",
  zip: "ZIP",
  primary_store: "Primary Store",
};

async function patchCustomer(id: string, field: ContactField, value: string | null) {
  const res = await fetch(`/api/customers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [field]: value }),
  });
  if (!res.ok) throw new Error();
}

export function CustomerContactEditor({ customer }: { customer: Customer }) {
  const [values, setValues] = useState({
    email: customer.email,
    phone: customer.phone,
    address_line1: customer.address_line1,
    city: customer.city,
    state: customer.state,
    zip: customer.zip,
    primary_store: customer.primary_store,
  });

  const hasAnyContact = values.email || values.phone || values.address_line1;
  const hasAddress = values.city || values.state || values.zip;

  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground mb-1">Contact &amp; Store</h2>
      <p className="text-[11px] text-text-secondary mb-2">
        Not present in the source A/R ledger — enter manually as it becomes available. Click any field to edit.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ContactField id={customer.id} field="email" value={values.email} onSaved={(v) => setValues((s) => ({ ...s, email: v }))} />
        <ContactField id={customer.id} field="phone" value={values.phone} onSaved={(v) => setValues((s) => ({ ...s, phone: v }))} />
        <ContactField id={customer.id} field="address_line1" value={values.address_line1} onSaved={(v) => setValues((s) => ({ ...s, address_line1: v }))} />
        <ContactField id={customer.id} field="city" value={values.city} onSaved={(v) => setValues((s) => ({ ...s, city: v }))} />
        <ContactField id={customer.id} field="state" value={values.state} onSaved={(v) => setValues((s) => ({ ...s, state: v }))} />
        <ContactField id={customer.id} field="zip" value={values.zip} onSaved={(v) => setValues((s) => ({ ...s, zip: v }))} />
        <ContactField id={customer.id} field="primary_store" value={values.primary_store} onSaved={(v) => setValues((s) => ({ ...s, primary_store: v }))} storeOptions />
      </div>
      {!hasAnyContact && !hasAddress && (
        <p className="text-[10px] text-accent-amber mt-2">No contact info on file yet for this customer.</p>
      )}
    </section>
  );
}

function ContactField({
  id, field, value, onSaved, storeOptions,
}: { id: string; field: ContactField; value: string | null; onSaved: (v: string | null) => void; storeOptions?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const listId = `store-options-${id}`;

  async function commit() {
    setEditing(false);
    const next = draft.trim() === "" ? null : draft.trim();
    if (next === value) return;
    setSaving(true);
    setError(false);
    try {
      await patchCustomer(id, field, next);
      onSaved(next);
    } catch {
      setDraft(value ?? "");
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface border border-border-custom rounded-lg p-3">
      <div className="text-[10px] text-text-secondary uppercase tracking-wide mb-0.5">{FIELD_LABEL[field]}</div>
      {editing ? (
        <>
          <input
            autoFocus
            list={storeOptions ? listId : undefined}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") { setDraft(value ?? ""); setEditing(false); }
            }}
            className="w-full text-sm border border-accent-blue/40 rounded px-1 py-0.5 bg-background focus:outline-none"
          />
          {storeOptions && (
            <datalist id={listId}>
              <option value="Columbia" />
              <option value="Florence" />
            </datalist>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => { setDraft(value ?? ""); setEditing(true); }}
          disabled={saving}
          className={`text-sm text-left w-full hover:bg-background rounded px-1 py-0.5 -mx-1 ${saving ? "opacity-60" : ""}`}
        >
          {value ? <span className="text-foreground">{value}</span> : <span className="text-text-secondary">Not set</span>}
          {error && <span className="ml-1 text-[9px] text-red-600" title="Save failed">!</span>}
        </button>
      )}
    </div>
  );
}
