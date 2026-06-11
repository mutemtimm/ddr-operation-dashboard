import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { type Transaction } from "@/lib/app-store";
import { formatCurrency } from "@/lib/format";
import { CHART_COLORS, tooltipStyle } from "@/lib/chart";

export function CategoryPie({
  transactions,
  type,
}: {
  transactions: Transaction[];
  type: "income" | "expense";
}) {
  const data = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type !== type) continue;
      buckets[t.category] = (buckets[t.category] ?? 0) + t.amount;
    }
    return Object.entries(buckets)
      .map(([name, value], i) => ({ name, value, fill: CHART_COLORS[i % CHART_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, type]);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={88} paddingAngle={3}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.fill} stroke="oklch(1 0 0)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n) => [formatCurrency(v), n]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
