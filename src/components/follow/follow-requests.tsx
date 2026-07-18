"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeDate } from "@/lib/format";

interface PendingRequest {
  follower_id: string;
  created_at: string;
  profile: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

interface FollowRequestsProps {
  currentUserId: string;
}

export function FollowRequests({ currentUserId }: FollowRequestsProps) {
  const supabase = useMemo(() => createClient(), []);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("follows")
        .select("follower_id, created_at")
        .eq("following_id", currentUserId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!data || data.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const ids = data.map((r) => r.follower_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", ids);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, p])
      );

      setRequests(
        data.map((r) => ({
          follower_id: r.follower_id,
          created_at: r.created_at,
          profile: profileMap.get(r.follower_id) ?? null,
        }))
      );
      setLoading(false);
    }

    load();

    // Subscribe to new follow requests
    const channel = supabase
      .channel("follow-requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "follows",
          filter: `following_id=eq.${currentUserId}`,
        },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, supabase]);

  async function accept(followerId: string) {
    setActing(followerId);
    await supabase
      .from("follows")
      .update({ status: "accepted" })
      .eq("follower_id", followerId)
      .eq("following_id", currentUserId);
    setRequests((prev) => prev.filter((r) => r.follower_id !== followerId));
    setActing(null);
  }

  async function decline(followerId: string) {
    setActing(followerId);
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", currentUserId);
    setRequests((prev) => prev.filter((r) => r.follower_id !== followerId));
    setActing(null);
  }

  if (loading) {
    return (
      <div className="flex h-16 items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <UserCheck className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No pending follow requests.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {requests.map((req) => {
        const p = req.profile;
        const isActing = acting === req.follower_id;
        return (
          <li key={req.follower_id} className="flex items-center gap-3 py-3">
            <Link href={p ? `/profile/${p.username}` : "#"} className="shrink-0">
              <Avatar className="h-10 w-10">
                {p?.avatar_url && (
                  <AvatarImage
                    src={p.avatar_url}
                    alt={p.display_name}
                    className="object-cover object-top"
                  />
                )}
                <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] font-semibold">
                  {(p?.display_name?.[0] ?? "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={p ? `/profile/${p.username}` : "#"}
                className="block truncate text-sm font-semibold hover:underline"
              >
                {p?.display_name ?? "Unknown"}
              </Link>
              <p className="text-xs text-muted-foreground">
                {p ? `@${p.username}` : ""} · {formatRelativeDate(req.created_at)}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                disabled={isActing}
                onClick={() => accept(req.follower_id)}
                className="h-8 bg-[var(--brand-red)] px-3 text-white hover:bg-[var(--brand-red-dark)]"
              >
                {isActing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isActing}
                onClick={() => decline(req.follower_id)}
                className="h-8 px-3"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
