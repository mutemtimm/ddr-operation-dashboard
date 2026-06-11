import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";

import { useApp, type FinanceReport } from "@/lib/app-store";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { RequireRole } from "@/components/require-role";
import { useConfirmDelete } from "@/components/confirm-delete";
import { EditDialog } from "@/components/edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/app/finance-reports")({
  head: () => ({
    meta: [
      { title: "Finance Reports — DDR Operations" },
      { name: "description", content: "Create and review periodic finance performance reports." },
    ],
  }),
  component: () => (
    <RequireRole roles={["finance"]}>
      <ReportsPage />
    </RequireRole>
  ),
});

function ReportsPage() {
  const { reports, addReport, deleteReport, updateReport } = useApp();
  const confirmDelete = useConfirmDelete();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceReport | null>(null);
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState("");
  const [revenue, setRevenue] = useState("");
  const [expenses, setExpenses] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!title.trim() || !period.trim()) {
      toast.error("Please add a title and period.");
      return;
    }
    addReport({
      title: title.trim(),
      period: period.trim(),
      revenue: Number(revenue) || 0,
      expenses: Number(expenses) || 0,
      notes: notes.trim(),
    });
    toast.success("Report created");
    setTitle(""); setPeriod(""); setRevenue(""); setExpenses(""); setNotes("");
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Finance Reports"
        subtitle="Create and store periodic performance reviews"
        action={
          <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New report
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => {
          const net = r.revenue - r.expenses;
          return (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.period}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() =>
                      confirmDelete({
                        itemName: r.title,
                        onConfirm: () => {
                          deleteReport(r.id);
                          toast.success("Report deleted");
                        },
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-display text-base font-bold text-primary">{formatCurrency(r.revenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div>
                  <p className="font-display text-base font-bold">{formatCurrency(r.expenses)}</p>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                </div>
                <div>
                  <p className={`font-display text-base font-bold ${net >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(net)}</p>
                  <p className="text-xs text-muted-foreground">Net</p>
                </div>
              </div>
              {r.notes && <p className="mt-4 text-sm text-muted-foreground">{r.notes}</p>}
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New finance report</DialogTitle>
            <DialogDescription>Capture a performance snapshot for a period.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="r-title">Title</Label>
              <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q3 Performance Review" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-period">Period</Label>
              <Input id="r-period" value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Q3 2025" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="r-rev">Revenue (USD)</Label>
                <Input id="r-rev" type="number" min="0" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-exp">Expenses (USD)</Label>
                <Input id="r-exp" type="number" min="0" value={expenses} onChange={(e) => setExpenses(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-notes">Notes</Label>
              <Textarea id="r-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Highlights and context" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={submit}>Create report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit report"
        values={
          editing
            ? { title: editing.title, period: editing.period, revenue: editing.revenue, expenses: editing.expenses, notes: editing.notes }
            : {}
        }
        fields={[
          { name: "title", label: "Title" },
          { name: "period", label: "Period" },
          { name: "revenue", label: "Revenue (USD)", type: "number", half: true },
          { name: "expenses", label: "Expenses (USD)", type: "number", half: true },
          { name: "notes", label: "Notes", optional: true },
        ]}
        onSave={(v, comment) => {
          if (!editing) return;
          updateReport(
            editing.id,
            {
              title: String(v.title),
              period: String(v.period),
              revenue: Number(v.revenue),
              expenses: Number(v.expenses),
              notes: String(v.notes),
            },
            comment,
          );
          toast.success("Report updated");
        }}
      />
    </div>
  );
}
