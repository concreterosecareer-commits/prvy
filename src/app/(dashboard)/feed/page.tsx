import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedClient } from "@/components/feed/feed-client";
import type { FeedAuthor, FeedPost } from "@/types/feed";
import type { SuggestedUser } from "@/components/follow/suggested-users";

export const metadata = { title: "Feed — PRIVY" };

// Show suggestions when the user follows fewer than this many people
const SUGGESTION_THRESHOLD = 5;

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  /* ── Current user ──────────────────────────────────────────── */
  const [{ data: profileRow }, { data: userRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, username, avatar_url, is_verified")
      .eq("id", user.id)
      .single(),
    supabase.from("users").select("role").eq("id", user.id).single(),
  ]);

  const role = userRow?.role ?? "patron";

  const currentUser: FeedAuthor = {
    id: user.id,
    display_name: profileRow?.display_name ?? user.email?.split("@")[0] ?? "You",
    username: profileRow?.username ?? "me",
    avatar_url: profileRow?.avatar_url ?? null,
    is_verified: profileRow?.is_verified ?? false,
  };

  /* ── Who the current user acceptedly follows ──────────────── */
  const { data: followRows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .eq("status", "accepted");

  const followedIds = (followRows ?? []).map((r) => r.following_id);
  const followCount = followedIds.length;

  /* ── Fetch posts ───────────────────────────────────────────── */
  // Show: own posts + public posts + followed users' posts (even private ones)
  let postsQuery = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(80);

  if (followedIds.length > 0) {
    postsQuery = postsQuery.or(
      [
        "is_public.eq.true",
        `author_id.eq.${user.id}`,
        `author_id.in.(${followedIds.join(",")})`,
      ].join(",")
    );
  } else {
    postsQuery = postsQuery.or(`is_public.eq.true,author_id.eq.${user.id}`);
  }

  const { data: rawPosts, error: postsError } = await postsQuery;

  /* ── Empty / error fallback ────────────────────────────────── */
  const emptyResult = async (suggestions: SuggestedUser[]) => (
    <FeedClient
      initialPosts={[]}
      currentUserId={user.id}
      role={role}
      currentUser={currentUser}
      followedIds={followedIds}
      suggestions={suggestions}
    />
  );

  const suggestions = await fetchSuggestions(
    supabase,
    user.id,
    followedIds,
    followCount
  );

  if (postsError || !rawPosts || rawPosts.length === 0) {
    return emptyResult(suggestions);
  }

  /* ── Author profiles ───────────────────────────────────────── */
  const authorIds = [...new Set(rawPosts.map((p) => p.author_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, is_verified")
    .in("id", authorIds);

  /* ── Likes ─────────────────────────────────────────────────── */
  const postIds = rawPosts.map((p) => p.id);

  const { data: likes } = await supabase
    .from("post_likes")
    .select("post_id, user_id")
    .in("post_id", postIds);

  const likeMap = (likes ?? []).reduce<
    Record<string, { count: number; likedByMe: boolean }>
  >((acc, l) => {
    if (!acc[l.post_id]) acc[l.post_id] = { count: 0, likedByMe: false };
    acc[l.post_id].count++;
    if (l.user_id === user.id) acc[l.post_id].likedByMe = true;
    return acc;
  }, {});

  /* ── Build FeedPost[] ─────────────────────────────────────── */
  const followedSet = new Set(followedIds);

  const feedPosts: FeedPost[] = rawPosts.map((p) => {
    const pr = (profiles ?? []).find((x) => x.id === p.author_id);
    const likeInfo = likeMap[p.id] ?? { count: 0, likedByMe: false };
    return {
      ...p,
      author: pr
        ? {
            id: pr.id,
            display_name: pr.display_name ?? "Unknown",
            username: pr.username ?? "unknown",
            avatar_url: pr.avatar_url ?? null,
            is_verified: pr.is_verified ?? false,
          }
        : {
            id: p.author_id,
            display_name: "Unknown",
            username: "unknown",
            avatar_url: null,
            is_verified: false,
          },
      like_count: likeInfo.count,
      is_liked_by_me: likeInfo.likedByMe,
    };
  });

  /* ── Sort: followed users first, then newest ───────────────── */
  const sortedPosts = [
    ...feedPosts.filter(
      (p) => p.author_id === user.id || followedSet.has(p.author_id)
    ),
    ...feedPosts.filter(
      (p) => p.author_id !== user.id && !followedSet.has(p.author_id)
    ),
  ];

  return (
    <FeedClient
      initialPosts={sortedPosts}
      currentUserId={user.id}
      role={role}
      currentUser={currentUser}
      followedIds={followedIds}
      suggestions={suggestions}
    />
  );
}

/* ── Suggested users helper ──────────────────────────────────── */
async function fetchSuggestions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  followedIds: string[],
  followCount: number
): Promise<SuggestedUser[]> {
  if (followCount >= SUGGESTION_THRESHOLD) return [];

  const excluded = [...followedIds, userId];

  // Only suggest public profiles for discovery
  const query = supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_verified, is_private, follower_count")
    .eq("is_private", false)
    .order("follower_count", { ascending: false })
    .limit(20);

  // Exclude already-followed users and self
  if (excluded.length > 0) {
    query.not("id", "in", `(${excluded.join(",")})`);
  }

  const { data } = await query;

  return (data ?? []).slice(0, 8).map((p) => ({
    id: p.id,
    username: p.username ?? "unknown",
    display_name: p.display_name ?? "Unknown",
    avatar_url: p.avatar_url ?? null,
    is_verified: p.is_verified ?? false,
    is_private: false,
    follower_count: p.follower_count ?? 0,
  }));
}
