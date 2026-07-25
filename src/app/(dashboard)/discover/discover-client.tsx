"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Users,
  BadgeCheck,
  Loader2,
  Compass,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  FollowButton,
  type FollowButtonStatus,
} from "@/components/follow/follow-button";

export interface DiscoverProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  is_verified: boolean;
  is_private: boolean;
  follower_count: number;
  followStatus: FollowButtonStatus;
}

type Tab = "all" | "recent" | "trending";

const PAGE_SIZE = 20;

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recently Active" },
  { id: "trending", label: "Trending" },
];

interface DiscoverClientProps {
  initialAll: DiscoverProfile[];
  initialRecent: DiscoverProfile[];
  initialTrending: DiscoverProfile[];
  currentUserId: string;
  allHasMore: boolean;
  trendingHasMore: boolean;
}

export function DiscoverClient({
  initialAll,
  initialRecent,
  initialTrending,
  currentUserId,
  allHasMore,
  trendingHasMore,
}: DiscoverClientProps) {
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState<Tab>("all");

  const [tabProfiles, setTabProfiles] = useState<Record<Tab, DiscoverProfile[]>>({
    all: initialAll,
    recent: initialRecent,
    trending: initialTrending,
  });
  const [tabHasMore, setTabHasMore] = useState<Record<Tab, boolean>>({
    all: allHasMore,
    recent: false,
    trending: trendingHasMore,
  });
  const [tabOffset, setTabOffset] = useState<Record<Tab, number>>({
    all: initialAll.length,
    recent: 0,
    trending: initialTrending.length,
  });
  const [tabLoaded, setTabLoaded] = useState<Record<Tab, boolean>>({
    all: true,
    recent: true,
    trending: true,
  });

  const [paginationLoading, setPaginationLoading] = useState(false);

  // Search
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState<DiscoverProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isSearchMode = debouncedSearch.trim().length > 0;

  /* ── Debounce search input ──────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* ── Perform search when query changes ──────────────────────── */
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setSearchDone(false);
      return;
    }

    let cancelled = false;
    setSearchLoading(true);
    setSearchDone(false);

    (async () => {
      const q = debouncedSearch.trim();
      const { data: rows } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, cover_url, bio, location, is_verified, is_private, follower_count"
        )
        .eq("is_private", false)
        .neq("id", currentUserId)
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .order("follower_count", { ascending: false })
        .limit(30);

      if (cancelled) return;

      if (!rows || rows.length === 0) {
        setSearchResults([]);
        setSearchLoading(false);
        setSearchDone(true);
        return;
      }

      const ids = rows.map((p) => p.id);
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id, status")
        .eq("follower_id", currentUserId)
        .in("following_id", ids);

      if (cancelled) return;

      const followMap = new Map(
        (follows ?? []).map((f) => [f.following_id, f.status as FollowButtonStatus])
      );

      setSearchResults(
        rows.map((p) => ({
          id: p.id,
          username: p.username ?? "unknown",
          display_name: p.display_name ?? "Unknown",
          avatar_url: p.avatar_url ?? null,
          cover_url: p.cover_url ?? null,
          bio: p.bio ?? null,
          location: p.location ?? null,
          is_verified: p.is_verified ?? false,
          is_private: false,
          follower_count: p.follower_count ?? 0,
          followStatus: followMap.get(p.id) ?? "none",
        }))
      );
      setSearchLoading(false);
      setSearchDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, currentUserId, supabase]);

  /* ── Load more profiles for a tab ──────────────────────────── */
  const loadMore = useCallback(async () => {
    if (paginationLoading || activeTab === "recent" || !tabHasMore[activeTab]) return;

    setPaginationLoading(true);
    try {
      const offset = tabOffset[activeTab];

      let query = supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, cover_url, bio, location, is_verified, is_private, follower_count"
        )
        .eq("is_private", false)
        .neq("id", currentUserId)
        .order("follower_count", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (activeTab === "trending") {
        query = query.gt("follower_count", 0);
      }

      const { data: rows } = await query;

      if (!rows || rows.length === 0) {
        setTabHasMore((prev) => ({ ...prev, [activeTab]: false }));
        return;
      }

      const ids = rows.map((p) => p.id);
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id, status")
        .eq("follower_id", currentUserId)
        .in("following_id", ids);

      const followMap = new Map(
        (follows ?? []).map((f) => [f.following_id, f.status as FollowButtonStatus])
      );

      const newProfiles: DiscoverProfile[] = rows.map((p) => ({
        id: p.id,
        username: p.username ?? "unknown",
        display_name: p.display_name ?? "Unknown",
        avatar_url: p.avatar_url ?? null,
        cover_url: p.cover_url ?? null,
        bio: p.bio ?? null,
        location: p.location ?? null,
        is_verified: p.is_verified ?? false,
        is_private: false,
        follower_count: p.follower_count ?? 0,
        followStatus: followMap.get(p.id) ?? "none",
      }));

      setTabProfiles((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], ...newProfiles],
      }));
      setTabOffset((prev) => ({ ...prev, [activeTab]: offset + rows.length }));
      setTabHasMore((prev) => ({
        ...prev,
        [activeTab]: rows.length >= PAGE_SIZE,
      }));
    } finally {
      setPaginationLoading(false);
    }
  }, [activeTab, paginationLoading, tabHasMore, tabOffset, currentUserId, supabase]);

  /* ── IntersectionObserver for infinite scroll ───────────────── */
  useEffect(() => {
    if (isSearchMode) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isSearchMode, loadMore]);

  /* ── Tab loading state (all tabs pre-loaded from server) ────── */
  const currentProfiles = isSearchMode ? searchResults : tabProfiles[activeTab];
  const isLoading = isSearchMode ? searchLoading : !tabLoaded[activeTab];
  const canLoadMore = !isSearchMode && tabHasMore[activeTab] && activeTab !== "recent";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Discover</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find and connect with public profiles
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or username…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs (hidden during search) */}
      {!isSearchMode && (
        <div className="mb-5 flex gap-1 border-b">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === t.id
                  ? "border-b-2 border-[var(--brand-red)] text-[var(--brand-red)] -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Search: no results */}
      {isSearchMode && searchDone && searchResults.length === 0 && !searchLoading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No public profiles found for &ldquo;{debouncedSearch}&rdquo;
          </p>
        </div>
      )}

      {/* Empty tab state */}
      {!isSearchMode && !isLoading && currentProfiles.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Compass className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {activeTab === "recent"
              ? "No recently active users found."
              : activeTab === "trending"
              ? "No trending profiles yet."
              : "No public profiles found."}
          </p>
        </div>
      )}

      {/* Profile list */}
      {!isLoading && currentProfiles.length > 0 && (
        <ul className="divide-y">
          {currentProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              currentUserId={currentUserId}
            />
          ))}
        </ul>
      )}

      {/* Infinite scroll sentinel */}
      {!isSearchMode && (
        <div ref={sentinelRef} className="h-1" />
      )}

      {/* Pagination loading */}
      {paginationLoading && (
        <div className="flex h-12 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* End of list */}
      {!isSearchMode && !canLoadMore && !paginationLoading && currentProfiles.length > 0 && activeTab !== "recent" && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          You&apos;ve seen all public profiles.
        </p>
      )}
    </div>
  );
}

/* ── Profile card ─────────────────────────────────────────────── */
function ProfileCard({
  profile,
  currentUserId,
}: {
  profile: DiscoverProfile;
  currentUserId: string;
}) {
  const [followStatus, setFollowStatus] = useState<FollowButtonStatus>(
    profile.followStatus
  );

  return (
    <li className="flex items-start gap-4 py-4">
      {/* Avatar */}
      <Link href={`/profile/${profile.username}`} className="shrink-0">
        <Avatar className="h-12 w-12 ring-2 ring-background">
          {profile.avatar_url && (
            <AvatarImage
              src={profile.avatar_url}
              alt={profile.display_name}
              className="object-cover object-top"
            />
          )}
          <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] text-sm font-semibold">
            {(profile.display_name?.[0] ?? "?").toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <Link
            href={`/profile/${profile.username}`}
            className="truncate font-semibold leading-tight hover:underline"
          >
            {profile.display_name}
          </Link>
          {profile.is_verified && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--brand-red)]" />
          )}
        </div>

        <p className="text-sm text-muted-foreground">@{profile.username}</p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {profile.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatCount(profile.follower_count)}{" "}
            {profile.follower_count === 1 ? "follower" : "followers"}
          </span>
        </div>

        {profile.bio && (
          <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Follow button */}
      <div className="shrink-0 pt-0.5">
        <FollowButton
          targetUserId={profile.id}
          currentUserId={currentUserId}
          initialStatus={followStatus}
          isTargetPrivate={false}
          onStatusChange={setFollowStatus}
          size="sm"
        />
      </div>
    </li>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */
function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
