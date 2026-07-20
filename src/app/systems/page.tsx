import { ClassificationBadge } from "@/components/ClassificationBadge";
import { SystemLogo } from "@/components/spp/SystemLogo";

export const dynamic = "force-static";

interface SystemEntry {
  name: string;
  role: string;
  detail: string;
  url?: string;
  iconSlug?: string;
  estAnnualCost?: string;
}

const CATEGORIES: { title: string; items: SystemEntry[] }[] = [
  {
    title: "Application framework",
    items: [
      { name: "Next.js", role: "Web framework", detail: "v16.2.3, App Router, Turbopack build", url: "https://nextjs.org", iconSlug: "nextdotjs", estAnnualCost: "Free / open source" },
      { name: "React", role: "UI library", detail: "v19.2.4", url: "https://react.dev", iconSlug: "react", estAnnualCost: "Free / open source" },
      { name: "TypeScript", role: "Language", detail: "v5, strict mode", url: "https://www.typescriptlang.org", iconSlug: "typescript", estAnnualCost: "Free / open source" },
      { name: "Tailwind CSS", role: "Styling", detail: "v4 (PostCSS pipeline, no separate config file)", url: "https://tailwindcss.com", iconSlug: "tailwindcss", estAnnualCost: "Free / open source" },
    ],
  },
  {
    title: "Hosting & deployment",
    items: [
      {
        name: "Vercel",
        role: "Production hosting",
        detail: "Every push builds a preview deployment; main branch deploys to production. Env vars configured in the Vercel dashboard, not committed to the repo.",
        url: "https://vercel.com/pricing",
        iconSlug: "vercel",
        estAnnualCost: "~$240/yr (Pro plan list price, $20/user/mo) — not confirmed against the actual billed plan",
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
        url: "https://supabase.com/pricing",
        iconSlug: "supabase",
        estAnnualCost: "~$300/yr (Pro plan list price, $25/mo) — not confirmed against the actual billed plan",
      },
    ],
  },
  {
    title: "Authentication",
    items: [
      { name: "NextAuth (Auth.js) v5", role: "Auth framework", detail: "JWT session strategy", url: "https://authjs.dev", iconSlug: "authjs", estAnnualCost: "Free / open source" },
      { name: "Google OAuth", role: "Sign-in provider", detail: "next-auth/providers/google", url: "https://developers.google.com/identity", iconSlug: "google", estAnnualCost: "Free" },
      {
        name: "Email sign-up",
        role: "Sign-in provider",
        detail: "Self-serve credentials provider (email + name + firm, no password) — every signup is an Investor by default; a fixed allowlist of emails gets Partner role.",
        estAnnualCost: "Free (built in-app, no vendor)",
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
        url: "https://www.anthropic.com/pricing",
        iconSlug: "anthropic",
        estAnnualCost: "Usage-based (pay-per-token) — no fixed annual figure without real usage data",
      },
      {
        name: "Claude Code",
        role: "Development",
        detail: "This platform's code, schema, and documentation are built and maintained via Claude Code sessions.",
        url: "https://claude.com/claude-code",
        estAnnualCost: "Included in a Claude subscription or usage-based API billing",
      },
    ],
  },
  {
    title: "Source control & CI",
    items: [
      { name: "GitHub", role: "Source control", detail: "MAKaminski/southern-precision-partners", url: "https://github.com/MAKaminski/southern-precision-partners", iconSlug: "github", estAnnualCost: "Free tier (GitHub Free includes private repos) — actual plan not confirmed" },
      {
        name: "GitHub Actions",
        role: "CI",
        detail: "Runs on every PR and push to main: npm ci → lint → typecheck → build → a custom financial-model audit script (scripts/audit-financials.ts).",
        url: "https://github.com/features/actions",
        iconSlug: "githubactions",
        estAnnualCost: "Free tier (2,000 min/mo included with GitHub Free)",
      },
    ],
  },
  {
    title: "Notable libraries",
    items: [
      { name: "ExcelJS", role: "XLSX export", detail: "Generates the downloadable investor financial model", url: "https://github.com/exceljs/exceljs", estAnnualCost: "Free / open source" },
      { name: "Recharts", role: "Charting", detail: "Financial charts across Forecast, Details, and deal pages", url: "https://recharts.org", estAnnualCost: "Free / open source" },
    ],
  },
  {
    title: "Runtime",
    items: [{ name: "Node.js", role: "Runtime", detail: "v22, pinned in CI (.github/workflows/ci.yml)", url: "https://nodejs.org", iconSlug: "nodedotjs", estAnnualCost: "Free / open source" }],
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
          , config files, and CI — nothing on this page is aspirational. Annual cost figures are public list
          prices for the plausible plan tier, not a lookup against real vendor invoices — treat them as rough
          budgeting estimates, not confirmed spend.
        </p>
      </header>

      <section className="space-y-5">
        {CATEGORIES.map((cat) => (
          <div key={cat.title}>
            <h2 className="text-sm font-semibold text-foreground mb-2">{cat.title}</h2>
            <div className="border border-border-custom rounded-lg divide-y divide-border-custom">
              {cat.items.map((item) => (
                <div key={item.name} className="p-3 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                  <SystemLogo name={item.name} iconSlug={item.iconSlug} />
                  <div className="sm:w-40 shrink-0">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono font-semibold text-accent-blue hover:underline"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <span className="text-sm font-mono font-semibold text-foreground">{item.name}</span>
                    )}
                    <div className="text-[10px] text-text-secondary uppercase tracking-wide">{item.role}</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-text-secondary">{item.detail}</p>
                    {item.estAnnualCost && (
                      <p className="text-[10px] font-mono text-accent-amber">{item.estAnnualCost}</p>
                    )}
                  </div>
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
