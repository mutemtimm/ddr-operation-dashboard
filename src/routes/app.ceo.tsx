import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  PieChart as PieIcon,
  Activity as ActivityIcon,
  LineChart as LineIcon,
} from "lucide-react";

import { useApp } from "@/lib/app-store";
import { formatCurrency, relativeTime } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { MonthlyChart } from "@/components/monthly-chart";
import { CategoryPie } from "@/components/category-pie";
import { ProfitLineChart } from "@/components/profit-line-chart";

export const Route = createFileRoute("/app/ceo")({
  head: () => ({
    meta: [
      { title: "CEO Overview — DDR Operations" },
      { name: "description", content: "Executive overview of revenue, expenses, projects, headcount and partner equity." },
    ],
  }),
  component: CeoDashboard,
});

const activityIcon = {
  income: ArrowUpRight,
  expense: ArrowDownRight,
  employee: UserPlus,
  partner: PieIcon,
  system: ActivityIcon,
} as const;

function Card({ title, icon: Icon, children, className = "" }: { title: string; icon: typeof PieIcon; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)] ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      {children}
    </div>
  );
}

function CeoDashboard() {
  const app = useApp();
  const { partners, netProfit, totalRevenue, totalExpenses, totalEmployees, activeProjects, transactions, activities } = app;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Executive Overview" subtitle="Company-wide performance at a glance" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={TrendingUp} trend="All recorded income" trendUp />
        <KpiCard label="Total Expenses" value={formatCurrency(totalExpenses)} icon={TrendingDown} trend="All recorded costs" />
        <KpiCard label="Net Profit" value={formatCurrency(netProfit)} icon={Wallet} accent />
        <KpiCard label="Active Projects" value={activeProjects} icon={Briefcase} trend="In progress" />
        <KpiCard label="Total Employees" value={totalEmployees} icon={Users} trend="Across all teams" />
        <KpiCard
          label="Profit Margin"
          value={`${totalRevenue ? Math.round((netProfit / totalRevenue) * 100) : 0}%`}
          icon={PieIcon}
          trend="Net / revenue"
          trendUp
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Revenue vs Expenses" icon={LineIcon} className="lg:col-span-2">
          <MonthlyChart transactions={transactions} />
        </Card>
        <Card title="Equity Overview" icon={PieIcon}>
          <div className="space-y-4">
            {partners.map((p) => {
              const share = (p.equity / 100) * netProfit;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-primary">{p.equity}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[image:var(--gradient-gold)]" style={{ width: `${p.equity}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Profit share: <span className="text-foreground">{formatCurrency(share)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Profit Trend" icon={LineIcon} className="lg:col-span-2">
          <ProfitLineChart transactions={transactions} />
        </Card>
        <Card title="Expense Breakdown" icon={PieIcon}>
          <CategoryPie transactions={transactions} type="expense" />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Revenue by Source" icon={PieIcon}>
          <CategoryPie transactions={transactions} type="income" />
        </Card>
        <Card title="Recent Activity" icon={ActivityIcon}>
          <ul className="space-y-1">
            {activities.map((a) => {
              const Icon = activityIcon[a.kind];
              return (
                <li key={a.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="flex-1 text-sm">{a.message}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(a.timestamp)}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
