import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Role = "ceo" | "finance" | "hr" | "logistics";

export interface User {
  username: string;
  name: string;
  role: Role;
  title: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  contractStatus: "Full-time" | "Part-time" | "Contract" | "Probation";
  email?: string;
  phone?: string;
  location?: string;
  startDate?: string; // YYYY-MM-DD
}

export interface Partner {
  id: string;
  name: string;
  equity: number; // percentage
  investment: number;
}

export interface FinanceReport {
  id: string;
  title: string;
  period: string;
  revenue: number;
  expenses: number;
  notes: string;
}

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  due: string;
  documents?: string[];
  statusNote?: string;
}

export interface Budget {
  id: string;
  department: string;
  allocated: number;
  spent: number;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  department: string;
  stage: "Applied" | "Interview" | "Offer" | "Hired";
}

export interface Shipment {
  id: string;
  ref: string;
  origin: string;
  destination: string;
  status: "Preparing" | "In Transit" | "Delivered" | "Delayed";
  eta: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  reorder: number;
  location: string;
}

export interface Activity {
  id: string;
  kind: "income" | "expense" | "employee" | "partner" | "system";
  message: string;
  timestamp: string; // ISO
}

export interface Message {
  id: string;
  from: string;
  target: Role | "all";
  title: string;
  body: string;
  files: string[];
  timestamp: string; // ISO
}

interface AppData {
  transactions: Transaction[];
  employees: Employee[];
  partners: Partner[];
  reports: FinanceReport[];
  invoices: Invoice[];
  budgets: Budget[];
  candidates: Candidate[];
  shipments: Shipment[];
  inventory: InventoryItem[];
  activities: Activity[];
  messages: Message[];
  reads: Partial<Record<Role, string>>; // last-read ISO timestamp per role
  activeProjects: number;
}

interface AppContextValue extends AppData {
  user: User | null;
  hydrated: boolean;
  canEdit: boolean;
  login: (username: string, password: string) => User | null;
  logout: () => void;
  // finance
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Omit<Transaction, "id">, comment?: string) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (rows: Omit<Transaction, "id">[]) => void;
  addReport: (r: Omit<FinanceReport, "id">) => void;
  updateReport: (id: string, r: Omit<FinanceReport, "id">, comment?: string) => void;
  deleteReport: (id: string) => void;
  addInvoice: (i: Omit<Invoice, "id">) => void;
  updateInvoice: (id: string, i: Partial<Omit<Invoice, "id">>, comment?: string) => void;
  deleteInvoice: (id: string) => void;
  // hr
  addEmployee: (e: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, e: Partial<Omit<Employee, "id">>, comment?: string) => void;
  deleteEmployee: (id: string) => void;
  addCandidate: (c: Omit<Candidate, "id">) => void;
  updateCandidate: (id: string, c: Partial<Omit<Candidate, "id">>, comment?: string) => void;
  deleteCandidate: (id: string) => void;
  advanceCandidate: (id: string) => void;
  // logistics
  addShipment: (s: Omit<Shipment, "id">) => void;
  updateShipment: (id: string, s: Partial<Omit<Shipment, "id">>, comment?: string) => void;
  deleteShipment: (id: string) => void;
  addInventoryItem: (i: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: string, i: Partial<Omit<InventoryItem, "id">>, comment?: string) => void;
  deleteInventoryItem: (id: string) => void;
  // messaging & notifications
  addMessage: (m: Omit<Message, "id" | "timestamp" | "from">) => void;
  markNotificationsRead: () => void;
  // derived
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalEmployees: number;
  totalPayroll: number;
}

export interface UserProfile {
  email: string;
  phone: string;
  location: string;
  joined: string;
  bio: string;
  responsibilities: string[];
  reportsTo: string;
}

export const USER_PROFILES: Record<Role, UserProfile> = {
  ceo: {
    email: "dana.reyes@ddrcompany.com",
    phone: "+1 (415) 555-0110",
    location: "San Francisco, CA",
    joined: "2018-03-01",
    bio: "Founder and Chief Executive Officer. Sets company strategy and oversees every division across DDR Operations.",
    responsibilities: ["Company strategy & vision", "Board & investor relations", "Final approval on budgets", "Partner equity oversight"],
    reportsTo: "Board of Directors",
  },
  finance: {
    email: "marcus.lin@ddrcompany.com",
    phone: "+1 (415) 555-0132",
    location: "San Francisco, CA",
    joined: "2020-06-15",
    bio: "Finance Lead managing all income, expenses, budgeting and client invoicing for the company.",
    responsibilities: ["Transaction bookkeeping", "Budget planning", "Invoice & collections", "Quarterly finance reports"],
    reportsTo: "Dana Reyes (CEO)",
  },
  hr: {
    email: "priya.nair@ddrcompany.com",
    phone: "+1 (415) 555-0148",
    location: "Austin, TX",
    joined: "2021-01-11",
    bio: "HR Manager responsible for the team directory, payroll runs and the recruitment pipeline.",
    responsibilities: ["Employee records", "Payroll processing", "Recruitment & hiring", "Contracts & onboarding"],
    reportsTo: "Dana Reyes (CEO)",
  },
  logistics: {
    email: "sofia.marwan@ddrcompany.com",
    phone: "+1 (206) 555-0177",
    location: "Seattle, WA",
    joined: "2021-09-02",
    bio: "Logistics Lead overseeing shipments, routing and warehouse inventory across all locations.",
    responsibilities: ["Shipment tracking", "Inventory management", "Warehouse coordination", "Supplier logistics"],
    reportsTo: "Dana Reyes (CEO)",
  },
};

const DEMO_USERS: Record<string, User> = {
  ceo: { username: "ceo", name: "Dana Reyes", role: "ceo", title: "Chief Executive Officer" },
  finance: { username: "finance", name: "Marcus Lin", role: "finance", title: "Finance Lead" },
  hr: { username: "hr", name: "Priya Nair", role: "hr", title: "HR Manager" },
  logistics: { username: "logistics", name: "Sofia Marwan", role: "logistics", title: "Logistics Lead" },
};

export const HOME_FOR_ROLE: Record<Role, string> = {
  ceo: "/app/ceo",
  finance: "/app/finance",
  hr: "/app/hr",
  logistics: "/app/logistics",
};

const STORAGE_KEY = "ddr-ops-state-v3";

const uid = () => Math.random().toString(36).slice(2, 10);

const seedTransactions: Transaction[] = [
  { id: uid(), date: "2025-01-12", type: "income", category: "Client Retainer", description: "Atlas Group — Q1 retainer", amount: 86000 },
  { id: uid(), date: "2025-02-04", type: "income", category: "Project Fee", description: "Helios platform delivery", amount: 124000 },
  { id: uid(), date: "2025-02-18", type: "expense", category: "Payroll", description: "February salaries", amount: 71000 },
  { id: uid(), date: "2025-03-09", type: "income", category: "Consulting", description: "Northwind advisory", amount: 52000 },
  { id: uid(), date: "2025-03-22", type: "expense", category: "Software", description: "Cloud & SaaS tooling", amount: 9800 },
  { id: uid(), date: "2025-04-06", type: "income", category: "Project Fee", description: "Vertex mobile app", amount: 98000 },
  { id: uid(), date: "2025-04-19", type: "expense", category: "Marketing", description: "Brand campaign", amount: 18500 },
  { id: uid(), date: "2025-05-02", type: "expense", category: "Office", description: "Lease & utilities", amount: 14200 },
  { id: uid(), date: "2025-05-21", type: "income", category: "Client Retainer", description: "Atlas Group — Q2 retainer", amount: 86000 },
  { id: uid(), date: "2025-06-03", type: "expense", category: "Payroll", description: "May salaries", amount: 73500 },
];

const seedEmployees: Employee[] = [
  { id: uid(), name: "Sofia Marwan", role: "Engineering Lead", department: "Engineering", salary: 142000, contractStatus: "Full-time", email: "sofia.marwan@ddrcompany.com", phone: "+1 (206) 555-0177", location: "Seattle, WA", startDate: "2021-09-02" },
  { id: uid(), name: "Liam O'Connor", role: "Senior Designer", department: "Design", salary: 108000, contractStatus: "Full-time", email: "liam.oconnor@ddrcompany.com", phone: "+1 (415) 555-0191", location: "San Francisco, CA", startDate: "2022-02-14" },
  { id: uid(), name: "Priya Nair", role: "Account Manager", department: "Sales", salary: 92000, contractStatus: "Full-time", email: "priya.nair@ddrcompany.com", phone: "+1 (415) 555-0148", location: "Austin, TX", startDate: "2021-01-11" },
  { id: uid(), name: "Tomás Vidal", role: "Finance Analyst", department: "Finance", salary: 84000, contractStatus: "Full-time", email: "tomas.vidal@ddrcompany.com", phone: "+1 (415) 555-0163", location: "San Francisco, CA", startDate: "2022-08-20" },
  { id: uid(), name: "Amara Bello", role: "Frontend Engineer", department: "Engineering", salary: 96000, contractStatus: "Contract", email: "amara.bello@ddrcompany.com", phone: "+1 (646) 555-0124", location: "New York, NY", startDate: "2023-03-01" },
  { id: uid(), name: "Noah Fischer", role: "QA Engineer", department: "Engineering", salary: 78000, contractStatus: "Probation", email: "noah.fischer@ddrcompany.com", phone: "+1 (312) 555-0139", location: "Chicago, IL", startDate: "2024-11-04" },
];

const seedPartners: Partner[] = [
  { id: uid(), name: "Dana Reyes", equity: 45, investment: 250000 },
  { id: uid(), name: "Aaron Cole", equity: 35, investment: 180000 },
  { id: uid(), name: "Mei Tanaka", equity: 20, investment: 110000 },
];

const seedReports: FinanceReport[] = [
  { id: uid(), title: "Q1 Performance Review", period: "Q1 2025", revenue: 138000, expenses: 71000, notes: "Strong retainer base, payroll on plan." },
  { id: uid(), title: "Q2 Performance Review", period: "Q2 2025", revenue: 184000, expenses: 106200, notes: "New project wins offset higher marketing spend." },
];

const seedInvoices: Invoice[] = [
  { id: uid(), client: "Atlas Group", amount: 86000, status: "Paid", due: "2025-05-30" },
  { id: uid(), client: "Helios Inc", amount: 124000, status: "Pending", due: "2025-07-15" },
  { id: uid(), client: "Northwind", amount: 52000, status: "Overdue", due: "2025-06-01" },
  { id: uid(), client: "Vertex Labs", amount: 98000, status: "Pending", due: "2025-07-28" },
];

const seedBudgets: Budget[] = [
  { id: uid(), department: "Engineering", allocated: 220000, spent: 161000 },
  { id: uid(), department: "Marketing", allocated: 60000, spent: 41500 },
  { id: uid(), department: "Operations", allocated: 90000, spent: 52800 },
  { id: uid(), department: "Sales", allocated: 75000, spent: 48000 },
];

const seedCandidates: Candidate[] = [
  { id: uid(), name: "Elena Ruiz", role: "Backend Engineer", department: "Engineering", stage: "Interview" },
  { id: uid(), name: "James Park", role: "Product Designer", department: "Design", stage: "Applied" },
  { id: uid(), name: "Hana Sato", role: "Sales Associate", department: "Sales", stage: "Offer" },
];

const seedShipments: Shipment[] = [
  { id: uid(), ref: "SHP-1042", origin: "Rotterdam", destination: "New York", status: "In Transit", eta: "2025-06-18" },
  { id: uid(), ref: "SHP-1043", origin: "Shanghai", destination: "Los Angeles", status: "Preparing", eta: "2025-06-25" },
  { id: uid(), ref: "SHP-1044", origin: "Hamburg", destination: "Chicago", status: "Delayed", eta: "2025-06-20" },
  { id: uid(), ref: "SHP-1041", origin: "Singapore", destination: "Seattle", status: "Delivered", eta: "2025-06-05" },
];

const seedInventory: InventoryItem[] = [
  { id: uid(), sku: "WG-100", name: "Steel Widgets", quantity: 1240, reorder: 400, location: "Warehouse A" },
  { id: uid(), sku: "CP-220", name: "Control Panels", quantity: 180, reorder: 250, location: "Warehouse B" },
  { id: uid(), sku: "BX-050", name: "Shipping Crates", quantity: 860, reorder: 300, location: "Warehouse A" },
  { id: uid(), sku: "SN-310", name: "Sensor Modules", quantity: 95, reorder: 120, location: "Warehouse C" },
];

function makeSeedState(): AppData {
  return {
    transactions: seedTransactions,
    employees: seedEmployees,
    partners: seedPartners,
    reports: seedReports,
    invoices: seedInvoices,
    budgets: seedBudgets,
    candidates: seedCandidates,
    shipments: seedShipments,
    inventory: seedInventory,
    activeProjects: 7,
    activities: [
      { id: uid(), kind: "income", message: "Helios platform delivery invoiced — $124,000", timestamp: "2025-02-04T10:00:00Z" },
      { id: uid(), kind: "employee", message: "Amara Bello joined Engineering", timestamp: "2025-03-01T09:00:00Z" },
      { id: uid(), kind: "expense", message: "Brand campaign expense logged — $18,500", timestamp: "2025-04-19T14:00:00Z" },
      { id: uid(), kind: "partner", message: "Q2 profit distribution prepared", timestamp: "2025-06-01T08:30:00Z" },
    ],
    messages: [
      { id: uid(), from: "Dana Reyes", target: "finance", title: "Q3 budget review", body: "Please prepare the Q3 budget review and share the updated forecast by end of week.", files: ["Q3-template.xlsx"], timestamp: "2025-06-02T09:00:00Z" },
      { id: uid(), from: "Dana Reyes", target: "all", title: "All-hands Friday", body: "Reminder: company all-hands this Friday at 10am. Bring your team updates.", files: [], timestamp: "2025-06-04T15:30:00Z" },
    ],
    reads: {},
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AppData>(makeSeedState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.data) setData({ ...makeSeedState(), ...parsed.data });
        if (parsed.user) setUser(parsed.user);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, data }));
    } catch {
      /* ignore */
    }
  }, [user, data, hydrated]);

  const pushActivity = (a: Omit<Activity, "id" | "timestamp">) => {
    setData((d) => ({
      ...d,
      activities: [{ id: uid(), timestamp: new Date().toISOString(), ...a }, ...d.activities].slice(0, 30),
    }));
  };

  const value = useMemo<AppContextValue>(() => {
    const totalRevenue = data.transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpenses = data.transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalPayroll = data.employees.reduce((s, e) => s + e.salary, 0);

    return {
      user,
      hydrated,
      canEdit: user ? user.role !== "ceo" : false,
      ...data,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalEmployees: data.employees.length,
      totalPayroll,
      login: (username, password) => {
        const key = username.trim().toLowerCase();
        const found = DEMO_USERS[key] ?? null;
        if (found && password.trim().toLowerCase() === key) {
          setUser(found);
          return found;
        }
        return null;
      },
      logout: () => setUser(null),
      addTransaction: (t) => {
        setData((d) => ({ ...d, transactions: [{ id: uid(), ...t }, ...d.transactions] }));
        pushActivity({
          kind: t.type,
          message: `${t.type === "income" ? "Income" : "Expense"} logged — ${t.description} ($${t.amount.toLocaleString()})`,
        });
      },
      updateTransaction: (id, t, comment) => {
        setData((d) => ({ ...d, transactions: d.transactions.map((x) => (x.id === id ? { id, ...t } : x)) }));
        pushActivity({ kind: t.type, message: `Transaction edited — ${t.description}${comment ? ` (${comment})` : ""}` });
      },
      deleteTransaction: (id) => {
        setData((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== id) }));
      },
      importTransactions: (rows) => {
        setData((d) => ({ ...d, transactions: [...rows.map((r) => ({ id: uid(), ...r })), ...d.transactions] }));
        pushActivity({ kind: "system", message: `Imported ${rows.length} transactions` });
      },
      addReport: (r) => {
        setData((d) => ({ ...d, reports: [{ id: uid(), ...r }, ...d.reports] }));
        pushActivity({ kind: "system", message: `Finance report created — ${r.title}` });
      },
      updateReport: (id, r, comment) => {
        setData((d) => ({ ...d, reports: d.reports.map((x) => (x.id === id ? { id, ...r } : x)) }));
        pushActivity({ kind: "system", message: `Report edited — ${r.title}${comment ? ` (${comment})` : ""}` });
      },
      deleteReport: (id) => setData((d) => ({ ...d, reports: d.reports.filter((x) => x.id !== id) })),
      addInvoice: (i) => setData((d) => ({ ...d, invoices: [{ id: uid(), ...i }, ...d.invoices] })),
      updateInvoice: (id, i, comment) => {
        setData((d) => ({ ...d, invoices: d.invoices.map((x) => (x.id === id ? { ...x, ...i } : x)) }));
        pushActivity({ kind: "system", message: `Invoice updated${comment ? ` — ${comment}` : ""}` });
      },
      deleteInvoice: (id) => setData((d) => ({ ...d, invoices: d.invoices.filter((x) => x.id !== id) })),
      addEmployee: (e) => {
        setData((d) => ({ ...d, employees: [{ id: uid(), ...e }, ...d.employees] }));
        pushActivity({ kind: "employee", message: `${e.name} joined ${e.department}` });
      },
      updateEmployee: (id, e, comment) => {
        setData((d) => ({ ...d, employees: d.employees.map((x) => (x.id === id ? { ...x, ...e } : x)) }));
        pushActivity({ kind: "employee", message: `Employee record edited${e.name ? ` — ${e.name}` : ""}${comment ? ` (${comment})` : ""}` });
      },
      deleteEmployee: (id) => setData((d) => ({ ...d, employees: d.employees.filter((x) => x.id !== id) })),
      addCandidate: (c) => setData((d) => ({ ...d, candidates: [{ id: uid(), ...c }, ...d.candidates] })),
      updateCandidate: (id, c, comment) => {
        setData((d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === id ? { ...x, ...c } : x)) }));
        pushActivity({ kind: "system", message: `Candidate edited${c.name ? ` — ${c.name}` : ""}${comment ? ` (${comment})` : ""}` });
      },
      deleteCandidate: (id) => setData((d) => ({ ...d, candidates: d.candidates.filter((x) => x.id !== id) })),
      advanceCandidate: (id) => {
        const order: Candidate["stage"][] = ["Applied", "Interview", "Offer", "Hired"];
        setData((d) => ({
          ...d,
          candidates: d.candidates.map((c) =>
            c.id === id ? { ...c, stage: order[Math.min(order.indexOf(c.stage) + 1, order.length - 1)] } : c,
          ),
        }));
      },
      addShipment: (s) => setData((d) => ({ ...d, shipments: [{ id: uid(), ...s }, ...d.shipments] })),
      updateShipment: (id, s, comment) => {
        setData((d) => ({ ...d, shipments: d.shipments.map((x) => (x.id === id ? { ...x, ...s } : x)) }));
        pushActivity({ kind: "system", message: `Shipment edited${s.ref ? ` — ${s.ref}` : ""}${comment ? ` (${comment})` : ""}` });
      },
      deleteShipment: (id) => setData((d) => ({ ...d, shipments: d.shipments.filter((x) => x.id !== id) })),
      addInventoryItem: (i) => setData((d) => ({ ...d, inventory: [{ id: uid(), ...i }, ...d.inventory] })),
      updateInventoryItem: (id, i, comment) => {
        setData((d) => ({ ...d, inventory: d.inventory.map((x) => (x.id === id ? { ...x, ...i } : x)) }));
        pushActivity({ kind: "system", message: `Inventory edited${i.name ? ` — ${i.name}` : ""}${comment ? ` (${comment})` : ""}` });
      },
      deleteInventoryItem: (id) => setData((d) => ({ ...d, inventory: d.inventory.filter((x) => x.id !== id) })),
      addMessage: (m) => {
        setData((d) => ({
          ...d,
          messages: [{ id: uid(), from: user?.name ?? "CEO", timestamp: new Date().toISOString(), ...m }, ...d.messages],
        }));
        pushActivity({ kind: "system", message: `Message sent to ${m.target === "all" ? "everyone" : m.target} — ${m.title}` });
      },
      markNotificationsRead: () => {
        if (!user) return;
        setData((d) => ({ ...d, reads: { ...d.reads, [user.role]: new Date().toISOString() } }));
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, data, hydrated]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { DEMO_USERS };
