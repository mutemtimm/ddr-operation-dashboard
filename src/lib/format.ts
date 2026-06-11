export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export const formatCompact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Next payday — companies pay on the 28th of the month.
export const nextSalaryDate = (from: Date = new Date()) => {
  const day = from.getDate();
  const year = from.getFullYear();
  const month = from.getMonth();
  const next = day <= 28 ? new Date(year, month, 28) : new Date(year, month + 1, 28);
  return next;
};

export const formatLongDate = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export const daysUntil = (d: Date, from: Date = new Date()) => {
  const ms = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
    new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  return Math.round(ms / 86400000);
};

export const monthLabel = (date: string) =>
  new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short" });

export const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
};
