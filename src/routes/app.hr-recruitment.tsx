import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronRight, UserPlus } from "lucide-react";

import { useApp, type Candidate } from "@/lib/app-store";
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

export const Route = createFileRoute("/app/hr-recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment — DDR Operations" },
      { name: "description", content: "Track candidates through the hiring pipeline." },
    ],
  }),
  component: () => (
    <RequireRole roles={["hr"]}>
      <RecruitmentPage />
    </RequireRole>
  ),
});

const stageStyles: Record<Candidate["stage"], string> = {
  Applied: "border-muted-foreground/40 text-muted-foreground",
  Interview: "border-primary/40 text-primary",
  Offer: "border-chart-4/40 text-chart-4",
  Hired: "border-success/40 text-success",
};

function RecruitmentPage() {
  const { candidates, addCandidate, deleteCandidate, advanceCandidate, updateCandidate } = useApp();
  const confirmDelete = useConfirmDelete();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");

  const submit = () => {
    if (!name.trim() || !role.trim() || !department.trim()) {
      toast.error("Please complete all fields.");
      return;
    }
    addCandidate({ name: name.trim(), role: role.trim(), department: department.trim(), stage: "Applied" });
    toast.success("Candidate added");
    setName(""); setRole(""); setDepartment("");
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Recruitment"
        subtitle="Hiring pipeline and candidates"
        action={
          <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add candidate
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {candidates.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-display font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.role} · {c.department}</p>
                </div>
              </div>
              <Badge variant="outline" className={stageStyles[c.stage]}>{c.stage}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={c.stage === "Hired"}
                onClick={() => advanceCandidate(c.id)}
              >
                Advance <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(c)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() =>
                  confirmDelete({
                    itemName: c.name,
                    onConfirm: () => {
                      deleteCandidate(c.id);
                      toast.success("Candidate removed");
                    },
                  })
                }
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          </div>
        ))}
        {!candidates.length && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No candidates yet — add your first one.</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add candidate</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Full name</Label>
              <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="c-role">Role</Label>
                <Input id="c-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Engineer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-dept">Department</Label>
                <Input id="c-dept" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Engineering" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gold" onClick={submit}>Add candidate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit candidate"
        values={editing ? { name: editing.name, role: editing.role, department: editing.department, stage: editing.stage } : {}}
        fields={[
          { name: "name", label: "Full name" },
          { name: "role", label: "Role", half: true },
          { name: "department", label: "Department", half: true },
          { name: "stage", label: "Stage", type: "select", options: ["Applied", "Interview", "Offer", "Hired"] },
        ]}
        onSave={(v, comment) => {
          if (!editing) return;
          updateCandidate(
            editing.id,
            {
              name: String(v.name),
              role: String(v.role),
              department: String(v.department),
              stage: v.stage as Candidate["stage"],
            },
            comment,
          );
          toast.success("Candidate updated");
        }}
      />
    </div>
  );
}
