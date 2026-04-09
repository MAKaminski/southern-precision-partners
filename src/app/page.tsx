export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/70 font-medium">Actively Acquiring — Q1 2026</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Strategic Continuity for<br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Founder-Led Businesses
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
            Southeast Precision Partners acquires and operates high-quality lower-middle-market companies
            in the I-85 and I-77 Industrial Corridors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/deals/mosaic" className="inline-flex items-center justify-center bg-blue-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              View Current Deal — Project Mosaic
            </a>
            <a href="/submit" className="inline-flex items-center justify-center bg-white/10 border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-white/20 transition-colors">
              Submit a Deal
            </a>
          </div>
        </div>
      </section>

      {/* Buy Box */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground">Current Buy Box</h2>
          <p className="text-sm text-text-secondary mt-2">Our acquisition criteria as of Q1 2026</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BuyBoxCard icon="target" title="Business Type" value="Founder-Led" description="Clear operational levers for margin expansion and/or revenue growth" />
          <BuyBoxCard icon="map" title="Target Geography" value="SE Industrial Corridor" description="North Carolina, South Carolina, Virginia, Tennessee, Georgia" />
          <BuyBoxCard icon="factory" title="Sector Focus" value="Industrial & Distribution" description="Industrial Services, Specialty Manufacturing, Logistics" />
          <BuyBoxCard icon="dollar" title="Enterprise Value" value="$2M – $7M" description="Lower-middle-market operating businesses" />
          <BuyBoxCard icon="chart" title="Profitability" value="10% FCF Yield" description="Net Profit / Free Cash Flow yield on purchase price" />
          <BuyBoxCard icon="rocket" title="Target Returns" value="3.0x+ MOIC" description="Targeting 3.0x+ multiple on invested capital within 5 years" />
        </div>
      </section>

      {/* Active Deals */}
      <section className="bg-surface border-y border-border-custom">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">Active Deals</h2>
            <p className="text-sm text-text-secondary mt-2">Current investment opportunities under evaluation</p>
          </div>
          <a href="/deals/mosaic" className="block group">
            <div className="bg-background border border-border-custom rounded-xl p-6 hover:border-accent-blue/30 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] font-medium text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded uppercase">Active — April 2026</span>
                  <h3 className="text-xl font-bold text-foreground mt-2">Project Mosaic</h3>
                  <p className="text-sm text-text-secondary mt-1">Tile Center Group — Leveraged Buyout | Georgia</p>
                </div>
                <svg className="w-5 h-5 text-text-secondary group-hover:text-accent-blue transition-colors mt-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MiniStat label="Enterprise Value" value="$2.49M" />
                <MiniStat label="LTM Revenue" value="$4.95M" />
                <MiniStat label="Pro-Forma EBITDA" value="$554K" />
                <MiniStat label="Entry Multiple" value="4.5x" />
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">Partner With Us</h2>
        <p className="text-sm text-text-secondary max-w-xl mx-auto mb-6">
          Whether you are a founder seeking a successor, an investor looking for deal flow,
          or a lender interested in our pipeline — we would welcome the conversation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <a href="/submit" className="inline-flex items-center justify-center bg-accent-blue text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-accent-blue/90 transition-colors">
            Submit a Deal
          </a>
          <a href="mailto:info@sep-partners.com" className="inline-flex items-center justify-center bg-surface border border-border-custom text-foreground text-sm font-semibold px-6 py-3 rounded-lg hover:bg-border-custom/30 transition-colors">
            Contact Us
          </a>
        </div>
        <div className="text-xs text-text-secondary space-y-1">
          <p className="font-semibold text-foreground">Southeast Precision Partners, LLC</p>
          <p>5960 Fairview Road, Suite 400 | Charlotte, NC 28210</p>
          <p>
            <a href="mailto:info@sep-partners.com" className="text-accent-blue hover:underline">info@sep-partners.com</a> | (704) 920-8593
          </p>
        </div>
      </section>
    </div>
  );
}

function BuyBoxCard({ title, value, description, icon }: { title: string; value: string; description: string; icon: string }) {
  const icons: Record<string, string> = { target: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 100 12 6 6 0 000-12zm0 4a2 2 0 100 4 2 2 0 000-4z", map: "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z", factory: "M2 20h20V8l-6 4V8l-6 4V4H2v16z", dollar: "M12 2v20m5-17a5 5 0 00-10 0c0 4 10 4 10 8a5 5 0 01-10 0", chart: "M3 3v18h18M7 16l4-4 4 4 4-8", rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" };
  return (
    <div className="bg-surface border border-border-custom rounded-xl p-5 hover:border-accent-blue/20 transition-colors">
      <svg className="w-5 h-5 text-accent-blue mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={icons[icon] || icons.target} /></svg>
      <div className="text-[10px] text-text-secondary uppercase font-medium mb-1">{title}</div>
      <div className="text-lg font-bold text-foreground mb-1">{value}</div>
      <div className="text-xs text-text-secondary">{description}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-text-secondary uppercase">{label}</div>
    </div>
  );
}
