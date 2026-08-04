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
  TIER_CONFIG,
  TIER_STYLE,
  getClubShifts,
  getActiveShift,
  groupByWeek,
  groupByMonth,
  getTierForRevenue,
  getNextTier,
  getProgressToNextTier,
} from "@/app/(dashboard)/vip/_data";
import type { Shift, TierId } from "@/app/(dashboard)/vip/_data";
import {
  C,
  fmtK,
  TierBadge,
  KPICard,
  TierDetailModal,
  SortHeader,
  TrendCharts,
  TIER_COLOR,
} from "@/app/(dashboard)/vip/_components";

type EntertainerSortKey =
  | "name" | "tier" | "vipRevenue" | "vipRoomsSold"
  | "bonusPct" | "bonusEarned" | "netEarnings" | "progress";

type ShiftSortKey =
  | "date" | "entertainerId" | "vipRevenue" | "vipRoomsSold"
  | "tier" | "bonusEarned" | "commissionPct" | "hoursWorked";

export function ClubVIPClient() {
  const [clubId, setClubId]           = useState<string>("ricks");
  const [range, setRange]             = useState<"4w" | "3m">("4w");
  const [modalShift, setModalShift]   = useState<Shift | null>(null);
  const [entSort, setEntSort]         = useState<EntertainerSortKey>("vipRevenue");
  const [entDir, setEntDir]           = useState<"asc" | "desc">("desc");
  const [shiftSort, setShiftSort]     = useState<ShiftSortKey>("date");
  const [shiftDir, setShiftDir]       = useState<"asc" | "desc">("desc");

  // Live: entertainers with active shifts at selected club
  const activeRows = useMemo(() => {
    const actives = getClubShifts(clubId, { activeOnly: true });
    return actives
      .map((s) => {
        const ent  = ENTERTAINERS.find((e) => e.id === s.entertainerId)!;
        const tier = TIER_CONFIG.find((t) => t.id === s.tier)!;
        const next = getNextTier(tier);
        const pct  = getProgressToNextTier(s.vipRevenue, tier);
        return { shift: s, ent, tier, next, pct };
      })
      .sort((a, b) => {
        const av = entDir === "asc" ? 1 : -1;
        if (entSort === "name")       return av * a.ent.name.localeCompare(b.ent.name);
        if (entSort === "tier")       return av * a.tier.id.localeCompare(b.tier.id);
        if (entSort === "bonusPct")   return av * (a.shift.bonusPct   - b.shift.bonusPct);
        if (entSort === "bonusEarned")return av * (a.shift.bonusEarned - b.shift.bonusEarned);
        if (entSort === "netEarnings")return av * (a.shift.netEarnings - b.shift.netEarnings);
        if (entSort === "vipRoomsSold") return av * (a.shift.vipRoomsSold - b.shift.vipRoomsSold);
        if (entSort === "progress")   return av * (a.pct - b.pct);
        return av * (a.shift.vipRevenue - b.shift.vipRevenue);
      });
  }, [clubId, entSort, entDir]);

  // Historical shifts at selected club
  const history = useMemo(() => {
    return getClubShifts(clubId)
      .filter((s) => !s.isActive)
      .sort((a, b) => {
        const av = shiftDir === "asc" ? 1 : -1;
        if (shiftSort === "date")        return av * a.date.localeCompare(b.date);
        if (shiftSort === "entertainerId") return av * a.entertainerId.localeCompare(b.entertainerId);
        if (shiftSort === "tier")        return av * a.tier.localeCompare(b.tier);
        if (shiftSort === "commissionPct") return av * (a.commissionPct - b.commissionPct);
        if (shiftSort === "hoursWorked") return av * (a.hoursWorked - b.hoursWorked);
        if (shiftSort === "vipRoomsSold") return av * (a.vipRoomsSold - b.vipRoomsSold);
        if (shiftSort === "bonusEarned") return av * (a.bonusEarned - b.bonusEarned);
        return av * (a.vipRevenue - b.vipRevenue);
      });
  }, [clubId, shiftSort, shiftDir]);

  // Trend data
  const trendData = useMemo(() => {
    const shifts = getClubShifts(clubId);
    return range === "4w" ? groupByWeek(shifts) : groupByMonth(shifts);
  }, [clubId, range]);

  // Club summary KPIs (from active shifts)
  const totalVipRev = activeRows.reduce((a, r) => a + r.shift.vipRevenue, 0);
  const totalBonus  = activeRows.reduce((a, r) => a + r.shift.bonusEarned, 0);
  const totalRooms  = activeRows.reduce((a, r) => a + r.shift.vipRoomsSold, 0);
  const avgVipRev   = activeRows.length ? Math.round(totalVipRev / activeRows.length) : 0;
  const topPerformer= activeRows.reduce<typeof activeRows[0] | null>(
    (best, r) => (!best || r.shift.vipRevenue > best.shift.vipRevenue ? r : best), null,
  );

  // Tier distribution from active shifts
  const tierCounts: Record<TierId, number> = { standard: 0, pro: 0, privy: 0 };
  activeRows.forEach((r) => { tierCounts[r.shift.tier]++; });

  function toggleEnt(k: EntertainerSortKey) {
    if (k === entSort) setEntDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setEntSort(k); setEntDir("desc"); }
  }
  function toggleShift(k: ShiftSortKey) {
    if (k === shiftSort) setShiftDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setShiftSort(k); setShiftDir("desc"); }
  }

  const rangeLabel = range === "4w" ? "Last 4 Weeks" : "Last 3 Months";
  const clubName   = CLUBS.find((c) => c.id === clubId)?.name ?? clubId;

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            VIP Bonus Analytics · Club View
          </p>
          <h1 className="text-xl font-bold tracking-tight">{clubName}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Select value={clubId} onValueChange={setClubId}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CLUBS.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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

      {/* Club KPI summary */}
      <section>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Live Shift Summary · Tonight
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard
            label="Total VIP Revenue"
            value={fmtK(totalVipRev)}
            sub={`${activeRows.length} active`}
            accent={C.red}
            highlight
          />
          <KPICard
            label="Total Bonus Paid"
            value={fmtK(totalBonus)}
            sub="all entertainers"
            accent={C.gold}
          />
          <KPICard
            label="VIP Rooms Sold"
            value={String(totalRooms)}
            sub="tonight"
          />
          <KPICard
            label="Avg VIP Revenue"
            value={fmtK(avgVipRev)}
            sub="per entertainer"
          />
        </div>

        {/* Tier distribution pills */}
        {activeRows.length > 0 && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Tier Distribution:
            </span>
            {(["privy", "pro", "standard"] as TierId[]).map((t) => {
              const cnt = tierCounts[t];
              if (cnt === 0) return null;
              return (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: `${TIER_STYLE[t].border}18`,
                    border: `1px solid ${TIER_STYLE[t].border}30`,
                    color: TIER_STYLE[t].border,
                  }}
                >
                  <TierBadge tier={t} size="xs" />
                  <span>×{cnt}</span>
                </span>
              );
            })}
          </div>
        )}
      </section>

      {/* Live Leaderboard */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Live Leaderboard · Active Shifts
          </p>
          {topPerformer && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Top performer:</span>
              <span className="font-medium text-white">{topPerformer.ent.name}</span>
              <TierBadge tier={topPerformer.shift.tier} size="xs" />
            </div>
          )}
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid oklch(0.95 0 0 / 6%)" }}
        >
          <div className="overflow-x-auto">
            {activeRows.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No active shifts at {clubName} tonight
              </div>
            ) : (
              <table className="w-full min-w-[780px]">
                <thead style={{ background: "oklch(0.13 0.018 308)" }}>
                  <tr>
                    <th className="py-2 px-3 pl-4 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                      Rank
                    </th>
                    <SortHeader label="Entertainer" sk="name"        current={entSort} dir={entDir} onSort={toggleEnt} />
                    <SortHeader label="Tier"        sk="tier"        current={entSort} dir={entDir} onSort={toggleEnt} />
                    <SortHeader label="VIP Revenue" sk="vipRevenue"  current={entSort} dir={entDir} onSort={toggleEnt} />
                    <SortHeader label="Rooms"       sk="vipRoomsSold" current={entSort} dir={entDir} onSort={toggleEnt} />
                    <SortHeader label="Bonus %"     sk="bonusPct"    current={entSort} dir={entDir} onSort={toggleEnt} />
                    <SortHeader label="Bonus Earned" sk="bonusEarned" current={entSort} dir={entDir} onSort={toggleEnt} />
                    <SortHeader label="Net Earned"  sk="netEarnings" current={entSort} dir={entDir} onSort={toggleEnt} />
                    <SortHeader label="Progress"    sk="progress"    current={entSort} dir={entDir} onSort={toggleEnt} className="pr-4" />
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map(({ shift, ent, tier, next, pct }, idx) => {
                    const ts    = TIER_STYLE[shift.tier];
                    const total = shift.netEarnings + shift.bonusEarned;
                    return (
                      <tr
                        key={shift.id}
                        className="border-t cursor-pointer transition-colors"
                        style={{ borderColor: "oklch(0.95 0 0 / 5%)" }}
                        onClick={() => setModalShift(shift)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.95 0 0 / 2%)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <td className="py-3 px-3 pl-4">
                          <span className="text-xs font-bold text-muted-foreground">
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{ background: ts.gradient, color: ts.textColor }}
                            >
                              {ent.initials}
                            </div>
                            <span className="text-sm font-medium">{ent.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <TierBadge tier={shift.tier} size="xs" />
                        </td>
                        <td className="py-3 px-3 text-sm font-medium tabular-nums">
                          {fmtK(shift.vipRevenue)}
                        </td>
                        <td className="py-3 px-3 text-sm tabular-nums">
                          {shift.vipRoomsSold}
                        </td>
                        <td className="py-3 px-3 text-sm tabular-nums" style={{ color: ts.border }}>
                          {shift.bonusPct}%
                        </td>
                        <td className="py-3 px-3 text-sm font-medium tabular-nums" style={{ color: ts.border }}>
                          +{fmtK(shift.bonusEarned)}
                        </td>
                        <td className="py-3 px-3 text-sm font-medium tabular-nums">
                          {fmtK(total)}
                        </td>
                        <td className="py-3 px-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-1.5 w-20 rounded-full overflow-hidden flex-shrink-0"
                              style={{ background: "oklch(0.95 0 0 / 8%)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, background: ts.gradient }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {next ? `${pct}%` : "MAX"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Trend Charts */}
      <section>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Club VIP Trends
        </p>
        <TrendCharts data={trendData} rangeLabel={rangeLabel} />
      </section>

      {/* Historical shifts */}
      <section>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
          Shift History · {clubName}
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid oklch(0.95 0 0 / 6%)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead style={{ background: "oklch(0.13 0.018 308)" }}>
                <tr>
                  <SortHeader label="Date"        sk="date"          current={shiftSort} dir={shiftDir} onSort={toggleShift} className="pl-4" />
                  <SortHeader label="Entertainer" sk="entertainerId" current={shiftSort} dir={shiftDir} onSort={toggleShift} />
                  <SortHeader label="VIP Revenue" sk="vipRevenue"    current={shiftSort} dir={shiftDir} onSort={toggleShift} />
                  <SortHeader label="Rooms"       sk="vipRoomsSold"  current={shiftSort} dir={shiftDir} onSort={toggleShift} />
                  <SortHeader label="Tier"        sk="tier"          current={shiftSort} dir={shiftDir} onSort={toggleShift} />
                  <SortHeader label="Bonus"       sk="bonusEarned"   current={shiftSort} dir={shiftDir} onSort={toggleShift} />
                  <SortHeader label="Comm %"      sk="commissionPct" current={shiftSort} dir={shiftDir} onSort={toggleShift} />
                  <SortHeader label="Hours"       sk="hoursWorked"   current={shiftSort} dir={shiftDir} onSort={toggleShift} className="pr-4" />
                </tr>
              </thead>
              <tbody>
                {history.map((s) => {
                  const ent = ENTERTAINERS.find((e) => e.id === s.entertainerId);
                  const ts  = TIER_STYLE[s.tier];
                  return (
                    <tr
                      key={s.id}
                      className="border-t cursor-pointer transition-colors"
                      style={{ borderColor: "oklch(0.95 0 0 / 5%)" }}
                      onClick={() => setModalShift(s)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "oklch(0.95 0 0 / 2%)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td className="py-3 px-3 pl-4 text-sm tabular-nums">{s.date}</td>
                      <td className="py-3 px-3 text-sm">{ent?.name ?? s.entertainerId}</td>
                      <td className="py-3 px-3 text-sm font-medium tabular-nums">{fmtK(s.vipRevenue)}</td>
                      <td className="py-3 px-3 text-sm tabular-nums">{s.vipRoomsSold}</td>
                      <td className="py-3 px-3"><TierBadge tier={s.tier} size="xs" /></td>
                      <td className="py-3 px-3 text-sm font-medium tabular-nums" style={{ color: ts.border }}>
                        +{fmtK(s.bonusEarned)}
                      </td>
                      <td className="py-3 px-3 text-sm tabular-nums">{s.commissionPct}%</td>
                      <td className="py-3 px-3 pr-4 text-sm tabular-nums">{s.hoursWorked}h</td>
                    </tr>
                  );
                })}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      No historical shifts at {clubName}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalShift && (
        <TierDetailModal
          shift={modalShift}
          allShifts={ALL_SHIFTS}
          onClose={() => setModalShift(null)}
        />
      )}
    </div>
  );
}
