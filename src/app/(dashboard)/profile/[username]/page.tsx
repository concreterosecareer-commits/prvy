import { notFound, redirect } from "next/navigation";
import { MessageSquare, Gift, MoreHorizontal, MapPin, Globe, Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusDot } from "@/components/dashboard/status-dot";
import { createClient } from "@/lib/supabase/server";
import { MOCK_ALL_DANCERS } from "@/lib/mock-data";
import { formatUsd } from "@/lib/format";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (profile?.username === username) {
      redirect("/account");
    }
  }

  const dancer = MOCK_ALL_DANCERS.find((d) => d.username === username);

  if (!dancer) notFound();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-2xl border-none p-0 shadow-sm">
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[var(--brand-red)]/70 to-[var(--brand-black)]">
          {dancer.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dancer.avatar} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-top opacity-40 blur-sm scale-110" />
          )}
        </div>
        <div className="flex flex-wrap items-end gap-4 p-6 pt-0">
          <Avatar className="-mt-12 h-24 w-24 border-4 border-card">
            {dancer.avatar && (
              <AvatarImage src={dancer.avatar} alt={dancer.name} className="object-cover object-top" />
            )}
            <AvatarFallback className="bg-[var(--brand-red)] text-2xl text-white">
              {dancer.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 pt-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{dancer.name}</h1>
              <StatusDot status={dancer.status} />
            </div>
            <p className="text-sm text-muted-foreground">@{dancer.username}</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Luxury companion. Classy, fun and unforgettable. 💎
            </p>
          </div>
          <div className="flex items-center gap-2 pt-3">
            <Link href="/messages">
              <Button className="gap-2 bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
                <MessageSquare className="h-4 w-4" /> Message
              </Button>
            </Link>
            <Button variant="outline" className="gap-2">
              <Gift className="h-4 w-4" /> Send Tip
            </Button>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t px-6 py-4 sm:grid-cols-4">
          <div>
            <p className="text-lg font-bold">{dancer.patrons}</p>
            <p className="text-xs text-muted-foreground">Patrons</p>
          </div>
          <div>
            <p className="text-lg font-bold">{formatUsd(dancer.earnings)}</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </div>
          <div>
            <p className="text-lg font-bold">98%</p>
            <p className="text-xs text-muted-foreground">Response Rate</p>
          </div>
          <div>
            <p className="text-lg font-bold">4.9</p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="media">Media (24)</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="rates">Rates</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <Card className="rounded-2xl border-none p-5 shadow-sm">
              <h2 className="mb-3 font-semibold">About Me</h2>
              <p className="text-sm text-muted-foreground">
                Hi, I&apos;m {dancer.name} 💖 I love good vibes, great conversations and
                creating special memories. Let&apos;s connect and make it unforgettable.
              </p>
            </Card>
            <Card className="rounded-2xl border-none p-5 shadow-sm">
              <h2 className="mb-3 font-semibold">Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Las Vegas, NV
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" /> English
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Ruler className="h-4 w-4" /> 5&apos;7&quot;
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-gradient-to-br from-[var(--brand-red)]/30 to-[var(--brand-black)]/20"
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="mt-4">
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {dancer.name} is currently <StatusDot status={dancer.status} /> and typically
              responds within a few minutes.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="mt-4">
          <Card className="rounded-2xl border-none p-5 shadow-sm">
            <div className="divide-y text-sm">
              <div className="flex justify-between py-2"><span>Private Chat (1hr)</span><span className="font-semibold">500 Gems</span></div>
              <div className="flex justify-between py-2"><span>Video Call (30min)</span><span className="font-semibold">1,200 Gems</span></div>
              <div className="flex justify-between py-2"><span>Custom Content</span><span className="font-semibold">From 800 Gems</span></div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
