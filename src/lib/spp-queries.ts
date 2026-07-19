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
  year: number;
  existing_rev: number | null;
  new_rev: number | null;
  replacement: number | null;
  churn: number | null;
  ending_rev: number | null;
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
}> {
  const db = getSppDb();
  if (!db) return { rows: [], debt: [], revenueMatrix: [] };
  const [pnl, debt, rev] = await Promise.all([
    db.from("forecast_pnl").select("*").order("sort_order").order("year"),
    db.from("debt_schedule").select("facility,year,principal,interest,ending_balance").order("year"),
    db.from("revenue_matrix").select("*").order("year"),
  ]);
  if (pnl.error) console.error("getForecast/pnl", pnl.error.message);
  return {
    rows: (pnl.data ?? []) as ForecastRow[],
    debt: (debt.data ?? []) as DebtRow[],
    revenueMatrix: (rev.data ?? []) as RevenueMatrixRow[],
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

/** True when the SPP database connection is configured (service-role key present). */
export function sppDbConfigured(): boolean {
  return getSppDb() !== null;
}
