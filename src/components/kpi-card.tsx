import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent?: boolean;
}

export function KpiCard({ label, value, icon: Icon, trend, trendUp, accent }: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border p-5 shadow-[var(--shadow-elegant)]",
        accent
          ? "bg-[image:var(--gradient-gold)] text-primary-foreground"
          : "bg-[image:var(--gradient-surface)]",
      )}
    >
      <div className="flex items-start justify-between">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wide",
            accent ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            accent ? "bg-primary-foreground/15" : "bg-primary/10",
          )}
        >
          <Icon className={cn("h-4.5 w-4.5", accent ? "text-primary-foreground" : "text-primary")} />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight">{value}</p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs",
            accent
              ? "text-primary-foreground/80"
              : trendUp
                ? "text-success"
                : "text-muted-foreground",
          )}
        >
          {trend}
        </p>
      )}
    </div>
  );
}
