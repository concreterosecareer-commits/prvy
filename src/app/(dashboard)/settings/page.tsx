"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  ShieldCheck,
  CreditCard,
  Bell,
  HelpCircle,
  Camera,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "privacy", label: "Privacy & Security", icon: ShieldCheck },
  { id: "payment", label: "Payment Methods", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

export default function SettingsPage() {
  const router = useRouter();
  const [active, setActive] = useState("account");

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState("prvy_profile_guest");

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      setUserId(user.id);
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");

      const key = `prvy_profile_${user.id}`;
      setStorageKey(key);

      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const p = JSON.parse(saved);
          if (p.displayName) setDisplayName(p.displayName);
          if (p.username)    setUsername(p.username);
          if (p.avatarSrc)   setAvatarSrc(p.avatarSrc);
          return;
        }
      } catch {}

      supabase
        .from("profiles")
        .select("display_name, username, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.display_name) setDisplayName(data.display_name);
          if (data?.username)     setUsername(data.username);
          if (data?.avatar_url)   setAvatarSrc(data.avatar_url);
        });
    });
  }, []);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarSrc(dataUrl);
      try {
        const current = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
        localStorage.setItem(storageKey, JSON.stringify({ ...current, avatarSrc: dataUrl }));
      } catch {}
    };
    reader.readAsDataURL(file);
  }

  async function saveAccount() {
    if (!userId) return;
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, username })
      .eq("id", userId);

    if (error) {
      toast.error("Could not save: " + error.message);
      return;
    }

    try {
      const current = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      localStorage.setItem(storageKey, JSON.stringify({ ...current, displayName, username }));
    } catch {}

    router.refresh();
    toast.success("Settings saved!");
  }

  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Card className="rounded-2xl border-none p-3 shadow-sm">
        <nav className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active === s.id
                  ? "bg-[var(--brand-red)] text-white"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </nav>
      </Card>

      <Card className="rounded-2xl border-none p-6 shadow-sm">
        {active === "account" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Account Information</h2>

            {/* Avatar row */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Avatar className="h-16 w-16 ring-2 ring-[var(--brand-red)]/20">
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                  <AvatarFallback className="bg-[var(--brand-red)] text-lg font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-red)] text-white shadow hover:bg-[var(--brand-red-dark)]"
                >
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div>
                <p className="font-semibold">{displayName || "—"}</p>
                <p className="text-sm text-muted-foreground">@{username || "—"}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())
                  }
                  placeholder="your_handle"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled className="cursor-not-allowed opacity-60" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <Button
              onClick={saveAccount}
              className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]"
            >
              Save Changes
            </Button>
          </div>
        )}

        {active === "privacy" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Privacy &amp; Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show online status</p>
                  <p className="text-xs text-muted-foreground">Let others see when you&apos;re active</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Hide profile from search</p>
                  <p className="text-xs text-muted-foreground">Only invited users can find you</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        )}

        {active === "payment" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Payment Methods</h2>
            <p className="text-sm text-muted-foreground">
              No payment methods connected yet. Connect a wallet from the Buy Gems page.
            </p>
          </div>
        )}

        {active === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">New messages</p>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tips &amp; subscriptions</p>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Marketing emails</p>
                <Switch />
              </div>
            </div>
          </div>
        )}

        {active === "help" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Help &amp; Support</h2>
            <p className="text-sm text-muted-foreground">
              Need help? Visit the Support page or contact us at support@privy.app.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
