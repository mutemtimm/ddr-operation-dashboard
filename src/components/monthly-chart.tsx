import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type Transaction } from "@/lib/app-store";
import { formatCompact, formatCurrency } from "@/lib/format";
import { AXIS_COLOR, GRID_COLOR, tooltipStyle } from "@/lib/chart";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthlyChart({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const buckets: Record<string, { month: string; income: number; expense: number }> = {};
    for (const t of transactions) {
      const d = new Date(t.date + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!buckets[key]) buckets[key] = { month: MONTHS[d.getMonth()], income: 0, expense: 0 };
      buckets[key][t.type] += t.amount;
    }
    return Object.entries(buckets)
      .sort(([a], [b]) => {
        const [ay, am] = a.split("-").map(Number);
        const [by, bm] = b.split("-").map(Number);
        return ay - by || am - bm;
      })
      .map(([, v]) => v);
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.2 257)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="oklch(0.55 0.2 257)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.68 0.15 160)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="oklch(0.68 0.15 160)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey="month" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke={AXIS_COLOR}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCompact(v as number)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name) => [formatCurrency(value), name === "income" ? "Income" : "Expense"]}
        />
        <Area type="monotone" dataKey="income" stroke="oklch(0.55 0.2 257)" strokeWidth={2} fill="url(#incomeFill)" />
        <Area type="monotone" dataKey="expense" stroke="oklch(0.68 0.15 160)" strokeWidth={2} fill="url(#expenseFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
