"use client";

import { usePathname } from "next/navigation";
import { classifyPath, CLASSIFICATION_META } from "@/lib/access";

// Automatically labels the current page with its data classification. Placed in
// the global footer so every route — public or private — carries a visible
// sensitivity label without having to annotate each page individually.
export function PageClassificationFooter() {
  const pathname = usePathname() || "/";
  const level = classifyPath(pathname);
  const meta = CLASSIFICATION_META[level];

  const dot =
    level === "public"
      ? "bg-accent-green"
      : level === "confidential"
      ? "bg-accent-amber"
      : "bg-accent-red";

  return (
    <div className="flex items-center justify-center gap-2 text-[10px] text-white/40">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="uppercase tracking-wide font-semibold">{meta.short}</span>
      <span className="text-white/30">·</span>
      <span>{meta.audience}</span>
    </div>
  );
}
