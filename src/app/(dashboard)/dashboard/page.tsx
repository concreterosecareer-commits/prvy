import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  TrendingUp,
  Users,
  MessageSquare,
  Gem,
  BarChart3,
  Flame,
} from "lucide-react";
import { MOCK_RECENT_ACTIVITY, MOCK_HOT_SPOTS } from "@/lib/mock-data";
import { formatGems, formatUsd } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: userData }, { data: wallet }] = await Promise.all([
    supabase.from("profiles").select("display_name, username").eq("id", user!.id).single(),
    supabase.from("users").select("role").eq("id", user!.id).single(),
    supabase.from("wallets").select("gem_balance, usd_balance").eq("user_id", user!.id).single(),
  ]);

  const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "there";
  const role = userData?.role ?? "patron";
  const isDancer = role === "entertainer";

  const gemBalance = wallet?.gem_balance ?? 1250;
  const usdBalance = wallet?.usd_balance ?? 1250;

  const unreadMessages = MOCK_RECENT_ACTIVITY.reduce((sum, m) => sum + m.unread, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {isDancer ? displayName : `Patron ${displayName}`} 👑
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s your activity overview.</p>
      </div>

      {/* Zone 1 — Stat strip (3 cards max) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Gem Balance"
          value={formatGems(gemBalance)}
          icon={Gem}
          sub={`${formatUsd(usdBalance)} USD`}
          footer={
            isDancer ? (
              <Link href="/transactions">
                <Button size="sm" className="w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
                  Check Income
                </Button>
              </Link>
            ) : (
              <Link href="/buy-gems">
                <Button size="sm" className="w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
                  Top Up
                </Button>
              </Link>
            )
          }
        />

        {isDancer ? (
          <StatCard
            label="Lifetime Earnings"
            value={formatUsd(24560)}
            icon={TrendingUp}
            trend="↑ 18.4% this month"
          />
        ) : (
          <StatCard
            label="Active Entertainers"
            value="32"
            icon={Users}
            trend="↑ 5 new this week"
            footer={
              <Link href="/connections">
                <Button size="sm" className="w-full text-xs bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
                  View Entertainers
                </Button>
              </Link>
            }
          />
        )}

        <StatCard
          label="Unread Messages"
          value={String(unreadMessages)}
          icon={MessageSquare}
          footer={
            <Link href="/messages">
              <Button size="sm" className="w-full text-xs bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
                Open Messages
              </Button>
            </Link>
          }
        />
      </div>

      {/* Zone 2 — Primary action card */}
      {isDancer ? (
        <Card
          className="relative min-h-36 overflow-hidden rounded-2xl border-none p-6 shadow-sm"
          style={{ background: "linear-gradient(135deg, var(--brand-red), var(--brand-red-dark))" }}
        >
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">This week</p>
              <h2 className="mt-1 text-2xl font-bold">
                You have {unreadMessages} new message{unreadMessages !== 1 ? "s" : ""}
              </h2>
              <p className="mt-1 text-sm text-white/70">Stay on top of your patron conversations.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/messages">
                <Button className="bg-white text-[var(--brand-red)] hover:bg-white/90 font-semibold">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  View Messages
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Earnings
                </Button>
              </Link>
            </div>
          </div>
          <span className="pointer-events-none absolute -right-4 -top-4 select-none text-[120px] font-black leading-none text-white/5">
            ✉
          </span>
        </Card>
      ) : (
        <Card
          className="relative min-h-36 overflow-hidden rounded-2xl border-none p-6 shadow-sm"
          style={{ background: "linear-gradient(135deg, var(--brand-red), var(--brand-red-dark))" }}
        >
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">For you</p>
              <h2 className="mt-1 text-2xl font-bold">Discover Entertainers</h2>
              <p className="mt-1 text-sm text-white/70">
                Browse curated profiles and connect privately.
              </p>
            </div>
            <div className="shrink-0">
              <Link href="/connections">
                <Button className="bg-white px-6 text-[var(--brand-red)] hover:bg-white/90 font-semibold">
                  <Users className="mr-2 h-4 w-4" />
                  Browse Entertainers
                </Button>
              </Link>
            </div>
          </div>
          <span className="pointer-events-none absolute -right-4 -top-4 select-none text-[120px] font-black leading-none text-white/5">
            ✦
          </span>
        </Card>
      )}

      {/* Zone 3 — Secondary content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Recent Activity */}
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Activity</h2>
            <Link href="/messages" className="text-xs font-medium text-[var(--brand-red)] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {MOCK_RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  {item.avatar && <AvatarImage src={item.avatar} alt={item.name} className="object-cover object-top" />}
                  <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)]">
                    {item.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-red)] px-1.5 text-[11px] font-semibold text-white">
                      {item.unread}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Hot Spots */}
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[var(--brand-red)]" />
              <h2 className="font-semibold">Hot Spots</h2>
            </div>
            <Link href="/hot-spots" className="text-xs font-medium text-[var(--brand-red)] hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_HOT_SPOTS.slice(0, 4).map((spot) => (
              <Link key={spot.id} href={`/hot-spots/${spot.id}`} className="group overflow-hidden rounded-xl">
                <div
                  className="relative flex h-24 items-end overflow-hidden p-3"
                  style={{ background: spot.gradient }}
                >
                  {"image" in spot && spot.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={spot.image as string}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, oklch(0.08 0.01 25 / 90%) 0%, oklch(0.08 0.01 25 / 30%) 60%, transparent 100%)" }} />
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-white">{spot.name}</p>
                    <p className="text-[11px] text-white/70">{spot.location}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
