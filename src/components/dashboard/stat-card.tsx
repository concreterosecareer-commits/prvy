import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  sub?: string;
  footer?: React.ReactNode;
}

export function StatCard({ label, value, icon: Icon, trend, trendPositive = true, sub, footer }: StatCardProps) {
  return (
    <Card className="flex flex-col rounded-2xl border-none p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{label}</p>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[var(--brand-red)]/70 bg-transparent text-[var(--brand-red)]">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {trend && (
        <p className={cn("mt-1 text-xs font-medium", trendPositive ? "text-emerald-600" : "text-destructive")}>
          {trend}
        </p>
      )}
      {footer && <div className="mt-auto pt-3">{footer}</div>}
    </Card>
  );
}
