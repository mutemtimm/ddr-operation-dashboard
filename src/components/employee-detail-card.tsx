import {
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Building,
  BadgeCheck,
  Wallet,
  Activity as ActivityIcon,
} from "lucide-react";

import { useApp, type Employee } from "@/lib/app-store";
import { formatCurrency, formatDate, nextSalaryDate, formatLongDate, daysUntil, relativeTime } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

const statusStyles: Record<Employee["contractStatus"], string> = {
  "Full-time": "border-primary/40 text-primary",
  "Part-time": "border-chart-3/40 text-chart-3",
  Contract: "border-success/40 text-success",
  Probation: "border-chart-4/40 text-chart-4",
};

function EmployeeDetailBody({ employee }: { employee: Employee }) {
  const { activities } = useApp();
  const payday = nextSalaryDate();
  const monthly = employee.salary / 12;
  const initials = employee.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const related = activities.filter((a) => a.message.toLowerCase().includes(employee.name.toLowerCase()));

  const contact = [
    { icon: Mail, value: employee.email ?? `${employee.name.split(" ")[0].toLowerCase()}@ddrcompany.com` },
    { icon: Phone, value: employee.phone ?? "+1 (415) 555-0100" },
    { icon: MapPin, value: employee.location ?? "Remote" },
    { icon: CalendarDays, value: employee.startDate ? `Joined ${formatDate(employee.startDate)}` : "Joined —" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-lg font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">{employee.name}</p>
          <p className="text-sm text-muted-foreground">{employee.role}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1"><Building className="h-3 w-3" />{employee.department}</Badge>
            <Badge variant="outline" className={statusStyles[employee.contractStatus]}>{employee.contractStatus}</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {contact.map((c) => (
          <div key={c.value} className="flex items-center gap-2 text-sm">
            <c.icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{c.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Wallet className="h-3.5 w-3.5" /> Annual</div>
          <p className="mt-1 font-display text-base font-bold">{formatCurrency(employee.salary)}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><BadgeCheck className="h-3.5 w-3.5" /> Monthly</div>
          <p className="mt-1 font-display text-base font-bold">{formatCurrency(monthly)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Next salary date</div>
        <p className="mt-1 text-sm font-semibold">{formatLongDate(payday)}</p>
        <p className="text-xs text-muted-foreground">in {daysUntil(payday)} days · {formatCurrency(monthly)} net run</p>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <ActivityIcon className="h-3.5 w-3.5" /> Activity
        </div>
        {related.length ? (
          <ul className="space-y-1.5">
            {related.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-sm">{a.message}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(a.timestamp)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
}

export function EmployeeDetailCard({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const isMobile = useIsMobile();
  const handleOpenChange = (o: boolean) => {
    if (!o) onClose();
  };

  if (isMobile) {
    return (
      <Drawer open onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[88vh]">
          <div className="overflow-y-auto px-4 pb-8 pt-2">
            <p className="mb-3 text-center text-xs text-muted-foreground">Swipe down to close</p>
            <EmployeeDetailBody employee={employee} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <div className="mb-4 mt-2">
          <h2 className="font-display text-lg font-semibold">Employee profile</h2>
          <p className="text-sm text-muted-foreground">Full record and activity</p>
        </div>
        <EmployeeDetailBody employee={employee} />
      </SheetContent>
    </Sheet>
  );
}
