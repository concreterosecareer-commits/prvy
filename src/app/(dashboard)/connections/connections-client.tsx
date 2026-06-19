"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, MessageSquare, MoreVertical, MapPin,
  ArrowUpDown, Check, X, UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusDot } from "@/components/dashboard/status-dot";
import { MOCK_CONNECTIONS, MOCK_PATRON_CONNECTIONS, MOCK_INVITES } from "@/lib/mock-data";
import { formatUsd } from "@/lib/format";

type SortKey = "name" | "status" | "earnings" | "patrons" | "location";

const STATUS_ORDER: Record<string, number> = { Active: 0, Away: 1, Offline: 2 };

function sortLabel(key: SortKey) {
  return {
    name: "Name (A–Z)",
    status: "Status",
    earnings: "Earnings",
    patrons: "Patrons",
    location: "Location",
  }[key];
}

/* ─── Dancer card (patron view) ─────────────────────────────── */
function DancerCard({ d }: { d: typeof MOCK_CONNECTIONS[0] }) {
  const gradients = [
    "linear-gradient(135deg, oklch(0.40 0.22 25 / 0.9), oklch(0.16 0.01 25))",
    "linear-gradient(135deg, oklch(0.35 0.18 290 / 0.9), oklch(0.16 0.01 25))",
    "linear-gradient(135deg, oklch(0.50 0.06 240 / 0.9), oklch(0.20 0.02 240))",
    "linear-gradient(135deg, oklch(0.45 0.15 160 / 0.9), oklch(0.18 0.02 160))",
    "linear-gradient(135deg, oklch(0.38 0.20 55 / 0.9),  oklch(0.16 0.01 25))",
    "linear-gradient(135deg, oklch(0.42 0.18 320 / 0.9), oklch(0.16 0.01 25))",
  ];
  const gradient = gradients[parseInt(d.id) % gradients.length];

  return (
    <Card className="overflow-hidden rounded-2xl border-none shadow-sm transition hover:shadow-md">
      {/* Gradient header band with floating round avatar */}
      <div className="relative flex h-20 items-end justify-center" style={{ background: gradient }}>
        <span className="pointer-events-none absolute right-3 top-1 select-none text-5xl font-black leading-none text-white/10">
          {d.name[0]}
        </span>
        <Avatar className="relative z-10 mb-[-28px] h-16 w-16 ring-4 ring-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.avatar} alt={d.name} className="h-full w-full rounded-full object-cover object-top" />
        </Avatar>
      </div>

      {/* Card body */}
      <div className="px-4 pb-4 pt-9 text-center">
        <Link href={`/profile/${d.username}`} className="text-sm font-semibold hover:underline">
          {d.name}
        </Link>
        <p className="text-xs text-muted-foreground">@{d.username}</p>
        <div className="mt-1 flex justify-center">
          <StatusDot status={d.status} />
        </div>

        <div className="mt-3 flex justify-center gap-6 text-center">
          <div>
            <p className="text-sm font-bold">{formatUsd(d.earnings)}</p>
            <p className="text-[11px] text-muted-foreground">Earnings</p>
          </div>
          <div>
            <p className="text-sm font-bold">{d.patrons.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Patrons</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <Link href="/messages" className="flex-1">
              <Button size="sm" className="w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Message
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="px-3">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Link href={`/profile/${d.username}`}>
            <Button size="sm" variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

/* ─── Patron row (dancer view) ───────────────────────────────── */
function PatronRow({ p }: { p: typeof MOCK_PATRON_CONNECTIONS[0] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl p-3 transition hover:bg-accent">
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] font-semibold">
          {p.name[0]}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <Link href={`/profile/${p.username}`} className="text-sm font-semibold hover:underline">
          {p.name}
        </Link>
        <p className="text-xs text-muted-foreground">@{p.username}</p>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        {p.location}
      </div>

      <StatusDot status={p.status} />

      <div className="flex items-center gap-1">
        <Link href="/messages">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Invitation card ────────────────────────────────────────── */
function InviteCard({
  invite,
  onAccept,
  onDecline,
}: {
  invite: typeof MOCK_INVITES[0];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl p-3 transition hover:bg-accent">
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] font-semibold">
          {invite.name[0]}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{invite.name}</p>
        <p className="text-xs text-muted-foreground">@{invite.username} · {invite.time}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground italic">"{invite.message}"</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          size="sm"
          onClick={() => onAccept(invite.id)}
          className="h-8 gap-1.5 bg-emerald-500 px-3 text-white hover:bg-emerald-600"
        >
          <Check className="h-3.5 w-3.5" /> Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDecline(invite.id)}
          className="h-8 gap-1.5 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" /> Decline
        </Button>
      </div>
    </div>
  );
}

/* ─── Main client component ──────────────────────────────────── */
export function ConnectionsClient({ isDancer }: { isDancer: boolean }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>(isDancer ? "name" : "name");
  const [invites, setInvites] = useState(MOCK_INVITES);

  const dancerSortOptions: SortKey[] = ["name", "status", "earnings", "patrons"];
  const patronSortOptions: SortKey[] = ["name", "status", "location"];
  const sortOptions = isDancer ? patronSortOptions : dancerSortOptions;

  /* Filtered + sorted dancers (patron view) */
  const filteredDancers = useMemo(() => {
    const q = search.toLowerCase();
    const list = MOCK_CONNECTIONS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.username.toLowerCase().includes(q)
    );
    return list.sort((a, b) => {
      if (sortKey === "name")     return a.name.localeCompare(b.name);
      if (sortKey === "status")   return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      if (sortKey === "earnings") return b.earnings - a.earnings;
      if (sortKey === "patrons")  return b.patrons - a.patrons;
      return 0;
    });
  }, [search, sortKey]);

  /* Filtered + sorted patrons (dancer view) */
  const filteredPatrons = useMemo(() => {
    const q = search.toLowerCase();
    const list = MOCK_PATRON_CONNECTIONS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );
    return list.sort((a, b) => {
      if (sortKey === "name")     return a.name.localeCompare(b.name);
      if (sortKey === "status")   return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      if (sortKey === "location") return a.location.localeCompare(b.location);
      return 0;
    });
  }, [search, sortKey]);

  function handleAccept(id: string) {
    setInvites((prev) => prev.filter((inv) => inv.id !== id));
  }
  function handleDecline(id: string) {
    setInvites((prev) => prev.filter((inv) => inv.id !== id));
  }

  return (
    <Tabs defaultValue="all" className="space-y-0">
      {/* ── Sticky filter bar ─────────────────────────────────── */}
      <div className="sticky top-0 z-10 -mx-1 bg-background/95 pb-4 pt-1 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TabsList>
              <TabsTrigger value="all">
                {isDancer ? "My Patrons" : "All Dancers"}
              </TabsTrigger>
              <TabsTrigger value="invitations" className="relative">
                Invitations
                {invites.length > 0 && (
                  <span className="ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-red)] px-1 text-[10px] font-semibold text-white">
                    {invites.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isDancer ? "Search patrons..." : "Search dancers..."}
                className="h-9 w-56 pl-9 text-sm"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 px-3">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {sortLabel(sortKey)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((key) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setSortKey(key)}
                    className="gap-2"
                  >
                    {sortKey === key && <Check className="h-3.5 w-3.5 text-[var(--brand-red)]" />}
                    <span className={sortKey !== key ? "pl-5" : ""}>{sortLabel(key)}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── All tab ───────────────────────────────────────────── */}
      <TabsContent value="all" className="mt-0">
        {isDancer ? (
          /* Patron list */
          <Card className="rounded-2xl border-none p-4 shadow-sm">
            {filteredPatrons.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No patrons found.</p>
            ) : (
              <div className="space-y-1">
                {filteredPatrons.map((p) => (
                  <PatronRow key={p.id} p={p} />
                ))}
              </div>
            )}
          </Card>
        ) : (
          /* Dancer card grid */
          <>
            {filteredDancers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No dancers found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDancers.map((d) => (
                  <DancerCard key={d.id} d={d} />
                ))}
              </div>
            )}
          </>
        )}
      </TabsContent>

      {/* ── Invitations tab ───────────────────────────────────── */}
      <TabsContent value="invitations" className="mt-0">
        <Card className="rounded-2xl border-none p-4 shadow-sm">
          {invites.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <UserPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No pending invitations</p>
              <p className="text-xs text-muted-foreground">When someone invites you, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {invites.map((inv) => (
                <InviteCard
                  key={inv.id}
                  invite={inv}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
