"use client";

import { useState } from "react";
import { Coins, Wallet as WalletIcon, Link2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PACKAGES = [
  { gems: 500, price: 10 },
  { gems: 1000, price: 20 },
  { gems: 2500, price: 50 },
  { gems: 5000, price: 100 },
  { gems: 10000, price: 200, bestValue: true },
];

const PAYMENT_METHODS = [
  { id: "coinbase", label: "Coinbase Pay", icon: Coins },
  { id: "metamask", label: "MetaMask", icon: WalletIcon },
  { id: "walletconnect", label: "Wallet Connect", icon: Link2 },
];

export default function BuyGemsPage() {
  const [selected, setSelected] = useState(1);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("coinbase");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Buy Gems</h1>

      <Card className="rounded-2xl border-none p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Select Amount</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PACKAGES.map((pkg, i) => (
            <button
              key={pkg.gems}
              onClick={() => setSelected(i)}
              className={cn(
                "relative rounded-xl border p-4 text-center transition hover:border-[var(--brand-red)]",
                selected === i && "border-[var(--brand-red)] bg-[var(--brand-red)]/5"
              )}
            >
              {pkg.bestValue && (
                <span className="absolute -top-2 right-2 rounded-full bg-[var(--brand-red)] px-2 py-0.5 text-[10px] font-semibold text-white">
                  Best Value
                </span>
              )}
              <p className="text-lg font-bold">{pkg.gems.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Gems</p>
              <p className="mt-1 text-sm font-semibold text-[var(--brand-red)]">${pkg.price}</p>
            </button>
          ))}
          <div className="rounded-xl border p-4 text-center">
            <p className="mb-2 text-xs text-muted-foreground">Custom</p>
            <Input
              placeholder="Enter amount"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                setSelected(-1);
              }}
              className="text-center"
            />
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border-none p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Payment Method</h2>
        <div className="grid grid-cols-3 gap-3">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 transition hover:border-[var(--brand-red)]",
                method === m.id && "border-[var(--brand-red)] bg-[var(--brand-red)]/5"
              )}
            >
              <m.icon className="h-5 w-5 text-[var(--brand-red)]" />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Secure payment powered by crypto. No chargebacks. KYC &amp; AML handled by Coinbase.
        </div>

        <Button className="mt-5 w-full bg-[var(--brand-red)] text-white hover:bg-[var(--brand-red-dark)]">
          Continue to Payment
        </Button>
      </Card>
    </div>
  );
}
