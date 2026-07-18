"use client";

import { useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import { SuggestedUsers } from "@/components/follow/suggested-users";
import type { SuggestedUser } from "@/components/follow/suggested-users";
import type { FeedAuthor, FeedPost } from "@/types/feed";

interface FeedClientProps {
  initialPosts: FeedPost[];
  currentUserId: string;
  role: string;
  currentUser: FeedAuthor;
  followedIds: string[];
  suggestions: SuggestedUser[];
}

export function FeedClient({
  initialPosts,
  currentUserId,
  role,
  currentUser,
  followedIds: initialFollowedIds,
  suggestions,
}: FeedClientProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  // Track locally so new follows immediately affect sort order on next post prepend
  const [followedIds, setFollowedIds] = useState<Set<string>>(
    new Set(initialFollowedIds)
  );

  function handleNewPost(post: FeedPost) {
    setPosts((prev) => [post, ...prev]);
  }

  function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  // When user follows someone from the suggestions, update the local follow set
  // so their posts would be promoted if they exist in the feed already
  function handleSuggestionFollow(userId: string) {
    setFollowedIds((prev) => new Set([...prev, userId]));
  }

  const enrichedSuggestions = suggestions.map((s) => ({
    ...s,
    // Pass through so FollowButton knows the current follow state
  }));

  return (
    <div className="mx-auto max-w-xl space-y-4 pb-8">
      <PostComposer
        currentUser={currentUser}
        currentUserId={currentUserId}
        role={role}
        onPost={handleNewPost}
      />

      {/* Suggested users — shown when following few people */}
      {enrichedSuggestions.length > 0 && (
        <SuggestedUsers
          suggestions={enrichedSuggestions}
          currentUserId={currentUserId}
        />
      )}

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-14 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-red)]/10">
            <Newspaper className="h-6 w-6 text-[var(--brand-red)]" />
          </div>
          <p className="text-sm font-medium">Nothing here yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Share your first photo above, or follow people to see their posts here.
          </p>
          <Link href="/dancers">
            <Button
              size="sm"
              className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]"
            >
              Browse Entertainers
            </Button>
          </Link>
        </div>
      )}

      {/* Post list */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
