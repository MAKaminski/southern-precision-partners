import { ClassificationBadge } from "@/components/ClassificationBadge";
import { CHANGELOG, CHANGE_STATUS_META } from "@/lib/changelog";
import { getSource } from "@/lib/sources";

export const dynamic = "force-dynamic";

export default function ChangelogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Changelog</h1>
          <ClassificationBadge level="internal" showAudience={false} />
        </div>
        <p className="text-sm text-text-secondary">
          A feedback-to-response ledger. For each piece of stakeholder input, we restate the original ask{" "}
          <em>in their own words</em> and then list exactly what was built to address it — so it&apos;s clear the change
          was made, who requested it, and where it landed.
        </p>
        <a href="/reports" className="inline-block text-[11px] text-accent-blue hover:underline">
          Browse the Reports appendix &rarr;
        </a>
      </header>

      {CHANGELOG.map((entry) => {
        const source = getSource(entry.sourceId);
        return (
          <article key={entry.id} className="border border-border-custom rounded-lg overflow-hidden">
            {/* Entry header */}
            <div className="bg-surface border-b border-border-custom p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-sm font-semibold text-foreground">{entry.title}</h2>
                <span className="text-[10px] font-mono text-text-secondary">{entry.date}</span>
              </div>
              {source && (
                <p className="text-[11px] text-text-secondary">
                  <span className="text-accent-blue font-medium">{source.party}</span> · {source.role} ·{" "}
                  {source.channel} · {source.receivedAt}
                </p>
              )}
              <p className="text-xs text-text-secondary leading-relaxed pt-1">{entry.responseSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-custom">
              {/* Original feedback — restated verbatim */}
              <section className="p-4 space-y-3">
                <h3 className="text-[10px] uppercase tracking-wide text-text-secondary font-semibold">
                  Original feedback{source ? ` — ${source.party}` : ""}
                </h3>
                {source ? (
                  <ul className="space-y-2.5">
                    {source.excerpts.map((ex) => (
                      <li key={ex.heading} className="text-xs">
                        <div className="font-semibold text-foreground">{ex.heading}</div>
                        <blockquote className="mt-0.5 border-l-2 border-border-custom pl-2.5 text-text-secondary italic leading-relaxed">
                          {ex.text}
                        </blockquote>
                      </li>
                    ))}
                    {source.otherNotes?.map((note) => (
                      <li key={note} className="text-[11px] text-text-secondary/80">
                        <span className="text-[9px] uppercase tracking-wide text-text-secondary mr-1">Also noted</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-text-secondary italic">Source not found in registry.</p>
                )}
              </section>

              {/* Changes made */}
              <section className="p-4 space-y-3">
                <h3 className="text-[10px] uppercase tracking-wide text-text-secondary font-semibold">Changes made</h3>
                <ul className="space-y-2.5">
                  {entry.changes.map((c, i) => {
                    const meta = CHANGE_STATUS_META[c.status];
                    return (
                      <li key={i} className="text-xs space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-foreground/90 leading-relaxed">{c.what}</span>
                          <span
                            className={`shrink-0 inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-[10px] text-text-secondary">{c.where}</code>
                          {c.addresses && (
                            <span className="text-[9px] text-accent-blue">↳ {c.addresses}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </article>
        );
      })}
    </div>
  );
}
