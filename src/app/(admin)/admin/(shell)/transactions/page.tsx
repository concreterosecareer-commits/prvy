import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MOCK_ADMIN_TRANSACTIONS, MOCK_PLATFORM_STATS } from "@/lib/mock-admin-data";
import { formatUsd } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  Completed: "bg-emerald-500/10 text-emerald-600",
  Pending:   "bg-amber-500/10  text-amber-600",
  Failed:    "bg-destructive/10 text-destructive",
};

export default function AdminTransactionsPage() {
  const totalIn  = MOCK_ADMIN_TRANSACTIONS.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = MOCK_ADMIN_TRANSACTIONS.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">All platform financial activity</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold">{formatUsd(MOCK_PLATFORM_STATS.totalRevenue)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="h-3 w-3" /> All time
          </p>
        </Card>
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Inflow (sample)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">+{formatUsd(totalIn)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="h-3 w-3" /> Purchases &amp; subs
          </p>
        </Card>
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Outflow (sample)</p>
          <p className="mt-1 text-2xl font-bold text-destructive">-{formatUsd(totalOut)}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-destructive">
            <TrendingDown className="h-3 w-3" /> Withdrawals &amp; tips
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-none shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ADMIN_TRANSACTIONS.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{tx.user}</TableCell>
                  <TableCell>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{tx.type}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tx.date}</TableCell>
                  <TableCell className={`text-right font-semibold ${tx.amount > 0 ? "text-emerald-600" : "text-destructive"}`}>
                    {tx.amount > 0 ? "+" : ""}{formatUsd(tx.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className={`text-[11px] ${STATUS_STYLES[tx.status] ?? ""}`}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
