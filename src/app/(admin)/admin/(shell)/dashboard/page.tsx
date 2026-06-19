import {
  Users, UserCircle, Crown, DollarSign,
  Gem, Activity, MessageSquare, Link2, MapPin,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  MOCK_PLATFORM_STATS,
  MOCK_RECENT_SIGNUPS,
  MOCK_PLATFORM_HEALTH,
} from "@/lib/mock-admin-data";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { formatCompactNumber } from "@/lib/format";

const ROLE_STYLES: Record<string, string> = {
  Entertainer: "bg-[var(--brand-red)]/10 text-[var(--brand-red)]",
  Patron:      "bg-sky-500/10 text-sky-600",
  Admin:       "bg-purple-500/10 text-purple-600",
};

/* ─── stat card ───────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
}

function AdminStatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <Card className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-none p-4 shadow-sm">
      {/* top accent bar */}
      <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl" style={{ background: accent }} />
      {/* icon */}
      <div
        className="mb-3 mt-1 flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
      >
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      {/* text */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

/* ─── page ────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Users",  value: formatCompactNumber(MOCK_PLATFORM_STATS.totalUsers),        icon: Users,      accent: "var(--brand-red)" },
    { label: "Dancers",      value: formatCompactNumber(MOCK_PLATFORM_STATS.totalEntertainers), icon: UserCircle, accent: "#8b5cf6" },
    { label: "Patrons",      value: formatCompactNumber(MOCK_PLATFORM_STATS.totalPatrons),      icon: Crown,      accent: "#0ea5e9" },
    { label: "Revenue",      value: `$${formatCompactNumber(MOCK_PLATFORM_STATS.totalRevenue)}`,icon: DollarSign, accent: "#10b981" },
    { label: "Gems Sold",    value: formatCompactNumber(MOCK_PLATFORM_STATS.gemsSold),          icon: Gem,        accent: "#f59e0b" },
    { label: "Active Now",   value: formatCompactNumber(MOCK_PLATFORM_STATS.activeNow),         icon: Activity,   accent: "#ec4899" },
  ];

  const health = [
    { label: "Messages Today",    value: formatCompactNumber(MOCK_PLATFORM_HEALTH.messagesSentToday),    icon: MessageSquare, accent: "#8b5cf6" },
    { label: "Connections Today", value: formatCompactNumber(MOCK_PLATFORM_HEALTH.connectionsMadeToday), icon: Link2,         accent: "#10b981" },
    { label: "Hot Spots Active",  value: String(MOCK_PLATFORM_HEALTH.hotSpotsActive),                   icon: MapPin,        accent: "var(--brand-red)" },
  ];

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Platform overview &amp; user management</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      {/* Stats strip — equal height, no dead space */}
      <div className="grid grid-cols-3 gap-3 xl:grid-cols-6">
        {stats.map((s) => (
          <AdminStatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Main content: table (3/5) + right sidebar (2/5) */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* ── User management table ── */}
        <Card className="overflow-hidden rounded-2xl border-none shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between px-5 py-3.5 border-b">
            <h2 className="font-semibold">User Management</h2>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs font-medium text-[var(--brand-red)] hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <UserManagementTable limit={6} />
        </Card>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-5 lg:col-span-2">

          {/* Recent signups */}
          <Card className="overflow-hidden rounded-2xl border-none shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-3.5">
              <h2 className="font-semibold">Recent Signups</h2>
              <span className="rounded-full bg-[var(--brand-red)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-red)]">
                {MOCK_RECENT_SIGNUPS.length} new
              </span>
            </div>
            <div className="divide-y">
              {MOCK_RECENT_SIGNUPS.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] text-xs font-bold">
                      {u.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.joined}</p>
                  </div>
                  <Badge variant="secondary" className={`shrink-0 text-[10px] ${ROLE_STYLES[u.role] ?? ""}`}>
                    {u.role === "Entertainer" ? "Dancer" : u.role}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Platform health */}
          <Card className="overflow-hidden rounded-2xl border-none shadow-sm">
            <div className="border-b px-5 py-3.5">
              <h2 className="font-semibold">Platform Health</h2>
              <p className="text-xs text-muted-foreground">Today&apos;s activity</p>
            </div>
            <div className="divide-y">
              {health.map(({ label, value, icon: Icon, accent }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: accent }} />
                    </div>
                    <p className="text-sm">{label}</p>
                  </div>
                  <p className="text-sm font-bold">{value}</p>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
