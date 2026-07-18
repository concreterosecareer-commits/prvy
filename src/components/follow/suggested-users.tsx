"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Lock, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/follow/follow-button";

export interface SuggestedUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  is_private: boolean;
  follower_count: number;
}

interface SuggestedUsersProps {
  suggestions: SuggestedUser[];
  currentUserId: string;
}

export function SuggestedUsers({ suggestions, currentUserId }: SuggestedUsersProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = suggestions.filter((u) => !dismissed.has(u.id));
  if (visible.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Suggested for you
      </p>
      <ul className="space-y-3">
        {visible.map((u) => (
          <li key={u.id} className="flex items-center gap-3">
            <Link href={`/profile/${u.username}`} className="shrink-0">
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
              <div className="flex items-center gap-1">
                <Link
                  href={`/profile/${u.username}`}
                  className="truncate text-sm font-semibold hover:underline"
                >
                  {u.display_name}
                </Link>
                {u.is_verified && (
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[var(--brand-red)]" />
                )}
                {u.is_private && (
                  <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {u.follower_count > 0
                  ? `${u.follower_count.toLocaleString()} follower${u.follower_count !== 1 ? "s" : ""}`
                  : `@${u.username}`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <FollowButton
                targetUserId={u.id}
                currentUserId={currentUserId}
                initialStatus="none"
                isTargetPrivate={u.is_private}
                onStatusChange={(s) => {
                  if (s === "accepted") {
                    setTimeout(
                      () => setDismissed((prev) => new Set([...prev, u.id])),
                      600
                    );
                  }
                }}
                size="sm"
              />
              <button
                onClick={() =>
                  setDismissed((prev) => new Set([...prev, u.id]))
                }
                aria-label="Dismiss suggestion"
                className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
