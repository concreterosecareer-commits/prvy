"use client";

import { useMemo, useState } from "react";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: "sm" | "default";
  className?: string;
}

export function FollowButton({
  targetUserId,
  currentUserId,
  initialIsFollowing,
  onFollowChange,
  size = "default",
  className,
}: FollowButtonProps) {
  const supabase = useMemo(() => createClient(), []);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    try {
      if (wasFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetUserId });
        if (error) throw error;
      }
      onFollowChange?.(!wasFollowing);
    } catch {
      setIsFollowing(wasFollowing);
    } finally {
      setLoading(false);
    }
  }

  const showUnfollowIntent = isFollowing && hovered;

  return (
    <Button
      size={size}
      onClick={toggle}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "min-w-[100px] transition-colors",
        isFollowing
          ? showUnfollowIntent
            ? "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
            : "border border-border bg-muted text-foreground hover:bg-muted"
          : "bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : showUnfollowIntent ? (
        <>
          <UserMinus className="mr-1.5 h-4 w-4" />
          Unfollow
        </>
      ) : isFollowing ? (
        <>
          <UserMinus className="mr-1.5 h-4 w-4 opacity-50" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
