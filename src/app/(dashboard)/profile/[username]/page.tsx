"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  Lock,
  MapPin,
  Globe,
  Ruler,
  MessageSquare,
  Gift,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusDot } from "@/components/dashboard/status-dot";
import { FollowButton, type FollowButtonStatus } from "@/components/follow/follow-button";
import { FollowListModal } from "@/components/follow/follow-list-modal";
import { PostCard } from "@/components/feed/post-card";
import { createClient } from "@/lib/supabase/client";
import type { FeedPost } from "@/types/feed";

const STATUS_LABEL: Record<string, "Active" | "Away" | "Offline"> = {
  active: "Active",
  away: "Away",
  offline: "Offline",
};

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  location: string | null;
  height: string | null;
  languages: string[] | null;
  rating: number;
  response_rate: number;
  patron_count: number;
  follower_count: number;
  following_count: number;
  earnings_total: number;
  is_verified: boolean;
  is_private: boolean;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userStatus, setUserStatus] = useState<"Active" | "Away" | "Offline">("Offline");
  const [followStatus, setFollowStatus] = useState<FollowButtonStatus>("none");
  const [followerCount, setFollowerCount] = useState(0);
  const [posts, setPosts] = useState<FeedPost[]>([]);

  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setCurrentUserId(user.id);

      // Redirect own profile to /account
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (myProfile?.username === username) {
        router.replace("/account");
        return;
      }

      // Fetch target profile (RLS enforces privacy: private profiles return null for non-followers)
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, avatar_url, cover_url, bio, location, height, languages, rating, response_rate, patron_count, follower_count, following_count, earnings_total, is_verified, is_private"
        )
        .eq("username", username)
        .single();

      // Profile not found OR private and we're blocked
      if (!targetProfile) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(targetProfile as ProfileData);
      setFollowerCount(targetProfile.follower_count ?? 0);

      const [{ data: targetUser }, { data: followRow }] = await Promise.all([
        supabase.from("users").select("status").eq("id", targetProfile.id).single(),
        supabase
          .from("follows")
          .select("status")
          .eq("follower_id", user.id)
          .eq("following_id", targetProfile.id)
          .maybeSingle(),
      ]);

      setUserStatus(STATUS_LABEL[targetUser?.status ?? "offline"] ?? "Offline");

      const fs: FollowButtonStatus = !followRow
        ? "none"
        : (followRow.status as FollowButtonStatus);
      setFollowStatus(fs);

      // Only fetch posts if we can see them (public profile or accepted follower)
      const canSeeContent =
        !targetProfile.is_private || fs === "accepted";

      if (canSeeContent) {
        const { data: rawPosts } = await supabase
          .from("posts")
          .select("*")
          .eq("author_id", targetProfile.id)
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(30);

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

          const author = {
            id: targetProfile.id,
            display_name: targetProfile.display_name,
            username: targetProfile.username,
            avatar_url: targetProfile.avatar_url,
            is_verified: targetProfile.is_verified,
          };

          setPosts(
            rawPosts.map((p) => ({
              ...p,
              author,
              like_count: likeMap[p.id]?.count ?? 0,
              is_liked_by_me: likeMap[p.id]?.likedByMe ?? false,
            }))
          );
        }
      }

      setLoading(false);
    }

    load();
  }, [username, supabase, router]);

  function handleFollowChange(s: FollowButtonStatus) {
    const wasAccepted = followStatus === "accepted";
    const nowAccepted = s === "accepted";
    setFollowStatus(s);
    if (nowAccepted && !wasAccepted) {
      setFollowerCount((c) => c + 1);
    } else if (!nowAccepted && wasAccepted) {
      setFollowerCount((c) => Math.max(0, c - 1));
    }
  }

  function handlePostDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-red)]" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm font-medium">Profile not found</p>
        <p className="text-xs text-muted-foreground">@{username} doesn&apos;t exist.</p>
      </div>
    );
  }

  const initials =
    profile.display_name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const isPrivateLocked =
    profile.is_private &&
    followStatus !== "accepted" &&
    currentUserId !== profile.id;

  return (
    <>
      <div className="space-y-6">
        {/* ── Profile card ──────────────────────────────────────── */}
        <Card className="overflow-hidden rounded-2xl border-none p-0 shadow-sm">
          {/* Cover */}
          <div
            className="relative h-32 overflow-hidden"
            style={
              profile.cover_url
                ? { background: `url(${profile.cover_url}) center/cover no-repeat` }
                : {
                    background:
                      "linear-gradient(135deg, oklch(0.5 0.22 25 / 70%), oklch(0.16 0.01 25))",
                  }
            }
          />

          {/* Avatar + info */}
          <div className="flex flex-wrap items-end gap-4 p-6 pt-0">
            <Avatar className="-mt-12 h-24 w-24 border-4 border-card">
              {profile.avatar_url && (
                <AvatarImage
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="object-cover object-top"
                />
              )}
              <AvatarFallback className="bg-[var(--brand-red)] text-2xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 pt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{profile.display_name}</h1>
                {profile.is_verified && (
                  <BadgeCheck className="h-5 w-5 text-[var(--brand-red)]" />
                )}
                {profile.is_private && (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Lock className="h-3 w-3" /> Private
                  </span>
                )}
                <StatusDot status={userStatus} />
              </div>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.bio && !isPrivateLocked && (
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  {profile.bio}
                </p>
              )}
            </div>

            {currentUserId && (
              <div className="flex flex-wrap items-center gap-2 pt-3">
                <FollowButton
                  targetUserId={profile.id}
                  currentUserId={currentUserId}
                  initialStatus={followStatus}
                  isTargetPrivate={profile.is_private}
                  onStatusChange={handleFollowChange}
                />
                {!isPrivateLocked && (
                  <>
                    <Link href="/messages">
                      <Button variant="outline" className="gap-2">
                        <MessageSquare className="h-4 w-4" /> Message
                      </Button>
                    </Link>
                    <Button variant="outline" className="gap-2">
                      <Gift className="h-4 w-4" /> Send Tip
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 gap-4 border-t px-6 py-4 sm:grid-cols-4">
            <button
              onClick={() => setFollowModal("followers")}
              className="text-left transition-opacity hover:opacity-75"
            >
              <p className="text-lg font-bold">{followerCount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </button>
            <button
              onClick={() => setFollowModal("following")}
              className="text-left transition-opacity hover:opacity-75"
            >
              <p className="text-lg font-bold">
                {profile.following_count.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Following</p>
            </button>
            <div>
              <p className="text-lg font-bold">
                {profile.rating > 0 ? profile.rating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {profile.response_rate > 0 ? `${profile.response_rate}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Response Rate</p>
            </div>
          </div>
        </Card>

        {/* ── Private account lock screen ───────────────────────── */}
        {isPrivateLocked ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">This account is private</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                {followStatus === "pending"
                  ? "Your follow request is pending approval."
                  : "Follow this account to see their photos and posts."}
              </p>
            </div>
          </div>
        ) : (
          /* ── Tabs ─────────────────────────────────────────────── */
          <Tabs defaultValue={posts.length > 0 ? "posts" : "about"}>
            <TabsList>
              <TabsTrigger value="posts">
                Posts {posts.length > 0 && `(${posts.length})`}
              </TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="rates">Rates</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4">
              {posts.length === 0 ? (
                <Card className="rounded-2xl border-none p-8 shadow-sm">
                  <p className="text-center text-sm text-muted-foreground">
                    No posts yet.
                  </p>
                </Card>
              ) : (
                <div className="max-w-xl space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUserId ?? ""}
                      onDelete={handlePostDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                <Card className="rounded-2xl border-none p-5 shadow-sm">
                  <h2 className="mb-3 font-semibold">About Me</h2>
                  <p className="text-sm text-muted-foreground">
                    {profile.bio || "No bio yet."}
                  </p>
                </Card>
                <Card className="rounded-2xl border-none p-5 shadow-sm">
                  <h2 className="mb-3 font-semibold">Info</h2>
                  <div className="space-y-3 text-sm">
                    {profile.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" /> {profile.location}
                      </div>
                    )}
                    {profile.languages?.[0] && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4 shrink-0" />{" "}
                        {profile.languages[0]}
                      </div>
                    )}
                    {profile.height && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Ruler className="h-4 w-4 shrink-0" /> {profile.height}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rates" className="mt-4">
              <Card className="rounded-2xl border-none p-5 shadow-sm">
                <div className="divide-y text-sm">
                  <div className="flex justify-between py-2">
                    <span>Private Chat (1hr)</span>
                    <span className="font-semibold">500 Gems</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Video Call (30min)</span>
                    <span className="font-semibold">1,200 Gems</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Custom Content</span>
                    <span className="font-semibold">From 800 Gems</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="mt-4">
              <Card className="rounded-2xl border-none p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">
                  {profile.display_name} is currently{" "}
                  <StatusDot status={userStatus} className="inline-flex" />{" "}
                  {userStatus.toLowerCase()} and typically responds within a few
                  minutes.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Followers / Following modals */}
      {currentUserId && (
        <>
          <FollowListModal
            open={followModal === "followers"}
            onClose={() => setFollowModal(null)}
            targetUserId={profile.id}
            currentUserId={currentUserId}
            type="followers"
            title={`Followers · ${followerCount.toLocaleString()}`}
          />
          <FollowListModal
            open={followModal === "following"}
            onClose={() => setFollowModal(null)}
            targetUserId={profile.id}
            currentUserId={currentUserId}
            type="following"
            title={`Following · ${profile.following_count.toLocaleString()}`}
          />
        </>
      )}
    </>
  );
}
