"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, MoreHorizontal, Trash2, BadgeCheck, Ticket, CalendarClock } from "lucide-react";
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

/* ── Promo helpers ────────────────────────────────────────────── */

function promoExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

function formatExpiry(expiresAt: string): string {
  const target = new Date(expiresAt);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return "Expired";

  const diffH = Math.ceil(diffMs / (1000 * 60 * 60));
  if (diffH < 24) return `Expires in ${diffH}h`;

  const diffD = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffD === 1) return "Expires tomorrow";
  if (diffD <= 7) return `Expires in ${diffD}d`;

  return `Expires ${target.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

/* ── Component ────────────────────────────────────────────────── */

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

  const isPromo = post.type === "club" && !!post.promotion_title;
  const expired = isPromo && !!post.expires_at && promoExpired(post.expires_at);
  const expiryLabel = isPromo && post.expires_at ? formatExpiry(post.expires_at) : null;

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
    <article
      className={cn(
        "overflow-hidden rounded-2xl bg-card shadow-sm",
        isPromo && "ring-1 ring-[var(--brand-red)]/20"
      )}
    >
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

      {/* ── Promotion banner ────────────────────────────────── */}
      {isPromo && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 border-y px-4 py-2.5",
            expired
              ? "border-border/60 bg-muted/40"
              : "border-[var(--brand-red)]/20 bg-[var(--brand-red)]/6"
          )}
        >
          {/* Title + icon */}
          <div className="flex min-w-0 items-center gap-2">
            <Ticket
              className={cn(
                "h-4 w-4 shrink-0",
                expired ? "text-muted-foreground" : "text-[var(--brand-red)]"
              )}
            />
            <span
              className={cn(
                "truncate text-sm font-bold tracking-tight",
                expired && "text-muted-foreground line-through"
              )}
            >
              {post.promotion_title}
            </span>
          </div>

          {/* Expiry badge */}
          {expiryLabel && (
            <span
              className={cn(
                "shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                expired
                  ? "bg-muted text-muted-foreground"
                  : "bg-[var(--brand-red)]/10 text-[var(--brand-red)]"
              )}
            >
              <CalendarClock className="h-3 w-3" />
              {expiryLabel}
            </span>
          )}
        </div>
      )}

      {/* ── Image ───────────────────────────────────────────── */}
      <div className="relative">
        {!imgError ? (
          <img
            src={post.image_url}
            alt={post.promotion_title ?? post.caption ?? "Post image"}
            className={cn(
              "w-full object-cover",
              expired && "opacity-50 grayscale-[40%]"
            )}
            style={{ maxHeight: "min(600px, 80vw)" }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            Image unavailable
          </div>
        )}

        {/* Expired overlay */}
        {expired && !imgError && (
          <div className="absolute inset-0 flex items-end justify-start p-3">
            <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
              Promotion ended
            </span>
          </div>
        )}
      </div>

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
