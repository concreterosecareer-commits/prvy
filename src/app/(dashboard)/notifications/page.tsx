import { Bell, Gift, MessageSquare, Users, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Bell> = {
  tip: Gift,
  message: MessageSquare,
  subscriber: Users,
  payout: Download,
  invite: Gift,
  system: Bell,
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="ghost" className="text-sm text-[var(--brand-red)] hover:text-[var(--brand-red)]">
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-2xl border-none p-2 shadow-sm">
        <div className="divide-y">
          {MOCK_NOTIFICATIONS.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl p-4 transition hover:bg-accent",
                  n.unread && "bg-[var(--brand-red)]/5"
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                </div>
                {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-red)]" />}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
