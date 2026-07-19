import { CLASSIFICATION_META, type Classification } from "@/lib/access";

// Visible data/page label. Renders the classification of a page or data section
// so viewers always know whether what they're looking at is public or restricted.
// Presentational only (no hooks) — safe in both server and client components.
export function ClassificationBadge({
  level,
  className = "",
  showAudience = true,
}: {
  level: Classification;
  className?: string;
  showAudience?: boolean;
}) {
  const meta = CLASSIFICATION_META[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.badgeClass} ${className}`}
      title={meta.description}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
        {level === "public" ? (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
          </>
        ) : (
          <>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </>
        )}
      </svg>
      {meta.short}
      {showAudience && <span className="font-normal normal-case opacity-70">· {meta.audience}</span>}
    </span>
  );
}
