"use client";

import React, { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALL_SHIFTS,
  CLUBS,
  ENTERTAINERS,
  getActiveShift,
  getEntertainerShifts,
  groupByWeek,
  groupByMonth,
  computeEntertainerKPIs,
} from "./_data";
import type { Shift } from "./_data";
import {
  C,
  fmtK,
  TierBadge,
  KPICard,
  TierProgressCard,
  TierDetailModal,
  SortHeader,
  TrendCharts,
  TIER_COLOR,
  TIER_STYLE,
} from "./_components";

// In production this would be the authenticated user's ID
const DEMO_ENTERTAINER_ID = "aria";

type ShiftSortKey =
  | "date" | "clubId" | "vipRevenue" | "vipRoomsSold"
  | "tier" | "bonusEarned" | "commissionPct" | "hoursWorked" | "netEarnings";

interface SortHeaderPropsAlias<K> {
  label: string;
  sk: K;
  current: K;
  dir: "asc" | "desc";
  onSort: (k: K) => void;
}

export function EntertainerVIPClient() {
  const [clubFilter, setClubFilter] = useState<string>("all");
  const [range, setRange]           = useState<"4w" | "3m">("4w");
  const [modalOpen, setModalOpen]   = useState(false);
  const [sortKey, setSortKey]       = useState<ShiftSortKey>("date");
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("desc");

  const eid = DEMO_ENTERTAINER_ID;

  const activeShift = useMemo(() => getActiveShift(eid), []);
  const kpis = useMemo(() => computeEntertainerKPIs(eid), []);

  const history = useMemo(
    () =>
      getEntertainerShifts(eid, { excludeActive: true, clubId: clubFilter }).sort(
        (a, b) =>
          sortDir === "asc"
            ? String(a[sortKey]) > String(b[sortKey]) ? 1 : -1
            : String(a[sortKey]) < String(b[sortKey]) ? 1 : -1,
      ),
    [clubFilter, sortKey, sortDir],
  );

  const trendData = useMemo(() => {
    const all = getEntertainerShifts(eid, { excludeActive: true });
    return range === "4w" ? groupByWeek(all) : groupByMonth(all);
  }, [range]);

  function toggleSort(k: ShiftSortKey) {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  }

  const entertainer = ENTERTAINERS.find((e) => e.id === eid)!;
  const rangeLabel  = range === "4w" ? "Last 4 Weeks" : "Last 3 Months";

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            VIP Bonus Analytics
          </p>
          <h1 className="text-xl font-bold tracking-tight">
            {entertainer.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Club filter */}
          <Select value={clubFilter} onValueChange={setClubFilter}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="All Clubs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clubs</SelectItem>
              {CLUBS.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Range toggle */}
          <div
            className="flex overflow-hidden rounded-lg"
            style={{ border: "1px solid oklch(0.95 0 0 / 12%)" }}
          >
            {(["4w", "3m"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: range === r ? "var(--brand-red)" : "transparent",
                  color: range === r ? "#fff" : C.muted,
                }}
              >
                {r === "4w" ? "4 Weeks" : "3 Months"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tier Progress Card */}
      {activeShift && (
        <TierProgressCard shift={activeShift} onOpen={() => setModalOpen(true)} />
      )}

      {/* KPI Grid */}
      <section>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Today&apos;s Performance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard
            label="VIP Revenue"
            value={fmtK(kpis.todayVipRevenue)}
            sub="today"
            sparkline={kpis.sparkRevenue}
            accent={C.red}
            highlight
          />
          <KPICard
            label="Bonus Earned"
            value={fmtK(kpis.todayBonus)}
            sub="today"
            sparkline={kpis.sparkBonus}
            accent={C.gold}
          />
          <KPICard
            label="VIP Rooms"
            value={String(kpis.todayRooms)}
            sub="today"
          />
          <KPICard
            label="Commission %"
            value={`${kpis.todayCommission}%`}
            sub="current tier"
          />
        </div>
      </section>

      <section>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Period Totals
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard
            label="Weekly VIP Rev"
            value={fmtK(kpis.weeklyVipRevenue)}
            trend={kpis.weekTrend}
            sparkline={kpis.sparkRevenue}
            accent={C.teal}
          />
          <KPICard
            label="Monthly VIP Rev"
            value={fmtK(kpis.monthlyVipRevenue)}
            trend={kpis.monthTrend}
            accent={C.teal}
          />
          <KPICard
            label="Progress"
            value={`${kpis.progressPct}%`}
            sub="to next tier"
            accent={TIER_COLOR[kpis.tier.id]}
          />
          <KPICard
            label="Personal Best"
            value={fmtK(kpis.personalBest)}
            sub="single shift"
            accent={C.gold}
          />
        </div>
      </section>

      {/* Trend Charts */}
      <section>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Performance Trends
        </p>
        <TrendCharts data={trendData} rangeLabel={rangeLabel} />
      </section>

      {/* Shift History Table */}
      <section>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Shift History
          {clubFilter !== "all" && (
            <span className="ml-2 normal-case text-white/60 capitalize">
              · {CLUBS.find((c) => c.id === clubFilter)?.name}
            </span>
          )}
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid oklch(0.95 0 0 / 6%)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead style={{ background: "oklch(0.14 0.008 25)" }}>
                <tr>
                  <SortHeader label="Date"       sk="date"          current={sortKey} dir={sortDir} onSort={toggleSort} className="pl-4" />
                  <SortHeader label="Club"        sk="clubId"        current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="VIP Revenue" sk="vipRevenue"    current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Rooms"       sk="vipRoomsSold"  current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Tier"        sk="tier"          current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Bonus"       sk="bonusEarned"   current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Comm %"      sk="commissionPct" current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Hours"       sk="hoursWorked"   current={sortKey} dir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Net Earned"  sk="netEarnings"   current={sortKey} dir={sortDir} onSort={toggleSort} className="pr-4" />
                </tr>
              </thead>
              <tbody>
                {history.map((s) => (
                  <ShiftTableRow key={s.id} shift={s} />
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                      No shifts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && activeShift && (
        <TierDetailModal
          shift={activeShift}
          allShifts={ALL_SHIFTS}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Shift table row ─────────────────────────────────────────────────────────

function ShiftTableRow({ shift }: { shift: Shift }) {
  const club  = CLUBS.find((c) => c.id === shift.clubId);
  const ts    = TIER_STYLE[shift.tier];
  const total = shift.netEarnings + shift.bonusEarned;

  return (
    <tr
      className="border-t transition-colors"
      style={{ borderColor: "oklch(0.95 0 0 / 5%)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.95 0 0 / 2%)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      <td className="py-3 px-3 pl-4 text-sm tabular-nums">{shift.date}</td>
      <td className="py-3 px-3 text-sm">{club?.name ?? shift.clubId}</td>
      <td className="py-3 px-3 text-sm font-medium tabular-nums">{fmtK(shift.vipRevenue)}</td>
      <td className="py-3 px-3 text-sm tabular-nums">{shift.vipRoomsSold}</td>
      <td className="py-3 px-3"><TierBadge tier={shift.tier} size="xs" /></td>
      <td className="py-3 px-3 text-sm font-medium tabular-nums" style={{ color: ts.border }}>
        +{fmtK(shift.bonusEarned)}
      </td>
      <td className="py-3 px-3 text-sm tabular-nums">{shift.commissionPct}%</td>
      <td className="py-3 px-3 text-sm tabular-nums">{shift.hoursWorked}h</td>
      <td className="py-3 px-3 pr-4 text-sm font-medium tabular-nums">{fmtK(total)}</td>
    </tr>
  );
}
