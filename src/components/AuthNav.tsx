"use client";

import { useSession, signOut } from "next-auth/react";

export function AuthNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-16 h-4 bg-border-custom/50 rounded animate-pulse" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {session.user.image ? (
            <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-accent-blue/10 flex items-center justify-center text-[10px] font-bold text-accent-blue">
              {session.user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <span className="text-xs text-text-secondary hidden sm:inline">
            {session.user.name}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-[10px] text-text-secondary hover:text-foreground border border-border-custom px-2 py-1 rounded transition-colors"
        >
          Sign Out
        </button>
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
