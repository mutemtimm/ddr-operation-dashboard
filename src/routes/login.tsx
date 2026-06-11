import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Building2, ShieldCheck, Lock, User as UserIcon } from "lucide-react";

import { useApp, DEMO_USERS, HOME_FOR_ROLE } from "@/lib/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — DDR Operations" },
      { name: "description", content: "Sign in to the DDR Operations business management system." },
    ],
  }),
  component: LoginPage,
});

const demoAccounts = [
  { username: "ceo", label: "Owner / Manager", desc: "Read-only across every module" },
  { username: "finance", label: "Finance", desc: "Transactions, reports, budgets & invoices" },
  { username: "hr", label: "Human Resources", desc: "Employees, payroll & recruitment" },
  { username: "logistics", label: "Logistics", desc: "Shipments, inventory & overview" },
];

function LoginPage() {
  const { login, user, hydrated } = useApp();
  const navigate = useNavigate();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (hydrated && user) {
      navigate({ to: HOME_FOR_ROLE[user.role], replace: true });
    }
  }, [hydrated, user, navigate]);

  const submit = (u: string, p: string) => {
    const found = login(u, p);
    if (!found) {
      toast.error("Invalid credentials. Tip: the password is the same as the username.");
      return;
    }
    toast.success(`Welcome back, ${found.name}`);
    router.navigate({ to: HOME_FOR_ROLE[found.role], replace: true });
  };

  const fillAndSignIn = (u: string) => {
    setUsername(u);
    setPassword(u);
    submit(u, u);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-gold)] shadow-[var(--shadow-gold)]">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">DDR Operations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Business Management System</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elegant)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(username, password);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-9"
                  placeholder="e.g. finance"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  placeholder="Same as username"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button type="submit" variant="gold" className="w-full">
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            QUICK DEMO LOGIN
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => fillAndSignIn(acc.username)}
                className="group flex flex-col rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <p className="font-display text-sm font-semibold">{acc.label}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{acc.desc}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                  {acc.username} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          Demo environment — the password is the same as the username
        </p>
      </div>
    </div>
  );
}

void DEMO_USERS;
