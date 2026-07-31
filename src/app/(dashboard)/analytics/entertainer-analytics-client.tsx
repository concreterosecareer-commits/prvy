"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, Star } from "lucide-react";

import {
  CLUBS, CLUB_STATS, CUSTOMERS, MONTH_LABELS,
  getClubStats, computeKPIs, getClubTableRows, filterCustomers,
} from "./_data";
import type { ClubStats, Customer } from "./_data";

// ── Color tokens ───────────────────────────────────────────────────────────────
const C = {
  red:   "oklch(0.5 0.22 25)",
  c2:    "oklch(0.65 0.18 20)",
  c3:    "oklch(0.4 0.15 30)",
  c4:    "oklch(0.75 0.1 25)",
  c5:    "oklch(0.3 0.05 25)",
  grid:  "oklch(0.95 0 0 / 6%)",
  card:  "oklch(0.17 0.008 25)",
  muted: "oklch(0.54 0.006 25)",
  fg:    "oklch(0.95 0.003 25)",
};

const TT: React.ComponentProps<typeof Tooltip>["contentStyle"] = {
  background: C.card,
  border: "1px solid oklch(0.95 0 0 / 8%)",
  borderRadius: 8,
  fontSize: 12,
  color: C.fg,
};

// ── Formatters ─────────────────────────────────────────────────────────────────
const fmtK    = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
const fmtHr   = (n: number) => `$${n}/hr`;
const fmtPct  = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
const daysSince = (iso: string) =>
  Math.floor((new Date("2026-07-31").getTime() - new Date(iso).getTime()) / 86400000);

// ── Shared UI components ───────────────────────────────────────────────────────

function Sparkline({ data, color = C.red }: { data: number[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function KPICard({
  label, value, sub, trend, spark, sparkColor, accent,
}: {
  label: string; value: string; sub?: string;
  trend?: number; spark?: number[]; sparkColor?: string; accent?: boolean;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <Card className={`flex flex-col gap-1 rounded-2xl border-none p-4 shadow-sm ${accent ? "ring-1 ring-[var(--brand-red)]/25" : ""}`}>
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold leading-none tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-400" : "text-rose-400"}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {fmtPct(trend)}
          </span>
        )}
        {spark && spark.length > 1 && (
          <div className="h-10 flex-1">
            <Sparkline data={spark} color={sparkColor ?? C.red} />
          </div>
        )}
      </div>
    </Card>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="ml-1 opacity-20">↕</span>;
  return <ChevronDown className={`ml-0.5 inline h-3 w-3 ${dir === "asc" ? "rotate-180" : ""}`} />;
}

type SortHeaderProps<K> = {
  label: string; sk: K; current: K; dir: "asc" | "desc"; onSort: (k: K) => void;
};
function SortHeader<K>({ label, sk, current, dir, onSort }: SortHeaderProps<K>) {
  return (
    <th
      onClick={() => onSort(sk)}
      className="cursor-pointer select-none whitespace-nowrap px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <SortIcon active={current === sk} dir={dir} />
    </th>
  );
}

function WeekHeatmap({ data }: { data: number[][] }) {
  const allVals = data.flat().filter(v => v > 0);
  const max = allVals.length ? Math.max(...allVals) : 1;
  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground">{d}</div>
        ))}
      </div>
      {data.map((week, wi) => (
        <div key={wi} className="mb-0.5 grid grid-cols-7 gap-0.5">
          {week.map((val, di) => (
            <div
              key={di}
              title={val > 0 ? `$${val.toLocaleString()}` : "No shift"}
              className="h-7 rounded-sm"
              style={{
                background: val === 0
                  ? "oklch(0.95 0 0 / 5%)"
                  : `oklch(0.5 0.22 25 / ${Math.max(0.12, (val / max) * 0.85)})`,
              }}
            />
          ))}
        </div>
      ))}
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Low</span>
        {[0.12, 0.3, 0.5, 0.7, 0.85].map(o => (
          <div key={o} className="h-3 w-3.5 rounded-sm" style={{ background: `oklch(0.5 0.22 25 / ${o})` }} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}

// ── Club Detail Panel ──────────────────────────────────────────────────────────

function ClubDetailPanel({ stats, range }: { stats: ClubStats; range: "4w" | "3m" }) {
  const house    = stats.houseFees + stats.djTips + stats.securityTips + stats.valet + stats.otherFees;
  const net      = stats.grossEarnings - house;
  const rate     = stats.hoursWorked > 0 ? Math.round(net / stats.hoursWorked) : 0;
  const costPct  = stats.grossEarnings > 0 ? ((house / stats.grossEarnings) * 100).toFixed(1) : "0";
  const club     = CLUBS.find(c => c.id === stats.clubId);
  const period   = range === "4w" ? stats.weeklyData : stats.monthlyData;

  const donutData = [
    { name: "House Fees", value: stats.houseFees },
    { name: "DJ Tips",    value: stats.djTips },
    { name: "Security",   value: stats.securityTips },
    { name: "Valet",      value: stats.valet },
    { name: "Other",      value: stats.otherFees },
  ].filter(d => d.value > 0);
  const donutColors = [C.red, C.c2, C.c3, C.c4, C.c5];

  const houseBars = period.map(p => ({
    label:        p.label,
    "House Fees": Math.round(p.houseCosts * (stats.houseFees / house)),
    "DJ/Security":Math.round(p.houseCosts * ((stats.djTips + stats.securityTips) / house)),
    "Other":      Math.round(p.houseCosts * ((stats.valet + stats.otherFees) / house)),
  }));

  const avgRate = Math.round(period.reduce((s, p) => s + p.rate, 0) / period.length);
  const bestRate = Math.max(...period.map(p => p.rate));

  return (
    <div className="mt-2 space-y-6 rounded-2xl bg-[var(--accent)] p-5">
      {/* Title */}
      <div>
        <p className="font-semibold text-sm">{club?.name} — Detailed Analytics</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{range === "4w" ? "Last 4 weeks" : "Last 3 months"}</p>
      </div>

      {/* A · Effective Hourly Rate */}
      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Effective Hourly Rate</p>
        <div className="grid gap-3 lg:grid-cols-[200px_1fr]">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Current Rate", val: fmtHr(rate) },
              { label: "Period Avg",   val: fmtHr(avgRate) },
              { label: "Peak Rate",    val: fmtHr(bestRate) },
            ].map(({ label, val }) => (
              <div key={label} className="rounded-xl bg-[var(--card)] p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-1 text-lg font-bold tabular-nums">{val}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-[var(--card)] p-4">
            <p className="mb-2 text-xs text-muted-foreground">Rate trend</p>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={period.map(p => ({ label: p.label, v: p.rate }))} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke={C.grid} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
                <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip contentStyle={TT} formatter={(v) => `$${v}/hr`} cursor={{ stroke: C.grid }} />
                <Line type="monotone" dataKey="v" name="Rate" stroke={C.red} strokeWidth={2}
                  dot={{ r: 3, fill: C.red, strokeWidth: 0 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* B · House Cost Analysis */}
      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">House Cost Analysis</p>
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Gross Earnings", val: fmtK(stats.grossEarnings) },
            { label: "Total Costs",    val: fmtK(house) },
            { label: "Net Earnings",   val: fmtK(net) },
            { label: "Cost %",         val: `${costPct}%` },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-xl bg-[var(--card)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{val}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Cost breakdown donut */}
          <div className="rounded-xl bg-[var(--card)] p-4">
            <p className="mb-1 text-xs text-muted-foreground">Cost breakdown</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={46} outerRadius={70}
                  paddingAngle={2} startAngle={90} endAngle={-270} isAnimationActive={false}>
                  {donutData.map((_, i) => <Cell key={i} fill={donutColors[i % donutColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={TT} formatter={(v) => fmtK(Number(v ?? 0))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {donutData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: donutColors[i % donutColors.length] }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>
          {/* Stacked bar by period */}
          <div className="rounded-xl bg-[var(--card)] p-4">
            <p className="mb-1 text-xs text-muted-foreground">Costs per {range === "4w" ? "week" : "month"}</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={houseBars} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={C.grid} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
                <YAxis tickFormatter={v => fmtK(v as number)} tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip contentStyle={TT} cursor={{ fill: "oklch(0.95 0 0 / 4%)" }} formatter={(v) => fmtK(Number(v ?? 0))} />
                <Bar dataKey="House Fees"  stackId="a" fill={C.red} isAnimationActive={false} />
                <Bar dataKey="DJ/Security" stackId="a" fill={C.c2} isAnimationActive={false} />
                <Bar dataKey="Other"       stackId="a" fill={C.c4} radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* C · Customer Traffic Density */}
      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Customer Traffic Density</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-[var(--card)] p-4">
            <p className="mb-2 text-xs text-muted-foreground">Revenue by shift type</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={stats.trafficByDay} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={C.grid} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.muted }} />
                <YAxis tickFormatter={v => fmtK(v as number)} tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip contentStyle={TT} cursor={{ fill: "oklch(0.95 0 0 / 4%)" }} />
                <Bar dataKey="avgRevenue"    name="Avg Revenue"   fill={C.red} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="avgCustomers"  name="Avg Customers" fill={C.c2} radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-[var(--card)] p-4">
            <p className="mb-3 text-xs text-muted-foreground">Daily revenue heatmap — last 4 weeks</p>
            <WeekHeatmap data={stats.weekHeatmap} />
          </div>
        </div>
      </section>

      {/* D · Period Performance */}
      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {range === "4w" ? "Weekly" : "Monthly"} Performance
        </p>
        <div className="rounded-xl bg-[var(--card)] p-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={period} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis tickFormatter={v => fmtK(v as number)} tick={{ fontSize: 11, fill: C.muted }} />
              <Tooltip contentStyle={TT} cursor={{ fill: "oklch(0.95 0 0 / 4%)" }} formatter={(v) => fmtK(Number(v ?? 0))} />
              <Bar dataKey="gross"      name="Gross"       fill={C.c2} radius={[2, 2, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="net"        name="Net"         fill={C.red} radius={[2, 2, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="houseCosts" name="House Costs" fill={C.c5} radius={[2, 2, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {([["Gross", C.c2], ["Net", C.red], ["House Costs", C.c5]] as [string, string][]).map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Customer Detail Panel ──────────────────────────────────────────────────────

function CustomerDetailPanel({ customer }: { customer: Customer }) {
  const {
    monthlySpend, totalVisits, vipVisits, lifetimeValue,
    conversationsTotal, conversionsSuccessful, totalTimeHours,
  } = customer;

  const spendTrend = MONTH_LABELS.map((label, i) => ({ label, v: monthlySpend[i] }));
  const cumulative = monthlySpend.reduce<number[]>((acc, v) => {
    acc.push((acc[acc.length - 1] ?? 0) + v);
    return acc;
  }, []);
  const ltvData = MONTH_LABELS.map((label, i) => ({ label, v: cumulative[i] }));

  const activeMonths = monthlySpend.filter(v => v > 0);
  const highestMonth = activeMonths.length ? Math.max(...activeMonths) : 0;
  const lowestMonth  = activeMonths.length ? Math.min(...activeMonths) : 0;
  const avgSession   = (totalTimeHours / Math.max(1, totalVisits)).toFixed(1);

  const stageEst   = Math.round(conversionsSuccessful * 0.62);
  const privateEst = Math.round(conversionsSuccessful * 0.38);
  const funnelSteps = [
    { label: "Conversations",  count: conversationsTotal,                    pct: 100 },
    { label: "Engaged",        count: Math.round(conversationsTotal * 0.70), pct: 70  },
    { label: "Stage Dance",    count: stageEst,                              pct: Math.round(stageEst / Math.max(1, conversationsTotal) * 100) },
    { label: "Private Dance",  count: privateEst,                            pct: Math.round(privateEst / Math.max(1, conversationsTotal) * 100) },
    { label: "VIP Room",       count: vipVisits,                             pct: Math.round(vipVisits / Math.max(1, totalVisits) * 100) },
  ];

  const tierLabel = customer.tier === "high" ? "High Value" : customer.tier === "mid" ? "Mid Value" : "Regular";

  return (
    <div className="mt-2 space-y-6 rounded-2xl bg-[var(--accent)] p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-red)]/20 text-sm font-bold text-[var(--brand-red)]">
          {customer.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-sm">{customer.name}</p>
          <p className="text-xs text-muted-foreground">
            {tierLabel} · {totalVisits} visits · {vipVisits > 0 ? `${vipVisits} VIP · ` : ""}LTV {fmtK(lifetimeValue)}
          </p>
        </div>
      </div>

      {/* A · Avg Spend per Interaction */}
      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Spend per Interaction</p>
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Avg Spend",     val: fmtK(customer.avgSpend) },
            { label: "Avg Session",   val: `${avgSession}h` },
            { label: "Best Month",    val: fmtK(highestMonth) },
            { label: "Lowest Month",  val: fmtK(lowestMonth) },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-xl bg-[var(--card)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{val}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-[var(--card)] p-4">
          <p className="mb-2 text-xs text-muted-foreground">Monthly spend</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={spendTrend} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis tickFormatter={v => fmtK(v as number)} tick={{ fontSize: 11, fill: C.muted }} />
              <Tooltip contentStyle={TT} cursor={{ fill: "oklch(0.95 0 0 / 4%)" }} formatter={(v) => fmtK(Number(v ?? 0))} />
              <Bar dataKey="v" name="Spend" fill={C.red} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* B · Lifetime Value */}
      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Customer Lifetime Value</p>
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Total LTV",    val: fmtK(lifetimeValue) },
            { label: "Total Visits", val: String(totalVisits) },
            { label: "VIP Visits",   val: String(vipVisits) },
            { label: "First Visit",  val: fmtDate(customer.firstVisit) },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-xl bg-[var(--card)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{val}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-[var(--card)] p-4">
          <p className="mb-2 text-xs text-muted-foreground">Cumulative revenue (recent 6 months)</p>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={ltvData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id={`ltv-${customer.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.red} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis tickFormatter={v => fmtK(v as number)} tick={{ fontSize: 11, fill: C.muted }} />
              <Tooltip contentStyle={TT} formatter={(v) => fmtK(Number(v ?? 0))} />
              <Area type="monotone" dataKey="v" name="Cumulative"
                stroke={C.red} strokeWidth={2}
                fill={`url(#ltv-${customer.id})`}
                isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* C · Conversion Rate */}
      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Conversion Rate</p>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Conversations",  val: String(conversationsTotal) },
            { label: "Conversions",    val: String(conversionsSuccessful) },
            { label: "Conv. Rate",     val: `${Math.round(customer.conversionRate * 100)}%` },
            { label: "Momentum",       val: customer.conversionRate >= 0.65 ? "↑ Strong" : customer.conversionRate >= 0.50 ? "→ Stable" : "↓ Grow" },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-xl bg-[var(--card)] p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{val}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-[var(--card)] p-4 space-y-3">
          <p className="text-xs text-muted-foreground">Sales funnel</p>
          {funnelSteps.map((step, i) => (
            <div key={step.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{step.label}</span>
                <span className="font-medium tabular-nums">
                  {step.count} <span className="text-muted-foreground">· {step.pct}%</span>
                </span>
              </div>
              <div className="h-5 overflow-hidden rounded bg-[var(--muted)]">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${step.pct}%`,
                    background: `oklch(0.5 0.22 25 / ${0.35 + (1 - i / funnelSteps.length) * 0.5})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Customer Insights ──────────────────────────────────────────────────────────

function CustomerInsightsSection({ customers }: { customers: Customer[] }) {
  const byLtv    = [...customers].sort((a, b) => b.lifetimeValue - a.lifetimeValue);
  const bySpend  = [...customers].sort((a, b) => b.avgSpend - a.avgSpend);
  const byVisits = [...customers].sort((a, b) => b.totalVisits - a.totalVisits);
  const notSeen  = byLtv.filter(c => daysSince(c.lastVisit) > 45).slice(0, 4);
  const vipRegs  = byLtv.filter(c => c.vipVisits >= 2).slice(0, 4);
  const potential = customers.filter(c => c.tier !== "high" && c.conversionRate >= 0.60).slice(0, 4);

  function Pill({ c, value }: { c: Customer; value: string }) {
    return (
      <div className="flex items-center justify-between rounded-lg bg-[var(--accent)] px-3 py-2 text-xs">
        <span className="font-medium">{c.name}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
    );
  }

  function InsightBlock({ title, color, children }: { title: string; color?: string; children: React.ReactNode }) {
    return (
      <Card className="rounded-2xl border-none p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: color ?? C.red }}>
          <span className="h-px w-4" style={{ background: color ?? C.red }} />
          {title}
        </p>
        <div className="space-y-1.5">{children}</div>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="mb-3 font-semibold">Customer Insights</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightBlock title="Highest Lifetime Value">
          {byLtv.slice(0, 3).map(c => <Pill key={c.id} c={c} value={fmtK(c.lifetimeValue)} />)}
        </InsightBlock>

        <InsightBlock title="Highest Avg Spend" color={C.c2}>
          {bySpend.slice(0, 3).map(c => <Pill key={c.id} c={c} value={fmtK(c.avgSpend)} />)}
        </InsightBlock>

        <InsightBlock title="Most Frequent Visitor" color={C.c3}>
          {byVisits.slice(0, 1).map(c => (
            <div key={c.id} className="rounded-xl bg-[var(--accent)] p-3">
              <p className="font-semibold">{c.name}</p>
              <div className="mt-2 grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                <span>Total visits</span>
                <span className="text-right font-medium text-foreground">{c.totalVisits}</span>
                <span>LTV</span>
                <span className="text-right font-medium text-foreground">{fmtK(c.lifetimeValue)}</span>
                <span>VIP visits</span>
                <span className="text-right font-medium text-foreground">{c.vipVisits}</span>
              </div>
            </div>
          ))}
        </InsightBlock>

        <InsightBlock title="Not Seen in 45+ Days" color={C.c4}>
          {notSeen.length > 0
            ? notSeen.map(c => <Pill key={c.id} c={c} value={`${daysSince(c.lastVisit)}d ago`} />)
            : <p className="text-xs text-muted-foreground">Everyone seen recently</p>}
        </InsightBlock>

        <InsightBlock title="VIP Regulars" color={C.red}>
          {vipRegs.length > 0
            ? vipRegs.map(c => <Pill key={c.id} c={c} value={`${c.vipVisits} VIP visits`} />)
            : <p className="text-xs text-muted-foreground">No VIP regulars yet</p>}
        </InsightBlock>

        <InsightBlock title="Potential High-Value" color={C.c5}>
          {potential.length > 0
            ? potential.map(c => <Pill key={c.id} c={c} value={`${Math.round(c.conversionRate * 100)}% conv.`} />)
            : <p className="text-xs text-muted-foreground">No candidates identified</p>}
        </InsightBlock>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

type ClubSortKey = "name" | "hours" | "gross" | "net" | "rate" | "house" | "vip" | "traffic";
type CustSortKey = "name" | "lastVisit" | "visits" | "ltv" | "avgSpend" | "time" | "conversion" | "vip";

export function EntertainerAnalyticsClient() {
  const [clubId,       setClubId]       = useState("all");
  const [range,        setRange]        = useState<"4w" | "3m">("4w");
  const [custType,     setCustType]     = useState("all");
  const [expandedClub, setExpandedClub] = useState<string | null>(null);
  const [expandedCust, setExpandedCust] = useState<string | null>(null);
  const [clubSort,     setClubSort]     = useState<ClubSortKey>("gross");
  const [clubDir,      setClubDir]      = useState<"asc" | "desc">("desc");
  const [custSort,     setCustSort]     = useState<CustSortKey>("ltv");
  const [custDir,      setCustDir]      = useState<"asc" | "desc">("desc");

  const stats = useMemo(() => getClubStats(clubId), [clubId]);
  const kpis  = useMemo(() => computeKPIs(stats, range), [stats, range]);

  const clubRows = useMemo(() => {
    const rows = getClubTableRows(
      clubId === "all" ? CLUB_STATS : CLUB_STATS.filter(s => s.clubId === clubId),
      range
    );
    return [...rows].sort((a, b) => {
      let diff: number;
      const na = CLUBS.find(c => c.id === a.clubId)?.name ?? "";
      const nb = CLUBS.find(c => c.id === b.clubId)?.name ?? "";
      if      (clubSort === "name")    diff = na.localeCompare(nb);
      else if (clubSort === "hours")   diff = a.hoursWorked - b.hoursWorked;
      else if (clubSort === "gross")   diff = a.gross - b.gross;
      else if (clubSort === "net")     diff = a.net - b.net;
      else if (clubSort === "rate")    diff = a.rate - b.rate;
      else if (clubSort === "house")   diff = a.houseCosts - b.houseCosts;
      else if (clubSort === "vip")     diff = a.vipRevenue - b.vipRevenue;
      else                             diff = a.trafficRating - b.trafficRating;
      return clubDir === "asc" ? diff : -diff;
    });
  }, [clubId, range, clubSort, clubDir]);

  const filteredCusts = useMemo(() => filterCustomers(CUSTOMERS, clubId, custType), [clubId, custType]);

  const sortedCusts = useMemo(() => {
    return [...filteredCusts].sort((a, b) => {
      let diff: number;
      if      (custSort === "name")       diff = a.name.localeCompare(b.name);
      else if (custSort === "lastVisit")  diff = new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
      else if (custSort === "visits")     diff = a.totalVisits - b.totalVisits;
      else if (custSort === "ltv")        diff = a.lifetimeValue - b.lifetimeValue;
      else if (custSort === "avgSpend")   diff = a.avgSpend - b.avgSpend;
      else if (custSort === "time")       diff = a.totalTimeHours - b.totalTimeHours;
      else if (custSort === "conversion") diff = a.conversionRate - b.conversionRate;
      else                                diff = a.vipVisits - b.vipVisits;
      return custDir === "asc" ? diff : -diff;
    });
  }, [filteredCusts, custSort, custDir]);

  function handleClubSort(k: ClubSortKey) {
    if (clubSort === k) setClubDir(d => d === "asc" ? "desc" : "asc");
    else { setClubSort(k); setClubDir("desc"); }
  }
  function handleCustSort(k: CustSortKey) {
    if (custSort === k) setCustDir(d => d === "asc" ? "desc" : "asc");
    else { setCustSort(k); setCustDir("desc"); }
  }

  const tdCls = "whitespace-nowrap px-3 py-3 text-sm tabular-nums";

  return (
    <div className="space-y-6 pb-10">
      {/* Header + filters */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Earnings Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {CLUBS.length} clubs · {CUSTOMERS.length} customers tracked
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={clubId} onValueChange={v => { setClubId(v); setExpandedClub(null); }}>
            <SelectTrigger className="h-9 w-44 border-[var(--border)] bg-[var(--card)] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clubs</SelectItem>
              {CLUBS.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {/* Custom range selector to avoid nested Tabs context */}
          <div className="flex overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
            {(["4w", "3m"] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-[var(--brand-red)] text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "4w" ? "4 Weeks" : "3 Months"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        <KPICard label="Total Earnings"   value={fmtK(kpis.totalGross)} trend={kpis.monthlyGrowthPct} spark={kpis.revSparkline} accent />
        <KPICard label="Net Earnings"     value={fmtK(kpis.totalNet)}   trend={kpis.monthlyGrowthPct} spark={kpis.netSparkline} sparkColor={C.c2} />
        <KPICard label="Hours Worked"     value={`${kpis.totalHours}h`} />
        <KPICard label="Effective Rate"   value={fmtHr(kpis.effectiveRate)} spark={kpis.rateSparkline} sparkColor={C.c3} />
        <KPICard label="Customers Served" value={String(kpis.totalCustomers)} />
        <KPICard label="Avg Spend"        value={fmtK(kpis.avgSpend)} />
        <KPICard label="Monthly Growth"   value={fmtPct(kpis.monthlyGrowthPct)} trend={kpis.monthlyGrowthPct} />
        <KPICard label="Weekly Earnings"  value={fmtK(kpis.weeklyEarnings)} sub="gross, last period" />
      </div>

      {/* Section Tabs */}
      <Tabs defaultValue="clubs">
        <TabsList className="bg-[var(--card)]">
          <TabsTrigger value="clubs">Club Performance</TabsTrigger>
          <TabsTrigger value="crm">Customer CRM</TabsTrigger>
        </TabsList>

        {/* ── Club Performance ───────────────────────────────────────────── */}
        <TabsContent value="clubs" className="mt-4">
          <Card className="overflow-hidden rounded-2xl border-none shadow-sm">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="font-semibold">Club Performance</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Click a row to expand detailed analytics · Click headers to sort</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <SortHeader<ClubSortKey> label="Club"        sk="name"    current={clubSort} dir={clubDir} onSort={handleClubSort} />
                    <SortHeader<ClubSortKey> label="Hours"       sk="hours"   current={clubSort} dir={clubDir} onSort={handleClubSort} />
                    <SortHeader<ClubSortKey> label="Gross"       sk="gross"   current={clubSort} dir={clubDir} onSort={handleClubSort} />
                    <SortHeader<ClubSortKey> label="Net"         sk="net"     current={clubSort} dir={clubDir} onSort={handleClubSort} />
                    <SortHeader<ClubSortKey> label="Rate ($/hr)" sk="rate"    current={clubSort} dir={clubDir} onSort={handleClubSort} />
                    <SortHeader<ClubSortKey> label="House Costs" sk="house"   current={clubSort} dir={clubDir} onSort={handleClubSort} />
                    <SortHeader<ClubSortKey> label="VIP Rev"     sk="vip"     current={clubSort} dir={clubDir} onSort={handleClubSort} />
                    <SortHeader<ClubSortKey> label="Traffic"     sk="traffic" current={clubSort} dir={clubDir} onSort={handleClubSort} />
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {clubRows.flatMap(row => {
                    const club   = CLUBS.find(c => c.id === row.clubId);
                    const cs     = CLUB_STATS.find(s => s.clubId === row.clubId)!;
                    const isOpen = expandedClub === row.clubId;
                    const trend  = row.trendData;
                    const trendUp = trend[trend.length - 1] > trend[0];
                    return [
                      <tr key={row.clubId}
                        onClick={() => setExpandedClub(isOpen ? null : row.clubId)}
                        className={`cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--accent)] ${isOpen ? "bg-[var(--accent)]" : ""}`}
                      >
                        <td className={`${tdCls} font-medium`}>
                          <div className="flex items-center gap-2">
                            {isOpen
                              ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                              : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
                            <div>
                              <p>{club?.name}</p>
                              <p className="text-[10px] font-normal text-muted-foreground">{club?.city}, {club?.state}</p>
                            </div>
                          </div>
                        </td>
                        <td className={tdCls}>{row.hoursWorked}h</td>
                        <td className={tdCls}>{fmtK(row.gross)}</td>
                        <td className={`${tdCls} font-semibold`}>{fmtK(row.net)}</td>
                        <td className={tdCls}>{fmtHr(row.rate)}</td>
                        <td className={`${tdCls} text-rose-400`}>{fmtK(row.houseCosts)}</td>
                        <td className={tdCls}>{fmtK(row.vipRevenue)}</td>
                        <td className={tdCls}>
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-[var(--muted)]">
                              <div className="h-full rounded-full" style={{ width: `${(row.trafficRating / 10) * 100}%`, background: C.red }} />
                            </div>
                            <span>{row.trafficRating}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="h-8 w-20">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={trend.map((v, i) => ({ i, v }))} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
                                <Line type="monotone" dataKey="v"
                                  stroke={trendUp ? C.red : C.muted}
                                  strokeWidth={1.5} dot={false} isAnimationActive={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </td>
                      </tr>,
                      isOpen ? (
                        <tr key={`${row.clubId}-detail`}>
                          <td colSpan={9} className="px-4 py-3">
                            <ClubDetailPanel stats={cs} range={range} />
                          </td>
                        </tr>
                      ) : null,
                    ];
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ── Customer CRM ───────────────────────────────────────────────── */}
        <TabsContent value="crm" className="mt-4 space-y-5">
          {/* CRM filter row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Show:</span>
            <Select value={custType} onValueChange={setCustType}>
              <SelectTrigger className="h-8 w-40 border-[var(--border)] bg-[var(--card)] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="vip">VIP Customers</SelectItem>
                <SelectItem value="high">High Value</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{sortedCusts.length} customers</span>
          </div>

          {/* Customer table */}
          <Card className="overflow-hidden rounded-2xl border-none shadow-sm">
            <div className="border-b border-[var(--border)] px-5 py-4">
              <h2 className="font-semibold">Customer CRM</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Click a row to expand analytics · ★ = frequent VIP</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <SortHeader<CustSortKey> label="Customer"   sk="name"       current={custSort} dir={custDir} onSort={handleCustSort} />
                    <SortHeader<CustSortKey> label="Last Visit" sk="lastVisit"  current={custSort} dir={custDir} onSort={handleCustSort} />
                    <SortHeader<CustSortKey> label="Visits"     sk="visits"     current={custSort} dir={custDir} onSort={handleCustSort} />
                    <SortHeader<CustSortKey> label="LTV"        sk="ltv"        current={custSort} dir={custDir} onSort={handleCustSort} />
                    <SortHeader<CustSortKey> label="Avg Spend"  sk="avgSpend"   current={custSort} dir={custDir} onSort={handleCustSort} />
                    <SortHeader<CustSortKey> label="Time Spent" sk="time"       current={custSort} dir={custDir} onSort={handleCustSort} />
                    <SortHeader<CustSortKey> label="Conv. Rate" sk="conversion" current={custSort} dir={custDir} onSort={handleCustSort} />
                    <SortHeader<CustSortKey> label="VIP Visits" sk="vip"        current={custSort} dir={custDir} onSort={handleCustSort} />
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCusts.flatMap(cust => {
                    const isOpen = expandedCust === cust.id;
                    const convClr = cust.conversionRate >= 0.70 ? "text-emerald-400"
                                  : cust.conversionRate >= 0.50 ? "text-amber-400"
                                  : "text-rose-400";
                    const tier = cust.tier === "high"
                      ? { label: "High",    cls: "bg-[var(--brand-red)]/15 text-[var(--brand-red)]" }
                      : cust.tier === "mid"
                      ? { label: "Mid",     cls: "bg-amber-500/10 text-amber-400" }
                      : { label: "Regular", cls: "bg-[var(--muted)] text-muted-foreground" };
                    return [
                      <tr key={cust.id}
                        onClick={() => setExpandedCust(isOpen ? null : cust.id)}
                        className={`cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--accent)] ${isOpen ? "bg-[var(--accent)]" : ""}`}
                      >
                        <td className={`${tdCls} font-medium`}>
                          <div className="flex items-center gap-2">
                            {isOpen
                              ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                              : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
                            {cust.name}
                            {cust.vipVisits >= 5 && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                          </div>
                        </td>
                        <td className={tdCls}>{fmtDate(cust.lastVisit)}</td>
                        <td className={tdCls}>{cust.totalVisits}</td>
                        <td className={`${tdCls} font-semibold`}>{fmtK(cust.lifetimeValue)}</td>
                        <td className={tdCls}>{fmtK(cust.avgSpend)}</td>
                        <td className={tdCls}>{cust.totalTimeHours}h</td>
                        <td className={`${tdCls} font-medium ${convClr}`}>{Math.round(cust.conversionRate * 100)}%</td>
                        <td className={tdCls}>{cust.vipVisits}</td>
                        <td className={tdCls}>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${tier.cls}`}>
                            {tier.label}
                          </span>
                        </td>
                      </tr>,
                      isOpen ? (
                        <tr key={`${cust.id}-detail`}>
                          <td colSpan={9} className="px-4 py-3">
                            <CustomerDetailPanel customer={cust} />
                          </td>
                        </tr>
                      ) : null,
                    ];
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Customer Insights */}
          <CustomerInsightsSection customers={filteredCusts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
