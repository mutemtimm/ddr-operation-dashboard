import { createFileRoute } from "@tanstack/react-router";
import { Wallet, Users, BadgeCheck, CalendarClock } from "lucide-react";

import { useApp } from "@/lib/app-store";
import { formatCurrency, nextSalaryDate, formatLongDate, daysUntil } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { RequireRole } from "@/components/require-role";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/hr-payroll")({
  head: () => ({
    meta: [
      { title: "Payroll — DDR Operations" },
      { name: "description", content: "Monthly payroll run and per-employee compensation." },
    ],
  }),
  component: () => (
    <RequireRole roles={["hr"]}>
      <PayrollPage />
    </RequireRole>
  ),
});

function PayrollPage() {
  const { employees, totalPayroll, totalEmployees } = useApp();
  const monthly = totalPayroll / 12;
  const avg = totalEmployees ? totalPayroll / totalEmployees : 0;
  const payday = nextSalaryDate();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Payroll" subtitle="Compensation summary, per-employee detail and next salary date" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard label="Annual Payroll" value={formatCurrency(totalPayroll)} icon={Wallet} accent />
        <KpiCard label="Monthly Run" value={formatCurrency(monthly)} icon={BadgeCheck} />
        <KpiCard label="Headcount" value={totalEmployees} icon={Users} />
        <KpiCard label="Next Salary Date" value={formatLongDate(payday)} icon={CalendarClock} trend={`in ${daysUntil(payday)} days`} />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead className="text-right">Annual</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead>Next salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.email ?? "—"}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.role}</TableCell>
                  <TableCell>{e.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{e.contractStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(e.salary)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(e.salary / 12)}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{formatLongDate(payday)}</div>
                    <div className="text-xs text-muted-foreground">in {daysUntil(payday)} days</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">Average salary across the team: {formatCurrency(avg)}</p>
    </div>
  );
}
