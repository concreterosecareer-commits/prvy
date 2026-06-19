import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { EarningsBySourceChart } from "@/components/dashboard/earnings-by-source-chart";
import { DollarSign, Gift, Users, MessageSquare } from "lucide-react";
import { MOCK_EARNINGS_SERIES, MOCK_EARNINGS_BY_SOURCE } from "@/lib/mock-data";
import { formatUsd } from "@/lib/format";

const LEGEND_COLORS = ["bg-[var(--brand-red)]", "bg-[var(--chart-2)]", "bg-[var(--chart-4)]"];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <span className="text-sm text-muted-foreground">This Month</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Earnings" value={formatUsd(24560)} icon={DollarSign} trend="↑ 16.4%" />
        <StatCard label="Tips Received" value={formatUsd(18230)} icon={Gift} trend="↑ 21.3%" />
        <StatCard label="New Patrons" value="32" icon={Users} trend="↑ 14.2%" />
        <StatCard label="Messages" value="256" icon={MessageSquare} trend="↑ 8.7%" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Earnings Overview</h2>
          <EarningsChart data={MOCK_EARNINGS_SERIES} />
        </Card>

        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Earnings by Source</h2>
          <EarningsBySourceChart data={MOCK_EARNINGS_BY_SOURCE} />
          <div className="mt-4 space-y-2">
            {MOCK_EARNINGS_BY_SOURCE.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${LEGEND_COLORS[i]}`} />
                  {s.name}
                </span>
                <span className="font-medium">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
