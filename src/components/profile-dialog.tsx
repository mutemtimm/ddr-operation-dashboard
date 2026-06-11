import { Mail, Phone, MapPin, CalendarDays, Briefcase, ShieldCheck } from "lucide-react";

import { useApp, USER_PROFILES } from "@/lib/app-store";
import { formatDate } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const roleLabel: Record<string, string> = {
  ceo: "Owner / Manager",
  finance: "Finance",
  hr: "Human Resources",
  logistics: "Logistics",
};

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user, canEdit } = useApp();
  if (!user) return null;
  const profile = USER_PROFILES[user.role];
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  const rows = [
    { icon: Mail, label: "Email", value: profile.email },
    { icon: Phone, label: "Phone", value: profile.phone },
    { icon: MapPin, label: "Location", value: profile.location },
    { icon: CalendarDays, label: "Joined", value: formatDate(profile.joined) },
    { icon: Briefcase, label: "Reports to", value: profile.reportsTo },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My profile</DialogTitle>
          <DialogDescription>Your account details and responsibilities.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-gold)] text-xl font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/40 text-primary">{roleLabel[user.role]}</Badge>
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                {canEdit ? "Edit access" : "View-only"}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{profile.bio}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start gap-3 rounded-xl border border-border p-3">
              <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{r.label}</p>
                <p className="truncate text-sm font-medium">{r.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Responsibilities</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {profile.responsibilities.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
