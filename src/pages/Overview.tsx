import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Folder, Info, Plus, Users } from 'lucide-react';
import { AreaChart, DonutChart } from '@tremor/react';
import { CLIENTS, EARNINGS_BY_MONTH, INVOICES, type InvoiceStatus, type Project, type ProjectStatus } from '../data';
import type { ProjectPageProps } from '../App';
import { fmtDate, fmtMoney } from '../lib/format';
import Avatar from '../components/Avatar';
import ProjectIcon from '../components/ProjectIcon';
import ProgressWithLabel from '../components/ProgressWithLabel';
import ProjectDrawer from '../components/ProjectDrawer';
import ClientPanel from '../components/ClientPanel';
import PaymentBreakdown from '../components/PaymentBreakdown';
import OnboardingModal from '../components/OnboardingModal';

const TODAY = new Date('2026-08-02T00:00:00');
const INVOICE_STATUSES: { label: InvoiceStatus; amount: number; color: string }[] = [
  { label: 'Paid', amount: 25950, color: '#16b887' },
  { label: 'Sent', amount: 15900, color: '#3d7ff0' },
  { label: 'Overdue', amount: 10500, color: '#f43f5e' },
];

function TrendChart({ mode }: { mode: 'earnings' | 'hours' }) {
  return (
    <AreaChart
      className="overview-trend"
      data={EARNINGS_BY_MONTH}
      index="month"
      categories={[mode]}
      colors={['emerald']}
      valueFormatter={(value) => mode === 'earnings' ? fmtMoney(value) : `${value}h`}
      showLegend={false}
      showTooltip={true}
      showAnimation
      showYAxis={false}
      showGridLines={false}
    />
  );
}

function UpcomingPaymentStack({ projects }: { projects: Project[] }) {
  const payments = useMemo(() => INVOICES.filter((invoice) => invoice.status === 'Sent' || invoice.status === 'Overdue').sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4), []);
  const stackPayments = payments.slice(0, 3);
  const [order, setOrder] = useState<number[]>(() => stackPayments.map((invoice) => invoice.id));
  const activeInvoice = stackPayments.find((invoice) => invoice.id === order[0]);

  useEffect(() => {
    if (payments.length < 2) return;
    const interval = window.setInterval(() => setOrder((current) => current.length > 1 ? [...current.slice(1), current[0]] : current), 5500);
    return () => window.clearInterval(interval);
  }, [payments.length]);

  if (!activeInvoice) return null;

  return (
    <div className="overview-payment-stack" aria-live="polite">
      {order.map((invoiceId) => {
        const invoice = stackPayments.find((item) => item.id === invoiceId);
        if (!invoice) return null;
        const layer = order.indexOf(invoice.id);
        const invoiceProject = projects.find((item) => item.id === invoice.projectId);
        const isActive = invoice.id === activeInvoice?.id;
        return (
          <motion.div
            key={invoice.id}
            className={`overview-payment-box overview-payment-stack-card ${isActive ? 'active' : ''}`}
            layout
            initial={false}
            animate={{ opacity: isActive ? 1 : Math.max(.28, .62 - layer * .14), y: isActive ? 0 : layer * -7, scale: isActive ? 1 : 1 - layer * .025, zIndex: isActive ? 3 : 2 - layer }}
            transition={{ type: 'spring', stiffness: 180, damping: 23, mass: .7 }}
            style={{ pointerEvents: isActive ? 'auto' : 'none' }}
          >
            <div><strong>{fmtMoney(invoice.amount)}</strong><span>{invoice.client} · {invoiceProject?.name ?? 'Project payment'}</span><span>{invoice.status === 'Overdue' ? 'Overdue' : `Due ${fmtDate(invoice.due)}`}</span></div>
            <span className="overview-calendar"><Calendar size={20} /></span>
          </motion.div>
        );
      })}
    </div>
  );
}

function EarningsHero({ mode, setMode, projects }: { mode: 'earnings' | 'hours'; setMode: (mode: 'earnings' | 'hours') => void; projects: Project[] }) {
  const reduced = useReducedMotion();
  return (
    <section className="overview-hero">
      <div className="overview-hero-summary">
        <p className="overview-eyebrow">Earnings this month</p>
        <p className="overview-hero-value">$9,100</p>
        <div className="overview-goal-bar" aria-label="83 percent of monthly goal reached">
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: '83%' }}
            transition={reduced ? { duration: 0 } : { duration: 0.55, ease: 'easeOut' }}
          />
        </div>
        <div className="overview-legend overview-hero-legend">
          <span><i className="legend-dot mint" /> <strong>$9,100</strong> Earned</span>
          <span><i className="legend-dot slate" /> <strong>$1,900</strong> To goal</span>
        </div>
        <div className="overview-payment"><p>Upcoming Payment</p><UpcomingPaymentStack projects={projects} /></div>
      </div>
      <div className="overview-trend-panel">
        <div className="overview-trend-heading">
          <div><h2>Performance Trends</h2><p>Earnings &amp; hours logged over time.</p></div>
          <div className="overview-toggle" role="group" aria-label="Trend metric">
            {(['earnings', 'hours'] as const).map((item) => (
              <button key={item} onClick={() => setMode(item)} className={mode === item ? 'active' : ''}>
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overview-chart-wrap"><TrendChart mode={mode} /></div>
      </div>
    </section>
  );
}

function ActiveProjectsCard({ projects, selected, onClick }: Pick<ProjectPageProps, 'projects'> & { selected: boolean; onClick: () => void }) {
  const active = projects.filter((project) => project.status !== 'Done');
  const sorted = [...active].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const inProgress = active.filter((project) => project.status === 'In progress').length;
  const clientCount = new Set(active.map((project) => project.client)).size;
  return (
    <section className={`overview-card active-projects-card cursor-pointer transition-shadow hover:shadow-md ${selected ? 'ring-2 ring-emerald-200' : ''}`} onClick={onClick} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onClick(); }} role="button" tabIndex={0} aria-pressed={selected}>
      <p className="overview-eyebrow light">Active projects</p>
      <p className="overview-card-value">15</p>
      <p className="overview-card-subtitle">Projects currently in progress.</p>
      <div className="overview-fact-row">
        <span><Folder size={16} /> {inProgress} in progress</span>
        <span><Users size={16} /> {clientCount} clients</span>
        <span><Calendar size={16} /> Next due Jul 23</span>
      </div>
      <div className="overview-deadline-strip">
        {sorted.slice(0, 15).map((project) => {
          const days = Math.round((new Date(`${project.deadline}T00:00:00`).getTime() - TODAY.getTime()) / 86400000);
          return <span key={project.id} className={days < 0 ? 'overdue' : days <= 7 ? 'soon' : 'safe'} title={project.name} />;
        })}
      </div>
      <div className="overview-legend overview-deadline-legend">
        <span><i className="legend-dot green" /> &gt; 7 days</span><span><i className="legend-dot amber" /> ≤ 7 days</span><span><i className="legend-dot red" /> Overdue</span>
      </div>
      <div className="overview-deadline-labels"><span>Earliest deadline</span><span>Latest deadline</span></div>
    </section>
  );
}

function PendingInvoicesCard({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <section className={`overview-card pending-card cursor-pointer transition-shadow hover:shadow-md ${active ? 'ring-2 ring-emerald-200' : ''}`} onClick={onClick} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onClick(); }} role="button" tabIndex={0} aria-pressed={active}>
      <div><p className="overview-eyebrow light">Pending invoices <Info size={15} /></p><p className="overview-card-value">$26,400</p><p className="overview-card-subtitle">Invoices awaiting payment.</p></div>
      <div className="overview-invoice-bars">
        <div><span>Sent</span><strong>$15,900 <em>(60%)</em></strong><i><b className="sent" /></i></div>
        <div><span>Overdue</span><strong>$10,500 <em>(40%)</em></strong><i><b className="overdue-bar" /></i></div>
      </div>
    </section>
  );
}

function InvoiceStatusCard() {
  const chartData = INVOICE_STATUSES.map((item) => ({ name: item.label, amount: item.amount }));
  return (
    <section className="overview-card invoice-status-card">
      <p className="overview-eyebrow light">Invoice status</p>
      <p className="overview-card-value">$52k</p>
      <p className="overview-invoice-subtitle">Breakdown of invoiced amounts by status.</p>
      <div className="overview-pie-row">
        <DonutChart data={chartData} category="amount" index="name" valueFormatter={fmtMoney} showTooltip={true} className="overview-donut" colors={['emerald', 'blue', 'rose']} />
        <ul>{INVOICE_STATUSES.map((item) => <li key={item.label}><i style={{ background: item.color }} /><span>{item.label}</span><strong>{fmtMoney(item.amount)}</strong></li>)}</ul>
      </div>
    </section>
  );
}

type ProjectSortKey = 'name' | 'client' | 'status' | 'deadline' | 'value' | 'progress';

function statusTone(status: ProjectStatus) {
  if (status === 'In progress') return 'blue';
  if (status === 'Review') return 'amber';
  if (status === 'Done') return 'green';
  return 'slate';
}

type OverviewFilter = 'active' | 'outstanding' | 'dueSoon';

export default function Overview({ projects, setProjects }: ProjectPageProps) {
  const [mode, setMode] = useState<'earnings' | 'hours'>('earnings');
  const [sort, setSort] = useState<{ key: ProjectSortKey; dir: 1 | -1 }>({ key: 'deadline', dir: 1 });
  const [filter, setFilter] = useState<OverviewFilter | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState('8');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [paymentProjectId, setPaymentProjectId] = useState<number | null>(null);
  const sortBy = (key: ProjectSortKey) => setSort((current) => current.key === key ? { key, dir: current.dir === 1 ? -1 : 1 } : { key, dir: 1 });
  const goToProjects = () => { window.location.hash = 'projects'; };
  const daysUntil = (deadline: string) => Math.round((new Date(`${deadline}T00:00:00`).getTime() - TODAY.getTime()) / 86400000);
  const filteredProjects = useMemo(() => projects.filter((project) => {
    if (filter === 'active') return project.status !== 'Done';
    if (filter === 'outstanding') return project.paymentStatus !== 'Paid';
    if (filter === 'dueSoon') return daysUntil(project.deadline) <= 7;
    return true;
  }), [filter, projects]);
  const sortedRows = useMemo(() => [...filteredProjects].sort((a, b) => (a[sort.key] > b[sort.key] ? sort.dir : a[sort.key] < b[sort.key] ? -sort.dir : 0)), [filteredProjects, sort]);
  const perPage = Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const rows = sortedRows.slice((currentPage - 1) * perPage, currentPage * perPage);
  const selectedProject = selectedProjectId === null ? null : projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedClient = selectedClientName ? CLIENTS.find((client) => client.name === selectedClientName) ?? null : null;
  const paymentProject = paymentProjectId === null ? null : projects.find((project) => project.id === paymentProjectId) ?? null;
  const activeFilterLabel = filter === 'active' ? 'Active projects' : filter === 'outstanding' ? 'Outstanding' : filter === 'dueSoon' ? 'Due this week' : null;
  const applyFilter = (next: OverviewFilter) => { setPage(1); setFilter((current) => current === next ? null : next); };
  const setStatus = (projectId: number, status: ProjectStatus) => setProjects((current) => current.map((project) => project.id === projectId ? { ...project, status } : project));
  const toggleTask = (taskIndex: number) => selectedProject && setProjects((current) => current.map((project) => project.id === selectedProject.id ? { ...project, tasks: project.tasks.map((task, index) => index === taskIndex ? { ...task, done: !task.done } : task) } : project));
  const addTask = (label: string) => selectedProject && setProjects((current) => current.map((project) => project.id === selectedProject.id ? { ...project, tasks: [...project.tasks, { label, done: false }] } : project));
  const removeTask = (taskIndex: number) => selectedProject && setProjects((current) => current.map((project) => project.id === selectedProject.id ? { ...project, tasks: project.tasks.filter((_, index) => index !== taskIndex) } : project));

  return (
    <div className="overview-page">
      <OnboardingModal />
      <div className="overview-heading"><div><h1>Overview</h1><p>Here's how things are looking this month.</p></div><button className="overview-new-project" onClick={goToProjects}><Plus size={21} /> New Project</button></div>
      <EarningsHero mode={mode} setMode={setMode} projects={projects} />
      <div className="overview-kpi-grid"><ActiveProjectsCard projects={projects} selected={filter === 'active'} onClick={() => applyFilter('active')} /><PendingInvoicesCard active={filter === 'outstanding'} onClick={() => applyFilter('outstanding')} /><InvoiceStatusCard /></div>
      {activeFilterLabel && <div className="overview-filter-row"><span className="overview-filter-chip">{activeFilterLabel}<button type="button" onClick={() => setFilter(null)} aria-label={`Clear ${activeFilterLabel} filter`}>×</button></span></div>}
      <section className="overview-attention">
        <div className="overview-attention-heading"><h2>Needs attention</h2><p>Deadlines within 7 days and overdue projects.</p></div>
        <div className="overview-table-scroll"><table><thead><tr>{[['name', 'Project'], ['client', 'Client'], ['deadline', 'Due in'], ['status', 'Status'], ['value', 'Value'], ['progress', 'Progress']].map(([key, label]) => <th key={key}><button onClick={() => sortBy(key as ProjectSortKey)}>{label}</button></th>)}</tr></thead>
          <tbody>{rows.map((project) => { const days = daysUntil(project.deadline); const tone = statusTone(project.status); return <tr key={project.id}><td><button type="button" className="overview-table-link overview-project-name" onClick={() => setSelectedProjectId(project.id)}><ProjectIcon seed={project.id} />{project.name}</button></td><td><button type="button" className="overview-table-link overview-client" onClick={() => setSelectedClientName(project.client)}><Avatar name={project.client} />{project.client}</button></td><td className={days < 0 ? 'due-overdue' : ''}>{days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}</td><td><span className={`overview-status-control ${tone}`}><select aria-label={`Change status for ${project.name}`} value={project.status} onChange={(event) => setStatus(project.id, event.target.value as ProjectStatus)} className="overview-status-select"><option>To do</option><option>In progress</option><option>Review</option><option>Done</option></select><ChevronDown size={14} aria-hidden="true" /></span></td><td><button type="button" className="overview-value-link" onClick={() => setPaymentProjectId(project.id)}>{fmtMoney(project.value)}</button></td><td><ProgressWithLabel value={project.progress} /></td></tr>; })}</tbody>
         </table></div>
        <div className="overview-table-pagination"><label className="overview-page-size">Rows per page <span className="overview-page-size-select"><select value={rowsPerPage} onChange={(event) => { setRowsPerPage(event.target.value); setPage(1); }} aria-label="Rows per page"><option value="8">8</option><option value="15">15</option><option value="25">25</option></select><ChevronDown className="h-4 w-4" aria-hidden="true" /></span></label><div className="overview-page-controls"><span>Page <strong>{currentPage}/{totalPages}</strong></span><div className="flex items-center gap-1"><button type="button" onClick={() => setPage(1)} disabled={currentPage === 1} aria-label="First page"><ChevronsLeft className="h-4 w-4" /></button><button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} aria-label="Last page"><ChevronsRight className="h-4 w-4" /></button></div></div></div>
      </section>
      <ProjectDrawer project={selectedProject} onClose={() => setSelectedProjectId(null)} onToggleTask={toggleTask} onAddTask={addTask} onRemoveTask={removeTask} />
      <ClientPanel client={selectedClient} projects={projects} onClose={() => setSelectedClientName(null)} />
      <PaymentBreakdown project={paymentProject} onClose={() => setPaymentProjectId(null)} />
    </div>
  );
}
