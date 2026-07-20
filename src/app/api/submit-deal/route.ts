import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const reference = `SEP-${Date.now().toString(36).toUpperCase()}`;

    const revenue = parseFloat(data.annualRevenue);
    const ebitda = parseFloat(data.annualEbitda);

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from("deal_submissions").insert({
        reference,
        first_name: data.firstName || "",
        last_name: data.lastName || "",
        firm_name: data.firmName || "",
        email: data.email || "",
        phone: data.phone || null,
        subject: data.subject || "",
        business_industry: data.businessIndustry || null,
        hq_location: data.hqLocation || null,
        annual_revenue: Number.isFinite(revenue) ? revenue * 1_000_000 : null,
        annual_ebitda: Number.isFinite(ebitda) ? ebitda * 1_000_000 : null,
        notes: data.notes || null,
        newsletter_optin: data.newsletter === "yes",
      });

      if (error) {
        console.error("Failed to persist deal submission:", error.message, JSON.stringify(data));
        return NextResponse.json({ success: false, message: "Submission failed. Please try again." }, { status: 500 });
      }
    } else {
      // Database not configured — log so the submission isn't silently lost.
      console.error("Deal submission received but Supabase is not configured:", JSON.stringify(data, null, 2));
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your submission. Our team will review and respond within 48 hours.",
      reference,
    });
  } catch {
    return NextResponse.json({ success: false, message: "Submission failed. Please try again." }, { status: 400 });
  }
}
