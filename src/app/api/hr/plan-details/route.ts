import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";
import { requireClearance } from "@/lib/guard";

const TEXT_FIELDS = ["role_title", "department", "notes", "effective_date"];
const ENUM_FIELDS = ["employment_type", "status", "pay_type", "change_type"];
const NUMERIC_FIELDS = ["pay_rate", "hours_per_week"];
const ALLOWED_FIELDS = [...TEXT_FIELDS, ...ENUM_FIELDS, ...NUMERIC_FIELDS];

const ENUM_VALUES: Record<string, string[]> = {
  employment_type: ["full_time", "part_time", "contractor", "unpaid"],
  status: ["active", "terminated", "new_hire"],
  pay_type: ["salary", "hourly"],
  change_type: ["unchanged", "pay_increase", "pay_decrease", "role_change", "new_hire", "termination"],
};

function annualizedCost(payType: string, payRate: number, hoursPerWeek: number | null) {
  if (payType === "hourly") return payRate * (hoursPerWeek ?? 40) * 52;
  return payRate;
}

/** PATCH { id, field, value } — edit a single hr_employee_plan_details field. */
export async function PATCH(req: NextRequest) {
  // Staffing plan & pay rates — SEP partners only.
  const guard = await requireClearance("internal");
  if (!guard.ok) return guard.response;

  const db = getSppDb();
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  let body: { id?: string; field?: string; value?: string | number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!body.field || !ALLOWED_FIELDS.includes(body.field)) {
    return NextResponse.json({ error: "invalid field" }, { status: 400 });
  }
  if (ENUM_FIELDS.includes(body.field) && !ENUM_VALUES[body.field].includes(String(body.value))) {
    return NextResponse.json({ error: `invalid value for ${body.field}` }, { status: 400 });
  }

  const update: Record<string, string | number | null> = {};
  if (NUMERIC_FIELDS.includes(body.field)) {
    update[body.field] =
      body.value === null || body.value === undefined || Number.isNaN(Number(body.value)) ? null : Number(body.value);
  } else {
    update[body.field] = body.value === null || body.value === undefined ? null : String(body.value).slice(0, 500);
  }

  // Recompute annualized_cost whenever pay-driving fields change.
  if (["pay_type", "pay_rate", "hours_per_week"].includes(body.field)) {
    const { data: current, error: fetchErr } = await db
      .from("hr_employee_plan_details")
      .select("pay_type,pay_rate,hours_per_week")
      .eq("id", body.id)
      .maybeSingle();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });
    const merged = { ...current, [body.field]: update[body.field] };
    update.annualized_cost = annualizedCost(merged.pay_type, Number(merged.pay_rate), merged.hours_per_week);
  }

  const { data, error } = await db
    .from("hr_employee_plan_details")
    .update(update)
    .eq("id", body.id)
    .select()
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, row: data });
}

interface CreatePlanBody {
  employee_id?: string;
  new_employee_name?: string;
  plan?: "current" | "post_transition";
  role_title?: string | null;
  department?: string | null;
  employment_type?: string | null;
  status?: string;
  pay_type?: string;
  pay_rate?: number;
  hours_per_week?: number | null;
  change_type?: string;
  effective_date?: string | null;
  notes?: string | null;
}

/**
 * POST — add a staffing-plan row: either a new plan (e.g. post_transition)
 * for an existing employee, or a brand-new employee plus their first plan.
 */
export async function POST(req: NextRequest) {
  const guard = await requireClearance("internal");
  if (!guard.ok) return guard.response;

  const db = getSppDb();
  if (!db) return NextResponse.json({ error: "database not configured" }, { status: 503 });

  let body: CreatePlanBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.employee_id && !body.new_employee_name?.trim()) {
    return NextResponse.json({ error: "employee_id or new_employee_name required" }, { status: 400 });
  }
  if (body.plan !== "current" && body.plan !== "post_transition") {
    return NextResponse.json({ error: "plan must be current or post_transition" }, { status: 400 });
  }
  const status = body.status ?? "new_hire";
  const payType = body.pay_type ?? "salary";
  const payRate = Number.isFinite(Number(body.pay_rate)) ? Number(body.pay_rate) : 0;
  if (!ENUM_VALUES.status.includes(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });
  if (!ENUM_VALUES.pay_type.includes(payType)) return NextResponse.json({ error: "invalid pay_type" }, { status: 400 });
  if (body.employment_type && !ENUM_VALUES.employment_type.includes(body.employment_type)) {
    return NextResponse.json({ error: "invalid employment_type" }, { status: 400 });
  }

  let employeeId = body.employee_id ?? null;
  if (!employeeId) {
    const { data: emp, error: empErr } = await db
      .from("hr_employees")
      .insert({ full_name: body.new_employee_name!.trim(), source: "manual_entry" })
      .select()
      .single();
    if (empErr) return NextResponse.json({ error: empErr.message }, { status: 500 });
    employeeId = emp.id;
  }

  const { data, error } = await db
    .from("hr_employee_plan_details")
    .insert({
      employee_id: employeeId,
      plan: body.plan,
      role_title: body.role_title ?? null,
      department: body.department ?? null,
      employment_type: body.employment_type ?? null,
      status,
      pay_type: payType,
      pay_rate: payRate,
      hours_per_week: body.hours_per_week ?? null,
      annualized_cost: annualizedCost(payType, payRate, body.hours_per_week ?? null),
      change_type: body.change_type ?? "new_hire",
      effective_date: body.effective_date ?? null,
      notes: body.notes ?? null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, employee_id: employeeId, row: data });
}
