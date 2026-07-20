"use client";

import { useEffect, useState } from "react";

/**
 * Brand icon via the simple-icons CDN, falling back to a text monogram if
 * the slug 404s or is omitted. Loaded through a plain `Image()` probe in an
 * effect rather than a server-rendered <img src>, so a fast failure (404,
 * no network) can't race ahead of hydration and fire before onError is
 * attached — the fallback would otherwise sometimes never show.
 */
export function SystemLogo({ name, iconSlug }: { name: string; iconSlug?: string }) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(!iconSlug);

  useEffect(() => {
    if (!iconSlug) return;
    let cancelled = false;
    const src = `https://cdn.simpleicons.org/${iconSlug}`;
    const img = new Image();
    img.onload = () => { if (!cancelled) setLoadedSrc(src); };
    img.onerror = () => { if (!cancelled) setFailed(true); };
    img.src = src;
    return () => { cancelled = true; };
  }, [iconSlug]);

  const initials = name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (loadedSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={loadedSrc} alt={`${name} logo`} width={20} height={20} className="w-5 h-5 shrink-0" />
    );
  }
  return (
    <div className="w-8 h-8 rounded bg-surface border border-border-custom flex items-center justify-center text-[10px] font-bold text-text-secondary shrink-0">
      {failed || !iconSlug ? initials || "?" : ""}
    </div>
  );
}
