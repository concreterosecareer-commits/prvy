import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-500",
  Away: "bg-amber-500",
  Offline: "bg-zinc-400",
};

export function StatusDot({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_COLORS[status] ?? "bg-zinc-400")} />
      {status}
    </span>
  );
}
