import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

import { useApp, type Transaction } from "@/lib/app-store";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { MonthlyChart } from "@/components/monthly-chart";
import { TransactionDialog } from "@/components/transaction-dialog";
import { RequireRole } from "@/components/require-role";
import { useConfirmDelete } from "@/components/confirm-delete";
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

export const Route = createFileRoute("/app/finance")({
  head: () => ({
    meta: [
      { title: "Finance — DDR Operations" },
      { name: "description", content: "Manage income and expenses, import/export transactions and review monthly summaries." },
    ],
  }),
  component: () => (
    <RequireRole roles={["ceo", "finance"]}>
      <FinanceDashboard />
    </RequireRole>
  ),
});

function toCsv(rows: Transaction[]) {
  const header = "date,type,category,description,amount";
  const body = rows
    .map((r) => [r.date, r.type, `"${r.category}"`, `"${r.description}"`, r.amount].join(","))
    .join("\n");
  return `${header}\n${body}`;
}

function FinanceDashboard() {
  const { transactions, totalRevenue, totalExpenses, netProfit, deleteTransaction, importTransactions, canEdit } = useApp();
  const confirmDelete = useConfirmDelete();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setDialogOpen(true);
  };

  const handleExport = () => {
    const blob = new Blob([toCsv(sorted)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ddr-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transactions exported");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        const lines = text.split(/\r?\n/).filter(Boolean);
        const rows = lines.slice(1).map((line) => {
          const m = line.match(/(".*?"|[^,]+)(?=,|$)/g) ?? [];
          const cells = m.map((c) => c.replace(/^"|"$/g, "").trim());
          return {
            date: cells[0],
            type: (cells[1] === "expense" ? "expense" : "income") as "income" | "expense",
            category: cells[2] || "Imported",
            description: cells[3] || "Imported transaction",
            amount: Number(cells[4]) || 0,
          };
        }).filter((r) => r.date && r.amount > 0);
        if (!rows.length) {
          toast.error("No valid rows found in file.");
          return;
        }
        importTransactions(rows);
        toast.success(`Imported ${rows.length} transactions`);
      } catch {
        toast.error("Could not parse the CSV file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Finance"
        subtitle="Income, expenses and monthly reporting"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            {canEdit && (
              <>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Import
                </Button>
                <Button variant="gold" size="sm" onClick={openAdd}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={TrendingUp} trendUp trend="All income" />
        <KpiCard label="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} trend="All costs" />
        <KpiCard label="Net Profit" value={formatCurrency(netProfit)} icon={Wallet} accent />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
        <h2 className="mb-4 font-display text-lg font-semibold">Monthly Summary</h2>
        <MonthlyChart transactions={transactions} />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-display text-lg font-semibold">Transaction Log</h2>
          <span className="text-xs text-muted-foreground">{sorted.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(t.date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={t.type === "income" ? "border-primary/40 text-primary" : "border-success/40 text-success"}
                    >
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{t.description}</TableCell>
                  <TableCell className={`text-right font-medium ${t.type === "income" ? "text-primary" : "text-foreground"}`}>
                    {t.type === "income" ? "+" : "−"}
                    {formatCurrency(t.amount)}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            confirmDelete({
                              itemName: t.description,
                              onConfirm: () => {
                                deleteTransaction(t.id);
                                toast.success("Transaction removed");
                              },
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
    </div>
  );
}
