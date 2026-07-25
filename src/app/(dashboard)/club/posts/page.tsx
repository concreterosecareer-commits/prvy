import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClubPostsClient } from "./club-posts-client";
import type { FeedAuthor, FeedPost } from "@/types/feed";

export const metadata = { title: "My Posts — PRIVY" };

export default async function ClubPostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Gate: only clubs can access this page
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "club") redirect("/feed");

  // Fetch club profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url, is_verified")
    .eq("id", user.id)
    .single();

  const clubAuthor: FeedAuthor = {
    id: user.id,
    display_name: profile?.display_name ?? "Club",
    username: profile?.username ?? "club",
    avatar_url: profile?.avatar_url ?? null,
    is_verified: profile?.is_verified ?? false,
  };

  // Fetch existing posts
  const { data: rawPosts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  let initialPosts: FeedPost[] = [];

  if (rawPosts && rawPosts.length > 0) {
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

    initialPosts = rawPosts.map((p) => ({
      ...p,
      author: clubAuthor,
      like_count: likeMap[p.id]?.count ?? 0,
      is_liked_by_me: likeMap[p.id]?.likedByMe ?? false,
    }));
  }

  return (
    <ClubPostsClient
      clubAuthor={clubAuthor}
      currentUserId={user.id}
      initialPosts={initialPosts}
    />
  );
}
