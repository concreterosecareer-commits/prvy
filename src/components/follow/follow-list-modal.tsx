"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton, type FollowButtonStatus } from "@/components/follow/follow-button";
import { createClient } from "@/lib/supabase/client";

interface FollowUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  is_private: boolean;
}

interface FollowListModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  currentUserId: string;
  type: "followers" | "following";
  title: string;
}

export function FollowListModal({
  open,
  onClose,
  targetUserId,
  currentUserId,
  type,
  title,
}: FollowListModalProps) {
  const supabase = useMemo(() => createClient(), []);
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [statusMap, setStatusMap] = useState<Map<string, FollowButtonStatus>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function load() {
      setLoading(true);
      try {
        // Fetch accepted follows in the requested direction
        const sourceCol = type === "followers" ? "follower_id" : "following_id";
        const filterCol = type === "followers" ? "following_id" : "follower_id";

        const { data: followRows } = await supabase
          .from("follows")
          .select(sourceCol)
          .eq(filterCol, targetUserId)
          .eq("status", "accepted")
          .order("created_at", { ascending: false })
          .limit(200);

        const ids = (followRows ?? []).map(
          (r) => (r as Record<string, string>)[sourceCol]
        );

        if (ids.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Profiles + my follow status for each person in the list
        const [{ data: profiles }, { data: myFollows }] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url, is_verified, is_private")
            .in("id", ids),
          supabase
            .from("follows")
            .select("following_id, status")
            .eq("follower_id", currentUserId)
            .in("following_id", ids),
        ]);

        const profileMap = new Map(
          (profiles ?? []).map((p) => [p.id, p as FollowUser])
        );
        const followMap = new Map(
          (myFollows ?? []).map((f) => [f.following_id, f.status as FollowButtonStatus])
        );

        setUsers(
          ids
            .map((id) => profileMap.get(id))
            .filter(Boolean) as FollowUser[]
        );

        const sm = new Map<string, FollowButtonStatus>();
        ids.forEach((id) => sm.set(id, followMap.get(id) ?? "none"));
        setStatusMap(sm);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open, targetUserId, currentUserId, type, supabase]);

  function handleStatusChange(userId: string, s: FollowButtonStatus) {
    setStatusMap((prev) => new Map([...prev, [userId, s]]));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex-1 overflow-y-auto px-6">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {type === "followers" ? "No followers yet." : "Not following anyone yet."}
            </p>
          ) : (
            <ul className="divide-y">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 py-3">
                  <Link
                    href={`/profile/${u.username}`}
                    onClick={onClose}
                    className="shrink-0"
                  >
                    <Avatar className="h-10 w-10">
                      {u.avatar_url && (
                        <AvatarImage
                          src={u.avatar_url}
                          alt={u.display_name}
                          className="object-cover object-top"
                        />
                      )}
                      <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] font-semibold">
                        {(u.display_name?.[0] ?? "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/profile/${u.username}`}
                      onClick={onClose}
                      className="block truncate text-sm font-semibold hover:underline"
                    >
                      {u.display_name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      @{u.username}
                    </p>
                  </div>

                  {u.id !== currentUserId && (
                    <FollowButton
                      targetUserId={u.id}
                      currentUserId={currentUserId}
                      initialStatus={statusMap.get(u.id) ?? "none"}
                      isTargetPrivate={u.is_private}
                      onStatusChange={(s) => handleStatusChange(u.id, s)}
                      size="sm"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
