import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type Transaction } from "@/lib/app-store";
import { formatCompact, formatCurrency } from "@/lib/format";
import { AXIS_COLOR, GRID_COLOR, tooltipStyle } from "@/lib/chart";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ProfitLineChart({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const buckets: Record<string, { order: number; month: string; net: number }> = {};
    for (const t of transactions) {
      const d = new Date(t.date + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!buckets[key]) buckets[key] = { order: d.getFullYear() * 12 + d.getMonth(), month: MONTHS[d.getMonth()], net: 0 };
      buckets[key].net += t.type === "income" ? t.amount : -t.amount;
    }
    let running = 0;
    return Object.values(buckets)
      .sort((a, b) => a.order - b.order)
      .map((v) => {
        running += v.net;
        return { month: v.month, net: v.net, cumulative: running };
      });
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
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
          formatter={(value: number, name) => [formatCurrency(value), name === "net" ? "Monthly net" : "Cumulative"]}
        />
        <Line type="monotone" dataKey="cumulative" stroke="oklch(0.55 0.2 257)" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="net" stroke="oklch(0.68 0.15 160)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
