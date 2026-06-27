"use client";

import { useState } from "react";
import { Eye, ShieldOff, ShieldCheck, Ban, CircleSlash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MOCK_USERS_TABLE } from "@/lib/mock-admin-data";

/* ─── types ───────────────────────────────────────────────── */

type UserRow = (typeof MOCK_USERS_TABLE)[number] & { status: string };

const STATUS_STYLES: Record<string, string> = {
  Active:    "bg-emerald-500/10 text-emerald-600",
  Suspended: "bg-amber-500/10  text-amber-600",
  Pending:   "bg-sky-500/10    text-sky-600",
  Banned:    "bg-destructive/10 text-destructive",
};

const ROLE_STYLES: Record<string, string> = {
  Entertainer: "bg-[var(--brand-red)]/10 text-[var(--brand-red)]",
  Patron:      "bg-sky-500/10 text-sky-600",
  Admin:       "bg-purple-500/10 text-purple-600",
};

/* ─── mock extra profile data ─────────────────────────────── */

const MOCK_PROFILE: Record<string, { email: string; location: string; gems: number; sessions: number }> = {
  "1": { email: "sasha@example.com",  location: "Houston, TX",  gems: 1200, sessions: 47  },
  "2": { email: "janet@example.com",  location: "Atlanta, GA",  gems: 8400, sessions: 130 },
  "3": { email: "sapphire@prvy.com",  location: "Dallas, TX",   gems: 6200, sessions: 98  },
  "4": { email: "davidm@example.com", location: "Austin, TX",   gems: 340,  sessions: 12  },
  "5": { email: "jules@example.com",  location: "Miami, FL",    gems: 2100, sessions: 55  },
  "6": { email: "marcus@example.com", location: "Chicago, IL",  gems: 900,  sessions: 31  },
  "7": { email: "luna@prvy.com",      location: "Las Vegas, NV", gems: 5500, sessions: 88  },
  "8": { email: "brianw@example.com", location: "Phoenix, AZ",  gems: 50,   sessions: 3   },
};

/* ─── user profile sheet ──────────────────────────────────── */

function UserProfileSheet({
  user,
  open,
  onClose,
}: {
  user: UserRow | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!user) return null;
  const profile = MOCK_PROFILE[user.id] ?? { email: `${user.username}@example.com`, location: "Unknown", gems: 0, sessions: 0 };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="px-8 pt-8 pb-6">
          <SheetTitle className="text-lg">User Profile</SheetTitle>
          <SheetDescription>Account details for @{user.username}</SheetDescription>
        </SheetHeader>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-4 px-8 pb-8 border-b">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} alt={user.name} className="object-cover object-top" />
            <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] text-3xl font-bold">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">@{user.username}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className={`text-xs ${ROLE_STYLES[user.role] ?? ""}`}>
              {user.role === "Entertainer" ? "Entertainer" : user.role}
            </Badge>
            <Badge variant="secondary" className={`text-xs ${STATUS_STYLES[user.status] ?? ""}`}>
              {user.status}
            </Badge>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 px-8 py-8 border-b">
          {[
            { label: "Email",     value: profile.email     },
            { label: "Location",  value: profile.location  },
            { label: "Joined",    value: user.joined        },
            { label: "User ID",   value: `#${user.id.padStart(6, "0")}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-semibold break-all">{value}</p>
            </div>
          ))}
        </div>

        {/* Activity stats */}
        <div className="grid grid-cols-2 gap-4 px-8 py-8">
          <div className="rounded-2xl bg-muted/50 p-6 text-center">
            <p className="text-3xl font-bold">{profile.gems.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Gems</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-6 text-center">
            <p className="text-3xl font-bold">{profile.sessions}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Sessions</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── main component ──────────────────────────────────────── */

export function UserManagementTable({ limit = 6 }: { limit?: number }) {
  const [users, setUsers]           = useState<UserRow[]>(MOCK_USERS_TABLE);
  const [selected, setSelected]     = useState<UserRow | null>(null);
  const [sheetOpen, setSheetOpen]   = useState(false);

  const openProfile = (u: UserRow) => { setSelected(u); setSheetOpen(true); };

  const suspend = (id: string) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "Suspended" } : u));

  const unsuspend = (id: string) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "Active" } : u));

  const ban = (id: string) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "Banned" } : u));

  const unban = (id: string) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "Active" } : u));

  const displayed = users.slice(0, limit);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-9 px-5 text-[11px] font-semibold uppercase tracking-wide">User</TableHead>
            <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide">Role</TableHead>
            <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide">Status</TableHead>
            <TableHead className="h-9 pr-5 text-right text-[11px] font-semibold uppercase tracking-wide">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayed.map((u) => {
            const isSuspended = u.status === "Suspended";
            const isBanned    = u.status === "Banned";

            return (
              <TableRow key={u.id} className="hover:bg-muted/30">
                <TableCell className="px-5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={u.avatar} alt={u.name} className="object-cover object-top" />
                      <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)] text-xs font-bold">
                        {u.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-tight">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge variant="secondary" className={`text-[10px] ${ROLE_STYLES[u.role] ?? ""}`}>
                    {u.role === "Entertainer" ? "Entertainer" : u.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5">
                  <Badge variant="secondary" className={`text-[10px] ${STATUS_STYLES[u.status] ?? ""}`}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-2.5 pr-5">
                  <div className="flex items-center justify-end gap-0.5">
                    {/* View profile */}
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="View profile"
                      onClick={() => openProfile(u)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>

                    {/* Suspend / Unsuspend */}
                    {isSuspended ? (
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-emerald-500 hover:text-emerald-600"
                        title="Unsuspend user"
                        onClick={() => unsuspend(u.id)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-amber-500 hover:text-amber-600"
                        title={isBanned ? "Already banned" : "Suspend user"}
                        disabled={isBanned}
                        onClick={() => suspend(u.id)}
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    {/* Ban / Unban */}
                    {isBanned ? (
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-emerald-500 hover:text-emerald-600"
                        title="Unban user"
                        onClick={() => unban(u.id)}
                      >
                        <CircleSlash className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive/80"
                        title="Ban user"
                        onClick={() => ban(u.id)}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <UserProfileSheet
        user={selected}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
