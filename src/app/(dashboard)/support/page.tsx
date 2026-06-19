import { Mail, MessageCircle, FileQuestion } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const FAQS = [
  { q: "How do I buy gems?", a: "Go to Buy Gems and select a package, then pay with Coinbase Pay, MetaMask, or WalletConnect." },
  { q: "How do referrals work?", a: "Share your invite link from Invite & Earn — you earn 15% of commission on invited dancers' earnings." },
  { q: "Is my phone number ever shared?", a: "No. PRVY messaging never shares phone numbers between patrons and entertainers." },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Support</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-none p-5 text-center shadow-sm">
          <MessageCircle className="mx-auto h-6 w-6 text-[var(--brand-red)]" />
          <p className="mt-2 text-sm font-medium">Live Chat</p>
          <p className="text-xs text-muted-foreground">24/7 support</p>
        </Card>
        <Card className="rounded-2xl border-none p-5 text-center shadow-sm">
          <Mail className="mx-auto h-6 w-6 text-[var(--brand-red)]" />
          <p className="mt-2 text-sm font-medium">Email</p>
          <p className="text-xs text-muted-foreground">support@privy.app</p>
        </Card>
        <Card className="rounded-2xl border-none p-5 text-center shadow-sm">
          <FileQuestion className="mx-auto h-6 w-6 text-[var(--brand-red)]" />
          <p className="mt-2 text-sm font-medium">FAQ</p>
          <p className="text-xs text-muted-foreground">Common questions</p>
        </Card>
      </div>

      <Card className="rounded-2xl border-none p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Frequently Asked Questions</h2>
        <div className="divide-y">
          {FAQS.map((f) => (
            <div key={f.q} className="py-3">
              <p className="text-sm font-medium">{f.q}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl border-none p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Contact Us</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input placeholder="What do you need help with?" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea placeholder="Describe your issue..." rows={4} />
          </div>
          <Button className="bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
            Send Message
          </Button>
        </div>
      </Card>
    </div>
  );
}
