import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

export interface EditField {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: string[];
  placeholder?: string;
  /** Render at half width inside a two-column grid. */
  half?: boolean;
  /** Skip the required validation for this field. */
  optional?: boolean;
}

export type EditValues = Record<string, string | number>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: EditField[];
  values: EditValues;
  /** Called with the updated values (numbers coerced) and the change comment. */
  onSave: (values: EditValues, comment: string) => void;
}

export function EditDialog({ open, onOpenChange, title, description, fields, values, onSave }: Props) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      const init: Record<string, string> = {};
      fields.forEach((f) => {
        init[f.name] = values[f.name] !== undefined ? String(values[f.name]) : "";
      });
      setForm(init);
      setComment("");
    }
  }, [open, fields, values]);

  const set = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));

  const submit = () => {
    for (const f of fields) {
      if (f.optional) continue;
      if (!String(form[f.name] ?? "").trim()) {
        toast.error(`Please fill in ${f.label}.`);
        return;
      }
    }
    if (!comment.trim()) {
      toast.error("Please describe what you changed and why.");
      return;
    }
    const out: EditValues = {};
    fields.forEach((f) => {
      out[f.name] = f.type === "number" ? Number(form[f.name]) : form[f.name].trim();
    });
    onSave(out, comment.trim());
    onOpenChange(false);
  };

  const grouped: EditField[][] = [];
  let buffer: EditField[] = [];
  fields.forEach((f) => {
    if (f.half) {
      buffer.push(f);
      if (buffer.length === 2) {
        grouped.push(buffer);
        buffer = [];
      }
    } else {
      if (buffer.length) {
        grouped.push(buffer);
        buffer = [];
      }
      grouped.push([f]);
    }
  });
  if (buffer.length) grouped.push(buffer);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description ?? "Update the details, then note what you changed."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {grouped.map((row, i) => (
            <div key={i} className={row.length === 2 ? "grid grid-cols-2 gap-4" : ""}>
              {row.map((f) => (
                <div key={f.name} className="space-y-2">
                  <Label htmlFor={`ed-${f.name}`}>{f.label}</Label>
                  {f.type === "select" ? (
                    <Select value={form[f.name] ?? ""} onValueChange={(v) => set(f.name, v)}>
                      <SelectTrigger id={`ed-${f.name}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`ed-${f.name}`}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={form[f.name] ?? ""}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
          <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
            <Label htmlFor="ed-comment">What did you change & why?</Label>
            <Textarea
              id="ed-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Updated salary after promotion approval"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
