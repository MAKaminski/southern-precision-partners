"use client";

import { useState } from "react";

interface ImportResult {
  success: boolean;
  imported: number;
  summary: {
    total: number;
    withEmail: number;
    withPhone: number;
    byType: [string, number][];
  };
  targets: Record<string, unknown>[];
  message: string;
  error?: string;
}

export default function ImportPage() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File;
    if (!file || file.size === 0) { setError("Please select a CSV file"); setLoading(false); return; }

    try {
      const text = await file.text();
      const res = await fetch("/api/import-contacts", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: text,
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Import failed");
      }
    } catch {
      setError("Upload failed. Please check your file format.");
    } finally {
      setLoading(false);
    }
  }

  function downloadJSON() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.targets, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "imported-contacts.json";
    a.click();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Import Contacts</h1>
      <p className="text-sm text-text-secondary mb-6">
        Upload a CSV of real business contacts to add to the outreach system. The importer auto-detects
        business type and assigns email templates.
      </p>

      {/* CSV Format Guide */}
      <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-lg p-4 mb-6">
        <h2 className="text-xs font-semibold text-accent-blue uppercase mb-2">CSV Format</h2>
        <p className="text-xs text-text-secondary mb-2">
          Minimum columns: <code className="bg-surface px-1 py-0.5 rounded text-foreground">company, location</code>.
          All other columns are optional with smart defaults.
        </p>
        <div className="bg-surface border border-border-custom rounded p-3 font-mono text-[11px] text-text-secondary overflow-x-auto">
          company,type,location,contactName,contactTitle,email,phone,estimatedRevenue,priority<br />
          &quot;Mungo Homes&quot;,Residential Builder,&quot;Irmo, SC&quot;,John Smith,VP Purchasing,john@mungohomes.com,(803) 749-5580,&quot;$300K-$500K/yr&quot;,1<br />
          &quot;M.B. Kahn Construction&quot;,Commercial GC,&quot;Columbia, SC&quot;,,,info@mbkahn.com,(803) 736-2950,,1
        </div>
      </div>

      {/* Data Sources Guide */}
      <div className="bg-surface border border-border-custom rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Where to Get Real Contact Data</h2>
        <div className="space-y-3">
          <SourceCard
            name="SC LLR Contractor Database"
            cost="FREE"
            costColor="text-accent-green"
            url="https://verify.llronline.com/LicLookup/LicLookup.aspx"
            description="South Carolina Labor, Licensing & Regulation — official state contractor license database. Search by license type (General Contractor, Residential Builder, Specialty Contractor) and county. Export results manually."
            steps={["Go to llr.sc.gov → Verify a License", "Select license type: General Contractor, Residential Builder", "Filter by county (Richland, Lexington, Charleston, etc.)", "Copy results into CSV format"]}
            recommended
          />
          <SourceCard
            name="Google Maps Scrape (via Outscraper)"
            cost="~$2 per 1,000 results"
            costColor="text-accent-green"
            url="https://outscraper.com"
            description="Search 'tile contractor Columbia SC', 'flooring installer Charleston SC', etc. Returns real business name, address, phone, website, rating. Best bang for buck."
            steps={["Sign up at outscraper.com (free tier: 500 results)", "Search: 'flooring contractor' + each SC city", "Export as CSV", "Upload here"]}
            recommended
          />
          <SourceCard
            name="Apollo.io"
            cost="Free tier: 50 credits/mo"
            costColor="text-accent-amber"
            url="https://www.apollo.io"
            description="B2B contact database with verified emails. Search by industry (NAICS: 238340 Tile/Terrazzo, 444120 Building Materials) + geography. Free tier gives 50 contacts/month."
            steps={["Sign up free at apollo.io", "Filter: Industry → Construction / Building Materials, Location → SC", "Export contacts with email + phone", "Upload CSV here"]}
          />
          <SourceCard
            name="BuildZoom"
            cost="FREE (public data)"
            costColor="text-accent-green"
            url="https://www.buildzoom.com/contractor/sc"
            description="Contractor directory with license verification, project history, and ratings. SC-specific data. Good for validating contractors and finding project leads."
            steps={["Browse buildzoom.com/contractor/sc", "Filter by specialty: Tile, Flooring, General", "Copy company + contact details", "Format as CSV and upload"]}
          />
          <SourceCard
            name="Houzz Pro Directory"
            cost="FREE (public profiles)"
            costColor="text-accent-green"
            url="https://www.houzz.com/professionals"
            description="Design + build professional directory. Great for interior designers, kitchen/bath showrooms, custom builders. Profiles include contact info and project photos."
            steps={["Search houzz.com/professionals by city + specialty", "Filter: Tile Installers, Kitchen & Bath Designers, Flooring", "Collect business name, location, phone from profiles", "Upload CSV"]}
          />
          <SourceCard
            name="ZoomInfo (when budget allows)"
            cost="$15K+/yr"
            costColor="text-red-500"
            url="https://www.zoominfo.com"
            description="Enterprise-grade B2B database. Direct-dial phone numbers, verified emails, org charts. Overkill for now but perfect when you scale to 5,000+ targets."
            steps={["Consider when annual outreach budget exceeds $50K", "Negotiate startup pricing", "Bulk export SC construction contacts"]}
          />
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-surface border border-border-custom rounded-lg p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Upload CSV</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <div>
            <input
              type="file"
              name="file"
              accept=".csv,.txt"
              className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent-blue file:text-white hover:file:bg-accent-blue/90"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-accent-blue text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Processing..." : "Import Contacts"}
          </button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 bg-accent-green/5 border border-accent-green/20 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            <h3 className="text-sm font-semibold text-foreground">{result.message}</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><div className="text-lg font-bold text-foreground">{result.summary.total}</div><div className="text-[10px] text-text-secondary uppercase">Total Imported</div></div>
            <div><div className="text-lg font-bold text-accent-blue">{result.summary.withEmail}</div><div className="text-[10px] text-text-secondary uppercase">With Real Email</div></div>
            <div><div className="text-lg font-bold text-accent-green">{result.summary.withPhone}</div><div className="text-[10px] text-text-secondary uppercase">With Phone</div></div>
          </div>
          <div className="text-xs text-text-secondary mb-3">
            <span className="font-semibold">By type:</span>{" "}
            {result.summary.byType.map(([type, count]) => `${type} (${count})`).join(", ")}
          </div>
          <button
            onClick={downloadJSON}
            className="bg-accent-blue text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            Download as JSON (for dev integration)
          </button>
        </div>
      )}
    </div>
  );
}

function SourceCard({ name, cost, costColor, url, description, steps, recommended }: {
  name: string; cost: string; costColor: string; url: string; description: string; steps: string[]; recommended?: boolean;
}) {
  return (
    <div className={`border rounded-lg p-4 ${recommended ? "border-accent-green/30 bg-accent-green/5" : "border-border-custom bg-background"}`}>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          {recommended && <span className="text-[9px] font-bold text-accent-green bg-accent-green/10 px-1.5 py-0.5 rounded">RECOMMENDED</span>}
        </div>
        <span className={`text-xs font-bold ${costColor}`}>{cost}</span>
      </div>
      <p className="text-xs text-text-secondary mb-2">{description}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-blue hover:underline mb-2 inline-block">{url}</a>
      <ol className="text-[11px] text-text-secondary space-y-0.5 list-decimal list-inside">
        {steps.map((step, i) => <li key={i}>{step}</li>)}
      </ol>
    </div>
  );
}
