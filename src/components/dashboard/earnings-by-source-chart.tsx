"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["var(--brand-red)", "var(--chart-2)", "var(--chart-4)"];

interface EarningsBySourceChartProps {
  data: { name: string; value: number }[];
}

export function EarningsBySourceChart({ data }: EarningsBySourceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}%`, ""]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
