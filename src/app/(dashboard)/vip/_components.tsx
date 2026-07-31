"use client";

import React, { useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { X, TrendingUp, TrendingDown, ChevronUp, ChevronDown, Trophy } from "lucide-react";
import {
  TIER_CONFIG, TIER_STYLE, getNextTier, getProgressToNextTier, CLUBS,
} from "./_data";

export { TIER_STYLE };
import type { TierDef, Shift, TierId, PeriodData } from "./_data";

// ─── Colors ──────────────────────────────────────────────────────────────────

export const C = {
  red:      "oklch(0.5 0.22 25)",
  gold:     "oklch(0.72 0.14 85)",
  silver:   "oklch(0.70 0.003 0)",
  burgundy: "oklch(0.42 0.13 15)",
  teal:     "oklch(0.62 0.12 195)",
  lime:     "oklch(0.68 0.13 145)",
  grid:     "oklch(0.95 0 0 / 6%)",
  card:     "oklch(0.17 0.008 25)",
  bg:       "oklch(0.12 0.008 25)",
  muted:    "oklch(0.54 0.006 25)",
  fg:       "oklch(0.95 0.003 25)",
};

export const TIER_COLOR: Record<TierId, string> = {
  standard: C.silver,
  pro:      C.gold,
  privy:    C.burgundy,
};

const TT: React.ComponentProps<typeof Tooltip>["contentStyle"] = {
  background: C.card,
  border: "1px solid oklch(0.95 0 0 / 8%)",
  borderRadius: 8,
  fontSize: 12,
  color: C.fg,
};

// ─── Formatters ──────────────────────────────────────────────────────────────

export function fmtK(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`;
}

// ─── TierBadge ────────────────────────────────────────────────────────────────

interface TierBadgeProps {
  tier: TierId;
  size?: "xs" | "sm" | "md" | "lg";
}

export function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const style = TIER_STYLE[tier];
  const def = TIER_CONFIG.find((t) => t.id === tier)!;
  const sz = {
    xs: "px-2 py-0.5 text-[10px] tracking-wide",
    sm: "px-2.5 py-1 text-xs tracking-wide",
    md: "px-3 py-1.5 text-sm tracking-wider",
    lg: "px-4 py-2 text-base font-semibold tracking-widest",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sz}`}
      style={{
        background: style.gradient,
        border: `1px solid ${style.border}`,
        boxShadow: `0 0 10px ${style.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
        color: style.textColor,
      }}
    >
      {def.label}
    </span>
  );
}

// ─── KPICard ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  sparkline?: number[];
  accent?: string;
  highlight?: boolean;
}

export function KPICard({
  label,
  value,
  sub,
  trend,
  sparkline,
  accent = C.red,
  highlight = false,
}: KPICardProps) {
  const up = (trend ?? 0) >= 0;
  const sp = (sparkline ?? []).map((v, i) => ({ i, v }));

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1.5"
      style={{
        background: C.card,
        border: highlight
          ? `1px solid ${accent}35`
          : "1px solid oklch(0.95 0 0 / 6%)",
        boxShadow: highlight ? `0 0 24px ${accent}12` : undefined,
      }}
    >
      <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
        {label}
      </span>
      <span className="text-2xl font-bold tracking-tight">{value}</span>
      <div className="flex items-center justify-between mt-auto gap-2">
        <div className="flex items-center gap-1.5">
          {trend !== undefined && (
            <>
              {up ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
                {up ? "+" : ""}
                {trend.toFixed(1)}%
              </span>
            </>
          )}
          {sub && (
            <span className="text-xs text-muted-foreground">{sub}</span>
          )}
        </div>
        {sp.length > 1 && (
          <div style={{ width: 56, height: 22 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sp}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={accent}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TierProgressCard ─────────────────────────────────────────────────────────

interface TierProgressCardProps {
  shift: Shift;
  onOpen: () => void;
}

export function TierProgressCard({ shift, onOpen }: TierProgressCardProps) {
  const tier = TIER_CONFIG.find((t) => t.id === shift.tier)!;
  const next = getNextTier(tier);
  const pct = getProgressToNextTier(shift.vipRevenue, tier);
  const style = TIER_STYLE[shift.tier];
  const remaining = next ? Math.max(0, next.minRevenue - shift.vipRevenue) : 0;

  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-2xl p-5 transition-all duration-200 hover:scale-[1.005] active:scale-[0.998]"
      style={{
        background: `linear-gradient(145deg, oklch(0.18 0.01 15) 0%, ${C.card} 100%)`,
        border: `1px solid ${style.border}35`,
        boxShadow: `0 4px 40px ${style.glow}, 0 1px 0 rgba(255,255,255,0.04) inset`,
      }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Current Tier</p>
          <TierBadge tier={shift.tier} size="lg" />
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">VIP Revenue</p>
          <p className="text-3xl font-bold tabular-nums">{fmtK(shift.vipRevenue)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">
            {next ? `Progress to ${next.label}` : "Top Tier Achieved"}
          </span>
          <span className="font-bold tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.95 0 0 / 8%)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: style.gradient, boxShadow: `0 0 6px ${style.glow}` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {next
            ? `${fmtK(remaining)} more · ${next.bonusPct}% bonus unlocks at ${next.label}`
            : `${tier.bonusPct}% VIP bonus active · Maximum tier`}
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground mt-4 opacity-50 tracking-wide">
        Tap for breakdown →
      </p>
    </button>
  );
}

// ─── TierDetailModal ──────────────────────────────────────────────────────────

interface TierDetailModalProps {
  shift: Shift;
  allShifts: Shift[];
  onClose: () => void;
}

export function TierDetailModal({ shift, allShifts, onClose }: TierDetailModalProps) {
  const tier = TIER_CONFIG.find((t) => t.id === shift.tier)!;
  const next = getNextTier(tier);
  const pct = getProgressToNextTier(shift.vipRevenue, tier);
  const style = TIER_STYLE[shift.tier];
  const remaining = next ? Math.max(0, next.minRevenue - shift.vipRevenue) : 0;
  const total = shift.netEarnings + shift.bonusEarned;

  const recent = allShifts
    .filter((s) => !s.isActive && s.entertainerId === shift.entertainerId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background: "oklch(0.15 0.008 25)",
          border: `1px solid ${style.border}40`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 40px ${style.glow}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Tier Breakdown · {shift.date}
            </p>
            <TierBadge tier={shift.tier} size="lg" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{tier.description}</p>

        {/* Requirement tiers */}
        <div className="mb-5 space-y-2">
          {TIER_CONFIG.map((t) => {
            const s = TIER_STYLE[t.id];
            const achieved = shift.vipRevenue >= t.minRevenue;
            const isCurrent = t.id === shift.tier;
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                style={{
                  background: isCurrent ? `${s.border}18` : "oklch(0.12 0.008 25)",
                  border: isCurrent ? `1px solid ${s.border}40` : "1px solid transparent",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: achieved ? s.border : C.muted }}
                />
                <TierBadge tier={t.id} size="xs" />
                <span className="text-xs text-muted-foreground flex-1">
                  {t.minRevenue === 0 ? "Default" : `$${t.minRevenue.toLocaleString()}+ VIP revenue`}
                </span>
                <span className="text-xs font-medium" style={{ color: achieved ? s.border : C.muted }}>
                  {achieved ? "✓" : `Need ${fmtK(t.minRevenue - shift.vipRevenue)} more`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress to next tier */}
        {next ? (
          <div className="rounded-xl p-4 mb-5" style={{ background: C.card }}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Progress to {next.label}</p>
              <span className="text-sm font-bold" style={{ color: TIER_STYLE[next.id].border }}>
                {pct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden mb-2.5" style={{ background: "oklch(0.95 0 0 / 6%)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: style.gradient }} />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{tier.label}: {fmtK(tier.minRevenue)}</span>
              <span className="text-amber-400">{fmtK(remaining)} needed</span>
              <span>{next.label}: {fmtK(next.minRevenue)}</span>
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl p-4 mb-5 flex items-center gap-3"
            style={{ background: C.card, border: `1px solid ${style.border}30` }}
          >
            <Trophy className="w-5 h-5 flex-shrink-0" style={{ color: style.border }} />
            <div>
              <p className="text-sm font-medium">Maximum Tier Achieved</p>
              <p className="text-xs text-muted-foreground">Top performer this shift</p>
            </div>
          </div>
        )}

        {/* Earnings breakdown */}
        <div className="rounded-xl p-4 mb-5" style={{ background: C.card }}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
            Projected Earnings
          </p>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Commission ({tier.commissionPct}%)</p>
              <p className="text-xl font-bold tabular-nums">{fmtK(shift.netEarnings)}</p>
            </div>
            <span className="text-muted-foreground text-lg mb-0.5">+</span>
            <div>
              <p className="text-[10px] text-muted-foreground">VIP Bonus ({tier.bonusPct}%)</p>
              <p className="text-xl font-bold tabular-nums" style={{ color: style.border }}>
                {fmtK(shift.bonusEarned)}
              </p>
            </div>
            <span className="text-muted-foreground text-lg mb-0.5">=</span>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Total</p>
              <p className="text-2xl font-bold tabular-nums">{fmtK(total)}</p>
            </div>
          </div>
        </div>

        {/* Active benefits */}
        <div className="mb-5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
            Active Benefits
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tier.benefits.map((b) => (
              <span
                key={b}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: `${style.border}15`,
                  color: style.border,
                  border: `1px solid ${style.border}30`,
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Recent shift history */}
        {recent.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
              Recent Shift History
            </p>
            <div className="space-y-1.5">
              {recent.map((s) => {
                const club = CLUBS.find((c) => c.id === s.clubId);
                const ts = TIER_STYLE[s.tier];
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ background: "oklch(0.11 0.008 25)" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TierBadge tier={s.tier} size="xs" />
                      <span className="text-xs text-muted-foreground truncate">
                        {s.date} · {club?.name ?? s.clubId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-medium tabular-nums">{fmtK(s.vipRevenue)}</span>
                      <span className="text-xs tabular-nums" style={{ color: ts.border }}>
                        +{fmtK(s.bonusEarned)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SortHeader ───────────────────────────────────────────────────────────────

interface SortHeaderProps<K> {
  label: string;
  sk: K;
  current: K;
  dir: "asc" | "desc";
  onSort: (k: K) => void;
  className?: string;
}

export function SortHeader<K>({
  label, sk, current, dir, onSort, className = "",
}: SortHeaderProps<K>) {
  const active = current === sk;
  return (
    <th
      onClick={() => onSort(sk)}
      className={`cursor-pointer select-none text-left text-[10px] font-medium text-muted-foreground uppercase tracking-widest py-2 px-3 hover:text-foreground transition-colors whitespace-nowrap ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className={active ? "opacity-100" : "opacity-25"}>
          {active && dir === "asc" ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </span>
      </span>
    </th>
  );
}

// ─── TrendCharts ──────────────────────────────────────────────────────────────

interface TrendChartsProps {
  data: PeriodData[];
  rangeLabel: string;
}

export function TrendCharts({ data, rangeLabel }: TrendChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl p-4" style={{ background: C.card, border: "1px solid oklch(0.95 0 0 / 6%)" }}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          VIP Revenue · {rangeLabel}
        </p>
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="vipGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.red} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: C.muted }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtK(Number(v ?? 0))}
                width={40}
              />
              <Tooltip
                contentStyle={TT}
                formatter={(v) => [fmtK(Number(v ?? 0)), "VIP Revenue"]}
              />
              <Area type="monotone" dataKey="vipRevenue" stroke={C.red} fill="url(#vipGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: C.card, border: "1px solid oklch(0.95 0 0 / 6%)" }}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Bonus Earned · {rangeLabel}
        </p>
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: C.muted }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtK(Number(v ?? 0))}
                width={40}
              />
              <Tooltip
                contentStyle={TT}
                formatter={(v) => [fmtK(Number(v ?? 0)), "Bonus"]}
              />
              <Bar dataKey="bonus" fill={C.gold} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
