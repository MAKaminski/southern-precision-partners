"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthNav } from "@/components/AuthNav";
import { hasClearance, type Clearance } from "@/lib/access";
import { NAV_LINKS } from "@/lib/nav-links";
import type { UserRole } from "@/auth";

interface ExtendedSession {
  user?: unknown;
  role?: UserRole;
}

/**
 * Left-side navigation for signed-in users, replacing the top ribbon of
 * links that used to appear once a partner/investor logged in. `open` and
 * `onClose` are owned by AppShell so it can pad the rest of the page to
 * match this panel's state.
 */
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: rawSession } = useSession();
  const session = rawSession as ExtendedSession | null;
  const pathname = usePathname();

  if (!session?.user) return null;

  const role: Clearance = session.role ?? "investor";
  const visible = NAV_LINKS.filter((l) => hasClearance(role, l.level));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-60 flex-col border-r border-border-custom bg-surface transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 border-b border-border-custom px-4 py-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#0F172A] text-[10px] font-bold text-white">
            SEP
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Southeast Precision Partners
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {visible.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                pathname === l.href
                  ? "bg-accent-blue/10 font-medium text-accent-blue"
                  : "text-text-secondary hover:bg-border-custom/40 hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border-custom p-3">
          <AuthNav variant="sidebar" />
        </div>
      </aside>
    </>
  );
}
