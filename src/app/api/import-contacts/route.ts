import { NextRequest, NextResponse } from "next/server";

// Accepts CSV upload of real contacts and returns structured outreach targets
// CSV format: company,type,location,contactName,contactTitle,email,phone,estimatedRevenue,priority,template
//
// Minimal required columns: company, location
// Everything else has smart defaults

const TYPE_MAP: Record<string, string> = {
  builder: "volume-builder",
  "home builder": "volume-builder",
  "general contractor": "builder-intro",
  gc: "builder-intro",
  contractor: "contractor-intro",
  flooring: "contractor-intro",
  tile: "contractor-intro",
  designer: "contractor-intro",
  interior: "contractor-intro",
  showroom: "showroom-partner",
  "kitchen & bath": "showroom-partner",
  hospital: "institutional-intro",
  healthcare: "institutional-intro",
  medical: "institutional-intro",
  hotel: "hospitality-reno",
  hospitality: "hospitality-reno",
  government: "government-rfp",
  school: "government-rfp",
  education: "government-rfp",
  church: "institutional-intro",
  property: "institutional-intro",
  apartment: "builder-intro",
  "multi-family": "builder-intro",
  architect: "contractor-intro",
  renovation: "contractor-intro",
  remodel: "contractor-intro",
};

function guessTemplate(type: string): string {
  const lower = type.toLowerCase();
  for (const [keyword, template] of Object.entries(TYPE_MAP)) {
    if (lower.includes(keyword)) return template;
  }
  return "builder-intro";
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z]/g, ""));
  return lines.slice(1).map((line) => {
    // Handle quoted fields
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
      current += char;
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  }).filter((row) => row.company || row.name || row.businessname);
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let rows: Record<string, string>[];

    if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
      const text = await req.text();
      rows = parseCSV(text);
    } else if (contentType.includes("application/json")) {
      const json = await req.json();
      rows = Array.isArray(json) ? json : json.contacts || json.data || [];
    } else {
      // Try to parse as form data with file
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
      }
      const text = await file.text();
      rows = parseCSV(text);
    }

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "No valid rows found in upload" }, { status: 400 });
    }

    // Transform to outreach targets
    const targets = rows.map((row, i) => {
      const company = row.company || row.name || row.businessname || `Unknown Business ${i + 1}`;
      const type = row.type || row.businesstype || row.category || "General Contractor";
      const location = row.location || row.city || row.address || "SC";
      const email = row.email || row.contactemail || "";
      const phone = row.phone || row.contactphone || row.telephone || "";

      return {
        company,
        type,
        location: location.includes("SC") ? location : location + ", SC",
        contactName: row.contactname || row.contact || "",
        contactTitle: row.contacttitle || row.title || row.jobtitle || "General Manager",
        email: email || "info@" + company.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) + ".com",
        phone: phone || "",
        estimatedRevenue: row.estimatedrevenue || row.revenue || "$20K–$80K/yr",
        channel: row.channel || "Email + Phone",
        priority: parseInt(row.priority || "2") || 2,
        status: "ready" as const,
        template: row.template || guessTemplate(type),
      };
    });

    // Return structured data + summary
    return NextResponse.json({
      success: true,
      imported: targets.length,
      summary: {
        total: targets.length,
        withEmail: targets.filter((t) => t.email && !t.email.includes("info@")).length,
        withPhone: targets.filter((t) => t.phone).length,
        byType: Object.entries(
          targets.reduce((acc: Record<string, number>, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1]),
      },
      targets,
      message: `Successfully imported ${targets.length} contacts. Add these to your outreach-expanded.ts or use the import UI at /import.`,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ success: false, error: "Failed to parse upload" }, { status: 400 });
  }
}
