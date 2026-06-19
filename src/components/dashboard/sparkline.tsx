"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: { value: number }[];
}

export function Sparkline({ data }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-red)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--brand-red)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--brand-red)"
          strokeWidth={2}
          fill="url(#sparklineFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
