"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, MoreHorizontal, Trash2, BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { FeedPost } from "@/types/feed";

interface PostCardProps {
  post: FeedPost;
  currentUserId: string;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const supabase = useMemo(() => createClient(), []);
  const [liked, setLiked] = useState(post.is_liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [imgError, setImgError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isOwn = post.author_id === currentUserId;
  const CAPTION_LIMIT = 125;
  const captionLong = (post.caption?.length ?? 0) > CAPTION_LIMIT;
  const captionDisplay =
    captionLong && !expanded
      ? post.caption!.slice(0, CAPTION_LIMIT).trimEnd() + "…"
      : post.caption;

  async function toggleLike() {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    if (wasLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);
    } else {
      await supabase
        .from("post_likes")
        .insert({ post_id: post.id, user_id: currentUserId });
    }
  }

  async function deletePost() {
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) onDelete?.(post.id);
  }

  return (
    <article className="overflow-hidden rounded-2xl bg-card shadow-sm">
      {/* ── Author header ───────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          <Avatar className="h-9 w-9">
            {post.author.avatar_url && (
              <AvatarImage
                src={post.author.avatar_url}
                alt={post.author.display_name}
                className="object-cover object-top"
              />
            )}
            <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] text-sm font-semibold">
              {(post.author.display_name?.[0] ?? "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Link
              href={`/profile/${post.author.username}`}
              className="truncate text-sm font-semibold hover:underline"
            >
              {post.author.display_name}
            </Link>
            {post.author.is_verified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[var(--brand-red)]" />
            )}
            {post.type === "club" && (
              <span className="rounded-sm bg-[var(--brand-red)]/10 px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-red)]">
                Club
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            @{post.author.username} · {formatRelativeDate(post.created_at)}
          </p>
        </div>

        {isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={deletePost}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* ── Image ───────────────────────────────────────────── */}
      {!imgError ? (
        <img
          src={post.image_url}
          alt={post.caption ?? "Post image"}
          className="w-full object-cover"
          style={{ maxHeight: "min(600px, 80vw)" }}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
          Image unavailable
        </div>
      )}

      {/* ── Actions + Caption ───────────────────────────────── */}
      <div className="px-4 pb-4 pt-3 space-y-2">
        {/* Like row */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
            className="group -ml-1 rounded-full p-1 transition-transform active:scale-90"
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                liked
                  ? "fill-[var(--brand-red)] text-[var(--brand-red)]"
                  : "text-muted-foreground group-hover:text-[var(--brand-red)]"
              )}
            />
          </button>
          {likeCount > 0 && (
            <span className="text-sm font-medium">
              {likeCount.toLocaleString()}
            </span>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm leading-snug">
            <Link
              href={`/profile/${post.author.username}`}
              className="mr-1 font-semibold hover:underline"
            >
              {post.author.username}
            </Link>
            {captionDisplay}
            {captionLong && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                more
              </button>
            )}
          </p>
        )}
      </div>
    </article>
  );
}
