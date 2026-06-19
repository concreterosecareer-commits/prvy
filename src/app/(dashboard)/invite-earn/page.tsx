"use client";

import { useState } from "react";
import { Copy, Gift, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_INVITES } from "@/lib/mock-data";
import { formatUsd } from "@/lib/format";

const INVITE_LINK = "privy.app/invite/sasha";

export default function InviteEarnPage() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(INVITE_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invite &amp; Earn</h1>

      <Card className="rounded-2xl border-none bg-gradient-to-br from-[var(--brand-red)] to-[var(--brand-red-dark)] p-6 text-white shadow-sm">
        <div className="flex items-center gap-2 text-lg font-bold">
          <Gift className="h-5 w-5" /> Earn 15%
        </div>
        <p className="mt-1 text-sm text-white/70">From your invited dancers&apos; earnings</p>

        <p className="mb-2 mt-5 text-xs text-white/70">Your Invite Link</p>
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
          <span className="flex-1 truncate text-sm">{INVITE_LINK}</span>
          <Button size="sm" onClick={handleCopy} className="bg-white text-[var(--brand-red)] hover:bg-white/90">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-none p-5 text-center shadow-sm">
          <p className="text-2xl font-bold">32</p>
          <p className="text-sm text-muted-foreground">Invited</p>
        </Card>
        <Card className="rounded-2xl border-none p-5 text-center shadow-sm">
          <p className="text-2xl font-bold">18</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </Card>
        <Card className="rounded-2xl border-none p-5 text-center shadow-sm">
          <p className="text-2xl font-bold">{formatUsd(2460)}</p>
          <p className="text-sm text-muted-foreground">Commission Earned</p>
        </Card>
      </div>

      <Card className="rounded-2xl border-none p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Recent Invites</h2>
        <div className="divide-y">
          {MOCK_INVITES.map((invite) => (
            <div key={invite.id} className="flex items-center gap-3 py-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-[var(--brand-red)]/15 text-[var(--brand-red)]">
                  {invite.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{invite.name}</p>
                <p className="text-xs text-muted-foreground">Joined {invite.time}</p>
              </div>
              <Badge
                variant="secondary"
                className={
                  invite.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }
              >
                {invite.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
