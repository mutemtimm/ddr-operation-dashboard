import { useState } from "react";
import { toast } from "sonner";

import { useApp, type Employee } from "@/lib/app-store";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statuses: Employee["contractStatus"][] = ["Full-time", "Part-time", "Contract", "Probation"];

export function EmployeeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { addEmployee } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState("");
  const [contractStatus, setContractStatus] = useState<Employee["contractStatus"]>("Full-time");

  const reset = () => {
    setName("");
    setRole("");
    setDepartment("");
    setSalary("");
    setContractStatus("Full-time");
  };

  const submit = () => {
    const value = Number(salary);
    if (!name.trim() || !role.trim() || !department.trim() || !value || value <= 0) {
      toast.error("Please complete all fields with a valid salary.");
      return;
    }
    addEmployee({
      name: name.trim(),
      role: role.trim(),
      department: department.trim(),
      salary: value,
      contractStatus,
    });
    toast.success(`${name.trim()} added to ${department.trim()}`);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
          <DialogDescription>Add a team member to the payroll.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="emp-name">Full name</Label>
            <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emp-role">Role</Label>
              <Input id="emp-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emp-dept">Department</Label>
              <Input id="emp-dept" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Engineering" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emp-salary">Annual salary (USD)</Label>
              <Input id="emp-salary" type="number" min="0" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="90000" />
            </div>
            <div className="space-y-2">
              <Label>Contract</Label>
              <Select value={contractStatus} onValueChange={(v) => setContractStatus(v as Employee["contractStatus"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={submit}>
            Add employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
