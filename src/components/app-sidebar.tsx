import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  LayoutDashboard,
  LineChart,
  Users,
  PieChart,
  LogOut,
  FileText,
  Wallet,
  Receipt,
  UserPlus,
  Truck,
  Package,
  Boxes,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

import { useApp, type Role } from "@/lib/app-store";
import { ProfileDialog } from "@/components/profile-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = { title: string; url: string; icon: typeof LayoutDashboard; roles: Role[] };

// Single ordered list — no group headers.
const navItems: NavItem[] = [
  { title: "CEO Overview", url: "/app/ceo", icon: LayoutDashboard, roles: ["ceo"] },
  { title: "Equity", url: "/app/equity", icon: PieChart, roles: ["ceo"] },
  { title: "Messages", url: "/app/messages", icon: MessageSquare, roles: ["ceo"] },
  { title: "Finance Overview", url: "/app/finance", icon: LineChart, roles: ["ceo", "finance"] },
  { title: "Reports", url: "/app/finance-reports", icon: FileText, roles: ["finance"] },
  { title: "Budgets", url: "/app/finance-budgets", icon: Wallet, roles: ["finance"] },
  { title: "Invoices", url: "/app/finance-invoices", icon: Receipt, roles: ["finance"] },
  { title: "Employees", url: "/app/hr", icon: Users, roles: ["ceo", "hr"] },
  { title: "Payroll", url: "/app/hr-payroll", icon: Wallet, roles: ["hr"] },
  { title: "Recruitment", url: "/app/hr-recruitment", icon: UserPlus, roles: ["hr"] },
  { title: "Logistics Overview", url: "/app/logistics", icon: Truck, roles: ["ceo", "logistics"] },
  { title: "Shipments", url: "/app/logistics-shipments", icon: Package, roles: ["logistics"] },
  { title: "Inventory", url: "/app/logistics-inventory", icon: Boxes, roles: ["logistics"] },
];

export function AppSidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [profileOpen, setProfileOpen] = useState(false);

  const visibleItems = navItems.filter((i) => (user ? i.roles.includes(user.role) : false));

  const handleLogout = () => {
    logout();
    navigate({ to: "/login", replace: true });
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-gold)]">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold">DDR Operations</p>
            <p className="text-xs text-sidebar-foreground/60">Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} onClick={() => setOpenMobile(false)}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <button
          onClick={() => setProfileOpen(true)}
          className="mb-2 flex w-full items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2 text-left transition-colors hover:bg-sidebar-accent/70"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {user?.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user?.title}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
        </button>
        <SidebarMenuButton onClick={handleLogout} className="text-sidebar-foreground/80">
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </SidebarMenuButton>
      </SidebarFooter>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </Sidebar>
  );
}
