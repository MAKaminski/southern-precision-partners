import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // In production, this would send to a CRM, email, or database
    // For now, log and return success
    console.log("Deal submission received:", JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      message: "Thank you for your submission. Our team will review and respond within 48 hours.",
      reference: `SPP-${Date.now().toString(36).toUpperCase()}`,
    });
  } catch {
    return NextResponse.json({ success: false, message: "Submission failed. Please try again." }, { status: 400 });
  }
}
