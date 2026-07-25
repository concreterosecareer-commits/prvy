import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DiscoverClient } from "./discover-client";
import type { DiscoverProfile } from "./discover-client";
import type { FollowButtonStatus } from "@/components/follow/follow-button";

export const metadata = { title: "Discover — PRIVY" };

const PAGE_SIZE = 20;
const RECENT_WINDOW_DAYS = 30;

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  /* ── Initial "All" profiles (most followed first) ──────────── */
  const { data: allRows } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, cover_url, bio, location, is_verified, is_private, follower_count"
    )
    .eq("is_private", false)
    .neq("id", user.id)
    .order("follower_count", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  /* ── "Trending" (follower_count > 0, most followed first) ─── */
  const { data: trendingRows } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, cover_url, bio, location, is_verified, is_private, follower_count"
    )
    .eq("is_private", false)
    .neq("id", user.id)
    .gt("follower_count", 0)
    .order("follower_count", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  /* ── "Recent" (users who posted in the last 30 days) ─────── */
  const windowStart = new Date(
    Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: recentPostRows } = await supabase
    .from("posts")
    .select("author_id")
    .eq("is_public", true)
    .gte("created_at", windowStart)
    .order("created_at", { ascending: false })
    .limit(200);

  // Deduplicate and exclude self
  const recentAuthorIds = [
    ...new Set(
      (recentPostRows ?? [])
        .map((r) => r.author_id)
        .filter((id) => id !== user.id)
    ),
  ].slice(0, 40);

  let recentRows: typeof allRows = [];
  if (recentAuthorIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, username, display_name, avatar_url, cover_url, bio, location, is_verified, is_private, follower_count"
      )
      .in("id", recentAuthorIds)
      .eq("is_private", false);

    // Re-sort to match post-recency order
    const order = new Map(recentAuthorIds.map((id, i) => [id, i]));
    recentRows = (data ?? []).sort(
      (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99)
    );
  }

  /* ── Batch-fetch my follow statuses ────────────────────────── */
  const allIds = [
    ...new Set([
      ...(allRows ?? []).map((p) => p.id),
      ...(recentRows ?? []).map((p) => p.id),
      ...(trendingRows ?? []).map((p) => p.id),
    ]),
  ];

  const followMap = new Map<string, FollowButtonStatus>();
  if (allIds.length > 0) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id, status")
      .eq("follower_id", user.id)
      .in("following_id", allIds);

    for (const f of follows ?? []) {
      followMap.set(f.following_id, f.status as FollowButtonStatus);
    }
  }

  function enrich(rows: typeof allRows): DiscoverProfile[] {
    return (rows ?? []).map((p) => ({
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
      followStatus: (followMap.get(p.id) ?? "none") as FollowButtonStatus,
    }));
  }

  return (
    <DiscoverClient
      initialAll={enrich(allRows)}
      initialRecent={enrich(recentRows)}
      initialTrending={enrich(trendingRows)}
      currentUserId={user.id}
      allHasMore={(allRows?.length ?? 0) >= PAGE_SIZE}
      trendingHasMore={(trendingRows?.length ?? 0) >= PAGE_SIZE}
    />
  );
}
