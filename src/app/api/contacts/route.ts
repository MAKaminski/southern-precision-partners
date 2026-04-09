import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET /api/contacts?region=columbia&intent=4&type=builder&limit=50&offset=0
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const region = searchParams.get("region");
  const minIntent = parseInt(searchParams.get("intent") || "1");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = parseInt(searchParams.get("offset") || "0");
  const search = searchParams.get("q");

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Database not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." }, { status: 503 });
  }

  let query = supabase
    .from("contacts")
    .select("*", { count: "exact" })
    .gte("buyer_intent_score", minIntent)
    .order("buyer_intent_score", { ascending: false })
    .order("outreach_priority", { ascending: true })
    .range(offset, offset + limit - 1);

  if (region) query = query.eq("region", region);
  if (type) query = query.ilike("company_type", `%${type}%`);
  if (status) query = query.eq("outreach_status", status);
  if (search) query = query.or(`company.ilike.%${search}%,city.ilike.%${search}%,contact_name.ilike.%${search}%`);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Summary stats
  const { data: stats } = await supabase!.rpc("get_contact_stats").maybeSingle();

  return NextResponse.json({
    success: true,
    contacts: data || [],
    total: count || 0,
    limit,
    offset,
    stats: stats || null,
  });
}

// POST /api/contacts — bulk insert contacts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contacts = Array.isArray(body) ? body : body.contacts || [body];

    if (contacts.length === 0) {
      return NextResponse.json({ success: false, error: "No contacts provided" }, { status: 400 });
    }

    // Map to DB schema
    const rows = contacts.map((c: Record<string, unknown>) => ({
      company: c.company || "Unknown",
      company_type: c.company_type || c.type || "General Contractor",
      city: c.city || c.location?.toString().split(",")[0]?.trim() || "Unknown",
      state: "SC",
      region: c.region || guessRegion(c.city?.toString() || c.location?.toString() || ""),
      contact_name: c.contact_name || c.contactName || null,
      contact_title: c.contact_title || c.contactTitle || "General Manager",
      email: c.email || null,
      phone: c.phone || null,
      website: c.website || null,
      buyer_intent_score: c.buyer_intent_score || scoreBuyerIntent(c.company_type?.toString() || c.type?.toString() || ""),
      estimated_annual_revenue: c.estimated_annual_revenue || c.estimatedRevenue || null,
      outreach_priority: c.outreach_priority || c.priority || 2,
      outreach_status: "ready",
      email_template: c.email_template || c.template || "builder-intro",
      data_source: c.data_source || "import",
    }));

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Database not configured." }, { status: 503 });
    }
    const { data, error } = await supabase.from("contacts").insert(rows).select("id");

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      message: `Imported ${data?.length || 0} contacts into database.`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to parse request" }, { status: 400 });
  }
}

// PATCH /api/contacts — update contact status
export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ success: false, error: "Database not configured." }, { status: 503 });
  const { error } = await supabase.from("contacts").update(updates).eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

function guessRegion(location: string): string {
  const l = location.toLowerCase();
  if (l.includes("columbia") || l.includes("lexington") || l.includes("irmo") || l.includes("camden")) return "columbia";
  if (l.includes("florence") || l.includes("hartsville") || l.includes("darlington")) return "florence";
  if (l.includes("charleston") || l.includes("mount pleasant") || l.includes("summerville")) return "charleston";
  if (l.includes("greenville") || l.includes("spartanburg") || l.includes("anderson") || l.includes("greer")) return "greenville";
  if (l.includes("myrtle") || l.includes("conway") || l.includes("pawleys") || l.includes("georgetown")) return "myrtleBeach";
  return "columbia";
}

function scoreBuyerIntent(type: string): number {
  const t = type.toLowerCase();
  if (t.includes("tile") || t.includes("flooring") || t.includes("showroom") || t.includes("floor")) return 5;
  if (t.includes("volume") || t.includes("national") || t.includes("multi-family")) return 4;
  if (t.includes("builder") || t.includes("gc") || t.includes("contractor") || t.includes("custom")) return 3;
  if (t.includes("hospital") || t.includes("hotel") || t.includes("property") || t.includes("renovation")) return 2;
  return 1;
}
