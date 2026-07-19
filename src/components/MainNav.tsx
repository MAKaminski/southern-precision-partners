"use client";

import { useSession } from "next-auth/react";
import { AuthNav } from "@/components/AuthNav";
import { hasClearance, type Clearance } from "@/lib/access";
import type { UserRole } from "@/auth";

interface ExtendedSession {
  user?: unknown;
  role?: UserRole;
}

// Navigation links are filtered by the viewer's clearance so restricted
// destinations aren't advertised to users who can't reach them. This is a UX
// layer only — the middleware + route guards remain the real enforcement.
const LINKS: { href: string; label: string; level: "public" | "confidential" | "internal" }[] = [
  { href: "/", label: "Home", level: "public" },
  { href: "/about", label: "About", level: "public" },
  { href: "/deals/mosaic", label: "Project Mosaic", level: "confidential" },
  { href: "/details", label: "Details", level: "confidential" },
  { href: "/crm", label: "CRM", level: "internal" },
  { href: "/outreach", label: "Outreach", level: "internal" },
  { href: "/map", label: "Map", level: "internal" },
  { href: "/import", label: "Import", level: "internal" },
  { href: "/submit", label: "Submit", level: "public" },
];

export function MainNav() {
  const { data: rawSession } = useSession();
  const session = rawSession as ExtendedSession | null;
  const role: Clearance = session?.user ? session.role ?? "investor" : null;

  const visible = LINKS.filter((l) => hasClearance(role, l.level));
  const publicLinks = visible.filter((l) => l.level === "public");
  const restrictedLinks = visible.filter((l) => l.level !== "public");

  return (
    <div className="flex items-center gap-3">
      {publicLinks.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="text-xs text-text-secondary hover:text-foreground transition-colors"
        >
          {l.label}
        </a>
      ))}

      {restrictedLinks.length > 0 && (
        <>
          <span className="text-border-custom">|</span>
          {restrictedLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs text-text-secondary hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
        </>
      )}

      <div className="border-l border-border-custom pl-3 ml-1">
        <AuthNav />
      </div>
    </div>
  );
}
