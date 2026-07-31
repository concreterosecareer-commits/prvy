// ─── Types ───────────────────────────────────────────────────────────────────

export type TierId = "standard" | "pro" | "privy";

export interface TierDef {
  id: TierId;
  label: string;
  minRevenue: number;
  maxRevenue: number;
  bonusPct: number;      // e.g. 15 = 15%
  commissionPct: number; // base commission rate
  description: string;
  benefits: string[];
}

/** Edit these thresholds/percentages to reconfigure the tier system */
export const TIER_CONFIG: TierDef[] = [
  {
    id: "standard",
    label: "Standard",
    minRevenue: 0,
    maxRevenue: 999,
    bonusPct: 10,
    commissionPct: 35,
    description: "Default tier on check-in. Standard commission and base VIP bonus apply.",
    benefits: ["35% base commission", "10% VIP bonus", "Standard shift tracking"],
  },
  {
    id: "pro",
    label: "Pro",
    minRevenue: 1000,
    maxRevenue: 2499,
    bonusPct: 15,
    commissionPct: 40,
    description: "Unlocked after $1,000 in VIP revenue during a single shift.",
    benefits: ["40% commission", "15% VIP bonus", "Bonus eligibility", "Higher VIP payout rate"],
  },
  {
    id: "privy",
    label: "PRIVY",
    minRevenue: 2500,
    maxRevenue: Infinity,
    bonusPct: 22,
    commissionPct: 45,
    description: "Elite tier for top-performing shifts. Maximum commission and VIP bonus multiplier.",
    benefits: ["45% commission", "22% VIP bonus", "Max bonus multiplier", "Featured performer status"],
  },
];

// CSS gradient strings for tier badge styling — used as inline styles
export const TIER_STYLE: Record<TierId, {
  gradient: string;
  border: string;
  glow: string;
  textColor: string;
}> = {
  standard: {
    gradient:  "linear-gradient(135deg,#787878 0%,#d0d0d0 35%,#a8a8a8 55%,#dedede 75%,#808080 100%)",
    border:    "#b0b0b0",
    glow:      "rgba(180,180,180,0.22)",
    textColor: "#111111",
  },
  pro: {
    gradient:  "linear-gradient(135deg,#9a6f0a 0%,#e8b820 28%,#c89a10 50%,#f5d840 72%,#8a5f05 100%)",
    border:    "#c8a020",
    glow:      "rgba(200,160,32,0.32)",
    textColor: "#1a0f00",
  },
  privy: {
    gradient:  "linear-gradient(135deg,#3d0815 0%,#7a1528 28%,#5c1020 50%,#921a32 72%,#300610 100%)",
    border:    "#921a32",
    glow:      "rgba(120,20,40,0.42)",
    textColor: "#ffd4dc",
  },
};

// ─── Tier helpers ─────────────────────────────────────────────────────────────

export function getTierForRevenue(vipRevenue: number): TierDef {
  return (
    [...TIER_CONFIG].reverse().find((t) => vipRevenue >= t.minRevenue) ??
    TIER_CONFIG[0]
  );
}

export function getNextTier(current: TierDef): TierDef | null {
  const idx = TIER_CONFIG.findIndex((t) => t.id === current.id);
  return idx < TIER_CONFIG.length - 1 ? TIER_CONFIG[idx + 1] : null;
}

export function getProgressToNextTier(vipRevenue: number, current: TierDef): number {
  const next = getNextTier(current);
  if (!next) return 100;
  const pct = ((vipRevenue - current.minRevenue) / (next.minRevenue - current.minRevenue)) * 100;
  return Math.min(100, Math.round(pct));
}

// ─── Clubs ───────────────────────────────────────────────────────────────────

export interface Club {
  id: string;
  name: string;
  city: string;
  state: string;
}

export const CLUBS: Club[] = [
  { id: "ricks",   name: "Rick's Cabaret",  city: "New York",  state: "NY" },
  { id: "scores",  name: "Scores",           city: "New York",  state: "NY" },
  { id: "vivid",   name: "Vivid Cabaret",    city: "Las Vegas", state: "NV" },
  { id: "hustler", name: "Hustler Club",     city: "New York",  state: "NY" },
];

// ─── Entertainers ─────────────────────────────────────────────────────────────

export interface Entertainer {
  id: string;
  name: string;
  initials: string;
  homeClubId: string;
}

export const ENTERTAINERS: Entertainer[] = [
  { id: "aria",   name: "Aria V.",   initials: "AV", homeClubId: "ricks"   },
  { id: "celine", name: "Celine M.", initials: "CM", homeClubId: "scores"  },
  { id: "jade",   name: "Jade R.",   initials: "JR", homeClubId: "vivid"   },
  { id: "nova",   name: "Nova B.",   initials: "NB", homeClubId: "ricks"   },
  { id: "sage",   name: "Sage T.",   initials: "ST", homeClubId: "hustler" },
];

// ─── Shifts ───────────────────────────────────────────────────────────────────

export interface Shift {
  id: string;
  entertainerId: string;
  clubId: string;
  date: string;           // YYYY-MM-DD
  hoursWorked: number;
  vipRevenue: number;
  vipRoomsSold: number;
  tier: TierId;
  bonusPct: number;
  commissionPct: number;
  bonusEarned: number;
  netEarnings: number;    // base commission earned
  isActive: boolean;      // true = in-progress today (2026-07-31)
}

function mk(
  id: string,
  entertainerId: string,
  clubId: string,
  date: string,
  hoursWorked: number,
  vipRevenue: number,
  vipRoomsSold: number,
  isActive = false,
): Shift {
  const tier = getTierForRevenue(vipRevenue);
  return {
    id,
    entertainerId,
    clubId,
    date,
    hoursWorked,
    vipRevenue,
    vipRoomsSold,
    tier: tier.id,
    bonusPct: tier.bonusPct,
    commissionPct: tier.commissionPct,
    bonusEarned: Math.round(vipRevenue * tier.bonusPct / 100),
    netEarnings: Math.round(vipRevenue * tier.commissionPct / 100),
    isActive,
  };
}

export const ALL_SHIFTS: Shift[] = [
  // ── Aria V. ─ home: Rick's ───────────────────────────────────────────────
  mk("a01","aria","ricks",   "2026-05-03", 6, 1200,  5),
  mk("a02","aria","vivid",   "2026-05-10", 7, 2800, 11),
  mk("a03","aria","ricks",   "2026-05-17", 6, 1500,  6),
  mk("a04","aria","scores",  "2026-05-24", 5, 2100,  8),
  mk("a05","aria","ricks",   "2026-06-07", 7, 1800,  7),
  mk("a06","aria","vivid",   "2026-06-14", 8, 3200, 13),
  mk("a07","aria","ricks",   "2026-06-21", 6, 2600, 10),
  mk("a08","aria","scores",  "2026-06-28", 5, 1100,  4),
  mk("a09","aria","ricks",   "2026-07-05", 7, 2900, 12),
  mk("a10","aria","vivid",   "2026-07-12", 8, 3500, 14),
  mk("a11","aria","ricks",   "2026-07-19", 6, 2700, 11),
  mk("a12","aria","ricks",   "2026-07-26", 5, 1950,  8),
  mk("a14","aria","scores",  "2026-07-29", 6, 2400,  9),
  mk("a13","aria","ricks",   "2026-07-31", 4, 1850,  7, true), // active

  // ── Celine M. ─ home: Scores ─────────────────────────────────────────────
  mk("c01","celine","scores", "2026-05-02", 5,  900,  3),
  mk("c02","celine","ricks",  "2026-05-09", 6, 2200,  9),
  mk("c03","celine","scores", "2026-05-16", 7, 2800, 11),
  mk("c04","celine","scores", "2026-05-23", 6, 1600,  6),
  mk("c05","celine","scores", "2026-06-06", 7, 2400, 10),
  mk("c06","celine","ricks",  "2026-06-13", 8, 3100, 13),
  mk("c07","celine","scores", "2026-06-20", 6, 1900,  8),
  mk("c08","celine","vivid",  "2026-06-27", 7, 2600, 10),
  mk("c09","celine","scores", "2026-07-04", 6, 2900, 12),
  mk("c10","celine","ricks",  "2026-07-11", 5, 1800,  7),
  mk("c11","celine","scores", "2026-07-18", 7, 3400, 14),
  mk("c12","celine","scores", "2026-07-25", 6, 2100,  8),
  mk("c14","celine","ricks",  "2026-07-28", 7, 2950, 12),
  mk("c13","celine","scores", "2026-07-31", 5, 2750, 11, true), // active

  // ── Jade R. ─ home: Vivid LV ─────────────────────────────────────────────
  mk("j01","jade","vivid",   "2026-05-03", 5,  400,  2),
  mk("j02","jade","hustler", "2026-05-10", 6,  750,  3),
  mk("j03","jade","vivid",   "2026-05-17", 6,  600,  2),
  mk("j04","jade","vivid",   "2026-05-24", 5,  950,  4),
  mk("j05","jade","vivid",   "2026-06-07", 6,  800,  3),
  mk("j06","jade","hustler", "2026-06-14", 7, 1100,  4),
  mk("j07","jade","vivid",   "2026-06-21", 5,  750,  3),
  mk("j08","jade","vivid",   "2026-06-28", 7, 1400,  6),
  mk("j09","jade","vivid",   "2026-07-05", 6, 1200,  5),
  mk("j10","jade","hustler", "2026-07-12", 5,  900,  4),
  mk("j11","jade","vivid",   "2026-07-19", 7, 1600,  6),
  mk("j12","jade","vivid",   "2026-07-26", 6, 1050,  4),
  mk("j13","jade","vivid",   "2026-07-31", 3,  650,  3, true), // active

  // ── Nova B. ─ home: Rick's ───────────────────────────────────────────────
  mk("n01","nova","ricks",   "2026-05-02", 6, 1400,  6),
  mk("n02","nova","scores",  "2026-05-09", 5,  850,  3),
  mk("n03","nova","ricks",   "2026-05-16", 7, 1700,  7),
  mk("n04","nova","hustler", "2026-05-23", 6, 2300,  9),
  mk("n05","nova","ricks",   "2026-06-06", 7, 1100,  4),
  mk("n06","nova","scores",  "2026-06-13", 6, 1900,  8),
  mk("n07","nova","ricks",   "2026-06-20", 7, 2400, 10),
  mk("n08","nova","ricks",   "2026-06-27", 5, 1600,  6),
  mk("n09","nova","ricks",   "2026-07-04", 7, 1800,  7),
  mk("n10","nova","hustler", "2026-07-11", 6, 2600, 10),
  mk("n11","nova","ricks",   "2026-07-18", 7, 1400,  6),
  mk("n12","nova","scores",  "2026-07-25", 6, 2200,  9),
  mk("n14","nova","ricks",   "2026-07-30", 6, 1700,  7),
  mk("n13","nova","ricks",   "2026-07-31", 4, 1450,  6, true), // active

  // ── Sage T. ─ home: Hustler ──────────────────────────────────────────────
  mk("s01","sage","hustler", "2026-05-02", 5,  500,  2),
  mk("s02","sage","ricks",   "2026-05-09", 6, 1300,  5),
  mk("s03","sage","hustler", "2026-05-16", 5,  400,  2),
  mk("s04","sage","vivid",   "2026-05-23", 7,  800,  3),
  mk("s05","sage","hustler", "2026-06-06", 6, 1100,  4),
  mk("s06","sage","ricks",   "2026-06-13", 5,  600,  2),
  mk("s07","sage","vivid",   "2026-06-20", 8, 2200,  9),
  mk("s08","sage","hustler", "2026-06-27", 7, 1500,  6),
  mk("s09","sage","vivid",   "2026-07-04", 8, 2800, 11),
  mk("s10","sage","hustler", "2026-07-11", 6, 1200,  5),
  mk("s11","sage","hustler", "2026-07-18", 5,  700,  3),
  mk("s12","sage","vivid",   "2026-07-25", 8, 2100,  8),
  mk("s14","sage","hustler", "2026-07-29", 7, 1900,  7),
  mk("s13","sage","hustler", "2026-07-31", 6, 3100, 12, true), // active
];

// ─── Filter helpers ───────────────────────────────────────────────────────────

export function getActiveShift(entertainerId: string): Shift | undefined {
  return ALL_SHIFTS.find((s) => s.entertainerId === entertainerId && s.isActive);
}

export function getEntertainerShifts(
  entertainerId: string,
  opts?: { clubId?: string; excludeActive?: boolean },
): Shift[] {
  return ALL_SHIFTS.filter(
    (s) =>
      s.entertainerId === entertainerId &&
      (!opts?.clubId || opts.clubId === "all" || s.clubId === opts.clubId) &&
      (!opts?.excludeActive || !s.isActive),
  );
}

export function getClubShifts(
  clubId: string,
  opts?: { entertainerId?: string; activeOnly?: boolean },
): Shift[] {
  return ALL_SHIFTS.filter(
    (s) =>
      (clubId === "all" || s.clubId === clubId) &&
      (!opts?.entertainerId || opts.entertainerId === "all" || s.entertainerId === opts.entertainerId) &&
      (!opts?.activeOnly || s.isActive),
  );
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

export interface PeriodData {
  label: string;
  vipRevenue: number;
  rooms: number;
  bonus: number;
  shifts: number;
  commissions: number;
}

export function groupByWeek(shifts: Shift[]): PeriodData[] {
  const windows: { label: string; start: string; end: string }[] = [
    { label: "Jul 6",  start: "2026-07-06", end: "2026-07-13" },
    { label: "Jul 13", start: "2026-07-13", end: "2026-07-20" },
    { label: "Jul 20", start: "2026-07-20", end: "2026-07-27" },
    { label: "Jul 27", start: "2026-07-27", end: "2026-08-01" },
  ];
  return windows.map(({ label, start, end }) => {
    const rows = shifts.filter((s) => !s.isActive && s.date >= start && s.date < end);
    return {
      label,
      vipRevenue:  rows.reduce((a, s) => a + s.vipRevenue, 0),
      rooms:       rows.reduce((a, s) => a + s.vipRoomsSold, 0),
      bonus:       rows.reduce((a, s) => a + s.bonusEarned, 0),
      shifts:      rows.length,
      commissions: rows.reduce((a, s) => a + s.netEarnings, 0),
    };
  });
}

export function groupByMonth(shifts: Shift[]): PeriodData[] {
  const windows: { label: string; start: string; end: string }[] = [
    { label: "May", start: "2026-05-01", end: "2026-06-01" },
    { label: "Jun", start: "2026-06-01", end: "2026-07-01" },
    { label: "Jul", start: "2026-07-01", end: "2026-08-01" },
  ];
  return windows.map(({ label, start, end }) => {
    const rows = shifts.filter((s) => !s.isActive && s.date >= start && s.date < end);
    return {
      label,
      vipRevenue:  rows.reduce((a, s) => a + s.vipRevenue, 0),
      rooms:       rows.reduce((a, s) => a + s.vipRoomsSold, 0),
      bonus:       rows.reduce((a, s) => a + s.bonusEarned, 0),
      shifts:      rows.length,
      commissions: rows.reduce((a, s) => a + s.netEarnings, 0),
    };
  });
}

export interface EntertainerKPIs {
  todayVipRevenue: number;
  todayRooms: number;
  todayBonus: number;
  todayCommission: number;
  weeklyVipRevenue: number;
  monthlyVipRevenue: number;
  progressPct: number;
  tier: TierDef;
  weekTrend: number;   // % change week-over-week
  monthTrend: number;  // % change month-over-month
  sparkRevenue: number[];
  sparkBonus: number[];
  personalBest: number;
}

export function computeEntertainerKPIs(entertainerId: string): EntertainerKPIs {
  const active = getActiveShift(entertainerId);
  const history = getEntertainerShifts(entertainerId, { excludeActive: true });
  const tier = getTierForRevenue(active?.vipRevenue ?? 0);

  const weekly = groupByWeek(history);
  const monthly = groupByMonth(history);

  const thisWeek = weekly[weekly.length - 1]?.vipRevenue ?? 0;
  const lastWeek = weekly[weekly.length - 2]?.vipRevenue ?? 0;
  const thisMonth = monthly[monthly.length - 1]?.vipRevenue ?? 0;
  const lastMonth = monthly[monthly.length - 2]?.vipRevenue ?? 0;

  const weekTrend  = lastWeek  ? ((thisWeek  - lastWeek)  / lastWeek)  * 100 : 0;
  const monthTrend = lastMonth ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  const personalBest = Math.max(0, ...history.map((s) => s.vipRevenue));

  return {
    todayVipRevenue: active?.vipRevenue ?? 0,
    todayRooms:      active?.vipRoomsSold ?? 0,
    todayBonus:      active?.bonusEarned ?? 0,
    todayCommission: active?.commissionPct ?? tier.commissionPct,
    weeklyVipRevenue:  thisWeek  + (active?.vipRevenue ?? 0),
    monthlyVipRevenue: thisMonth + (active?.vipRevenue ?? 0),
    progressPct: getProgressToNextTier(active?.vipRevenue ?? 0, tier),
    tier,
    weekTrend,
    monthTrend,
    sparkRevenue: weekly.map((w) => w.vipRevenue),
    sparkBonus:   weekly.map((w) => w.bonus),
    personalBest,
  };
}
