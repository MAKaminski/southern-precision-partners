export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(5,150,105,0.12),transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Built on Integrity, Led by Precision
          </h1>
          <p className="text-base text-white/60 max-w-2xl mx-auto">
            Over 20 years of operational experience navigating the complexities of
            Fortune 50 manufacturing and global distribution.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="prose-sm text-text-secondary leading-relaxed space-y-5">
          <p className="text-base text-foreground font-medium leading-relaxed">
            Southeast Precision Partners operates on a singular principle: the men and women who built
            our region&apos;s industrial and distribution sectors deserve a partner who values the integrity
            of their legacy as much as the potential for its expansion.
          </p>
          <p>
            With over 20 years of operational experience navigating the complexities of Fortune 50
            manufacturing and global distribution, SEP Partners has seen firsthand that a business is
            more than its balance sheet. It is a collection of lives, a pillar of the local community,
            and a founder&apos;s life work.
          </p>
          <p>
            Our commitment is to provide active stewardship of that work. We are not looking for a
            quick exit. We are focused on strategic continuity for our families and the communities
            we serve. By honoring the founders who built these companies, the investors who trust our
            vision, and the clients who depend on our excellence, we ensure that the industrial
            corridor of the Southeast continues to thrive for generations to come.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-surface border-y border-border-custom">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-accent-blue uppercase tracking-wide mb-3">Our Mission</h2>
            <p className="text-sm text-foreground leading-relaxed">
              To provide Strategic Continuity for the Southeast industrial base by acquiring and operating
              founder-led businesses with a relentless focus on Active Custodianship and Operational
              Precision. We are committed to honoring the legacy of the founders we succeed, the investors
              we represent, and the employees who form the heart of the manufacturing, logistics, and
              distribution sectors.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-10">Our Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ValueCard
            title="Active Custodianship"
            description="We don't acquire and walk away. We embed ourselves in operations, working alongside existing teams to identify and execute value creation opportunities."
            color="#2563EB"
          />
          <ValueCard
            title="Operational Precision"
            description="Decades of Fortune 50 experience inform our approach to supply chain optimization, financial engineering, and margin expansion."
            color="#059669"
          />
          <ValueCard
            title="Strategic Continuity"
            description="We honor the legacy of the founders we succeed. Their customers, employees, and community relationships are the foundation we build upon."
            color="#D97706"
          />
        </div>
      </section>

      {/* Investment Thesis */}
      <section className="bg-surface border-y border-border-custom">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-3">Investment Thesis</h2>
          <p className="text-sm text-text-secondary text-center max-w-xl mx-auto mb-10">
            We seek founder-led businesses with clear operational levers for margin expansion and revenue growth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThesisItem title="Target Geography" items={["North Carolina", "South Carolina", "Virginia", "Tennessee", "Georgia"]} description="I-85 and I-77 Industrial Corridors" />
            <ThesisItem title="Sector Focus" items={["Industrial Services", "Specialty Manufacturing", "Logistics & Distribution", "Building Materials"]} description="Recession-resilient industrial verticals" />
            <ThesisItem title="Deal Criteria" items={["$2M – $7M enterprise value", "10%+ net profit / FCF yield", "3+ years of operating history", "Clear succession need"]} description="Lower middle market with operational upside" />
            <ThesisItem title="Value Creation" items={["Supply chain finance & float optimization", "Digital transformation & SEM marketing", "Geographic expansion", "Operational efficiency & lean ops"]} description="Proven playbook from Fortune 50 experience" />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-foreground mb-6">Get in Touch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
          <div className="bg-surface border border-border-custom rounded-xl p-5 text-left">
            <h3 className="text-xs font-semibold text-text-secondary uppercase mb-2">Headquarters</h3>
            <p className="text-sm text-foreground">5960 Fairview Road<br />Suite 400<br />Charlotte, NC 28210</p>
          </div>
          <div className="bg-surface border border-border-custom rounded-xl p-5 text-left">
            <h3 className="text-xs font-semibold text-text-secondary uppercase mb-2">Contact</h3>
            <p className="text-sm text-foreground">
              <a href="mailto:info@sep-partners.com" className="text-accent-blue hover:underline">info@sep-partners.com</a>
              <br />(704) 920-8593
              <br /><a href="https://www.sep-partners.com" className="text-accent-blue hover:underline">www.sep-partners.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ title, description, color }: { title: string; description: string; color: string }) {
  return (
    <div className="bg-background border border-border-custom rounded-xl p-5">
      <div className="w-8 h-1 rounded-full mb-4" style={{ backgroundColor: color }} />
      <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

function ThesisItem({ title, items, description }: { title: string; items: string[]; description: string }) {
  return (
    <div className="bg-background border border-border-custom rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-[10px] text-text-secondary mb-3">{description}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
            <div className="w-1 h-1 rounded-full bg-accent-blue shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
