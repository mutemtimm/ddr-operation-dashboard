import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Wallet, Building, BadgeCheck } from "lucide-react";

import { useApp, type Employee } from "@/lib/app-store";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { RequireRole } from "@/components/require-role";
import { useConfirmDelete } from "@/components/confirm-delete";
import { EmployeeDialog } from "@/components/employee-dialog";
import { EmployeeDetailCard } from "@/components/employee-detail-card";
import { EditDialog } from "@/components/edit-dialog";
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

export const Route = createFileRoute("/app/hr")({
  head: () => ({
    meta: [
      { title: "HR & Payroll — DDR Operations" },
      { name: "description", content: "Manage employees, departments, contracts and payroll summary." },
    ],
  }),
  component: () => (
    <RequireRole roles={["ceo", "hr"]}>
      <HrModule />
    </RequireRole>
  ),
});

const statusStyles: Record<Employee["contractStatus"], string> = {
  "Full-time": "border-primary/40 text-primary",
  "Part-time": "border-chart-3/40 text-chart-3",
  Contract: "border-success/40 text-success",
  Probation: "border-chart-4/40 text-chart-4",
};

function HrModule() {
  const { employees, totalPayroll, totalEmployees, deleteEmployee, updateEmployee, canEdit } = useApp();
  const confirmDelete = useConfirmDelete();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);

  const departments = useMemo(() => new Set(employees.map((e) => e.department)).size, [employees]);
  const avgSalary = totalEmployees ? totalPayroll / totalEmployees : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Employees"
        subtitle="Team directory and compensation"
        action={
          canEdit && (
            <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Add employee
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Employees" value={totalEmployees} icon={Users} />
        <KpiCard label="Departments" value={departments} icon={Building} />
        <KpiCard label="Annual Payroll" value={formatCurrency(totalPayroll)} icon={Wallet} accent />
        <KpiCard label="Avg. Salary" value={formatCurrency(avgSalary)} icon={BadgeCheck} />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-display text-lg font-semibold">Employee Directory</h2>
          <span className="text-xs text-muted-foreground">{employees.length} people</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Salary</TableHead>
                <TableHead>Contract</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => setSelected(e)}>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium">{e.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.role}</TableCell>
                  <TableCell>{e.department}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(e.salary)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[e.contractStatus]}>
                      {e.contractStatus}
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setEditing(e);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            confirmDelete({
                              itemName: e.name,
                              onConfirm: () => {
                                deleteEmployee(e.id);
                                toast.success(`${e.name} removed`);
                              },
                            });
                          }}
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

      <p className="text-center text-xs text-muted-foreground">Tip: click any employee to open their detail card.</p>

      <EmployeeDialog open={open} onOpenChange={setOpen} />
      {selected && <EmployeeDetailCard employee={selected} onClose={() => setSelected(null)} />}
      <EditDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit employee"
        values={
          editing
            ? {
                name: editing.name,
                role: editing.role,
                department: editing.department,
                salary: editing.salary,
                contractStatus: editing.contractStatus,
              }
            : {}
        }
        fields={[
          { name: "name", label: "Full name" },
          { name: "role", label: "Role", half: true },
          { name: "department", label: "Department", half: true },
          { name: "salary", label: "Annual salary (USD)", type: "number", half: true },
          {
            name: "contractStatus",
            label: "Contract",
            type: "select",
            options: ["Full-time", "Part-time", "Contract", "Probation"],
            half: true,
          },
        ]}
        onSave={(v, comment) => {
          if (!editing) return;
          updateEmployee(
            editing.id,
            {
              name: String(v.name),
              role: String(v.role),
              department: String(v.department),
              salary: Number(v.salary),
              contractStatus: v.contractStatus as Employee["contractStatus"],
            },
            comment,
          );
          toast.success("Employee updated");
        }}
      />
    </div>
  );
}
