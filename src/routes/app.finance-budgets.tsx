import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";

import { useApp } from "@/lib/app-store";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { RequireRole } from "@/components/require-role";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/app/finance-budgets")({
  head: () => ({
    meta: [
      { title: "Budgets — DDR Operations" },
      { name: "description", content: "Departmental budget allocation and spend tracking." },
    ],
  }),
  component: () => (
    <RequireRole roles={["finance"]}>
      <BudgetsPage />
    </RequireRole>
  ),
});

function BudgetsPage() {
  const { budgets } = useApp();
  const totalAllocated = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Budgets" subtitle="Allocation and spend by department" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total Allocated" value={formatCurrency(totalAllocated)} icon={Wallet} />
        <KpiCard label="Total Spent" value={formatCurrency(totalSpent)} icon={Wallet} />
        <KpiCard label="Remaining" value={formatCurrency(totalAllocated - totalSpent)} icon={Wallet} accent />
      </div>

      <div className="space-y-4">
        {budgets.map((b) => {
          const pct = b.allocated ? Math.round((b.spent / b.allocated) * 100) : 0;
          return (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold">{b.department}</p>
                <span className={`text-sm font-medium ${pct > 90 ? "text-destructive" : "text-muted-foreground"}`}>{pct}% used</span>
              </div>
              <Progress value={pct} className="mt-3" />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Spent {formatCurrency(b.spent)}</span>
                <span>Budget {formatCurrency(b.allocated)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
