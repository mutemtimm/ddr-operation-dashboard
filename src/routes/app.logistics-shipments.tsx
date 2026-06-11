import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { useApp, type Shipment } from "@/lib/app-store";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { RequireRole } from "@/components/require-role";
import { useConfirmDelete } from "@/components/confirm-delete";
import { EditDialog } from "@/components/edit-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/app/logistics-shipments")({
  head: () => ({
    meta: [
      { title: "Shipments — DDR Operations" },
      { name: "description", content: "Manage inbound and outbound shipments." },
    ],
  }),
  component: () => (
    <RequireRole roles={["logistics"]}>
      <ShipmentsPage />
    </RequireRole>
  ),
});

const statuses: Shipment["status"][] = ["Preparing", "In Transit", "Delivered", "Delayed"];
const statusStyles: Record<Shipment["status"], string> = {
  Preparing: "border-muted-foreground/40 text-muted-foreground",
  "In Transit": "border-primary/40 text-primary",
  Delivered: "border-success/40 text-success",
  Delayed: "border-destructive/40 text-destructive",
};

function ShipmentsPage() {
  const { shipments, addShipment, deleteShipment, updateShipment } = useApp();
  const confirmDelete = useConfirmDelete();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [ref, setRef] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<Shipment["status"]>("Preparing");
  const [eta, setEta] = useState(new Date().toISOString().slice(0, 10));

  const submit = () => {
    if (!ref.trim() || !origin.trim() || !destination.trim()) {
      toast.error("Please complete all fields.");
      return;
    }
    addShipment({ ref: ref.trim(), origin: origin.trim(), destination: destination.trim(), status, eta });
    toast.success("Shipment added");
    setRef(""); setOrigin(""); setDestination(""); setStatus("Preparing");
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Shipments"
        subtitle="Track shipment status and routing"
        action={
          <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New shipment
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Ref</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.ref}</TableCell>
                  <TableCell>{s.origin}</TableCell>
                  <TableCell>{s.destination}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[s.status]}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(s.eta)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() =>
                          confirmDelete({
                            itemName: `shipment ${s.ref}`,
                            onConfirm: () => {
                              deleteShipment(s.id);
                              toast.success("Shipment removed");
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
            <DialogTitle>New shipment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="s-ref">Reference</Label>
              <Input id="s-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="SHP-1050" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="s-origin">Origin</Label>
                <Input id="s-origin" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Rotterdam" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-dest">Destination</Label>
                <Input id="s-dest" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="New York" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Shipment["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-eta">ETA</Label>
                <Input id="s-eta" type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={submit}>Add shipment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit shipment"
        values={editing ? { ref: editing.ref, origin: editing.origin, destination: editing.destination, status: editing.status, eta: editing.eta } : {}}
        fields={[
          { name: "ref", label: "Reference" },
          { name: "origin", label: "Origin", half: true },
          { name: "destination", label: "Destination", half: true },
          { name: "status", label: "Status", type: "select", options: ["Preparing", "In Transit", "Delivered", "Delayed"], half: true },
          { name: "eta", label: "ETA", type: "date", half: true },
        ]}
        onSave={(v, comment) => {
          if (!editing) return;
          updateShipment(
            editing.id,
            {
              ref: String(v.ref),
              origin: String(v.origin),
              destination: String(v.destination),
              status: v.status as Shipment["status"],
              eta: String(v.eta),
            },
            comment,
          );
          toast.success("Shipment updated");
        }}
      />
    </div>
  );
}
