import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
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

interface ConfirmOptions {
  /** What is being deleted, e.g. an employee name or "this invoice". */
  itemName?: string;
  /** Title shown in the dialog. */
  title?: string;
  /** Called with the reason the user typed once they confirm. */
  onConfirm: (reason: string) => void;
}

type ConfirmFn = (opts: ConfirmOptions) => void;

const ConfirmDeleteContext = createContext<ConfirmFn | null>(null);

export function ConfirmDeleteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [reason, setReason] = useState("");

  const confirm: ConfirmFn = (o) => {
    setOpts(o);
    setReason("");
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for deleting this.");
      return;
    }
    opts?.onConfirm(reason.trim());
    setOpen(false);
  };

  return (
    <ConfirmDeleteContext.Provider value={confirm}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>{opts?.title ?? "Confirm deletion"}</DialogTitle>
            <DialogDescription>
              {opts?.itemName ? (
                <>
                  You're about to delete <span className="font-medium text-foreground">{opts.itemName}</span>. Please
                  provide a reason for this deletion.
                </>
              ) : (
                "Please provide a reason for this deletion."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor="delete-reason">Reason for deletion</Label>
            <Textarea
              id="delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate entry, no longer relevant…"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              OK, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDeleteContext.Provider>
  );
}

export function useConfirmDelete() {
  const ctx = useContext(ConfirmDeleteContext);
  if (!ctx) throw new Error("useConfirmDelete must be used within ConfirmDeleteProvider");
  return ctx;
}
