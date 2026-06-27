"use client";

import Link from "next/link";
import { useRef, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Gem, Menu, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { StatusDot } from "@/components/dashboard/status-dot";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { MOCK_ALL_DANCERS, MOCK_ALL_PATRONS } from "@/lib/mock-data";

interface TopbarProps {
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  unreadNotifications?: number;
  role?: string;
}

function SearchBar({ role }: { role?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isDancer = role === "entertainer";
  const pool = isDancer ? MOCK_ALL_PATRONS : MOCK_ALL_DANCERS;
  const placeholder = isDancer ? "Search for Patrons" : "Search for Entertainers";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (pool as Array<{ id: string; name: string; username: string; status: string; avatar?: string }>)
      .filter((p) => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, pool]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSelect(username: string) {
    setQuery("");
    setOpen(false);
    router.push(`/profile/${username}`);
  }

  return (
    <div ref={containerRef} className="relative w-1/3">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query && setOpen(true)}
        placeholder={placeholder}
        className="pl-10"
      />
      {query && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => { setQuery(""); setOpen(false); }}
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border bg-card shadow-lg">
          {results.map((r) => (
            <button
              key={r.id}
              onMouseDown={() => handleSelect(r.username)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-accent"
            >
              <Avatar className="h-8 w-8 shrink-0">
                {r.avatar && <AvatarImage src={r.avatar} alt={r.name} className="object-cover object-top" />}
                <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] text-xs font-semibold">
                  {r.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{r.username}</p>
              </div>
              <StatusDot status={r.status} />
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border bg-card px-4 py-3 shadow-lg">
          <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

export function Topbar({ displayName, username, avatarUrl, unreadNotifications = 0, role }: TopbarProps) {
  return (
    <header className="flex h-16 items-center border-b bg-background px-4 sm:px-6">
      {/* Mobile hamburger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-9 w-9" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-none p-0" showCloseButton={false}>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-10 text-[var(--brand-red)] hover:bg-white/10 hover:text-[var(--brand-red)]"
            >
              <X className="h-9 w-9" />
            </Button>
          </SheetClose>
          <SidebarNav role={role} />
        </SheetContent>
      </Sheet>

      {/* Desktop: search left | [buy gems] bell profile right */}
      <div className="hidden flex-1 items-center justify-between gap-4 lg:flex">
        <SearchBar role={role} />

        <div className="flex items-center gap-3">
          {role !== "entertainer" && (
            <Link href="/buy-gems">
              <Button
                className="h-12 gap-2 px-3 text-white hover:opacity-90"
                style={{ background: "linear-gradient(to right, var(--brand-red), var(--brand-black))" }}
              >
                <Gem className="h-7 w-7" />
                Buy Gems
              </Button>
            </Link>
          )}

          <Link href="/notifications" className="relative">
            <Button variant="ghost" size="icon" className="h-11 w-11">
              <Bell className="h-9 w-9" />
            </Button>
            {unreadNotifications > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-red)] px-1 text-[10px] font-semibold text-white">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <UserMenu displayName={displayName} username={username} avatarUrl={avatarUrl} variant="topbar" />
        </div>
      </div>

      {/* Mobile: right-aligned compact items */}
      <div className="flex flex-1 items-center justify-end gap-2 lg:hidden">
        {role !== "entertainer" && (
          <Link href="/buy-gems">
            <Button
              className="h-12 gap-2 px-3 text-white hover:opacity-90"
              style={{ background: "linear-gradient(to right, var(--brand-red), var(--brand-black))" }}
            >
              <Gem className="h-7 w-7" />
              <span className="hidden sm:inline">Buy Gems</span>
            </Button>
          </Link>
        )}

        <Link href="/notifications" className="relative">
          <Button variant="ghost" size="icon" className="h-11 w-11">
            <Bell className="h-9 w-9" />
          </Button>
          {unreadNotifications > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-red)] px-1 text-[10px] font-semibold text-white">
              {unreadNotifications}
            </span>
          )}
        </Link>

        <UserMenu displayName={displayName} username={username} avatarUrl={avatarUrl} variant="topbar" />
      </div>
    </header>
  );
}
