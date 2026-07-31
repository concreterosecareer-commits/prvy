// ─── Types ────────────────────────────────────────────────────────────────────

export type Club = {
  id: string;
  name: string;
  city: string;
  state: string;
};

export type PeriodRow = {
  label: string;
  gross: number;
  net: number;
  houseCosts: number;
  hours: number;
  rate: number;
  customers: number;
};

export type TrafficDay = {
  label: string;
  avgCustomers: number;
  highSpenders: number;
  avgRevenue: number;
};

export type ClubStats = {
  clubId: string;
  hoursWorked: number;
  grossEarnings: number;
  houseFees: number;
  djTips: number;
  securityTips: number;
  valet: number;
  otherFees: number;
  vipRevenue: number;
  customerCount: number;
  trafficRating: number;
  weeklyData: PeriodRow[];
  monthlyData: PeriodRow[];
  trafficByDay: TrafficDay[];
  weekHeatmap: number[][];  // [week 0-3][day 0-6 Sun-Sat]
};

export type Customer = {
  id: string;
  name: string;
  lastVisit: string;
  firstVisit: string;
  totalVisits: number;
  lifetimeValue: number;
  avgSpend: number;
  totalTimeHours: number;
  conversionRate: number;
  vipVisits: number;
  preferredClubId: string;
  tier: "high" | "mid" | "low";
  conversationsTotal: number;
  conversionsSuccessful: number;
  monthlySpend: number[];   // 6 months: Feb–Jul 2026
  monthlyVisits: number[];
};

// ─── Clubs ────────────────────────────────────────────────────────────────────

export const CLUBS: Club[] = [
  { id: "ricks",   name: "Rick's Cabaret",  city: "New York",   state: "NY" },
  { id: "scores",  name: "Scores",          city: "New York",   state: "NY" },
  { id: "vivid",   name: "Vivid Cabaret",   city: "Las Vegas",  state: "NV" },
  { id: "hustler", name: "Hustler Club",    city: "New York",   state: "NY" },
];

// ─── Club Statistics ──────────────────────────────────────────────────────────

export const CLUB_STATS: ClubStats[] = [
  {
    clubId: "ricks",
    hoursWorked: 52,
    grossEarnings: 15200,
    houseFees: 2600,
    djTips: 520,
    securityTips: 390,
    valet: 130,
    otherFees: 90,
    vipRevenue: 6200,
    customerCount: 18,
    trafficRating: 7.8,
    weeklyData: [
      { label: "Wk 1", gross: 3200, net: 2380, houseCosts: 820,  hours: 11, rate: 216, customers: 4 },
      { label: "Wk 2", gross: 3600, net: 2700, houseCosts: 900,  hours: 12, rate: 225, customers: 4 },
      { label: "Wk 3", gross: 3800, net: 2830, houseCosts: 970,  hours: 13, rate: 218, customers: 5 },
      { label: "Wk 4", gross: 4600, net: 3560, houseCosts: 1040, hours: 16, rate: 223, customers: 5 },
    ],
    monthlyData: [
      { label: "Apr", gross: 12800, net: 9400,  houseCosts: 3400, hours: 44, rate: 214, customers: 72 },
      { label: "May", gross: 13800, net: 10200, houseCosts: 3600, hours: 48, rate: 213, customers: 78 },
      { label: "Jun", gross: 15200, net: 11470, houseCosts: 3730, hours: 52, rate: 221, customers: 88 },
    ],
    trafficByDay: [
      { label: "Weekday",    avgCustomers: 4.2,  highSpenders: 1.4, avgRevenue: 680  },
      { label: "Weekend",    avgCustomers: 8.6,  highSpenders: 3.2, avgRevenue: 1240 },
      { label: "Holiday",    avgCustomers: 12.4, highSpenders: 4.8, avgRevenue: 1880 },
      { label: "Convention", avgCustomers: 10.2, highSpenders: 3.6, avgRevenue: 1560 },
      { label: "Local Night",avgCustomers: 6.4,  highSpenders: 2.1, avgRevenue: 920  },
    ],
    weekHeatmap: [
      [1180,    0,  680,    0,  720, 1240, 1360],
      [1320,  700,    0,  740,    0, 1380, 1460],
      [1540,    0,  680,  750,  820, 1460, 1580],
      [1680,  720,  780,    0,  860, 1680, 1800],
    ],
  },
  {
    clubId: "scores",
    hoursWorked: 36,
    grossEarnings: 13800,
    houseFees: 2700,
    djTips: 540,
    securityTips: 360,
    valet: 180,
    otherFees: 120,
    vipRevenue: 7200,
    customerCount: 12,
    trafficRating: 8.5,
    weeklyData: [
      { label: "Wk 1", gross: 2800, net: 2000, houseCosts: 800,  hours: 8,  rate: 250, customers: 3 },
      { label: "Wk 2", gross: 3200, net: 2250, houseCosts: 950,  hours: 9,  rate: 250, customers: 3 },
      { label: "Wk 3", gross: 3400, net: 2400, houseCosts: 1000, hours: 9,  rate: 267, customers: 3 },
      { label: "Wk 4", gross: 4400, net: 3250, houseCosts: 1150, hours: 10, rate: 325, customers: 3 },
    ],
    monthlyData: [
      { label: "Apr", gross: 11200, net: 7900, houseCosts: 3300, hours: 28, rate: 282, customers: 44 },
      { label: "May", gross: 12400, net: 8800, houseCosts: 3600, hours: 32, rate: 275, customers: 48 },
      { label: "Jun", gross: 13800, net: 9900, houseCosts: 3900, hours: 36, rate: 275, customers: 52 },
    ],
    trafficByDay: [
      { label: "Weekday",    avgCustomers: 2.8,  highSpenders: 1.2, avgRevenue: 900  },
      { label: "Weekend",    avgCustomers: 6.4,  highSpenders: 3.0, avgRevenue: 1800 },
      { label: "Holiday",    avgCustomers: 9.2,  highSpenders: 4.2, avgRevenue: 2600 },
      { label: "Convention", avgCustomers: 8.0,  highSpenders: 3.8, avgRevenue: 2200 },
      { label: "Local Night",avgCustomers: 4.4,  highSpenders: 1.8, avgRevenue: 1200 },
    ],
    weekHeatmap: [
      [1400,    0,    0,  900,    0, 1800, 2100],
      [1600,    0,  820,    0, 1050, 2200, 2400],
      [   0,  860,    0,  940, 1200, 2400, 2600],
      [1800,    0,  880,  960,    0, 2800, 3000],
    ],
  },
  {
    clubId: "vivid",
    hoursWorked: 24,
    grossEarnings: 11200,
    houseFees: 2200,
    djTips: 440,
    securityTips: 330,
    valet: 110,
    otherFees: 80,
    vipRevenue: 5800,
    customerCount: 8,
    trafficRating: 7.2,
    weeklyData: [
      { label: "Wk 1", gross: 2400, net: 1700, houseCosts: 700, hours: 6, rate: 283, customers: 2 },
      { label: "Wk 2", gross: 2600, net: 1850, houseCosts: 750, hours: 6, rate: 308, customers: 2 },
      { label: "Wk 3", gross: 2800, net: 1990, houseCosts: 810, hours: 6, rate: 332, customers: 2 },
      { label: "Wk 4", gross: 3400, net: 2500, houseCosts: 900, hours: 6, rate: 417, customers: 2 },
    ],
    monthlyData: [
      { label: "Apr", gross: 8800,  net: 6200, houseCosts: 2600, hours: 20, rate: 310, customers: 28 },
      { label: "May", gross: 10000, net: 7100, houseCosts: 2900, hours: 22, rate: 323, customers: 32 },
      { label: "Jun", gross: 11200, net: 8040, houseCosts: 3160, hours: 24, rate: 335, customers: 36 },
    ],
    trafficByDay: [
      { label: "Weekday",    avgCustomers: 2.0,  highSpenders: 1.0, avgRevenue: 1200 },
      { label: "Weekend",    avgCustomers: 4.8,  highSpenders: 2.6, avgRevenue: 2800 },
      { label: "Holiday",    avgCustomers: 6.4,  highSpenders: 3.2, avgRevenue: 3600 },
      { label: "Convention", avgCustomers: 7.2,  highSpenders: 4.0, avgRevenue: 4200 },
      { label: "Local Night",avgCustomers: 3.2,  highSpenders: 1.6, avgRevenue: 1800 },
    ],
    weekHeatmap: [
      [1200, 1000, 1200, 1400, 1600, 2000, 2400],
      [1400, 1200, 1400, 1600, 1800, 2200, 2600],
      [   0, 1400, 1600, 1800, 2000, 2400,    0],
      [1600, 1600, 1800, 2000, 2200,    0, 3000],
    ],
  },
  {
    clubId: "hustler",
    hoursWorked: 44,
    grossEarnings: 9400,
    houseFees: 1600,
    djTips: 320,
    securityTips: 240,
    valet: 120,
    otherFees: 20,
    vipRevenue: 2600,
    customerCount: 22,
    trafficRating: 6.4,
    weeklyData: [
      { label: "Wk 1", gross: 2000, net: 1510, houseCosts: 490, hours: 9,  rate: 168, customers: 5 },
      { label: "Wk 2", gross: 2200, net: 1640, houseCosts: 560, hours: 10, rate: 164, customers: 5 },
      { label: "Wk 3", gross: 2400, net: 1790, houseCosts: 610, hours: 11, rate: 163, customers: 6 },
      { label: "Wk 4", gross: 2800, net: 2160, houseCosts: 640, hours: 14, rate: 154, customers: 6 },
    ],
    monthlyData: [
      { label: "Apr", gross: 7800,  net: 5900, houseCosts: 1900, hours: 36, rate: 164, customers: 80 },
      { label: "May", gross: 8600,  net: 6400, houseCosts: 2200, hours: 40, rate: 160, customers: 88 },
      { label: "Jun", gross: 9400,  net: 7100, houseCosts: 2300, hours: 44, rate: 161, customers: 96 },
    ],
    trafficByDay: [
      { label: "Weekday",    avgCustomers: 5.2,  highSpenders: 1.0, avgRevenue: 420  },
      { label: "Weekend",    avgCustomers: 9.8,  highSpenders: 2.2, avgRevenue: 780  },
      { label: "Holiday",    avgCustomers: 13.6, highSpenders: 3.0, avgRevenue: 1040 },
      { label: "Convention", avgCustomers: 11.0, highSpenders: 2.4, avgRevenue: 880  },
      { label: "Local Night",avgCustomers: 7.6,  highSpenders: 1.6, avgRevenue: 560  },
    ],
    weekHeatmap: [
      [ 600, 520, 540, 560,  620,  880, 1000],
      [ 800, 600, 560, 580,    0,  960, 1100],
      [ 900,   0, 620, 640,  700, 1040, 1200],
      [1000, 680, 700,   0,  760, 1160, 1400],
    ],
  },
];

// ─── Customers ────────────────────────────────────────────────────────────────

export const CUSTOMERS: Customer[] = [
  // ── High Tier ──
  {
    id: "marcus",    name: "Marcus K.",   tier: "high",
    firstVisit: "2024-08-15", lastVisit: "2026-07-28",
    totalVisits: 22, lifetimeValue: 42800, avgSpend: 1945, totalTimeHours: 114, conversionRate: 0.87,
    vipVisits: 14, preferredClubId: "scores",
    conversationsTotal: 176, conversionsSuccessful: 153,
    monthlySpend:  [3890, 1945, 1945, 5835, 1945, 3890],
    monthlyVisits: [   2,    1,    1,    3,    1,    2],
  },
  {
    id: "david",     name: "David R.",    tier: "high",
    firstVisit: "2024-11-02", lastVisit: "2026-07-22",
    totalVisits: 18, lifetimeValue: 28400, avgSpend: 1578, totalTimeHours: 83,  conversionRate: 0.82,
    vipVisits: 10, preferredClubId: "scores",
    conversationsTotal: 144, conversionsSuccessful: 118,
    monthlySpend:  [3156,    0, 1578, 3156, 1578, 3156],
    monthlyVisits: [   2,    0,    1,    2,    1,    2],
  },
  {
    id: "james",     name: "James T.",    tier: "high",
    firstVisit: "2025-01-14", lastVisit: "2026-07-15",
    totalVisits: 14, lifetimeValue: 19200, avgSpend: 1371, totalTimeHours: 53,  conversionRate: 0.79,
    vipVisits: 8, preferredClubId: "vivid",
    conversationsTotal: 112, conversionsSuccessful: 88,
    monthlySpend:  [1371, 1371,    0, 2742, 1371,    0],
    monthlyVisits: [   1,    1,    0,    2,    1,    0],
  },
  {
    id: "michael",   name: "Michael B.",  tier: "high",
    firstVisit: "2025-03-08", lastVisit: "2026-07-18",
    totalVisits: 16, lifetimeValue: 15200, avgSpend: 950,  totalTimeHours: 46,  conversionRate: 0.74,
    vipVisits: 6, preferredClubId: "ricks",
    conversationsTotal: 128, conversionsSuccessful: 95,
    monthlySpend:  [ 950,  950,  950, 1900,  950,  950],
    monthlyVisits: [   1,    1,    1,    2,    1,    1],
  },
  // ── Mid Tier ──
  {
    id: "chris",     name: "Chris L.",    tier: "mid",
    firstVisit: "2025-04-20", lastVisit: "2026-07-10",
    totalVisits: 12, lifetimeValue: 12800, avgSpend: 1067, totalTimeHours: 31,  conversionRate: 0.71,
    vipVisits: 5, preferredClubId: "scores",
    conversationsTotal: 96,  conversionsSuccessful: 68,
    monthlySpend:  [1067,    0, 1067, 1067, 2134, 1067],
    monthlyVisits: [   1,    0,    1,    1,    2,    1],
  },
  {
    id: "jordan",    name: "Jordan W.",   tier: "mid",
    firstVisit: "2025-05-12", lastVisit: "2026-06-28",
    totalVisits: 10, lifetimeValue: 10400, avgSpend: 1040, totalTimeHours: 24,  conversionRate: 0.68,
    vipVisits: 4, preferredClubId: "scores",
    conversationsTotal: 80,  conversionsSuccessful: 54,
    monthlySpend:  [   0, 1040, 1040,    0, 2080,    0],
    monthlyVisits: [   0,    1,    1,    0,    2,    0],
  },
  {
    id: "nathan",    name: "Nathan P.",   tier: "mid",
    firstVisit: "2025-06-03", lastVisit: "2026-07-05",
    totalVisits: 11, lifetimeValue: 8600,  avgSpend: 782,  totalTimeHours: 23,  conversionRate: 0.65,
    vipVisits: 3, preferredClubId: "ricks",
    conversationsTotal: 88,  conversionsSuccessful: 57,
    monthlySpend:  [ 782,    0,  782,  782,  782,  782],
    monthlyVisits: [   1,    0,    1,    1,    1,    1],
  },
  {
    id: "tyler",     name: "Tyler S.",    tier: "mid",
    firstVisit: "2025-07-18", lastVisit: "2026-07-12",
    totalVisits: 9,  lifetimeValue: 7200,  avgSpend: 800,  totalTimeHours: 17,  conversionRate: 0.62,
    vipVisits: 2, preferredClubId: "ricks",
    conversationsTotal: 72,  conversionsSuccessful: 45,
    monthlySpend:  [ 800,    0,    0,  800,  800,  800],
    monthlyVisits: [   1,    0,    0,    1,    1,    1],
  },
  {
    id: "ryan",      name: "Ryan M.",     tier: "mid",
    firstVisit: "2025-08-05", lastVisit: "2026-06-20",
    totalVisits: 8,  lifetimeValue: 6800,  avgSpend: 850,  totalTimeHours: 16,  conversionRate: 0.66,
    vipVisits: 3, preferredClubId: "vivid",
    conversationsTotal: 64,  conversionsSuccessful: 42,
    monthlySpend:  [   0,  850,    0,  850,    0,    0],
    monthlyVisits: [   0,    1,    0,    1,    0,    0],
  },
  {
    id: "brian",     name: "Brian H.",    tier: "mid",
    firstVisit: "2025-09-14", lastVisit: "2026-07-08",
    totalVisits: 7,  lifetimeValue: 5900,  avgSpend: 843,  totalTimeHours: 13,  conversionRate: 0.61,
    vipVisits: 2, preferredClubId: "hustler",
    conversationsTotal: 56,  conversionsSuccessful: 34,
    monthlySpend:  [ 843,    0,  843,    0,    0,  843],
    monthlyVisits: [   1,    0,    1,    0,    0,    1],
  },
  {
    id: "derek",     name: "Derek C.",    tier: "mid",
    firstVisit: "2025-10-02", lastVisit: "2026-06-15",
    totalVisits: 8,  lifetimeValue: 5200,  avgSpend: 650,  totalTimeHours: 13,  conversionRate: 0.58,
    vipVisits: 1, preferredClubId: "hustler",
    conversationsTotal: 64,  conversionsSuccessful: 37,
    monthlySpend:  [   0,  650,    0,  650,    0,    0],
    monthlyVisits: [   0,    1,    0,    1,    0,    0],
  },
  {
    id: "kevin",     name: "Kevin F.",    tier: "mid",
    firstVisit: "2025-10-28", lastVisit: "2026-07-01",
    totalVisits: 7,  lifetimeValue: 4800,  avgSpend: 686,  totalTimeHours: 12,  conversionRate: 0.60,
    vipVisits: 2, preferredClubId: "ricks",
    conversationsTotal: 56,  conversionsSuccessful: 34,
    monthlySpend:  [ 686,    0,  686,    0,  686,    0],
    monthlyVisits: [   1,    0,    1,    0,    1,    0],
  },
  {
    id: "brandon",   name: "Brandon N.",  tier: "mid",
    firstVisit: "2025-11-15", lastVisit: "2026-07-20",
    totalVisits: 6,  lifetimeValue: 4200,  avgSpend: 700,  totalTimeHours: 9,   conversionRate: 0.57,
    vipVisits: 1, preferredClubId: "hustler",
    conversationsTotal: 48,  conversionsSuccessful: 27,
    monthlySpend:  [   0,  700,    0,  700,    0,  700],
    monthlyVisits: [   0,    1,    0,    1,    0,    1],
  },
  {
    id: "devon",     name: "Devon A.",    tier: "mid",
    firstVisit: "2025-12-08", lastVisit: "2026-07-04",
    totalVisits: 5,  lifetimeValue: 3800,  avgSpend: 760,  totalTimeHours: 8,   conversionRate: 0.55,
    vipVisits: 1, preferredClubId: "ricks",
    conversationsTotal: 40,  conversionsSuccessful: 22,
    monthlySpend:  [   0,    0,  760,    0,  760,  760],
    monthlyVisits: [   0,    0,    1,    0,    1,    1],
  },
  // ── Low Tier ──
  {
    id: "cameron",   name: "Cameron J.",  tier: "low",
    firstVisit: "2026-01-20", lastVisit: "2026-06-10",
    totalVisits: 4,  lifetimeValue: 2400,  avgSpend: 600,  totalTimeHours: 5,   conversionRate: 0.48,
    vipVisits: 0, preferredClubId: "hustler",
    conversationsTotal: 32,  conversionsSuccessful: 15,
    monthlySpend:  [   0,    0,    0,  600,  600,    0],
    monthlyVisits: [   0,    0,    0,    1,    1,    0],
  },
  {
    id: "alex",      name: "Alex R.",     tier: "low",
    firstVisit: "2026-02-14", lastVisit: "2026-05-28",
    totalVisits: 3,  lifetimeValue: 1800,  avgSpend: 600,  totalTimeHours: 3,   conversionRate: 0.44,
    vipVisits: 0, preferredClubId: "ricks",
    conversationsTotal: 24,  conversionsSuccessful: 11,
    monthlySpend:  [   0,  600,    0,  600,    0,    0],
    monthlyVisits: [   0,    1,    0,    1,    0,    0],
  },
  {
    id: "sean",      name: "Sean G.",     tier: "low",
    firstVisit: "2026-03-05", lastVisit: "2026-06-18",
    totalVisits: 3,  lifetimeValue: 1400,  avgSpend: 467,  totalTimeHours: 3,   conversionRate: 0.40,
    vipVisits: 0, preferredClubId: "hustler",
    conversationsTotal: 24,  conversionsSuccessful: 10,
    monthlySpend:  [   0,    0,  467,    0,  467,    0],
    monthlyVisits: [   0,    0,    1,    0,    1,    0],
  },
  {
    id: "dylan",     name: "Dylan O.",    tier: "low",
    firstVisit: "2026-04-12", lastVisit: "2026-05-20",
    totalVisits: 2,  lifetimeValue: 1200,  avgSpend: 600,  totalTimeHours: 2,   conversionRate: 0.38,
    vipVisits: 0, preferredClubId: "hustler",
    conversationsTotal: 16,  conversionsSuccessful: 6,
    monthlySpend:  [   0,    0,    0,  600,  600,    0],
    monthlyVisits: [   0,    0,    0,    1,    1,    0],
  },
  {
    id: "patrick",   name: "Patrick V.",  tier: "low",
    firstVisit: "2026-05-08", lastVisit: "2026-07-19",
    totalVisits: 2,  lifetimeValue: 900,   avgSpend: 450,  totalTimeHours: 2,   conversionRate: 0.35,
    vipVisits: 0, preferredClubId: "hustler",
    conversationsTotal: 16,  conversionsSuccessful: 6,
    monthlySpend:  [   0,    0,    0,  450,    0,  450],
    monthlyVisits: [   0,    0,    0,    1,    0,    1],
  },
  {
    id: "ethan",     name: "Ethan C.",    tier: "low",
    firstVisit: "2026-06-22", lastVisit: "2026-06-22",
    totalVisits: 1,  lifetimeValue: 600,   avgSpend: 600,  totalTimeHours: 1,   conversionRate: 0.32,
    vipVisits: 0, preferredClubId: "ricks",
    conversationsTotal: 8,   conversionsSuccessful: 3,
    monthlySpend:  [   0,    0,    0,    0,  600,    0],
    monthlyVisits: [   0,    0,    0,    0,    1,    0],
  },
];

// ─── Computed helpers ─────────────────────────────────────────────────────────

const MONTH_LABELS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];

export { MONTH_LABELS };

export function getClubStats(clubId: string): ClubStats[] {
  return clubId === "all" ? CLUB_STATS : CLUB_STATS.filter(s => s.clubId === clubId);
}

export type KPIData = {
  totalGross: number;
  totalNet: number;
  totalHours: number;
  effectiveRate: number;
  totalCustomers: number;
  avgSpend: number;
  monthlyGrowthPct: number;
  weeklyEarnings: number;
  weeklyNet: number;
  revSparkline: number[];
  netSparkline: number[];
  rateSparkline: number[];
};

export function computeKPIs(stats: ClubStats[], range: "4w" | "3m"): KPIData {
  if (range === "4w") {
    const totalGross = stats.reduce((s, c) => s + c.grossEarnings, 0);
    const totalHouseFees = stats.reduce((s, c) => s + c.houseFees + c.djTips + c.securityTips + c.valet + c.otherFees, 0);
    const totalNet = totalGross - totalHouseFees;
    const totalHours = stats.reduce((s, c) => s + c.hoursWorked, 0);
    const totalCustomers = stats.reduce((s, c) => s + c.customerCount, 0);

    // Week-by-week aggregated across clubs
    const weeklyGross = [0, 1, 2, 3].map(w =>
      stats.reduce((s, c) => s + c.weeklyData[w].gross, 0)
    );
    const weeklyNet = [0, 1, 2, 3].map(w =>
      stats.reduce((s, c) => s + c.weeklyData[w].net, 0)
    );
    const weeklyRate = [0, 1, 2, 3].map(w => {
      const hours = stats.reduce((s, c) => s + c.weeklyData[w].hours, 0);
      return hours > 0 ? Math.round(weeklyNet[w] / hours) : 0;
    });

    const prevMonthGross = stats.reduce((s, c) => s + c.monthlyData[1].gross, 0);
    const curMonthGross  = stats.reduce((s, c) => s + c.monthlyData[2].gross, 0);

    return {
      totalGross, totalNet, totalHours,
      effectiveRate: totalHours > 0 ? Math.round(totalNet / totalHours) : 0,
      totalCustomers,
      avgSpend: totalCustomers > 0 ? Math.round(totalGross / totalCustomers) : 0,
      monthlyGrowthPct: prevMonthGross > 0 ? +((curMonthGross - prevMonthGross) / prevMonthGross * 100).toFixed(1) : 0,
      weeklyEarnings: weeklyGross[3],
      weeklyNet: weeklyNet[3],
      revSparkline: weeklyGross,
      netSparkline: weeklyNet,
      rateSparkline: weeklyRate,
    };
  } else {
    // 3-month view
    const totalGross = stats.reduce((s, c) => s + c.monthlyData.reduce((m, d) => m + d.gross, 0), 0);
    const totalNet   = stats.reduce((s, c) => s + c.monthlyData.reduce((m, d) => m + d.net, 0), 0);
    const totalHours = stats.reduce((s, c) => s + c.monthlyData.reduce((m, d) => m + d.hours, 0), 0);
    const totalCustomers = stats.reduce((s, c) => s + c.monthlyData.reduce((m, d) => m + d.customers, 0), 0);

    const monthlyGross = [0, 1, 2].map(m => stats.reduce((s, c) => s + c.monthlyData[m].gross, 0));
    const monthlyNet   = [0, 1, 2].map(m => stats.reduce((s, c) => s + c.monthlyData[m].net, 0));
    const monthlyRate  = [0, 1, 2].map(m => {
      const hrs = stats.reduce((s, c) => s + c.monthlyData[m].hours, 0);
      return hrs > 0 ? Math.round(monthlyNet[m] / hrs) : 0;
    });

    return {
      totalGross, totalNet, totalHours,
      effectiveRate: totalHours > 0 ? Math.round(totalNet / totalHours) : 0,
      totalCustomers,
      avgSpend: totalCustomers > 0 ? Math.round(totalGross / totalCustomers) : 0,
      monthlyGrowthPct: monthlyGross[1] > 0 ? +((monthlyGross[2] - monthlyGross[1]) / monthlyGross[1] * 100).toFixed(1) : 0,
      weeklyEarnings: Math.round(monthlyGross[2] / 4),
      weeklyNet: Math.round(monthlyNet[2] / 4),
      revSparkline: monthlyGross,
      netSparkline: monthlyNet,
      rateSparkline: monthlyRate,
    };
  }
}

export function getClubTableRows(stats: ClubStats[], range: "4w" | "3m") {
  return stats.map(s => {
    const house = s.houseFees + s.djTips + s.securityTips + s.valet + s.otherFees;
    const net   = s.grossEarnings - house;
    const trendData = range === "4w"
      ? s.weeklyData.map(w => w.gross)
      : s.monthlyData.map(m => m.gross);
    return {
      clubId:      s.clubId,
      hoursWorked: s.hoursWorked,
      gross:       s.grossEarnings,
      net,
      rate:        s.hoursWorked > 0 ? Math.round(net / s.hoursWorked) : 0,
      houseCosts:  house,
      vipRevenue:  s.vipRevenue,
      trafficRating: s.trafficRating,
      trendData,
    };
  });
}

export function filterCustomers(
  customers: Customer[],
  clubId: string,
  customerType: string
): Customer[] {
  let result = customers;
  if (clubId !== "all") result = result.filter(c => c.preferredClubId === clubId);
  if (customerType === "vip") result = result.filter(c => c.vipVisits > 0);
  if (customerType === "high") result = result.filter(c => c.tier === "high");
  if (customerType === "regular") result = result.filter(c => c.tier !== "high" && c.vipVisits === 0);
  return result;
}
