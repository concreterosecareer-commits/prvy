"use client";

import { useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import type { FeedAuthor, FeedPost } from "@/types/feed";

interface FeedClientProps {
  initialPosts: FeedPost[];
  currentUserId: string;
  role: string;
  currentUser: FeedAuthor;
}

export function FeedClient({
  initialPosts,
  currentUserId,
  role,
  currentUser,
}: FeedClientProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);

  function handleNewPost(post: FeedPost) {
    setPosts((prev) => [post, ...prev]);
  }

  function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 pb-8">
      <PostComposer
        currentUser={currentUser}
        currentUserId={currentUserId}
        role={role}
        onPost={handleNewPost}
      />

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-14 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-red)]/10">
            <Newspaper className="h-6 w-6 text-[var(--brand-red)]" />
          </div>
          <p className="text-sm font-medium">Nothing here yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Share your first photo above, or browse the platform to connect with others.
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
