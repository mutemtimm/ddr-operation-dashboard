import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PieChart,
  Cell,
  Pie,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Calculator, Crown, TrendingUp, Wallet } from "lucide-react";

import { useApp } from "@/lib/app-store";
import { formatCurrency } from "@/lib/format";
import { CHART_COLORS, tooltipStyle } from "@/lib/chart";
import { PageHeader } from "@/components/page-header";
import { RequireRole } from "@/components/require-role";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/app/equity")({
  head: () => ({
    meta: [
      { title: "Equity — DDR Operations" },
      { name: "description", content: "Partner ownership, investments and an automatic profit distribution calculator." },
    ],
  }),
  component: () => (
    <RequireRole roles={["ceo"]}>
      <EquityModule />
    </RequireRole>
  ),
});

const COLORS = CHART_COLORS;

function EquityModule() {
  const { partners, netProfit } = useApp();
  const [profitInput, setProfitInput] = useState(String(Math.max(netProfit, 0)));

  const totalInvestment = partners.reduce((s, p) => s + p.investment, 0);
  const distributable = Number(profitInput) || 0;
  const pieData = partners.map((p, i) => ({ name: p.name, value: p.equity, fill: COLORS[i % COLORS.length] }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Equity & Partners" subtitle="Ownership structure and profit distribution" />

      <div className="grid gap-4 lg:grid-cols-3">
        {partners.map((p, i) => {
          const share = (p.equity / 100) * netProfit;
          return (
            <div
              key={p.id}
              className="relative overflow-hidden rounded-2xl border border-border bg-[image:var(--gradient-surface)] p-5 shadow-[var(--shadow-elegant)]"
            >
              <div
                className="absolute right-0 top-0 h-20 w-20 rounded-full opacity-20 blur-2xl"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-background"
                  style={{ background: COLORS[i % COLORS.length] }}
                >
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="flex items-center gap-1.5 font-display font-semibold">
                    {p.name}
                    {i === 0 && <Crown className="h-3.5 w-3.5 text-primary" />}
                  </p>
                  <p className="text-xs text-muted-foreground">Partner</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-display text-lg font-bold text-primary">{p.equity}%</p>
                  <p className="text-xs text-muted-foreground">Equity</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{formatCurrency(p.investment)}</p>
                  <p className="text-xs text-muted-foreground">Invested</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{formatCurrency(share)}</p>
                  <p className="text-xs text-muted-foreground">Profit share</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)] lg:col-span-2">
          <h2 className="mb-2 font-display text-lg font-semibold">Ownership Split</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.fill} stroke="oklch(1 0 0)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Total invested: <span className="text-foreground">{formatCurrency(totalInvestment)}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)] lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Profit Distribution Calculator</h2>
          </div>

          <div className="max-w-xs space-y-2">
            <Label htmlFor="profit">Total profit to distribute (USD)</Label>
            <Input
              id="profit"
              type="number"
              min="0"
              value={profitInput}
              onChange={(e) => setProfitInput(e.target.value)}
              placeholder="0"
            />
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => setProfitInput(String(Math.max(netProfit, 0)))}
            >
              Use current net profit ({formatCurrency(Math.max(netProfit, 0))})
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {partners.map((p, i) => {
              const amount = (p.equity / 100) * distributable;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.equity}% ownership</p>
                    </div>
                  </div>
                  <p className="font-display text-lg font-bold text-primary">{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-[image:var(--gradient-gold)] px-4 py-3 text-primary-foreground">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="h-4 w-4" /> Total distributed
            </span>
            <span className="font-display text-lg font-bold">{formatCurrency(distributable)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-muted-foreground">
        <TrendingUp className="h-4 w-4 text-primary" />
        Profit shares update automatically as finance transactions change company net profit.
      </div>
    </div>
  );
}
