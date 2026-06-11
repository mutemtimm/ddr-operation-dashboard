import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { useApp, HOME_FOR_ROLE, type Role } from "@/lib/app-store";
import { Button } from "@/components/ui/button";

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useApp();

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Restricted area</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your role doesn't have access to this module.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link to={user ? HOME_FOR_ROLE[user.role] : "/login"}>Back to your dashboard</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
