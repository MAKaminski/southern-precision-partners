import "server-only";
import { getSppDb } from "@/lib/spp-db";

// ─── Types (mirror the SPP Supabase schema) ──────────────────────────────────
export interface DeliveryTask {
  id: string;
  delivery_year: number | null;
  item: number | null;
  task: number | null;
  system: string | null;
  rank: number | null;
  title: string;
  next_step: string | null;
  owner: string | null;
  start_date: string | null;
  end_date: string | null;
  cost_k: number | null;
  benefit_k: number | null;
  status: "not_started" | "in_progress" | "blocked" | "done";
  notes: string | null;
  sort_order: number;
}

export interface ForecastRow {
  id: string;
  scenario: "forecast" | "plan";
  category: string;
  year: number;
  value: number | null;
  is_percent: boolean;
  sort_order: number;
}

export interface DebtRow {
  facility: string;
  year: number;
  principal: number | null;
  interest: number | null;
  ending_balance: number | null;
}

export interface RevenueMatrixRow {
  id: string;
  year: number;
  existing_rev: number | null;
  new_rev: number | null;
  replacement: number | null;
  churn: number | null;
  ending_rev: number | null;
}

export interface OpexGlRow {
  id: string;
  scenario: "forecast" | "plan";
  gl_category: string;
  year: number;
  value: number | null;
  sort_order: number;
}

export interface Customer {
  id: string;
  customer_code: string | null;
  name: string;
  alias: string | null;
  first_sale_date: string | null;
  last_sale_date: string | null;
  lifetime_sales: number;
  lifetime_sale_count: number;
  lifetime_payments: number;
  lifetime_payment_count: number;
  balance: number;
  segment: string | null;
  notes: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  primary_store: string | null;
}

export interface AnnualSale {
  customer_id: string;
  year: number;
  sales: number;
}

export interface ArTransaction {
  id: string;
  year: number;
  invoice_date: string | null;
  invoice_number: string | null;
  invoice_amount: number | null;
  payment_ref: string | null;
  payment_date: string | null;
  payment_amount: number | null;
  running_balance: number | null;
  is_credit_memo: boolean;
}

export interface CustomerWithSales extends Customer {
  annual: Record<number, number>; // year -> sales
}

export interface Employee {
  id: string;
  full_name: string;
  employee_code: string | null;
  hire_date: string | null;
  notes: string | null;
}

export type HrPlan = "current" | "post_transition";

export interface EmployeePlanDetail {
  id: string;
  employee_id: string;
  plan: HrPlan;
  role_title: string | null;
  department: string | null;
  employment_type: "full_time" | "part_time" | "contractor" | "unpaid" | null;
  status: "active" | "terminated" | "new_hire";
  pay_type: "salary" | "hourly";
  pay_rate: number;
  hours_per_week: number | null;
  annualized_cost: number | null;
  change_type: "unchanged" | "pay_increase" | "pay_decrease" | "role_change" | "new_hire" | "termination";
  effective_date: string | null;
  notes: string | null;
}

export interface EmployeeWithPlans extends Employee {
  plans: Partial<Record<HrPlan, EmployeePlanDetail>>;
}

// ─── Queries (service-role, server-only) ─────────────────────────────────────
export async function getDeliveryTasks(): Promise<DeliveryTask[]> {
  const db = getSppDb();
  if (!db) return [];
  const { data, error } = await db
    .from("delivery_tasks")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) { console.error("getDeliveryTasks", error.message); return []; }
  return (data ?? []) as DeliveryTask[];
}

export async function getForecast(): Promise<{
  rows: ForecastRow[];
  debt: DebtRow[];
  revenueMatrix: RevenueMatrixRow[];
  opexGl: OpexGlRow[];
}> {
  const db = getSppDb();
  if (!db) return { rows: [], debt: [], revenueMatrix: [], opexGl: [] };
  const [pnl, debt, rev, opexGl] = await Promise.all([
    db.from("forecast_pnl").select("*").order("sort_order").order("year"),
    db.from("debt_schedule").select("facility,year,principal,interest,ending_balance").order("year"),
    db.from("revenue_matrix").select("*").order("year"),
    db.from("forecast_opex_gl").select("*").order("sort_order").order("year"),
  ]);
  if (pnl.error) console.error("getForecast/pnl", pnl.error.message);
  return {
    rows: (pnl.data ?? []) as ForecastRow[],
    debt: (debt.data ?? []) as DebtRow[],
    revenueMatrix: (rev.data ?? []) as RevenueMatrixRow[],
    opexGl: (opexGl.data ?? []) as OpexGlRow[],
  };
}

export async function getCustomers(): Promise<CustomerWithSales[]> {
  const db = getSppDb();
  if (!db) return [];
  const [cust, annual] = await Promise.all([
    db.from("customers").select("*").order("lifetime_sales", { ascending: false }),
    db.from("customer_annual_sales").select("customer_id,year,sales"),
  ]);
  if (cust.error) { console.error("getCustomers", cust.error.message); return []; }
  const byId = new Map<string, Record<number, number>>();
  for (const a of (annual.data ?? []) as AnnualSale[]) {
    if (!byId.has(a.customer_id)) byId.set(a.customer_id, {});
    byId.get(a.customer_id)![a.year] = Number(a.sales);
  }
  return ((cust.data ?? []) as Customer[]).map((c) => ({ ...c, annual: byId.get(c.id) ?? {} }));
}

export async function getCustomer(id: string): Promise<{
  customer: Customer | null;
  annual: AnnualSale[];
  transactions: ArTransaction[];
}> {
  const db = getSppDb();
  if (!db) return { customer: null, annual: [], transactions: [] };
  const [c, annual, tx] = await Promise.all([
    db.from("customers").select("*").eq("id", id).maybeSingle(),
    db.from("customer_annual_sales").select("customer_id,year,sales").eq("customer_id", id).order("year"),
    db.from("ar_transactions").select("*").eq("customer_id", id)
      .order("invoice_date", { ascending: true, nullsFirst: false }).limit(2000),
  ]);
  return {
    customer: (c.data ?? null) as Customer | null,
    annual: (annual.data ?? []) as AnnualSale[],
    transactions: (tx.data ?? []) as ArTransaction[],
  };
}

export async function getEmployees(): Promise<EmployeeWithPlans[]> {
  const db = getSppDb();
  if (!db) return [];
  const [emp, plans] = await Promise.all([
    db.from("hr_employees").select("*").order("full_name", { ascending: true }),
    db.from("hr_employee_plan_details").select("*"),
  ]);
  if (emp.error) { console.error("getEmployees", emp.error.message); return []; }
  const byId = new Map<string, Partial<Record<HrPlan, EmployeePlanDetail>>>();
  for (const p of (plans.data ?? []) as EmployeePlanDetail[]) {
    if (!byId.has(p.employee_id)) byId.set(p.employee_id, {});
    byId.get(p.employee_id)![p.plan] = p;
  }
  return ((emp.data ?? []) as Employee[]).map((e) => ({
    ...e,
    plans: byId.get(e.id) ?? {},
  }));
}

export interface ErdColumn {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
  is_primary_key: boolean;
  is_unique: boolean;
  is_composite_key_member: boolean;
}

export interface ErdTable {
  table_name: string;
  row_count: number;
  columns: ErdColumn[];
}

export interface ErdRelationship {
  constraint_name: string;
  source_table: string;
  source_column: string;
  target_table: string;
  target_column: string;
  on_delete: string;
  cardinality: "one-to-one" | "many-to-one";
}

export interface SchemaErd {
  generated_at: string;
  tables: ErdTable[];
  relationships: ErdRelationship[];
}

/** Live introspection of the public schema — see get_schema_erd() in
 * supabase/migrations/0003_schema_erd_function.sql. Never hand-maintained:
 * always reflects exactly what's in the database right now. */
export async function getSchemaErd(): Promise<SchemaErd | null> {
  const db = getSppDb();
  if (!db) return null;
  const { data, error } = await db.rpc("get_schema_erd");
  if (error) { console.error("getSchemaErd", error.message); return null; }
  return data as SchemaErd;
}

export interface ArAgingByCustomer {
  customer_id: string;
  invoice_count: number;
  total_invoice_amount: number;
  avg_days_to_pay: number | null;
}

/** Per-customer AR aging rollup — see get_ar_aging_by_customer() in
 * supabase/migrations/0008_ar_aging_by_customer_function.sql. Invoice
 * dollars and days-to-pay are computed per invoice_number first (one
 * invoice_amount, latest payment_date), not a naive per-row sum. */
export async function getArAgingByCustomer(): Promise<ArAgingByCustomer[]> {
  const db = getSppDb();
  if (!db) return [];
  const { data, error } = await db.rpc("get_ar_aging_by_customer");
  if (error) { console.error("getArAgingByCustomer", error.message); return []; }
  return (data ?? []) as ArAgingByCustomer[];
}

export interface GrowthInitiative {
  id: string;
  category: "new_business" | "churn_replacement" | "share_of_wallet" | "pricing" | "other";
  name: string;
  description: string | null;
  target_revenue_impact: number | null;
  owner: string | null;
  status: "tbd" | "planned" | "in_progress" | "done";
  notes: string | null;
  sort_order: number;
}

export async function getGrowthInitiatives(): Promise<GrowthInitiative[]> {
  const db = getSppDb();
  if (!db) return [];
  const { data, error } = await db
    .from("growth_initiatives")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) { console.error("getGrowthInitiatives", error.message); return []; }
  return (data ?? []) as GrowthInitiative[];
}

export interface MonthlyPerformanceRow {
  id: string;
  year: number;
  month: number;
  category: "Revenue" | "EBITDA" | "Free Cash Flow" | "Cash Balance";
  plan_value: number | null;
  actual_value: number | null;
  notes: string | null;
}

export async function getMonthlyPerformance(year: number): Promise<MonthlyPerformanceRow[]> {
  const db = getSppDb();
  if (!db) return [];
  const { data, error } = await db
    .from("monthly_performance")
    .select("*")
    .eq("year", year)
    .order("month", { ascending: true });
  if (error) { console.error("getMonthlyPerformance", error.message); return []; }
  return (data ?? []) as MonthlyPerformanceRow[];
}

/** True when the SPP database connection is configured (service-role key present). */
export function sppDbConfigured(): boolean {
  return getSppDb() !== null;
}
