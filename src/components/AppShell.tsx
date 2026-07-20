"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/Sidebar";
import { MainNav } from "@/components/MainNav";
import { ChatWidget } from "@/components/ChatWidget";
import { PageClassificationFooter } from "@/components/PageClassificationFooter";
import { useSidebarOpen } from "@/lib/use-sidebar-open";
import type { UserRole } from "@/auth";

interface ExtendedSession {
  user?: unknown;
  role?: UserRole;
}

/**
 * All page chrome (contact bar, nav, footer, chat widget) plus the signed-in
 * left Sidebar. Reads the sidebar's open/closed state — persisted across
 * page loads — so it can render the toggle button, the panel itself, and the
 * matching content padding from one source of truth.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: rawSession } = useSession();
  const session = rawSession as ExtendedSession | null;
  const isAuthenticated = Boolean(session?.user);

  const [open, setOpen] = useSidebarOpen();

  return (
    <>
      {isAuthenticated && <Sidebar open={open} onClose={() => setOpen(false)} />}

      <div
        className={`flex min-h-full flex-1 flex-col transition-[padding] duration-200 ease-in-out ${
          isAuthenticated && open ? "md:pl-60" : ""
        }`}
      >
        {/* Top bar */}
        <div className="bg-[#0F172A] text-white/60 text-[10px] text-center py-1.5 tracking-wide">
          Southeast Precision Partners, LLC | Charlotte, NC |{" "}
          <a href="mailto:info@sep-partners.com" className="text-white/80 hover:text-white">
            info@sep-partners.com
          </a>{" "}
          | (704) 920-8593
        </div>

        {/* Navigation */}
        <nav className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border-custom">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border-custom text-text-secondary transition-colors hover:bg-border-custom/40 hover:text-foreground"
                  aria-label={open ? "Hide navigation" : "Show navigation"}
                  aria-expanded={open}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#0F172A] flex items-center justify-center text-white text-[10px] font-bold">
                  SEP
                </div>
                <span className="text-sm font-semibold tracking-tight text-foreground hidden sm:inline">
                  Southeast Precision Partners
                </span>
              </Link>
            </div>
            <MainNav />
          </div>
        </nav>

        <main className="flex-1">{children}</main>

        <footer className="bg-[#0F172A] text-white/50 py-8">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-white font-semibold text-sm mb-2">Southeast Precision Partners</div>
                <p className="text-xs leading-relaxed">
                  Providing Capital and Stewardship for the Southeast Industrial Corridor.
                </p>
              </div>
              <div>
                <div className="text-white/70 text-xs font-semibold uppercase mb-2">Headquarters</div>
                <p className="text-xs">5960 Fairview Road, Suite 400<br />Charlotte, NC 28210</p>
              </div>
              <div>
                <div className="text-white/70 text-xs font-semibold uppercase mb-2">Contact</div>
                <p className="text-xs">
                  <a href="mailto:info@sep-partners.com" className="text-blue-400 hover:text-blue-300">info@sep-partners.com</a>
                  <br />(704) 920-8593
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 space-y-2">
              <PageClassificationFooter />
              <div className="text-[10px] text-center">
                &copy; {new Date().getFullYear()} Southeast Precision Partners, LLC. All Rights Reserved.
              </div>
            </div>
          </div>
        </footer>

        <ChatWidget />
      </div>
    </>
  );
}
