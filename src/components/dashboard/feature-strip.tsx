import { Gem, ShieldCheck, Eye, Gift, Users, Headset } from "lucide-react";

const FEATURES = [
  { icon: Gem, title: "Private Messaging", subtitle: "No phone numbers" },
  { icon: ShieldCheck, title: "Secure Payments", subtitle: "Crypto. No chargebacks" },
  { icon: Eye, title: "Discreet & Private", subtitle: "Your data, your control" },
  { icon: Gift, title: "Dancer Rewards", subtitle: "Earn from invites" },
  { icon: Users, title: "Invite Only", subtitle: "Access by invite" },
  { icon: Headset, title: "24/7 Support", subtitle: "We're here for you" },
];

export function FeatureStrip() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {FEATURES.map((f) => (
        <div key={f.title} className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-red)]/10 text-[var(--brand-red)]">
            <f.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold">{f.title}</p>
            <p className="text-[11px] text-muted-foreground">{f.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
