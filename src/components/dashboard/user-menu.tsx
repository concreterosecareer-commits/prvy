"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  displayName: string;
  username: string;
  avatarUrl?: string | null;
  variant?: "sidebar" | "topbar";
}

export function UserMenu({ displayName, username, avatarUrl, variant = "sidebar" }: UserMenuProps) {
  const router = useRouter();
  const supabase = useRef(createClient()).current;

  const [localName, setLocalName] = useState(displayName);
  const [localUsername, setLocalUsername] = useState(username);
  const [localAvatar, setLocalAvatar] = useState<string | null>(avatarUrl ?? null);

  // Keep in sync when server re-renders deliver a new avatar_url (e.g. after router.refresh())
  useEffect(() => {
    if (avatarUrl) setLocalAvatar(avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      try {
        const saved = localStorage.getItem(`prvy_profile_${user.id}`);
        if (saved) {
          const p = JSON.parse(saved);
          if (p.displayName) setLocalName(p.displayName);
          if (p.username)    setLocalUsername(p.username);
          if (p.avatarSrc) {
            setLocalAvatar(p.avatarSrc);
            return;
          }
        }
        // No cached avatar — fetch profile picture directly (only avatar_url, not media)
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();
        if (profile?.avatar_url) setLocalAvatar(profile.avatar_url);
      } catch {}
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = localName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "topbar" ? (
          <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-accent">
            <Avatar className="h-9 w-9 ring-2 ring-[var(--brand-red)]/30">
              {localAvatar && <AvatarImage src={localAvatar} alt={localName} />}
              <AvatarFallback className="bg-[var(--brand-red)] text-sm font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden flex-col items-start sm:flex">
              <p className="text-sm font-semibold leading-tight">{localName}</p>
              <p className="text-xs leading-tight text-muted-foreground">@{localUsername}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        ) : (
          <button className="flex w-full items-center gap-3 rounded-xl border-t border-white/10 px-3 py-3 text-left text-white hover:bg-white/5">
            <Avatar className="h-9 w-9">
              {localAvatar && <AvatarImage src={localAvatar} alt={localName} />}
              <AvatarFallback className="bg-[var(--brand-red)] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{localName}</p>
              <p className="truncate text-xs text-white/40">@{localUsername}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-white/40" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => router.push("/account")}>
          <UserIcon className="h-4 w-4" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
