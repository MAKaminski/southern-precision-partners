import { Suspense } from "react";
import Link from "next/link";
import { CLASSIFICATION_META, type Classification } from "@/lib/access";

function isClassification(v: string | undefined): v is Classification {
  return v === "public" || v === "confidential" || v === "internal";
}

async function UnauthorizedContent({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; level?: string }>;
}) {
  const { from, level } = await searchParams;
  const meta = isClassification(level) ? CLASSIFICATION_META[level] : null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-accent-red/10 flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Insufficient Clearance</h1>
        <p className="text-sm text-text-secondary mt-3">
          {meta ? (
            <>
              This resource is classified <strong>{meta.short}</strong> and is restricted to{" "}
              <strong>{meta.audience}</strong>. Your account doesn&apos;t have the required clearance.
            </>
          ) : (
            <>You don&apos;t have clearance to view this page with your current account.</>
          )}
        </p>
        {from && (
          <p className="text-xs text-text-secondary mt-2">
            Requested: <code className="text-foreground">{from}</code>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-accent-blue text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            Return Home
          </Link>
          <a
            href="mailto:info@sep-partners.com?subject=Access%20Request"
            className="inline-flex items-center justify-center bg-surface border border-border-custom text-foreground text-sm font-medium px-5 py-2 rounded-lg hover:bg-border-custom/50 transition-colors"
          >
            Request Access
          </a>
        </div>
        <p className="text-[11px] text-text-secondary mt-6">
          If you believe this is an error, contact the SEP team at info@sep-partners.com.
        </p>
      </div>
    </div>
  );
}

export default function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; level?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <UnauthorizedContent searchParams={searchParams} />
    </Suspense>
  );
}
