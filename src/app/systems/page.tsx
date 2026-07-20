import { ClassificationBadge } from "@/components/ClassificationBadge";

export const dynamic = "force-static";

interface SystemEntry {
  name: string;
  role: string;
  detail: string;
}

const CATEGORIES: { title: string; items: SystemEntry[] }[] = [
  {
    title: "Application framework",
    items: [
      { name: "Next.js", role: "Web framework", detail: "v16.2.3, App Router, Turbopack build" },
      { name: "React", role: "UI library", detail: "v19.2.4" },
      { name: "TypeScript", role: "Language", detail: "v5, strict mode" },
      { name: "Tailwind CSS", role: "Styling", detail: "v4 (PostCSS pipeline, no separate config file)" },
    ],
  },
  {
    title: "Hosting & deployment",
    items: [
      {
        name: "Vercel",
        role: "Production hosting",
        detail: "Every push builds a preview deployment; main branch deploys to production. Env vars configured in the Vercel dashboard, not committed to the repo.",
      },
    ],
  },
  {
    title: "Database",
    items: [
      {
        name: "Supabase (Postgres)",
        role: "Primary datastore",
        detail: "All operational data (customers, AR ledger, forecast, delivery plan, HR/payroll, revenue build, schema ERD) lives here. RLS enabled with no anon/authenticated policies — the app reads/writes exclusively via a service-role client, gated again by the app's own auth middleware.",
      },
    ],
  },
  {
    title: "Authentication",
    items: [
      { name: "NextAuth (Auth.js) v5", role: "Auth framework", detail: "JWT session strategy" },
      { name: "Google OAuth", role: "Sign-in provider", detail: "next-auth/providers/google" },
      {
        name: "Email sign-up",
        role: "Sign-in provider",
        detail: "Self-serve credentials provider (email + name + firm, no password) — every signup is an Investor by default; a fixed allowlist of emails gets Partner role.",
      },
    ],
  },
  {
    title: "AI",
    items: [
      {
        name: "Anthropic Claude",
        role: "In-app deal-room chatbot",
        detail: "claude-sonnet-4-20250514 via @anthropic-ai/sdk, gated to signed-in investors/partners for confidential Q&A; falls back to a local knowledge base if unavailable.",
      },
      {
        name: "Claude Code",
        role: "Development",
        detail: "This platform's code, schema, and documentation are built and maintained via Claude Code sessions.",
      },
    ],
  },
  {
    title: "Source control & CI",
    items: [
      { name: "GitHub", role: "Source control", detail: "MAKaminski/southern-precision-partners" },
      {
        name: "GitHub Actions",
        role: "CI",
        detail: "Runs on every PR and push to main: npm ci → lint → typecheck → build → a custom financial-model audit script (scripts/audit-financials.ts).",
      },
    ],
  },
  {
    title: "Notable libraries",
    items: [
      { name: "ExcelJS", role: "XLSX export", detail: "Generates the downloadable investor financial model" },
      { name: "Recharts", role: "Charting", detail: "Financial charts across Forecast, Details, and deal pages" },
    ],
  },
  {
    title: "Runtime",
    items: [{ name: "Node.js", role: "Runtime", detail: "v22, pinned in CI (.github/workflows/ci.yml)" }],
  },
];

const NOT_USED = [
  {
    name: "Google Cloud Platform (GCP)",
    detail:
      "No GCP usage anywhere in the codebase — no Cloud Storage, BigQuery, Firebase, or service-account credentials. The only Google touchpoint is Google OAuth sign-in (an identity provider, not GCP infrastructure).",
  },
  {
    name: "Email delivery (Resend, SendGrid, etc.)",
    detail: "No transactional email package or integration exists in the app code.",
  },
  {
    name: "Observability / analytics (Sentry, PostHog, Segment, Mixpanel)",
    detail: "None integrated.",
  },
];

export default function SystemsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <a href="/deals/mosaic" className="text-[10px] text-accent-blue hover:underline uppercase tracking-wide">
        &larr; Project Mosaic
      </a>
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Systems</h1>
          <ClassificationBadge level="internal" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          Every real technology and vendor this platform runs on, read directly from{" "}
          <code className="text-[11px] bg-surface border border-border-custom rounded px-1 py-0.5">
            package.json
          </code>
          , config files, and CI — nothing on this page is aspirational.
        </p>
      </header>

      <section className="space-y-5">
        {CATEGORIES.map((cat) => (
          <div key={cat.title}>
            <h2 className="text-sm font-semibold text-foreground mb-2">{cat.title}</h2>
            <div className="border border-border-custom rounded-lg divide-y divide-border-custom">
              {cat.items.map((item) => (
                <div key={item.name} className="p-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <div className="sm:w-40 shrink-0">
                    <span className="text-sm font-mono font-semibold text-foreground">{item.name}</span>
                    <div className="text-[10px] text-text-secondary uppercase tracking-wide">{item.role}</div>
                  </div>
                  <p className="text-xs text-text-secondary flex-1">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground mb-2">Not currently used</h2>
        <div className="border border-border-custom rounded-lg divide-y divide-border-custom">
          {NOT_USED.map((item) => (
            <div key={item.name} className="p-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <span className="sm:w-40 shrink-0 text-sm font-mono font-semibold text-text-secondary">
                {item.name}
              </span>
              <p className="text-xs text-text-secondary flex-1">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
