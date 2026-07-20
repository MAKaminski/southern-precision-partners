import { NextRequest, NextResponse } from "next/server";
import { getSppDb } from "@/lib/spp-db";

export async function POST(req: NextRequest) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Submission failed. Please try again." }, { status: 400 });
  }

  const reference = `SEP-${Date.now().toString(36).toUpperCase()}`;
  const field = (key: string) => {
    const value = data[key];
    return typeof value === "string" && value.trim() ? value : null;
  };
  const numberField = (key: string) => {
    const value = Number(data[key]);
    return Number.isFinite(value) ? value : null;
  };

  const db = getSppDb();
  if (db) {
    const { error } = await db.from("deal_submissions").insert({
      reference,
      first_name: field("firstName") ?? "",
      last_name: field("lastName") ?? "",
      firm_name: field("firmName") ?? "",
      email: field("email") ?? "",
      phone: field("phone"),
      subject: field("subject") ?? "",
      business_industry: field("businessIndustry"),
      hq_location: field("hqLocation"),
      annual_revenue: numberField("annualRevenue"),
      annual_ebitda: numberField("annualEbitda"),
      notes: field("notes"),
      newsletter_optin: data.newsletter === "yes",
    });
    if (error) {
      // Don't drop the submission silently — surface it in logs even though
      // the DB write failed, so it isn't lost without a trace.
      console.error("Failed to persist deal submission (reference " + reference + "):", error.message, JSON.stringify(data));
    }
  } else {
    console.error("Deal submission received but Supabase is not configured (reference " + reference + "):", JSON.stringify(data));
  }

  return NextResponse.json({
    success: true,
    message: "Thank you for your submission. Our team will review and respond within 48 hours.",
    reference,
  });
}
