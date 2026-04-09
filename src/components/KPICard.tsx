import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  className?: string;
}

export function KPICard({ label, value, className }: KPICardProps) {
  return (
    <div className={cn("bg-surface border border-border-custom rounded-lg p-4 text-center", className)}>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-text-secondary mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}
