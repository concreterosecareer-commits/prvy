import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FeedClient } from "@/components/feed/feed-client";
import type { FeedAuthor, FeedPost } from "@/types/feed";

export const metadata = { title: "Feed — PRIVY" };

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  /* ── Current user data ─────────────────────────────────── */
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

  /* ── Connected user IDs (for personalised feed) ────────── */
  const { data: connections } = await supabase
    .from("connections")
    .select("patron_id, entertainer_id")
    .or(`patron_id.eq.${user.id},entertainer_id.eq.${user.id}`)
    .eq("status", "active");

  const connectedIds = (connections ?? []).map((c) =>
    c.patron_id === user.id ? c.entertainer_id : c.patron_id
  );

  /* ── Fetch posts ────────────────────────────────────────── */
  // Show: public posts, own posts, posts from active connections
  let postsQuery = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(60);

  if (connectedIds.length > 0) {
    postsQuery = postsQuery.or(
      [
        "is_public.eq.true",
        `author_id.eq.${user.id}`,
        `author_id.in.(${connectedIds.join(",")})`,
      ].join(",")
    );
  } else {
    // No connections yet — show own posts + all public posts
    postsQuery = postsQuery.or(
      `is_public.eq.true,author_id.eq.${user.id}`
    );
  }

  const { data: rawPosts, error: postsError } = await postsQuery;

  /* ── If the posts table doesn't exist yet, show empty feed ─ */
  if (postsError) {
    return (
      <FeedClient
        initialPosts={[]}
        currentUserId={user.id}
        role={role}
        currentUser={currentUser}
      />
    );
  }

  if (!rawPosts || rawPosts.length === 0) {
    return (
      <FeedClient
        initialPosts={[]}
        currentUserId={user.id}
        role={role}
        currentUser={currentUser}
      />
    );
  }

  /* ── Author profiles ────────────────────────────────────── */
  const authorIds = [...new Set(rawPosts.map((p) => p.author_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, is_verified")
    .in("id", authorIds);

  /* ── Likes ──────────────────────────────────────────────── */
  const postIds = rawPosts.map((p) => p.id);

  const { data: likes } = await supabase
    .from("post_likes")
    .select("post_id, user_id")
    .in("post_id", postIds);

  // Build per-post like summary
  const likeMap = (likes ?? []).reduce<
    Record<string, { count: number; likedByMe: boolean }>
  >((acc, l) => {
    if (!acc[l.post_id]) acc[l.post_id] = { count: 0, likedByMe: false };
    acc[l.post_id].count++;
    if (l.user_id === user.id) acc[l.post_id].likedByMe = true;
    return acc;
  }, {});

  /* ── Merge into FeedPost array ──────────────────────────── */
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

  return (
    <FeedClient
      initialPosts={feedPosts}
      currentUserId={user.id}
      role={role}
      currentUser={currentUser}
    />
  );
}
