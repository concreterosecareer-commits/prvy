"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface EarningsChartProps {
  data: { date: string; earnings: number }[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-red)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--brand-red)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            fontSize: 12,
          }}
          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Earnings"]}
        />
        <Area
          type="monotone"
          dataKey="earnings"
          stroke="var(--brand-red)"
          strokeWidth={2}
          fill="url(#earningsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
