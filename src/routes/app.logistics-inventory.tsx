import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { useApp, type InventoryItem } from "@/lib/app-store";
import { PageHeader } from "@/components/page-header";
import { RequireRole } from "@/components/require-role";
import { useConfirmDelete } from "@/components/confirm-delete";
import { EditDialog } from "@/components/edit-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/app/logistics-inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — DDR Operations" },
      { name: "description", content: "Track stock levels and reorder thresholds." },
    ],
  }),
  component: () => (
    <RequireRole roles={["logistics"]}>
      <InventoryPage />
    </RequireRole>
  ),
});

function InventoryPage() {
  const { inventory, addInventoryItem, deleteInventoryItem, updateInventoryItem } = useApp();
  const confirmDelete = useConfirmDelete();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reorder, setReorder] = useState("");
  const [location, setLocation] = useState("");

  const submit = () => {
    if (!sku.trim() || !name.trim()) {
      toast.error("Please add a SKU and name.");
      return;
    }
    addInventoryItem({
      sku: sku.trim(),
      name: name.trim(),
      quantity: Number(quantity) || 0,
      reorder: Number(reorder) || 0,
      location: location.trim() || "Warehouse A",
    });
    toast.success("Item added");
    setSku(""); setName(""); setQuantity(""); setReorder(""); setLocation("");
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Stock levels and reorder points"
        action={
          <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add item
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>SKU</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((i) => {
                const low = i.quantity <= i.reorder;
                return (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.sku}</TableCell>
                    <TableCell>{i.name}</TableCell>
                    <TableCell className="text-muted-foreground">{i.location}</TableCell>
                    <TableCell className="text-right font-medium">{i.quantity.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={low ? "border-destructive/40 text-destructive" : "border-success/40 text-success"}>
                        {low ? "Reorder" : "In stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(i)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            confirmDelete({
                              itemName: `${i.name} (${i.sku})`,
                              onConfirm: () => {
                                deleteInventoryItem(i.id);
                                toast.success("Item removed");
                              },
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add inventory item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inv-sku">SKU</Label>
                <Input id="inv-sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="WG-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-loc">Location</Label>
                <Input id="inv-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Warehouse A" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-name">Item name</Label>
              <Input id="inv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Steel Widgets" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inv-qty">Quantity</Label>
                <Input id="inv-qty" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-re">Reorder at</Label>
                <Input id="inv-re" type="number" min="0" value={reorder} onChange={(e) => setReorder(e.target.value)} placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={submit}>Add item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit inventory item"
        values={editing ? { sku: editing.sku, name: editing.name, location: editing.location, quantity: editing.quantity, reorder: editing.reorder } : {}}
        fields={[
          { name: "sku", label: "SKU", half: true },
          { name: "location", label: "Location", half: true },
          { name: "name", label: "Item name" },
          { name: "quantity", label: "Quantity", type: "number", half: true },
          { name: "reorder", label: "Reorder at", type: "number", half: true },
        ]}
        onSave={(v, comment) => {
          if (!editing) return;
          updateInventoryItem(
            editing.id,
            {
              sku: String(v.sku),
              name: String(v.name),
              location: String(v.location),
              quantity: Number(v.quantity),
              reorder: Number(v.reorder),
            },
            comment,
          );
          toast.success("Item updated");
        }}
      />
    </div>
  );
}
