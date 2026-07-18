"use client";

import { useMemo, useState } from "react";
import { UserPlus, UserMinus, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { FollowStatus } from "@/types/database";

/** null = not following, 'pending' = request sent, 'accepted' = following */
export type FollowButtonStatus = FollowStatus | "none";

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  initialStatus: FollowButtonStatus;
  /** Whether the target profile is private — drives optimistic pending vs accepted UI */
  isTargetPrivate?: boolean;
  onStatusChange?: (status: FollowButtonStatus) => void;
  size?: "sm" | "default";
  className?: string;
}

export function FollowButton({
  targetUserId,
  currentUserId,
  initialStatus,
  isTargetPrivate = false,
  onStatusChange,
  size = "default",
  className,
}: FollowButtonProps) {
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<FollowButtonStatus>(initialStatus);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    const prev = status;

    try {
      if (status === "none") {
        // Optimistically predict accepted vs pending based on is_private.
        // The DB trigger will set the real status; we just want the right UI.
        const optimistic: FollowButtonStatus = isTargetPrivate ? "pending" : "accepted";
        setStatus(optimistic);
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: currentUserId, following_id: targetUserId });
        if (error) throw error;
        onStatusChange?.(optimistic);
      } else {
        // Cancel request OR unfollow — both are a DELETE
        setStatus("none");
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);
        if (error) throw error;
        onStatusChange?.("none");
      }
    } catch {
      setStatus(prev);
    } finally {
      setLoading(false);
    }
  }

  const showUnfollowLabel = status === "accepted" && hovered;

  return (
    <Button
      size={size}
      onClick={handleClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "min-w-[108px] transition-colors",
        status === "none"
          ? "bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]"
          : status === "pending"
          ? "border border-border bg-muted text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          : showUnfollowLabel
          ? "border border-destructive/40 bg-destructive/10 text-destructive"
          : "border border-border bg-muted text-foreground hover:bg-muted",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === "none" ? (
        <>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Follow
        </>
      ) : status === "pending" ? (
        <>
          <Clock className="mr-1.5 h-4 w-4" />
          {hovered ? "Cancel" : "Requested"}
        </>
      ) : showUnfollowLabel ? (
        <>
          <UserMinus className="mr-1.5 h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserMinus className="mr-1.5 h-4 w-4 opacity-40" />
          Following
        </>
      )}
    </Button>
  );
}
