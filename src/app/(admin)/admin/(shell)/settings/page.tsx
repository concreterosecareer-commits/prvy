"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, ShieldCheck, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Platform configuration &amp; controls</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Referral / Financials */}
        <Card className="rounded-2xl border-none shadow-sm">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <Settings className="h-4 w-4 text-[var(--brand-red)]" />
            <h2 className="font-semibold">Financial Settings</h2>
          </div>
          <div className="space-y-5 p-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Default Commission Rate (%)</Label>
              <p className="text-xs text-muted-foreground">Applied to all dancer payouts</p>
              <Input type="number" defaultValue={15} className="max-w-xs bg-muted/40 border-none focus-visible:ring-1" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Gem-to-USD Rate</Label>
              <p className="text-xs text-muted-foreground">How many gems equal $1.00</p>
              <Input type="number" defaultValue={100} className="max-w-xs bg-muted/40 border-none focus-visible:ring-1" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Minimum Withdrawal ($)</Label>
              <Input type="number" defaultValue={50} className="max-w-xs bg-muted/40 border-none focus-visible:ring-1" />
            </div>
          </div>
        </Card>

        {/* Platform Controls */}
        <Card className="rounded-2xl border-none shadow-sm">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <ShieldCheck className="h-4 w-4 text-[var(--brand-red)]" />
            <h2 className="font-semibold">Platform Controls</h2>
          </div>
          <div className="divide-y p-5 space-y-0">
            {[
              { label: "New Signups",           desc: "Allow new users to register",           defaultOn: true  },
              { label: "Email Verification",    desc: "Require OTP before account access",     defaultOn: true  },
              { label: "Two-Factor Auth",       desc: "Enforce 2FA for all admin accounts",    defaultOn: false },
              { label: "Maintenance Mode",      desc: "Temporarily disable patron access",     defaultOn: false },
              { label: "Explicit Content",      desc: "Allow adults-only media uploads",        defaultOn: true  },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.defaultOn} />
              </div>
            ))}
          </div>
        </Card>

        {/* Notifications */}
        <Card className="rounded-2xl border-none shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <Bell className="h-4 w-4 text-[var(--brand-red)]" />
            <h2 className="font-semibold">Admin Notifications</h2>
          </div>
          <div className="grid gap-0 divide-y p-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {[
              { label: "New user signup",        defaultOn: true  },
              { label: "New report filed",        defaultOn: true  },
              { label: "Large withdrawal (>$500)", defaultOn: true  },
              { label: "Failed payment",          defaultOn: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between px-0 py-3.5 sm:px-4 first:sm:pl-0 last:sm:pr-0">
                <p className="text-sm">{item.label}</p>
                <Switch defaultChecked={item.defaultOn} />
              </div>
            ))}
          </div>
        </Card>

      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Discard</Button>
        <Button className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
