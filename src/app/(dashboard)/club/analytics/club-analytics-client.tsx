"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight } from "lucide-react";

// ── Color tokens (literal oklch values — recharts can't read CSS vars) ──
const C = {
  red:   "#341539",
  c2:    "oklch(0.60 0.18 312)",
  c3:    "oklch(0.38 0.14 280)",
  c4:    "oklch(0.68 0.10 308)",
  c5:    "oklch(0.26 0.06 308)",
  grid:  "oklch(0.95 0 0 / 6%)",
  card:  "oklch(0.15 0.018 308)",
  bg:    "oklch(0.10 0.018 308)",
  fg:    "oklch(0.95 0.004 308)",
  muted: "oklch(0.52 0.010 308)",
};

const ENT_COLORS = [C.red, C.c2, C.c3, C.c4, C.c5];

// ── Formatters ────────────────────────────────────────────────────────────
const fmtK   = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

// ── Mock data ─────────────────────────────────────────────────────────────

const CLUBS = [
  { id: "all",       name: "All Clubs" },
  { id: "ricks",     name: "Rick's Cabaret" },
  { id: "treasures", name: "Treasures" },
  { id: "vivid",     name: "Vivid Cabaret" },
  { id: "xtc",       name: "XTC Cabaret" },
];

const ENT_NAMES = ["Janet", "Sapphire", "Baby Jules", "Raven", "Maxine"] as const;

// Base stats for Janet @ Rick's (top earner, anchor point)
const BASE = { fees: 5800, stage: 18200, vip: 14600, fb: 3200, tips: 2100, ret: 78, att: 28 };

// Entertainer performance multipliers per club (index 0 = Janet … 4 = Maxine)
const MULTS: Record<string, number[]> = {
  ricks:     [1.00, 0.73, 0.58, 0.44, 0.35],
  treasures: [0.87, 0.64, 0.51, 0.39, 0.31],
  vivid:     [0.74, 0.54, 0.43, 0.33, 0.26],
  xtc:       [0.61, 0.45, 0.36, 0.27, 0.22],
};

// Retention and attendance offsets relative to BASE
const RET_OFFSETS = [0, -10, -6, -17, -23];
const ATT_OFFSETS = [0, -6,  -8, -10, -13];

type EntRow = {
  id: string; name: string; color: string;
  fees: number; stage: number; vip: number;
  fb: number; tips: number; ret: number; att: number;
  attSeries: number[];
  retSeries: number[];
};

function buildClubEnts(clubId: string): EntRow[] {
  return ENT_NAMES.map((name, i) => {
    const m       = MULTS[clubId][i];
    const baseRet = Math.min(90, BASE.ret + RET_OFFSETS[i]);
    const baseAtt = BASE.att + ATT_OFFSETS[i];
    const attSeries = Array.from({ length: 8 }, (_, j) =>
      Math.max(5, Math.round(baseAtt * m + (j - 3) * 0.4 + Math.sin(i + j) * 1.2))
    );
    const retSeries = Array.from({ length: 8 }, (_, j) =>
      Math.min(95, Math.max(40, Math.round(baseRet + (j - 4) * 0.3 + Math.sin(i * 2 + j) * 0.8)))
    );
    return {
      id:    name.toLowerCase().replace(" ", ""),
      name,
      color: ENT_COLORS[i],
      fees:  Math.round(BASE.fees  * m),
      stage: Math.round(BASE.stage * m),
      vip:   Math.round(BASE.vip   * m),
      fb:    Math.round(BASE.fb    * m),
      tips:  Math.round(BASE.tips  * m),
      ret:   baseRet,
      att:   Math.round(baseAtt * m),
      attSeries,
      retSeries,
    };
  });
}

type TrendPoint = { label: string; stage: number; vip: number; fb: number; tips: number };
type EntTrendPoint = { label: string } & Record<string, number | string>;

function buildTrends(
  clubId: string,
  range: "4w" | "3m"
): { byCategory: TrendPoint[]; byEntertainer: EntTrendPoint[] } {
  const ents    = buildClubEnts(clubId);
  const labels  = range === "4w"
    ? ["Wk 1", "Wk 2", "Wk 3", "Wk 4"]
    : ["April", "May", "June"];
  const scale   = range === "4w" ? 1 : 4.2;

  const byCategory: TrendPoint[] = labels.map((label, j) => ({
    label,
    stage: Math.round(ents.reduce((s, e) => s + e.stage, 0) / 4 * (0.90 + j * 0.04) * scale),
    vip:   Math.round(ents.reduce((s, e) => s + e.vip,   0) / 4 * (0.88 + j * 0.04) * scale),
    fb:    Math.round(ents.reduce((s, e) => s + e.fb,    0) / 4 * (0.92 + j * 0.02) * scale),
    tips:  Math.round(ents.reduce((s, e) => s + e.tips,  0) / 4 * (0.90 + j * 0.03) * scale),
  }));

  const byEntertainer: EntTrendPoint[] = labels.map((label, j) => {
    const pt: EntTrendPoint = { label };
    ENT_NAMES.forEach((name, i) => {
      const e     = ents[i];
      const total = e.fees + e.stage + e.vip + e.fb + e.tips;
      pt[name]    = Math.round(total / 4 * (0.88 + j * 0.04 + i * 0.005) * scale);
    });
    return pt;
  });

  return { byCategory, byEntertainer };
}

function buildKPIs(clubId: string) {
  const ids = clubId === "all" ? ["ricks", "treasures", "vivid", "xtc"] : [clubId];
  const all  = ids.flatMap(buildClubEnts);

  const sum       = (k: keyof EntRow) => all.reduce((s, e) => s + (e[k] as number), 0);
  const totalRev  = sum("fees") + sum("stage") + sum("vip") + sum("fb") + sum("tips");
  const vipRev    = sum("vip");
  const houseFees = sum("fees");
  const totalAtt  = sum("att");
  const avgSpend  = Math.round(totalRev / Math.max(1, totalAtt));

  const weeklyGrowth = clubId === "all"
    ? 8.4
    : ({ ricks: 9.2, treasures: 7.8, vivid: 6.5, xtc: 5.1 } as Record<string, number>)[clubId] ?? 8.4;

  const spark = (base: number) =>
    Array.from({ length: 8 }, (_, i) => Math.round(base * (0.70 + i * 0.045)));

  return {
    totalRev, vipRev, houseFees, avgSpend, weeklyGrowth,
    activeEnts:  5,
    activeClubs: clubId === "all" ? 4 : 1,
    revSpark:    spark(totalRev  / 8),
    vipSpark:    spark(vipRev    / 8),
    feeSpark:    spark(houseFees / 8),
  };
}

// ── Inline sub-components ─────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function KPICard({
  label, value, sub, trend, spark, sparkColor,
}: {
  label: string; value: string; sub?: string;
  trend?: number; spark?: number[]; sparkColor?: string;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <Card className="flex flex-col gap-1 rounded-2xl border-none p-4 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold leading-none tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-400" : "text-[var(--brand-red)]"}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {fmtPct(trend)}
          </span>
        )}
        {spark && (
          <div className="h-10 flex-1">
            <Sparkline data={spark} color={sparkColor ?? C.red} />
          </div>
        )}
      </div>
    </Card>
  );
}

type SortKey = "name" | "fees" | "stage" | "vip" | "fb" | "tips" | "ret" | "att" | "total";

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <span className="ml-1 opacity-20">↕</span>;
  return dir === "asc"
    ? <ChevronDown className="ml-0.5 inline h-3 w-3 rotate-180" />
    : <ChevronDown className="ml-0.5 inline h-3 w-3" />;
}

function IndividualPanel({ ent }: { ent: EntRow }) {
  const donutData = [
    { name: "Stage", value: ent.stage },
    { name: "VIP",   value: ent.vip   },
  ];
  const donutColors = [C.c2, C.red];
  const attData = ent.attSeries.map((v, i) => ({ shift: `S${i + 1}`, v }));
  const retData = ent.retSeries.map((v, i) => ({ wk: `W${i + 1}`, v }));

  const stats = [
    { label: "F&B Sales",     value: fmtK(ent.fb) },
    { label: "Avg Spend",     value: fmtK(Math.round(ent.stage / Math.max(1, ent.att))) },
    { label: "Tip Revenue",   value: fmtK(ent.tips) },
    { label: "Total Revenue", value: fmtK(ent.fees + ent.stage + ent.vip + ent.fb + ent.tips) },
  ];

  const ttStyle = { background: C.card, border: `1px solid oklch(0.95 0 0 / 8%)`, borderRadius: 8, fontSize: 12, color: C.fg };

  return (
    <div className="rounded-xl bg-[var(--accent)] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: ent.color }} />
        <h3 className="font-semibold">{ent.name} — Individual Analytics</h3>
      </div>

      {/* Stat tiles */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-[var(--card)] p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Stage vs VIP donut */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Stage vs VIP Split</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={donutData} dataKey="value" innerRadius={46} outerRadius={70}
                paddingAngle={2} startAngle={90} endAngle={-270} isAnimationActive={false}>
                {donutData.map((_, i) => <Cell key={i} fill={donutColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={ttStyle} formatter={(v) => fmtK(Number(v ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            {["Stage", "VIP"].map((label, i) => (
              <span key={label} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: donutColors[i] }} />{label}
              </span>
            ))}
          </div>
        </div>

        {/* Shift attendance */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Shift Attendance (last 8)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={attData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="shift" tick={{ fontSize: 10, fill: C.muted }} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} />
              <Tooltip contentStyle={ttStyle} cursor={{ fill: "oklch(0.95 0 0 / 4%)" }} />
              <Bar dataKey="v" name="Customers" fill={ent.color} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Retention trend */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Customer Retention (last 8 wk)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={retData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={C.grid} />
              <XAxis dataKey="wk" tick={{ fontSize: 10, fill: C.muted }} />
              <YAxis domain={[45, 90]} tick={{ fontSize: 10, fill: C.muted }} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={ttStyle} formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="v" name="Retention"
                stroke={ent.color} strokeWidth={2}
                dot={{ r: 2.5, fill: ent.color, strokeWidth: 0 }}
                isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────

export function ClubAnalyticsClient() {
  const [clubId, setClubId]   = useState("all");
  const [range, setRange]     = useState<"4w" | "3m">("4w");
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  // ── Derived data ──────────────────────────────────────────────────────
  const kpis = useMemo(() => buildKPIs(clubId), [clubId]);

  const entertainers = useMemo<EntRow[]>(() => {
    if (clubId === "all") {
      const allClubs = ["ricks", "treasures", "vivid", "xtc"];
      return ENT_NAMES.map((_, i) => {
        const rows = allClubs.map(c => buildClubEnts(c)[i]);
        return {
          ...rows[0],
          fees:  rows.reduce((s, r) => s + r.fees,  0),
          stage: rows.reduce((s, r) => s + r.stage, 0),
          vip:   rows.reduce((s, r) => s + r.vip,   0),
          fb:    rows.reduce((s, r) => s + r.fb,    0),
          tips:  rows.reduce((s, r) => s + r.tips,  0),
          ret:   Math.round(rows.reduce((s, r) => s + r.ret, 0) / rows.length),
          att:   Math.round(rows.reduce((s, r) => s + r.att, 0) / rows.length),
        };
      });
    }
    return buildClubEnts(clubId);
  }, [clubId]);

  const sortedEnts = useMemo(() => {
    return [...entertainers].sort((a, b) => {
      let diff: number;
      if (sortKey === "name") {
        diff = a.name.localeCompare(b.name);
      } else if (sortKey === "total") {
        diff = (a.fees + a.stage + a.vip + a.fb + a.tips)
             - (b.fees + b.stage + b.vip + b.fb + b.tips);
      } else {
        diff = (a[sortKey] as number) - (b[sortKey] as number);
      }
      return sortDir === "asc" ? diff : -diff;
    });
  }, [entertainers, sortKey, sortDir]);

  const trends = useMemo(() => {
    if (clubId === "all") {
      const all = ["ricks", "treasures", "vivid", "xtc"].map(c => buildTrends(c, range));
      return {
        byCategory: all[0].byCategory.map((pt, j) => ({
          label: pt.label,
          stage: all.reduce((s, t) => s + t.byCategory[j].stage, 0),
          vip:   all.reduce((s, t) => s + t.byCategory[j].vip,   0),
          fb:    all.reduce((s, t) => s + t.byCategory[j].fb,    0),
          tips:  all.reduce((s, t) => s + t.byCategory[j].tips,  0),
        })),
        byEntertainer: all[0].byEntertainer.map((pt, j) => {
          const merged: EntTrendPoint = { label: pt.label };
          ENT_NAMES.forEach(n => {
            merged[n] = all.reduce((s, t) => s + ((t.byEntertainer[j][n] as number) ?? 0), 0);
          });
          return merged;
        }),
      };
    }
    return buildTrends(clubId, range);
  }, [clubId, range]);

  const clubComp = useMemo(() =>
    ["ricks", "treasures", "vivid", "xtc"].map(id => {
      const k = buildKPIs(id);
      return {
        id,
        name:         CLUBS.find(c => c.id === id)!.name,
        totalRev:     k.totalRev,
        vipPct:       Math.round((k.vipRev / k.totalRev) * 100),
        topEnt:       "Janet",
        weeklyGrowth: k.weeklyGrowth,
      };
    }),
  []);

  const maxClubRev = Math.max(...clubComp.map(c => c.totalRev));

  // ── Helpers ───────────────────────────────────────────────────────────
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const ttStyle = {
    background: C.card,
    border: `1px solid oklch(0.95 0 0 / 8%)`,
    borderRadius: 8, fontSize: 12, color: C.fg,
  };

  const TH = ({ label, sk }: { label: string; sk: SortKey }) => (
    <th
      onClick={() => handleSort(sk)}
      className="cursor-pointer select-none whitespace-nowrap px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <SortIcon active={sortKey === sk} dir={sortDir} />
    </th>
  );

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10">
      {/* Header + filters */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Club Analytics</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Revenue, performance &amp; retention across your venues
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={clubId} onValueChange={v => { setClubId(v); setExpanded(null); }}>
            <SelectTrigger className="h-9 w-44 border-[var(--border)] bg-[var(--card)] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLUBS.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={range} onValueChange={v => setRange(v as "4w" | "3m")}>
            <TabsList className="h-9 bg-[var(--card)]">
              <TabsTrigger value="4w" className="text-xs">4 Weeks</TabsTrigger>
              <TabsTrigger value="3m" className="text-xs">3 Months</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <KPICard
          label="Total Revenue" value={fmtK(kpis.totalRev)}
          trend={kpis.weeklyGrowth} spark={kpis.revSpark} sparkColor={C.red}
        />
        <KPICard
          label="Active Entertainers" value={String(kpis.activeEnts)}
          sub="across selection"
        />
        <KPICard
          label={clubId === "all" ? "Active Clubs" : "Venue"}
          value={String(kpis.activeClubs)}
          sub={clubId === "all" ? "venues tracked" : CLUBS.find(c => c.id === clubId)?.name}
        />
        <KPICard
          label="VIP Revenue" value={fmtK(kpis.vipRev)}
          trend={kpis.weeklyGrowth * 1.14} spark={kpis.vipSpark} sparkColor={C.c2}
        />
        <KPICard
          label="Avg Spend / Visit" value={`$${kpis.avgSpend}`}
          trend={2.4}
        />
        <KPICard
          label="Weekly Growth" value={fmtPct(kpis.weeklyGrowth)}
          sub="vs prior period" trend={kpis.weeklyGrowth}
        />
      </div>

      {/* Entertainer performance table */}
      <Card className="overflow-hidden rounded-2xl border-none shadow-sm">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-semibold">Entertainer Performance</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Click any row to expand individual analytics · Click headers to sort
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <TH label="Entertainer" sk="name" />
                <TH label="House Fees"  sk="fees" />
                <TH label="Stage Rev"   sk="stage" />
                <TH label="VIP Rev"     sk="vip" />
                <TH label="F&B"         sk="fb" />
                <TH label="Tip Share"   sk="tips" />
                <TH label="Retention"   sk="ret" />
                <TH label="Avg Attend"  sk="att" />
                <TH label="Total"       sk="total" />
              </tr>
            </thead>
            <tbody>
              {sortedEnts.flatMap(ent => {
                const total  = ent.fees + ent.stage + ent.vip + ent.fb + ent.tips;
                const isOpen = expanded === ent.id;
                const retClr = ent.ret >= 70 ? "text-emerald-400"
                             : ent.ret >= 60 ? "text-amber-400"
                             : "text-[var(--brand-red)]";
                return [
                  <tr
                    key={ent.id}
                    onClick={() => setExpanded(isOpen ? null : ent.id)}
                    className={`cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--accent)] ${isOpen ? "bg-[var(--accent)]" : ""}`}
                  >
                    <td className="whitespace-nowrap px-3 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 flex-none rounded-full" style={{ background: ent.color }} />
                        <span className="font-medium">{ent.name}</span>
                        {isOpen
                          ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          : <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                        }
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums">{fmtK(ent.fees)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums">{fmtK(ent.stage)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums">{fmtK(ent.vip)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums">{fmtK(ent.fb)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums">{fmtK(ent.tips)}</td>
                    <td className={`whitespace-nowrap px-3 py-3 text-sm font-medium ${retClr}`}>{ent.ret}%</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums">{ent.att}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold tabular-nums">{fmtK(total)}</td>
                  </tr>,
                  isOpen && (
                    <tr key={`${ent.id}-panel`}>
                      <td colSpan={9} className="px-4 py-3">
                        <IndividualPanel ent={ent} />
                      </td>
                    </tr>
                  ),
                ].filter(Boolean);
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Performance trends */}
      <div>
        <h2 className="mb-3 font-semibold">Performance Trends</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Multi-line revenue by entertainer */}
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Revenue by Entertainer</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends.byEntertainer} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={C.grid} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
                <YAxis tickFormatter={v => fmtK(v as number)} tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip contentStyle={ttStyle} formatter={(v) => fmtK(Number(v ?? 0))} />
                {ENT_NAMES.map((name, i) => (
                  <Line
                    key={name} type="monotone" dataKey={name} name={name}
                    stroke={ENT_COLORS[i]} strokeWidth={2}
                    dot={{ r: 3, fill: ENT_COLORS[i], strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {ENT_NAMES.map((name, i) => (
                <span key={name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: ENT_COLORS[i] }} />
                  {name}
                </span>
              ))}
            </div>
          </Card>

          {/* Stacked bar by category */}
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">Revenue by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trends.byCategory} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={C.grid} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
                <YAxis tickFormatter={v => fmtK(v as number)} tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip contentStyle={ttStyle} cursor={{ fill: "oklch(0.95 0 0 / 4%)" }} formatter={(v) => fmtK(Number(v ?? 0))} />
                <Bar dataKey="stage" name="Stage" stackId="a" fill={C.c2} isAnimationActive={false} />
                <Bar dataKey="vip"   name="VIP"   stackId="a" fill={C.red} isAnimationActive={false} />
                <Bar dataKey="fb"    name="F&B"   stackId="a" fill={C.c4} isAnimationActive={false} />
                <Bar dataKey="tips"  name="Tips"  stackId="a" fill={C.c3}
                  radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {([ ["Stage", C.c2], ["VIP", C.red], ["F&B", C.c4], ["Tips", C.c3] ] as [string, string][]).map(([label, color]) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Club comparison */}
      <div>
        <h2 className="mb-3 font-semibold">Club Comparison</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {clubComp.map(club => (
            <Card key={club.id} className="rounded-2xl border-none p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold leading-tight">{club.name}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums">{fmtK(club.totalRev)}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`mt-0.5 shrink-0 text-xs font-semibold ${
                    club.weeklyGrowth >= 8
                      ? "bg-emerald-950 text-emerald-300"
                      : "bg-amber-950 text-amber-300"
                  }`}
                >
                  {fmtPct(club.weeklyGrowth)}
                </Badge>
              </div>
              {/* Revenue bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(club.totalRev / maxClubRev) * 100}%`,
                    background: C.red,
                  }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                <span>Top earner</span>
                <span className="text-right font-medium text-foreground">{club.topEnt}</span>
                <span>VIP share</span>
                <span className="text-right font-medium text-foreground">{club.vipPct}%</span>
                <span>House fees</span>
                <span className="text-right font-medium text-foreground">
                  {fmtK(buildKPIs(club.id).houseFees)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
