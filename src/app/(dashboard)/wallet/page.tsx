import Link from "next/link";
import { Gem, ArrowUpRight, ArrowDownRight, Wallet as WalletIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { MOCK_RECENT_TRANSACTIONS } from "@/lib/mock-data";
import { formatGems, formatUsd } from "@/lib/format";

const QUICK_BUY = [500, 1000, 2500, 5000, 10000];

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: wallet }, { data: userData }] = await Promise.all([
    supabase.from("wallets").select("gem_balance, usd_balance, is_vip").eq("user_id", user!.id).single(),
    supabase.from("users").select("role").eq("id", user!.id).single(),
  ]);

  const gemBalance = wallet?.gem_balance ?? 1250;
  const usdBalance = wallet?.usd_balance ?? 1250;
  const isVip = wallet?.is_vip ?? true;
  const isDancer = userData?.role === "entertainer";

  return (
    <div className={isDancer ? "space-y-6" : "grid gap-6 lg:grid-cols-[1fr_320px]"}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Wallet</h1>

        <Card className="rounded-2xl border-none bg-gradient-to-br from-[var(--brand-red)] to-[var(--brand-red-dark)] p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70">Your Balance</p>
            {isVip && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">VIP</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Gem className="h-7 w-7" />
            <p className="text-3xl font-bold">{formatGems(gemBalance)}</p>
          </div>
          <p className="text-sm text-white/70">{formatUsd(usdBalance)} USD</p>
          {!isDancer && (
            <Link href="/buy-gems">
              <Button className="mt-4 bg-white text-[var(--brand-red)] hover:bg-white/90">
                Buy Gems
              </Button>
            </Link>
          )}
        </Card>

        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Transactions</h2>
            <Link href="/transactions" className="text-xs font-medium text-[var(--brand-red)] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_RECENT_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    tx.positive ? "bg-emerald-500/10 text-emerald-600" : "bg-[var(--brand-red)]/10 text-[var(--brand-red)]"
                  }`}
                >
                  {tx.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <span className={`shrink-0 text-sm font-semibold ${tx.positive ? "text-emerald-600" : ""}`}>
                  {tx.positive ? "+" : ""}
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {!isDancer && (
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <h2 className="mb-4 font-semibold">Quick Buy</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_BUY.map((amount, i) => (
              <button
                key={amount}
                className={`rounded-xl border p-3 text-center transition hover:border-[var(--brand-red)] ${
                  i === 1 ? "border-[var(--brand-red)] bg-[var(--brand-red)]/5" : ""
                }`}
              >
                <p className="font-semibold">{formatGems(amount)}</p>
                <p className="text-xs text-muted-foreground">Gems</p>
                <p className="mt-1 text-xs text-muted-foreground">${(amount / 50).toFixed(0)}</p>
              </button>
            ))}
            <Link href="/buy-gems" className="rounded-xl border p-3 text-center transition hover:border-[var(--brand-red)]">
              <p className="font-semibold">Custom</p>
              <p className="text-xs text-muted-foreground">Enter amount</p>
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
            <WalletIcon className="h-4 w-4 shrink-0" />
            Secure payment powered by crypto. No chargebacks.
          </div>
        </Card>
      )}
    </div>
  );
}
