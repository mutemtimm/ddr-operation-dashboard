import { createFileRoute } from "@tanstack/react-router";
import { Truck, Package, Boxes, AlertTriangle } from "lucide-react";

import { useApp } from "@/lib/app-store";
import { PageHeader } from "@/components/page-header";
import { KpiCard } from "@/components/kpi-card";
import { RequireRole } from "@/components/require-role";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/logistics")({
  head: () => ({
    meta: [
      { title: "Logistics — DDR Operations" },
      { name: "description", content: "Overview of shipments, inventory and supply status." },
    ],
  }),
  component: () => (
    <RequireRole roles={["ceo", "logistics"]}>
      <LogisticsOverview />
    </RequireRole>
  ),
});

function LogisticsOverview() {
  const { shipments, inventory } = useApp();
  const inTransit = shipments.filter((s) => s.status === "In Transit").length;
  const delayed = shipments.filter((s) => s.status === "Delayed").length;
  const lowStock = inventory.filter((i) => i.quantity <= i.reorder);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title="Logistics Overview" subtitle="Shipments and inventory at a glance" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Active Shipments" value={shipments.length} icon={Package} accent />
        <KpiCard label="In Transit" value={inTransit} icon={Truck} />
        <KpiCard label="Delayed" value={delayed} icon={AlertTriangle} />
        <KpiCard label="SKUs Tracked" value={inventory.length} icon={Boxes} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
        <h2 className="mb-4 font-display text-lg font-semibold">Recent Shipments</h2>
        <ul className="space-y-2">
          {shipments.slice(0, 5).map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{s.ref}</p>
                <p className="text-xs text-muted-foreground">{s.origin} → {s.destination}</p>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary">{s.status}</Badge>
            </li>
          ))}
        </ul>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-display text-lg font-semibold">Low Stock Alerts</h2>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {lowStock.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.name} ({i.sku})</span>
                <span className="text-destructive">{i.quantity} left · reorder at {i.reorder}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
