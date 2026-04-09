import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gmqarvuurgpqchetmups.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) return null;
  _client = createClient(url, key);
  return _client;
}

export interface DBContact {
  id: string;
  company: string;
  company_type: string;
  license_number: string | null;
  city: string;
  state: string;
  county: string | null;
  region: string | null;
  contact_name: string | null;
  contact_title: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  buyer_intent_score: number;
  estimated_annual_revenue: string | null;
  estimated_tile_spend: string | null;
  products_of_interest: string[] | null;
  outreach_priority: number;
  outreach_status: string;
  outreach_channel: string;
  email_template: string;
  last_contacted_at: string | null;
  notes: string | null;
  tags: string[];
  data_source: string;
  created_at: string;
}
