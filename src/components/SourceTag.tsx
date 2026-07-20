import { getSource } from "@/lib/sources";

// Inline provenance credit — "Requested by <party> · <channel> · <date>".
// Renders next to a section/report/tab that exists because a specific party
// asked for it, so any addition is visibly traceable to its source. Reads the
// registry in src/lib/sources.ts by id. Presentational only (no hooks) — safe
// in both server and client components, same as ClassificationBadge.
export function SourceTag({
  sourceId,
  excerpt,
  className = "",
}: {
  sourceId: string;
  /** Optional excerpt heading to name the specific ask this addresses. */
  excerpt?: string;
  className?: string;
}) {
  const s = getSource(sourceId);
  if (!s) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border border-accent-blue/20 bg-accent-blue/5 px-2 py-0.5 text-[10px] font-medium text-accent-blue ${className}`}
      title={`${s.party} — ${s.role}. ${s.channel}, ${s.receivedAt}.${
        excerpt ? ` Ask: “${excerpt}”.` : ""
      }`}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" />
      </svg>
      <span>
        Requested by {s.party}
        {excerpt ? <span className="font-normal opacity-80"> · “{excerpt}”</span> : null}
      </span>
    </span>
  );
}
