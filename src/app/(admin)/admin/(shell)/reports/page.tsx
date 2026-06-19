import { Flag, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MOCK_REPORTS } from "@/lib/mock-admin-data";

const STATUS_STYLES: Record<string, { badge: string; icon: React.ElementType }> = {
  Open:     { badge: "bg-amber-500/10  text-amber-600",    icon: Clock        },
  Resolved: { badge: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle  },
};

export default function AdminReportsPage() {
  const open     = MOCK_REPORTS.filter((r) => r.status === "Open").length;
  const resolved = MOCK_REPORTS.filter((r) => r.status === "Resolved").length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">User-submitted complaints &amp; flags</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total Reports</p>
          <p className="mt-1 text-3xl font-bold">{MOCK_REPORTS.length}</p>
        </Card>
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Open</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{open}</p>
        </Card>
        <Card className="rounded-2xl border-none p-5 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Resolved</p>
          <p className="mt-1 text-3xl font-bold text-emerald-600">{resolved}</p>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-none shadow-sm">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <Flag className="h-4 w-4 text-[var(--brand-red)]" />
          <h2 className="font-semibold">All Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reporter</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_REPORTS.map((r) => {
                const style = STATUS_STYLES[r.status] ?? STATUS_STYLES.Open;
                const Icon  = style.icon;
                return (
                  <TableRow key={r.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{r.reporter}</TableCell>
                    <TableCell className="text-muted-foreground">{r.target}</TableCell>
                    <TableCell>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{r.reason}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`inline-flex items-center gap-1 text-[11px] ${style.badge}`}>
                        <Icon className="h-3 w-3" />
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={r.status === "Resolved"}
                      >
                        {r.status === "Resolved" ? "Done" : "Review"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
