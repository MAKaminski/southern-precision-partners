"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { AuthNav } from "@/components/AuthNav";
import { hasClearance, type Clearance } from "@/lib/access";
import { NAV_LINKS } from "@/lib/nav-links";
import type { UserRole } from "@/auth";

interface ExtendedSession {
  user?: unknown;
  role?: UserRole;
}

export function MainNav() {
  const { data: rawSession } = useSession();
  const session = rawSession as ExtendedSession | null;

  // Once signed in, every destination lives in the collapsible left Sidebar
  // instead of here — this bar only ever shows the logo + account controls,
  // so it no longer grows with the number of internal tools.
  if (session?.user) {
    return <AuthNav />;
  }

  const role: Clearance = null;
  const visible = NAV_LINKS.filter((l) => hasClearance(role, l.level));

  return (
    <div className="flex items-center gap-3">
      {visible.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-xs text-text-secondary hover:text-foreground transition-colors"
        >
          {l.label}
        </Link>
      ))}

      <div className="border-l border-border-custom pl-3 ml-1">
        <AuthNav />
      </div>
    </div>
  );
}
