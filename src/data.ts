// Dummy data model — frontend only, no backend.
export type ProjectStatus = 'To do' | 'In progress' | 'Review' | 'Done';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';
export type ClientStatus = 'Active' | 'Lead' | 'Past';

export interface Client {
  id: number;
  name: string;
  company: string;
  status: ClientStatus;
  lastActivity: string;
  activeProjects: number;
  totalBilled: number;
}

export interface ProjectTask { label: string; done: boolean }
export interface TimelineEvent { text: string; date: string }

export interface Project {
  id: number;
  name: string;
  client: string;
  status: ProjectStatus;
  value: number;
  progress: number;
  deadline: string;
  paymentStatus: InvoiceStatus;
  tasks: ProjectTask[];
  timeline: TimelineEvent[];
}

export interface Invoice {
  id: number;
  number: string;
  projectId: number;
  client: string;
  amount: number;
  issued: string;
  due: string;
  status: InvoiceStatus;
}

export interface EarningsMonth { month: string; earnings: number; hours: number }
export interface ActivityItem { id: number; text: string; when: string }

const CLIENTS_RAW: Omit<Client, 'activeProjects' | 'totalBilled'>[] = [
  { id: 1, name: 'Priya Nair', company: 'Fernweh Studio', status: 'Active', lastActivity: '2026-07-29' },
  { id: 2, name: 'Marcus Webb', company: 'Northbound Coffee', status: 'Active', lastActivity: '2026-07-31' },
  { id: 3, name: 'Elena Cho', company: 'Lucid Health', status: 'Active', lastActivity: '2026-07-22' },
  { id: 4, name: 'Tobias Reinholt', company: 'Kaskade Outdoor', status: 'Past', lastActivity: '2026-05-14' },
  { id: 5, name: 'Amara Okoye', company: 'Bloomwell', status: 'Active', lastActivity: '2026-07-30' },
  { id: 6, name: 'Sana Farouk', company: 'Verdant Realty', status: 'Lead', lastActivity: '2026-07-18' },
  { id: 7, name: 'Jonas Berg', company: 'Halden & Co.', status: 'Active', lastActivity: '2026-07-25' },
  { id: 8, name: 'Ines Duarte', company: 'Sable Studio', status: 'Past', lastActivity: '2026-04-02' },
  { id: 9, name: 'Wei Chen', company: 'Orbital Games', status: 'Active', lastActivity: '2026-07-28' },
  { id: 10, name: 'Naomi Kessler', company: 'Rootline Ventures', status: 'Lead', lastActivity: '2026-07-10' },
  { id: 11, name: 'Diego Salcedo', company: 'Puro Coffee Co.', status: 'Active', lastActivity: '2026-07-27' },
  { id: 12, name: 'Freya Lindqvist', company: 'Nordvik Design', status: 'Active', lastActivity: '2026-07-15' },
  { id: 13, name: 'Yusuf Demir', company: 'Anchorpoint Legal', status: 'Past', lastActivity: '2026-03-20' },
  { id: 14, name: 'Clara Bennett', company: 'Wildflower Market', status: 'Active', lastActivity: '2026-07-26' },
  { id: 15, name: 'Ravi Malhotra', company: 'Summit Analytics', status: 'Lead', lastActivity: '2026-07-05' },
];

const PROJECT_TEMPLATES: [string, ProjectStatus, number, number][] = [
  ['Brand identity refresh', 'To do', 4800, 10],
  ['Marketing site redesign', 'In progress', 7200, 45],
  ['Mobile app UI kit', 'In progress', 6400, 60],
  ['Product launch landing page', 'Review', 3200, 90],
  ['Q3 pitch deck design', 'Done', 1800, 100],
  ['Packaging design system', 'To do', 5200, 5],
  ['Email newsletter template', 'Done', 900, 100],
  ['Design system audit', 'In progress', 4200, 35],
  ['Onboarding flow redesign', 'Review', 3800, 85],
  ['Social media content kit', 'To do', 1500, 0],
  ['Investor one-pager', 'Done', 1200, 100],
  ['Dashboard UX overhaul', 'In progress', 8800, 55],
  ['Logo & wordmark exploration', 'Review', 2400, 95],
  ['App icon set', 'Done', 700, 100],
  ['Café menu & signage', 'To do', 1600, 15],
  ['Annual report layout', 'In progress', 5400, 40],
  ['Checkout flow redesign', 'Review', 4600, 80],
  ['Style guide documentation', 'To do', 2000, 0],
  ['Conference booth graphics', 'Done', 2600, 100],
  ['Referral program UI', 'In progress', 3600, 25],
];

const TASK_SETS = [
  ['Kickoff call', 'Moodboard approval', 'Wireframes', 'Final delivery'],
  ['Audit current assets', 'Concept exploration', 'Client review', 'Handoff files'],
  ['Discovery', 'Wireframes', 'Visual design', 'QA & handoff'],
];

function seededDate(offsetDays: number): string {
  const d = new Date('2026-08-02');
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const PROJECTS: Project[] = PROJECT_TEMPLATES.map(([name, status, value, progress], i) => {
  const client = CLIENTS_RAW[i % CLIENTS_RAW.length];
  const taskSet = TASK_SETS[i % TASK_SETS.length];
  const tasks: ProjectTask[] = taskSet.map((label, j) => ({
    label,
    done: j < Math.round((progress / 100) * taskSet.length),
  }));
  return {
    id: i + 1,
    name,
    client: client.name,
    status,
    value,
    progress,
    deadline: seededDate(-10 + i * 3),
    paymentStatus: progress === 100 ? 'Paid' : progress > 50 ? 'Sent' : 'Draft',
    tasks,
    timeline: [
      { text: 'Project created', date: seededDate(-30 + i) },
      { text: 'Scope agreed with client', date: seededDate(-25 + i) },
      { text: 'Work in progress', date: seededDate(-15 + i) },
    ],
  };
});

const INVOICE_STATUS_CYCLE: InvoiceStatus[] = ['Paid', 'Paid', 'Sent', 'Overdue', 'Draft', 'Paid', 'Sent'];
export const INVOICES: Invoice[] = Array.from({ length: 25 }, (_, i) => {
  const client = CLIENTS_RAW[i % CLIENTS_RAW.length];
  const clientProjects = PROJECTS.filter((project) => project.client === client.name);
  const status = INVOICE_STATUS_CYCLE[i % INVOICE_STATUS_CYCLE.length];
  return {
    id: i + 1,
    number: `INV-${1042 + i}`,
    projectId: clientProjects[i % clientProjects.length].id,
    client: client.name,
    amount: 600 + (i % 9) * 450,
    issued: seededDate(-40 + i * 2),
    due: seededDate(-40 + i * 2 + 14),
    status,
  };
});

const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
export const EARNINGS_BY_MONTH: EarningsMonth[] = MONTHS.map((month, i) => ({
  month,
  earnings: [4200, 3800, 5100, 6200, 4900, 5600, 7100, 6800, 7400, 8200, 7900, 9100][i],
  hours: [86, 74, 92, 104, 88, 96, 112, 108, 118, 126, 120, 131][i],
}));

export const ACTIVITY: ActivityItem[] = [
  { id: 1, text: 'Invoice INV-1063 marked as paid by Diego Salcedo', when: '2 hours ago' },
  { id: 2, text: 'Marcus Webb left a 5-star review', when: 'Yesterday' },
  { id: 3, text: 'Sent proposal to Sana Farouk', when: 'Yesterday' },
  { id: 4, text: 'Completed task "Wireframes" on Onboarding flow redesign', when: '2 days ago' },
  { id: 5, text: 'New invoice INV-1065 created for Wei Chen', when: '3 days ago' },
  { id: 6, text: 'Amara Okoye approved final designs', when: '4 days ago' },
  { id: 7, text: 'Uploaded final files for Q3 pitch deck design', when: '5 days ago' },
  { id: 8, text: 'Scheduled kickoff call with Naomi Kessler', when: '1 week ago' },
];

function computeClientTotals(): Client[] {
  const map: Record<string, { activeProjects: number; totalBilled: number }> = {};
  CLIENTS_RAW.forEach((c) => (map[c.name] = { activeProjects: 0, totalBilled: 0 }));
  PROJECTS.forEach((p) => { if (p.status !== 'Done') map[p.client].activeProjects++; });
  INVOICES.forEach((inv) => { if (inv.status === 'Paid') map[inv.client].totalBilled += inv.amount; });
  return CLIENTS_RAW.map((c) => ({ ...c, ...map[c.name] }));
}

export const CLIENTS: Client[] = computeClientTotals();

export const KPIS = {
  earnings: EARNINGS_BY_MONTH[EARNINGS_BY_MONTH.length - 1].earnings,
  earningsDelta: Math.round(
    ((EARNINGS_BY_MONTH.at(-1)!.earnings - EARNINGS_BY_MONTH.at(-2)!.earnings) / EARNINGS_BY_MONTH.at(-2)!.earnings) * 100,
  ),
  activeProjects: PROJECTS.filter((p) => p.status !== 'Done').length,
  pendingInvoices: INVOICES.filter((i) => i.status === 'Sent' || i.status === 'Overdue').reduce((s, i) => s + i.amount, 0),
  avgRating: 4.8,
};

export const GOAL = { current: 9100, target: 11000 };
