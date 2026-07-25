import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  Available: "bg-emerald-500",
  Working:   "bg-[var(--brand-red)]",
  Away:      "bg-amber-500",   // legacy — kept so old rows render correctly
  Active:    "bg-emerald-500", // legacy alias
  Offline:   "bg-zinc-400",
};

export function StatusDot({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const color = STATUS_COLORS[status] ?? "bg-zinc-400";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
      {status}
    </span>
  );
}
