"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Gem, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  purchase:       "Gem Purchase",
  tip:            "Tip",
  subscription:   "Subscription",
  withdrawal:     "Withdrawal",
  referral_bonus: "Referral Bonus",
  refund:         "Refund",
};

const TAB_TYPE: Record<string, string | null> = {
  all:           null,
  gems:          "purchase",
  tips:          "tip",
  subscriptions: "subscription",
};

interface TxRow {
  id: string;
  type: string;
  status: string;
  gem_amount: number;
  usd_amount: number;
  description: string | null;
  counterparty_id: string | null;
  created_at: string;
  counterparty_name?: string;
}

function signedAmount(tx: TxRow): { value: number; isGems: boolean } {
  if (tx.gem_amount > 0) {
    const isCredit =
      tx.description === "Tip received" ||
      tx.type === "purchase" ||
      tx.type === "referral_bonus" ||
      tx.type === "refund";
    return { value: isCredit ? tx.gem_amount : -tx.gem_amount, isGems: true };
  }
  if (tx.usd_amount > 0) {
    return { value: tx.type === "withdrawal" ? -tx.usd_amount : tx.usd_amount, isGems: false };
  }
  return { value: 0, isGems: true };
}

export default function TransactionsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState("all");
  const [allTxs, setAllTxs] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: txs, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        setFetchError(error.message);
        setLoading(false);
        return;
      }

      const cpIds = [
        ...new Set(
          (txs ?? []).map((t) => t.counterparty_id).filter(Boolean) as string[]
        ),
      ];

      let nameMap: Record<string, string> = {};
      if (cpIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", cpIds);
        nameMap = Object.fromEntries(
          (profiles ?? []).map((p) => [p.id, p.display_name])
        );
      }

      setAllTxs(
        (txs ?? []).map((t) => ({
          ...t,
          counterparty_name: t.counterparty_id
            ? nameMap[t.counterparty_id]
            : undefined,
        }))
      );
      setLoading(false);
    }
    load();
  }, [supabase]);

  const filtered = useMemo(() => {
    const typeFilter = TAB_TYPE[activeTab];
    return typeFilter ? allTxs.filter((t) => t.type === typeFilter) : allTxs;
  }, [allTxs, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button variant="outline" className="gap-2" disabled>
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>

      <Card className="rounded-2xl border-none p-5 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="gems">Gems</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : fetchError ? (
            <p className="py-8 text-center text-sm text-destructive">
              {fetchError}
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No transactions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>To / From</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx) => {
                    const { value, isGems } = signedAmount(tx);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">
                          {TYPE_LABELS[tx.type] ?? tx.type}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.counterparty_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatRelativeDate(tx.created_at)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold",
                            value > 0
                              ? "text-emerald-600"
                              : "text-foreground"
                          )}
                        >
                          {value > 0 ? "+" : ""}
                          {isGems ? (
                            <span className="inline-flex items-center gap-1">
                              <Gem className="h-3 w-3 text-[var(--brand-red)]" />
                              {Math.abs(value).toLocaleString()}
                            </span>
                          ) : (
                            `$${Math.abs(value).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="secondary"
                            className={
                              tx.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : tx.status === "pending"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-destructive/10 text-destructive"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Tabs>
      </Card>
    </div>
  );
}
