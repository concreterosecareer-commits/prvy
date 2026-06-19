"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus, ShieldOff, ShieldCheck, Trash2, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MOCK_USERS_TABLE } from "@/lib/mock-admin-data";

/* ─── types ───────────────────────────────────────────────── */

type UserRow = (typeof MOCK_USERS_TABLE)[number];
type Filter  = "All" | "Dancers" | "Patrons" | "Suspended";

const FILTERS: Filter[] = ["All", "Dancers", "Patrons", "Suspended"];

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

/* ─── action row menu ─────────────────────────────────────── */

function UserActionMenu({
  user,
  onSuspend,
  onUnsuspend,
  onDelete,
}: {
  user: UserRow;
  onSuspend:   (id: string) => void;
  onUnsuspend: (id: string) => void;
  onDelete:    (id: string) => void;
}) {
  const isSuspended = user.status === "Suspended" || user.status === "Banned";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {isSuspended ? (
          <DropdownMenuItem
            className="gap-2 text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
            onClick={() => onUnsuspend(user.id)}
          >
            <ShieldCheck className="h-4 w-4" />
            Unsuspend
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="gap-2 text-amber-600 focus:text-amber-600 focus:bg-amber-50"
            onClick={() => onSuspend(user.id)}
          >
            <ShieldOff className="h-4 w-4" />
            Suspend
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => onDelete(user.id)}
        >
          <Trash2 className="h-4 w-4" />
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── page ────────────────────────────────────────────────── */

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<UserRow[]>(MOCK_USERS_TABLE);
  const [activeFilter, setFilter]   = useState<Filter>("All");
  const [query, setQuery]           = useState("");

  /* ── actions ── */
  const suspend   = (id: string) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "Suspended" } : u));
  const unsuspend = (id: string) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: "Active" }    : u));
  const remove    = (id: string) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  /* ── filtered view ── */
  const filtered = useMemo(() => {
    let list = users;
    if (activeFilter === "Dancers")   list = list.filter((u) => u.role === "Entertainer");
    if (activeFilter === "Patrons")   list = list.filter((u) => u.role === "Patron");
    if (activeFilter === "Suspended") list = list.filter((u) => u.status === "Suspended" || u.status === "Banned");
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, activeFilter, query]);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage platform members</p>
        </div>
        <Button className="h-9 gap-2 px-4 bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Search + filter + table */}
      <Card className="rounded-2xl border-none shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or username…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-muted/40 border-none focus-visible:ring-1"
            />
          </div>
          {/* Filter chips */}
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeFilter === f
                    ? "bg-[var(--brand-red)] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 px-5 text-[11px] font-semibold uppercase tracking-wide">User</TableHead>
                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide">Role</TableHead>
                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide">Status</TableHead>
                <TableHead className="h-9 text-[11px] font-semibold uppercase tracking-wide">Joined</TableHead>
                <TableHead className="h-9 pr-5 text-right text-[11px] font-semibold uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No users match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9 shrink-0">
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
                      <Badge variant="secondary" className={`text-[11px] ${ROLE_STYLES[u.role] ?? ""}`}>
                        {u.role === "Entertainer" ? "Dancer" : u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="secondary" className={`text-[11px] ${STATUS_STYLES[u.status] ?? ""}`}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground">{u.joined}</TableCell>
                    <TableCell className="py-2.5 pr-5 text-right">
                      <UserActionMenu
                        user={u}
                        onSuspend={suspend}
                        onUnsuspend={unsuspend}
                        onDelete={remove}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            <span className="font-semibold text-foreground">{users.length}</span> users
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
