"use client";

import { useState } from "react";

const industries = [
  "Select an option",
  "Industrial Services",
  "Specialty Manufacturing",
  "Logistics & Distribution",
  "Building Materials",
  "Construction Services",
  "HVAC / Mechanical",
  "Electrical Services",
  "Plumbing",
  "Environmental Services",
  "Food & Beverage Manufacturing",
  "Metal Fabrication",
  "Automotive Services",
  "Healthcare Services",
  "Technology Services",
  "Other",
];

const locations = [
  "Select an option",
  "North Carolina",
  "South Carolina",
  "Virginia",
  "Tennessee",
  "Georgia",
  "Alabama",
  "Florida",
  "Other Southeast",
  "Other US",
];

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/submit-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setReference(result.reference);
        setSubmitted(true);
      }
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Submission Received</h1>
        <p className="text-sm text-text-secondary mb-4">
          Thank you for your submission. Our team will review and respond within 48 hours.
        </p>
        <p className="text-xs text-text-secondary">
          Reference: <span className="font-mono text-foreground">{reference}</span>
        </p>
        <a href="/submit" onClick={() => { setSubmitted(false); setReference(""); }} className="inline-block mt-6 text-sm text-accent-blue hover:underline">
          Submit another deal
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Southeast Precision Partners</h1>
        <p className="text-sm text-text-secondary max-w-xl mx-auto">
          Strategic Continuity for Founder-Led Businesses. Our acquisition strategy targets high-quality,
          lower-middle-market companies within the I-85 and I-77 Industrial Corridors.
        </p>
      </div>

      {/* Buy Box */}
      <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-lg p-5 mb-8">
        <h2 className="text-sm font-semibold text-accent-blue mb-3">Q1 2026 Current Buy Box</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <BuyBoxItem label="Business Type" value="Founder-Led with clear operational levers" />
          <BuyBoxItem label="Target Geography" value="NC, SC, VA, TN, GA" />
          <BuyBoxItem label="Sector Focus" value="Industrial Services, Specialty Mfg, Logistics" />
          <BuyBoxItem label="Enterprise Value" value="$2M – $7M" />
          <BuyBoxItem label="Profitability" value="10% Net Profit / FCF Yield" />
          <BuyBoxItem label="Investment Returns" value="3.0x+ MOIC within 5 years" />
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface border border-border-custom rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Deal Submission Form</h2>
        <p className="text-xs text-text-secondary mb-6">All fields marked with * are required.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field name="firstName" label="First Name" required />
            <Field name="lastName" label="Last Name" required />
            <Field name="firmName" label="Firm Name" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Phone" type="tel" />
            <Field name="subject" label="Subject" required />
          </div>

          {/* Business Details */}
          <div className="border-t border-border-custom pt-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Business Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField name="businessIndustry" label="Business Industry" options={industries} required />
              <SelectField name="hqLocation" label="HQ Location" options={locations} required />
              <Field name="annualRevenue" label="Annual Revenue ($M)" type="number" step="0.1" required prefix="$" />
              <Field name="annualEbitda" label="Annual EBITDA ($M)" type="number" step="0.1" required prefix="$" />
            </div>
          </div>

          {/* Additional */}
          <div className="border-t border-border-custom pt-5">
            <label className="block text-xs font-medium text-foreground mb-1">Additional Notes</label>
            <textarea
              name="notes"
              rows={4}
              className="w-full bg-background border border-border-custom rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 resize-none"
              placeholder="Please include any additional information about the business, seller motivation, timeline, etc."
            />
          </div>

          {/* Newsletter opt-in */}
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" name="newsletter" value="yes" className="rounded border-border-custom" />
            Sign up for news and updates
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-blue text-white text-sm font-medium py-3 rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Deal"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-text-secondary space-y-2">
        <div>
          <span className="font-semibold text-foreground">Southeast Precision Partners, LLC</span>
          <br />Providing Capital and Stewardship for the Southeast Industrial Corridor.
        </div>
        <div>
          5960 Fairview Road, Suite 400, Charlotte, NC 28210
          <br />
          <a href="mailto:info@sep-partners.com" className="text-accent-blue hover:underline">info@sep-partners.com</a> | (704) 920-8593
        </div>
        <div className="text-[10px]">&copy; 2026 Southeast Precision Partners, LLC. All Rights Reserved.</div>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text", required, step, prefix }: { name: string; label: string; type?: string; required?: boolean; step?: string; prefix?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">{prefix}</span>}
        <input
          name={name}
          type={type}
          step={step}
          required={required}
          className={`w-full bg-background border border-border-custom rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 ${prefix ? "pl-7" : ""}`}
        />
      </div>
    </div>
  );
}

function SelectField({ name, label, options, required }: { name: string; label: string; options: string[]; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        required={required}
        className="w-full bg-background border border-border-custom rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
      >
        {options.map((opt) => (
          <option key={opt} value={opt === "Select an option" ? "" : opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function BuyBoxItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-text-secondary uppercase font-medium">{label}</div>
      <div className="text-xs text-foreground font-medium mt-0.5">{value}</div>
    </div>
  );
}
