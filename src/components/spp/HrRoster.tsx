"use client";

import { useState } from "react";
import type { EmployeeWithPlans, EmployeePlanDetail, HrPlan } from "@/lib/spp-queries";

const money = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : `$${Math.round(Number(v)).toLocaleString()}`;

const payDisplay = (payType: string, rate: number, hours: number | null) =>
  payType === "hourly" ? `$${rate.toLocaleString()}/hr${hours ? ` (${hours} hrs/wk)` : ""}` : `${money(rate)}/yr`;

const statusBadge: Record<string, string> = {
  active: "bg-accent-green/10 text-accent-green",
  new_hire: "bg-accent-blue/10 text-accent-blue",
  terminated: "bg-accent-red/10 text-accent-red",
};

const EMPLOYMENT_TYPES = ["full_time", "part_time", "contractor", "unpaid"] as const;
const STATUSES = ["active", "new_hire", "terminated"] as const;
const PAY_TYPES = ["salary", "hourly"] as const;

async function patchField(id: string, field: string, value: string | number | null) {
  const res = await fetch("/api/hr/plan-details", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, field, value }),
  });
  if (!res.ok) throw new Error();
  const json = await res.json();
  return json.row as EmployeePlanDetail;
}

export function HrRoster({ initial }: { initial: EmployeeWithPlans[] }) {
  const [employees, setEmployees] = useState(initial);
  const [addingNew, setAddingNew] = useState(false);

  function updatePlan(employeeId: string, plan: HrPlan, row: EmployeePlanDetail) {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, plans: { ...e.plans, [plan]: row } } : e))
    );
  }

  function addEmployeeToState(employeeId: string, fullName: string, plan: HrPlan, row: EmployeePlanDetail) {
    setEmployees((prev) => {
      const existing = prev.find((e) => e.id === employeeId);
      if (existing) return prev.map((e) => (e.id === employeeId ? { ...e, plans: { ...e.plans, [plan]: row } } : e));
      return [...prev, { id: employeeId, full_name: fullName, employee_code: null, hire_date: null, notes: null, plans: { [plan]: row } }];
    });
  }

  const currentActive = employees.filter((e) => e.plans.current?.status === "active");
  const postTransitionPlanned = employees.some((e) => e.plans.post_transition);
  const postActive = employees.filter(
    (e) => e.plans.post_transition && e.plans.post_transition.status !== "terminated"
  );
  const currentCost = currentActive.reduce((s, e) => s + (Number(e.plans.current?.annualized_cost) || 0), 0);
  const postCost = postActive.reduce((s, e) => s + (Number(e.plans.post_transition?.annualized_cost) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Current Headcount" value={String(currentActive.length)} />
        <Kpi
          label="Post-Transition Headcount"
          value={postTransitionPlanned ? String(postActive.length) : "Not yet planned"}
        />
        <Kpi label="Current Annualized Payroll" value={money(currentCost)} />
        <Kpi
          label="Post-Transition Annualized Payroll"
          value={postTransitionPlanned ? money(postCost) : "Not yet planned"}
          accent={postTransitionPlanned && postCost !== currentCost}
        />
      </div>

      <div className="overflow-x-auto border border-border-custom rounded-lg">
        <table className="w-full text-xs">
          <thead className="bg-surface">
            <tr className="border-b border-border-custom text-text-secondary">
              <th className="text-left py-2 px-3 font-medium">Name</th>
              <th className="text-left py-2 px-2 font-medium" colSpan={3}>Current</th>
              <th className="text-left py-2 px-2 font-medium" colSpan={3}>Post-Transition</th>
              <th className="text-left py-2 px-3 font-medium">Change</th>
            </tr>
            <tr className="border-b border-border-custom text-text-secondary">
              <th className="text-left py-1 px-3 font-normal"></th>
              <th className="text-left py-1 px-2 font-normal">Role</th>
              <th className="text-left py-1 px-2 font-normal">Status</th>
              <th className="text-right py-1 px-2 font-normal">Pay</th>
              <th className="text-left py-1 px-2 font-normal">Role</th>
              <th className="text-left py-1 px-2 font-normal">Status</th>
              <th className="text-right py-1 px-2 font-normal">Pay</th>
              <th className="text-left py-1 px-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => {
              const cur = e.plans.current;
              const post = e.plans.post_transition;
              return (
                <tr key={e.id} className="border-b border-border-custom/50 last:border-0 align-top">
                  <td className="py-1.5 px-3 font-mono text-foreground whitespace-nowrap">{e.full_name}</td>
                  {cur ? (
                    <PlanCells plan={cur} onUpdated={(row) => updatePlan(e.id, "current", row)} />
                  ) : (
                    <NoPlanCells employeeId={e.id} fullName={e.full_name} plan="current" onAdded={(row) => addEmployeeToState(e.id, e.full_name, "current", row)} />
                  )}
                  {post ? (
                    <PlanCells plan={post} onUpdated={(row) => updatePlan(e.id, "post_transition", row)} />
                  ) : (
                    <NoPlanCells employeeId={e.id} fullName={e.full_name} plan="post_transition" retainFrom={cur} onAdded={(row) => addEmployeeToState(e.id, e.full_name, "post_transition", row)} />
                  )}
                  <td className="py-1.5 px-3 text-text-secondary">{post?.change_type ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {addingNew ? (
        <NewEmployeeForm
          onCancel={() => setAddingNew(false)}
          onCreated={(employeeId, fullName, row) => {
            addEmployeeToState(employeeId, fullName, row.plan, row);
            setAddingNew(false);
          }}
        />
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="text-xs px-3 py-1.5 rounded-lg border border-border-custom text-text-secondary hover:bg-surface transition-colors"
        >
          + Add Employee
        </button>
      )}
    </div>
  );
}

function PlanCells({ plan, onUpdated }: { plan: EmployeePlanDetail; onUpdated: (row: EmployeePlanDetail) => void }) {
  return (
    <>
      <td className="py-1 px-2">
        <EditableText value={plan.role_title ?? ""} onCommit={async (v) => onUpdated(await patchField(plan.id, "role_title", v || null))} />
      </td>
      <td className="py-1 px-2">
        <select
          value={plan.status}
          onChange={async (ev) => onUpdated(await patchField(plan.id, "status", ev.target.value))}
          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border-0 ${statusBadge[plan.status]}`}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="py-1 px-2 text-right">
        <PayEditor plan={plan} onUpdated={onUpdated} />
      </td>
    </>
  );
}

function NoPlanCells({
  employeeId, fullName, plan, onAdded, retainFrom,
}: { employeeId: string; fullName: string; plan: HrPlan; onAdded: (row: EmployeePlanDetail) => void; retainFrom?: EmployeePlanDetail }) {
  const [adding, setAdding] = useState(false);
  const [retaining, setRetaining] = useState(false);

  // Carry the current plan forward unchanged — same role, status, and pay.
  async function retain() {
    if (!retainFrom) return;
    setRetaining(true);
    try {
      const res = await fetch("/api/hr/plan-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          plan,
          role_title: retainFrom.role_title,
          department: retainFrom.department,
          employment_type: retainFrom.employment_type,
          status: retainFrom.status,
          pay_type: retainFrom.pay_type,
          pay_rate: retainFrom.pay_rate,
          hours_per_week: retainFrom.hours_per_week,
          change_type: "unchanged",
        }),
      });
      if (!res.ok) return;
      const json = await res.json();
      onAdded(json.row as EmployeePlanDetail);
    } finally {
      setRetaining(false);
    }
  }

  if (adding) {
    return (
      <td colSpan={3} className="py-1.5 px-2">
        <PlanForm
          initialRoleTitle=""
          onCancel={() => setAdding(false)}
          onSubmit={async (fields) => {
            const res = await fetch("/api/hr/plan-details", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ employee_id: employeeId, plan, ...fields }),
            });
            if (!res.ok) return;
            const json = await res.json();
            onAdded(json.row as EmployeePlanDetail);
            setAdding(false);
          }}
        />
      </td>
    );
  }
  return (
    <td colSpan={3} className="py-1.5 px-2">
      <div className="flex items-center gap-2">
        {plan === "post_transition" && retainFrom && (
          <button
            onClick={retain}
            disabled={retaining}
            className="text-[10px] text-accent-green hover:underline disabled:opacity-50"
            title={`Retain ${fullName} post-transition — carry current role, status, and pay forward unchanged`}
          >
            {retaining ? "Retaining…" : "Retain"}
          </button>
        )}
        <button
          onClick={() => setAdding(true)}
          className="text-[10px] text-accent-blue hover:underline"
          title={`Add a ${plan === "current" ? "current" : "post-transition"} plan for ${fullName}`}
        >
          + Add {plan === "current" ? "current" : "post-transition"} plan
        </button>
      </div>
    </td>
  );
}

function EditableText({ value, onCommit }: { value: string; onCommit: (v: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function commit() {
    setEditing(false);
    if (draft === value) return;
    setSaving(true);
    try {
      await onCommit(draft);
    } catch {
      setDraft(value);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(ev) => setDraft(ev.target.value)}
        onBlur={commit}
        onKeyDown={(ev) => { if (ev.key === "Enter") commit(); if (ev.key === "Escape") { setDraft(value); setEditing(false); } }}
        className="w-32 text-xs border border-accent-blue/40 rounded px-1 py-0.5 focus:outline-none"
      />
    );
  }
  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`text-text-secondary hover:bg-accent-blue/10 rounded px-1 py-0.5 text-left ${saving ? "opacity-50" : ""}`}
      title="Click to edit"
    >
      {value || "—"}
    </button>
  );
}

function PayEditor({ plan, onUpdated }: { plan: EmployeePlanDetail; onUpdated: (row: EmployeePlanDetail) => void }) {
  const [editing, setEditing] = useState(false);
  const [payType, setPayType] = useState(plan.pay_type);
  const [rate, setRate] = useState(String(plan.pay_rate));
  const [hours, setHours] = useState(plan.hours_per_week ? String(plan.hours_per_week) : "");
  const [saving, setSaving] = useState(false);

  async function commit() {
    setSaving(true);
    try {
      let row = await patchField(plan.id, "pay_type", payType);
      row = await patchField(plan.id, "pay_rate", Number(rate) || 0);
      if (payType === "hourly") row = await patchField(plan.id, "hours_per_week", hours ? Number(hours) : null);
      onUpdated(row);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 justify-end">
        <select value={payType} onChange={(ev) => setPayType(ev.target.value as "salary" | "hourly")} className="text-[10px] border border-border-custom rounded px-0.5">
          {PAY_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input value={rate} onChange={(ev) => setRate(ev.target.value)} className="w-16 text-right text-xs font-mono border border-accent-blue/40 rounded px-1 py-0.5" />
        {payType === "hourly" && (
          <input value={hours} onChange={(ev) => setHours(ev.target.value)} placeholder="hrs/wk" className="w-12 text-right text-xs font-mono border border-accent-blue/40 rounded px-1 py-0.5" />
        )}
        <button onClick={commit} className="text-[10px] text-accent-green">✓</button>
        <button onClick={() => setEditing(false)} className="text-[10px] text-text-secondary">✕</button>
      </div>
    );
  }
  return (
    <button
      onClick={() => setEditing(true)}
      className={`font-mono text-text-secondary hover:bg-accent-blue/10 rounded px-1 py-0.5 whitespace-nowrap ${saving ? "opacity-50" : ""}`}
      title="Click to edit"
    >
      {payDisplay(plan.pay_type, plan.pay_rate, plan.hours_per_week)}
    </button>
  );
}

interface PlanFormFields {
  role_title: string | null;
  department: string | null;
  employment_type: string | null;
  status: string;
  pay_type: string;
  pay_rate: number;
  hours_per_week: number | null;
  effective_date: string | null;
  notes: string | null;
}

function PlanForm({
  initialRoleTitle, onSubmit, onCancel,
}: { initialRoleTitle: string; onSubmit: (fields: PlanFormFields) => Promise<void>; onCancel: () => void }) {
  const [roleTitle, setRoleTitle] = useState(initialRoleTitle);
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState<string>("full_time");
  const [status, setStatus] = useState<string>("new_hire");
  const [payType, setPayType] = useState<string>("salary");
  const [payRate, setPayRate] = useState("0");
  const [hours, setHours] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-surface border border-border-custom rounded p-2">
      <input placeholder="Role title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} className="w-32 text-xs border border-border-custom rounded px-1 py-0.5" />
      <input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-24 text-xs border border-border-custom rounded px-1 py-0.5" />
      <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="text-xs border border-border-custom rounded px-1 py-0.5">
        {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs border border-border-custom rounded px-1 py-0.5">
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={payType} onChange={(e) => setPayType(e.target.value)} className="text-xs border border-border-custom rounded px-1 py-0.5">
        {PAY_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <input placeholder="Pay rate" value={payRate} onChange={(e) => setPayRate(e.target.value)} className="w-16 text-xs font-mono border border-border-custom rounded px-1 py-0.5" />
      {payType === "hourly" && (
        <input placeholder="hrs/wk" value={hours} onChange={(e) => setHours(e.target.value)} className="w-14 text-xs font-mono border border-border-custom rounded px-1 py-0.5" />
      )}
      <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className="text-xs border border-border-custom rounded px-1 py-0.5" />
      <input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-40 text-xs border border-border-custom rounded px-1 py-0.5" />
      <button
        disabled={submitting}
        onClick={async () => {
          setSubmitting(true);
          try {
            await onSubmit({
              role_title: roleTitle || null,
              department: department || null,
              employment_type: employmentType,
              status,
              pay_type: payType,
              pay_rate: Number(payRate) || 0,
              hours_per_week: payType === "hourly" && hours ? Number(hours) : null,
              effective_date: effectiveDate || null,
              notes: notes || null,
            });
          } finally {
            setSubmitting(false);
          }
        }}
        className="text-[10px] px-2 py-1 rounded bg-accent-blue text-white disabled:opacity-50"
      >
        Save
      </button>
      <button onClick={onCancel} className="text-[10px] px-2 py-1 rounded border border-border-custom text-text-secondary">Cancel</button>
    </div>
  );
}

function NewEmployeeForm({
  onCreated, onCancel,
}: { onCreated: (employeeId: string, fullName: string, row: EmployeePlanDetail) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<HrPlan>("post_transition");

  return (
    <div className="border border-border-custom rounded-lg p-3 space-y-2 bg-surface">
      <div className="flex items-center gap-2">
        <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="w-48 text-xs border border-border-custom rounded px-2 py-1" />
        <select value={plan} onChange={(e) => setPlan(e.target.value as HrPlan)} className="text-xs border border-border-custom rounded px-2 py-1">
          <option value="post_transition">Post-transition plan</option>
          <option value="current">Current plan</option>
        </select>
      </div>
      <PlanForm
        initialRoleTitle=""
        onCancel={onCancel}
        onSubmit={async (fields) => {
          if (!name.trim()) return;
          const res = await fetch("/api/hr/plan-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_employee_name: name.trim(), plan, ...fields }),
          });
          if (!res.ok) return;
          const json = await res.json();
          onCreated(json.employee_id as string, name.trim(), json.row as EmployeePlanDetail);
        }}
      />
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface border border-border-custom rounded-lg p-3 text-center">
      <div className={`text-xl font-bold ${accent ? "text-accent-amber" : "text-foreground"}`}>{value}</div>
      <div className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}
