"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PostComposer } from "@/components/feed/post-composer";
import { PostCard } from "@/components/feed/post-card";
import type { FeedAuthor, FeedPost } from "@/types/feed";

interface ClubPostsClientProps {
  clubAuthor: FeedAuthor;
  currentUserId: string;
  initialPosts: FeedPost[];
}

export function ClubPostsClient({
  clubAuthor,
  currentUserId,
  initialPosts,
}: ClubPostsClientProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);

  function handlePost(newPost: FeedPost) {
    setPosts((prev) => [newPost, ...prev]);
  }

  function handleDelete(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Posts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish and manage your club&apos;s promotional posts.
        </p>
      </div>

      <PostComposer
        currentUser={clubAuthor}
        currentUserId={currentUserId}
        role="club"
        onPost={handlePost}
      />

      {posts.length === 0 ? (
        <Card className="rounded-2xl border-none p-12 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <Images className="h-12 w-12 text-muted-foreground/30" />
            <p className="font-medium">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              Share your first promotional photo above.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
