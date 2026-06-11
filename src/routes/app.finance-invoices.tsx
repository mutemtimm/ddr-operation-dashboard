import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Receipt, FileUp, Paperclip, X } from "lucide-react";

import { useApp, type Invoice } from "@/lib/app-store";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { RequireRole } from "@/components/require-role";
import { useConfirmDelete } from "@/components/confirm-delete";
import { EditDialog } from "@/components/edit-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/finance-invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — DDR Operations" },
      { name: "description", content: "Track client invoices, amounts and payment status." },
    ],
  }),
  component: () => (
    <RequireRole roles={["finance"]}>
      <InvoicesPage />
    </RequireRole>
  ),
});

const statusStyles: Record<Invoice["status"], string> = {
  Paid: "border-success/40 text-success",
  Pending: "border-primary/40 text-primary",
  Overdue: "border-destructive/40 text-destructive",
};

function InvoicesPage() {
  const { invoices, addInvoice, deleteInvoice, updateInvoice } = useApp();
  const confirmDelete = useConfirmDelete();
  const [open, setOpen] = useState(false);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Invoice["status"]>("Pending");
  const [due, setDue] = useState(new Date().toISOString().slice(0, 10));
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [statusFor, setStatusFor] = useState<Invoice | null>(null);

  const outstanding = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);

  const submit = () => {
    if (!client.trim() || !(Number(amount) > 0)) {
      toast.error("Add a client and a valid amount.");
      return;
    }
    addInvoice({ client: client.trim(), amount: Number(amount), status, due });
    toast.success("Invoice added");
    setClient(""); setAmount(""); setStatus("Pending");
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Client billing and payment status"
        action={
          <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Outstanding" value={formatCurrency(outstanding)} icon={Receipt} />
        <KpiCard label="Collected" value={formatCurrency(paid)} icon={Receipt} accent />
        <KpiCard label="Invoices" value={invoices.length} icon={Receipt} />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.client}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(i.amount)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant="outline" className={statusStyles[i.status]}>{i.status}</Badge>
                      {!!i.documents?.length && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Paperclip className="h-3 w-3" /> {i.documents.length} doc{i.documents.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(i.due)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary"
                        title="Update status with document or note"
                        onClick={() => setStatusFor(i)}
                      >
                        <FileUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(i)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() =>
                          confirmDelete({
                            itemName: `invoice for ${i.client}`,
                            onConfirm: () => {
                              deleteInvoice(i.id);
                              toast.success("Invoice removed");
                            },
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New invoice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="i-client">Client</Label>
              <Input id="i-client" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="i-amount">Amount (USD)</Label>
                <Input id="i-amount" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="i-due">Due date</Label>
                <Input id="i-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Invoice["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={submit}>Add invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit invoice"
        values={editing ? { client: editing.client, amount: editing.amount, status: editing.status, due: editing.due } : {}}
        fields={[
          { name: "client", label: "Client" },
          { name: "amount", label: "Amount (USD)", type: "number", half: true },
          { name: "due", label: "Due date", type: "date", half: true },
          { name: "status", label: "Status", type: "select", options: ["Pending", "Paid", "Overdue"] },
        ]}
        onSave={(v, comment) => {
          if (!editing) return;
          updateInvoice(
            editing.id,
            {
              client: String(v.client),
              amount: Number(v.amount),
              due: String(v.due),
              status: v.status as Invoice["status"],
            },
            comment,
          );
          toast.success("Invoice updated");
        }}
      />

      <StatusDialog
        invoice={statusFor}
        onClose={() => setStatusFor(null)}
        onSave={(id, patch, comment) => {
          updateInvoice(id, patch, comment);
          toast.success("Invoice status updated");
        }}
      />
    </div>
  );
}

function StatusDialog({
  invoice,
  onClose,
  onSave,
}: {
  invoice: Invoice | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Invoice>, comment: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Invoice["status"]>("Pending");
  const [note, setNote] = useState("");
  const [docs, setDocs] = useState<string[]>([]);

  // Sync local state whenever a new invoice is opened.
  const [lastId, setLastId] = useState<string | null>(null);
  if (invoice && invoice.id !== lastId) {
    setLastId(invoice.id);
    setStatus(invoice.status);
    setNote("");
    setDocs(invoice.documents ?? []);
  }

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(e.target.files ?? []).map((f) => f.name);
    if (names.length) setDocs((d) => [...d, ...names]);
    e.target.value = "";
  };

  const submit = () => {
    if (!invoice) return;
    if (!note.trim() && docs.length === (invoice.documents?.length ?? 0)) {
      toast.error("Upload a document or add a note describing the change.");
      return;
    }
    onSave(invoice.id, { status, documents: docs, statusNote: note.trim() }, note.trim() || "Status changed");
    onClose();
  };

  return (
    <Dialog open={!!invoice} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update invoice status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Invoice["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Supporting documents</Label>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={onPick} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <FileUp className="h-4 w-4" /> Upload document
            </Button>
            {!!docs.length && (
              <ul className="space-y-1">
                {docs.map((d, idx) => (
                  <li key={`${d}-${idx}`} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-1.5 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <Paperclip className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{d}</span>
                    </span>
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setDocs((arr) => arr.filter((_, i) => i !== idx))}
                      aria-label="Remove document"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="st-note">Note / reason</Label>
            <Textarea
              id="st-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Payment received via wire on June 10"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="gold" onClick={submit}>Save status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
