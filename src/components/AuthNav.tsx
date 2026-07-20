"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import type { UserRole } from "@/auth";

interface ExtendedSession {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  role?: UserRole;
  firm?: string;
}

const roleBadges: Record<UserRole, { label: string; className: string }> = {
  partner: { label: "Partner", className: "bg-accent-green/10 text-accent-green" },
  investor: { label: "Investor", className: "bg-accent-blue/10 text-accent-blue" },
};

interface AuthNavProps {
  /** "bar" (default) lays out avatar/name/controls in a row for the top nav.
   * "sidebar" stacks them for a narrow vertical panel instead. */
  variant?: "bar" | "sidebar";
}

export function AuthNav({ variant = "bar" }: AuthNavProps) {
  const { data: rawSession, status } = useSession();
  const session = rawSession as ExtendedSession | null;
  const [viewAs, setViewAs] = useState<UserRole | null>(null);

  if (status === "loading") {
    return <div className="w-16 h-4 bg-border-custom/50 rounded animate-pulse" />;
  }

  if (session?.user) {
    const actualRole = session.role || "investor";
    const isPartner = actualRole === "partner";
    const activeRole = viewAs || actualRole;
    const badge = roleBadges[activeRole];

    const avatar = session.user.image ? (
      <img src={session.user.image} alt="" className="w-6 h-6 rounded-full shrink-0" />
    ) : (
      <div className="w-6 h-6 shrink-0 rounded-full bg-accent-blue/10 flex items-center justify-center text-[10px] font-bold text-accent-blue">
        {session.user.name?.[0]?.toUpperCase() || "?"}
      </div>
    );

    const viewAsSelect = isPartner ? (
      <select
        value={viewAs || "partner"}
        onChange={(e) => setViewAs(e.target.value === "partner" ? null : e.target.value as UserRole)}
        className="text-[10px] bg-surface border border-border-custom rounded px-1.5 py-0.5 text-text-secondary focus:outline-none"
        title="Switch view"
      >
        <option value="partner">Partner View</option>
        <option value="investor">Investor View</option>
      </select>
    ) : null;

    const signOutButton = (
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-[10px] text-text-secondary hover:text-foreground border border-border-custom px-2 py-1 rounded transition-colors"
      >
        Sign Out
      </button>
    );

    if (variant === "sidebar") {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {avatar}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-text-secondary truncate">{session.user.name}</span>
              <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded ${badge.className}`}>
                {badge.label}
              </span>
            </div>
          </div>
          {viewAsSelect && <div className="w-full [&>select]:w-full">{viewAsSelect}</div>}
          <div className="w-full [&>button]:w-full">{signOutButton}</div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {avatar}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-xs text-text-secondary">{session.user.name}</span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        {viewAsSelect}
        {signOutButton}
      </div>
    );
  }

  return (
    <a
      href="/auth/signin"
      className="text-xs font-medium bg-accent-blue text-white px-3 py-1.5 rounded-lg hover:bg-accent-blue/90 transition-colors"
    >
      Investor Login
    </a>
  );
}
