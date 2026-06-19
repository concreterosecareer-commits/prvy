"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/dashboard/status-dot";
import { MOCK_ALL_DANCERS, MOCK_ALL_PATRONS } from "@/lib/mock-data";
import { formatUsd, formatGems } from "@/lib/format";

const GRADIENTS = [
  "linear-gradient(135deg, oklch(0.40 0.22 25 / 0.9), oklch(0.16 0.01 25))",
  "linear-gradient(135deg, oklch(0.35 0.18 290 / 0.9), oklch(0.16 0.01 25))",
  "linear-gradient(135deg, oklch(0.50 0.06 240 / 0.9), oklch(0.20 0.02 240))",
  "linear-gradient(135deg, oklch(0.45 0.15 160 / 0.9), oklch(0.18 0.02 160))",
  "linear-gradient(135deg, oklch(0.38 0.20 55 / 0.9),  oklch(0.16 0.01 25))",
  "linear-gradient(135deg, oklch(0.42 0.18 320 / 0.9), oklch(0.16 0.01 25))",
];

/* ── Dancer card (patron view) ───────────────────────────────── */
function DancerCard({ d }: { d: typeof MOCK_ALL_DANCERS[0] }) {
  const gradient = GRADIENTS[parseInt(d.id) % GRADIENTS.length];
  return (
    <Card className="overflow-hidden rounded-2xl border-none shadow-sm transition hover:shadow-md">
      <div className="relative flex h-20 items-end justify-center" style={{ background: gradient }}>
        <span className="pointer-events-none absolute right-3 top-1 select-none text-5xl font-black leading-none text-white/10">
          {d.name[0]}
        </span>
        {d.isConnected && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            Connected
          </span>
        )}
        <Avatar className="relative z-10 mb-[-28px] h-16 w-16 ring-4 ring-card">
          {d.avatar ? (
            <AvatarImage src={d.avatar} alt={d.name} className="object-cover object-top" />
          ) : (
            <AvatarFallback className="bg-[var(--brand-red)] text-lg font-semibold text-white">
              {d.name[0]}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      <div className="px-4 pb-4 pt-9 text-center">
        <Link href={`/profile/${d.username}`} className="text-sm font-semibold hover:underline">
          {d.name}
        </Link>
        <p className="text-xs text-muted-foreground">@{d.username}</p>
        <div className="mt-1 flex justify-center">
          <StatusDot status={d.status} />
        </div>
        <div className="mt-3 flex justify-center gap-6">
          <div>
            <p className="text-sm font-bold">{formatUsd(d.earnings)}</p>
            <p className="text-[11px] text-muted-foreground">Earned</p>
          </div>
          <div>
            <p className="text-sm font-bold">{d.patrons.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Patrons</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Link href={`/profile/${d.username}`}>
            <Button size="sm" className="w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
              View Profile
            </Button>
          </Link>
          {d.isConnected ? (
            <Link href="/messages">
              <Button size="sm" variant="outline" className="w-full">Message</Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" className="w-full">Connect</Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ── Patron card (dancer view) ───────────────────────────────── */
function PatronCard({ p }: { p: typeof MOCK_ALL_PATRONS[0] }) {
  const gradient = GRADIENTS[parseInt(p.id) % GRADIENTS.length];
  return (
    <Card className="overflow-hidden rounded-2xl border-none shadow-sm transition hover:shadow-md">
      <div className="relative flex h-20 items-end justify-center" style={{ background: gradient }}>
        <span className="pointer-events-none absolute right-3 top-1 select-none text-5xl font-black leading-none text-white/10">
          {p.name[0]}
        </span>
        {p.isConnected && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            Connected
          </span>
        )}
        <Avatar className="relative z-10 mb-[-28px] h-16 w-16 ring-4 ring-card">
          <AvatarFallback className="bg-[var(--brand-red)] text-lg font-semibold text-white">
            {p.name[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="px-4 pb-4 pt-9 text-center">
        <Link href={`/profile/${p.username}`} className="text-sm font-semibold hover:underline">
          {p.name}
        </Link>
        <p className="text-xs text-muted-foreground">@{p.username}</p>
        <div className="mt-1 flex justify-center">
          <StatusDot status={p.status} />
        </div>
        <div className="mt-3 flex justify-center gap-6">
          <div>
            <p className="text-sm font-bold">{formatGems(p.gems)}</p>
            <p className="text-[11px] text-muted-foreground">Gems</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {p.location.split(",")[0]}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Link href={`/profile/${p.username}`}>
            <Button size="sm" className="w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
              View Profile
            </Button>
          </Link>
          {p.isConnected ? (
            <Link href="/messages">
              <Button size="sm" variant="outline" className="w-full">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Message
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" className="w-full">Connect</Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ── Main export ─────────────────────────────────────────────── */
export function DancersClient({ isDancer }: { isDancer: boolean }) {
  const [search, setSearch] = useState("");

  const filteredDancers = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_ALL_DANCERS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.username.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredPatrons = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_ALL_PATRONS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [search]);

  const title = isDancer ? "Discover Patrons" : "Discover Dancers";
  const placeholder = isDancer ? "Search patrons..." : "Search dancers...";
  const items = isDancer ? filteredPatrons : filteredDancers;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No results found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isDancer
            ? (filteredPatrons as typeof MOCK_ALL_PATRONS).map((p) => <PatronCard key={p.id} p={p} />)
            : (filteredDancers as typeof MOCK_ALL_DANCERS).map((d) => <DancerCard key={d.id} d={d} />)}
        </div>
      )}
    </div>
  );
}
