import { useMemo, useState } from 'react';
import {
  Card,
  AreaChart,
  DonutChart,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@tremor/react';
import { motion, useReducedMotion } from 'motion/react';
import { EARNINGS_BY_MONTH, INVOICES, KPIS, GOAL, type InvoiceStatus } from '../data';
import type { ProjectPageProps } from '../App';
import { fmtMoney, fmtDate } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import ProjectIcon from '../components/ProjectIcon';
import ProgressWithLabel from '../components/ProgressWithLabel';
import SortIcon from '../components/SortIcon';
import { AnimatedNumber } from '../components/motion/AnimatedNumber';
import { Calendar, Folder, Users } from 'lucide-react';
import { useDataVizReady } from '../components/motion/dataViz';

const INVOICE_STATUS_ORDER: InvoiceStatus[] = ['Paid', 'Sent', 'Overdue', 'Draft'];
const INVOICE_STATUS_COLORS = ['emerald', 'blue', 'rose', 'gray'];
const INVOICE_STATUS_BARS = ['bg-emerald-500', 'bg-blue-500', 'bg-rose-500', 'bg-gray-400'];
const TODAY = new Date('2026-08-02T00:00:00');

// Style: title, big number, then each breakdown line gets its own full-width bar (ref: "Total tokens").
function StatRow({ label, value, pct, color, delay = 0 }: { label: string; value: number; pct: number; color: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-800">
           <AnimatedNumber value={value} format={fmtMoney} duration={600} />{' '}
           <span className="font-normal text-slate-500">(
             <AnimatedNumber value={pct} format={(v) => v.toFixed(0) + '%'} duration={600} />
           )</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.42, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function PendingInvoicesCard() {
  const sentAmount = INVOICES.filter((i) => i.status === 'Sent').reduce((s, i) => s + i.amount, 0);
  const overdueAmount = INVOICES.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);
  const total = sentAmount + overdueAmount || 1;

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pending invoices</p>
         <p className="text-3xl font-bold mt-1"><AnimatedNumber value={KPIS.pendingInvoices} format={fmtMoney} duration={600} /></p>
      </div>
      <div className="space-y-3">
          <StatRow label="Sent" value={sentAmount} pct={(sentAmount / total) * 100} color="bg-teal-400" delay={0.08} />
          <StatRow label="Overdue" value={overdueAmount} pct={(overdueAmount / total) * 100} color="bg-violet-500" delay={0.16} />
      </div>
    </Card>
  );
}

// Style 3 (ref: "Outstanding balance") — title, big number, shared bar + legend, divider, highlighted next-payment panel.
function EarningsCard() {
  const reduced = useReducedMotion();
  const goalPct = Math.min(100, Math.round((GOAL.current / GOAL.target) * 100));
  const remaining = GOAL.target - GOAL.current;
  const nextInvoice = useMemo(
    () => [...INVOICES].filter((i) => i.status === 'Sent' || i.status === 'Overdue').sort((a, b) => a.due.localeCompare(b.due))[0],
    [],
  );

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Earnings this month</p>
        <p className="text-3xl font-bold mt-1"><AnimatedNumber value={GOAL.current} format={fmtMoney} duration={600} /></p>
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mt-4 mb-2.5">
           <motion.div className="bg-teal-400" initial={{ width: 0 }} animate={{ width: `${goalPct}%` }} transition={reduced ? { duration: 0 } : { duration: 0.42, delay: 0.12, ease: 'easeOut' }} />
           <motion.div className="bg-violet-500" initial={{ width: 0 }} animate={{ width: `${100 - goalPct}%` }} transition={reduced ? { duration: 0 } : { duration: 0.42, delay: 0.18, ease: 'easeOut' }} />
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-teal-400" />
            <strong className="text-slate-700 font-semibold"><AnimatedNumber value={GOAL.current} format={fmtMoney} duration={600} /></strong> Earned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-violet-500" />
            <strong className="text-slate-700 font-semibold"><AnimatedNumber value={remaining} format={fmtMoney} duration={600} /></strong> To goal
          </span>
        </div>
      </div>
      {nextInvoice && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3.5 py-3">
            <p className="text-sm text-slate-600">
              Next payment of <strong className="font-semibold text-slate-800">{fmtMoney(nextInvoice.amount)}</strong> due{' '}
              {fmtDate(nextInvoice.due)}.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

// Style 4 (ref: "Emma's Online-Shop") — title (matches cards 1 & 4), fact pills, colored day-strip.
function ActiveProjectsCard({ projects }: Pick<ProjectPageProps, 'projects'>) {
  const active = projects.filter((p) => p.status !== 'Done');
  const sortedByDeadline = [...active].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const inProgressCount = active.filter((p) => p.status === 'In progress').length;
  const clientCount = new Set(active.map((p) => p.client)).size;
  const nearest = sortedByDeadline[0];

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active projects</p>
        <p className="text-3xl font-bold mt-1"><AnimatedNumber value={KPIS.activeProjects} format={(v) => Math.round(v).toLocaleString('en-US')} duration={600} /></p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
             <Folder className="w-3.5 h-3.5" /> <AnimatedNumber value={inProgressCount} format={(v) => Math.round(v).toLocaleString('en-US')} duration={600} /> in progress
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
             <Users className="w-3.5 h-3.5" /> <AnimatedNumber value={clientCount} format={(v) => Math.round(v).toLocaleString('en-US')} duration={600} /> clients
          </span>
          {nearest && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
              <Calendar className="w-3.5 h-3.5" /> Next due {fmtDate(nearest.deadline)}
            </span>
          )}
        </div>

        <div
          className="flex gap-[3px] mt-4"
          role="img"
          aria-label="Project deadline strip. Green means more than seven days away, amber means due within seven days, and red means overdue."
        >
          {sortedByDeadline.map((p) => {
            const days = Math.round((new Date(p.deadline + 'T00:00:00').getTime() - TODAY.getTime()) / 86400000);
            const color = days < 0 ? 'bg-rose-500' : days <= 7 ? 'bg-amber-400' : 'bg-emerald-500';
            return <span key={p.id} className={`flex-1 h-6 rounded-sm ${color}`} title={`${p.name} — due ${fmtDate(p.deadline)}`} />;
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500" aria-label="Deadline legend">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-500" />More than 7 days</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-amber-400" />Due within 7 days</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-rose-500" />Overdue</span>
        </div>
        <div className="flex items-center justify-between mt-1.5 text-xs text-slate-500">
          <span>Earliest deadline</span>
          <span>Latest deadline</span>
        </div>
      </div>
    </Card>
  );
}

type ProjectSortKey = 'name' | 'client' | 'status' | 'deadline' | 'value' | 'progress';

const PROJECT_COLS: { key: ProjectSortKey; label: string }[] = [
  { key: 'name', label: 'Project' },
  { key: 'client', label: 'Client' },
  { key: 'status', label: 'Status' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'value', label: 'Value' },
  { key: 'progress', label: 'Progress' },
];

export default function Overview({ projects }: ProjectPageProps) {
  const [mode, setMode] = useState<'earnings' | 'hours'>('earnings');
  const [projectSort, setProjectSort] = useState<{ key: ProjectSortKey; dir: 1 | -1 }>({ key: 'deadline', dir: 1 });
  const earningsChartReady = useDataVizReady(120);
  const invoiceChartReady = useDataVizReady(260);

  const invoiceStatusData = useMemo(
    () =>
      INVOICE_STATUS_ORDER.map((status) => ({
        status,
        amount: INVOICES.filter((i) => i.status === status).reduce((s, i) => s + i.amount, 0),
      })),
    [],
  );

  const projectPreview = useMemo(() => {
    const { key, dir } = projectSort;
    return [...projects].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir).slice(0, 8);
  }, [projects, projectSort]);

  function sortProjectsBy(key: ProjectSortKey) {
    setProjectSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));
  }

  const invoiceTotal = invoiceStatusData.reduce((s, d) => s + d.amount, 0) || 1;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Overview</h1>
          <p className="text-sm text-slate-500">Here's how things are looking this month.</p>
        </div>
      </div>

      {/* 3 KPIs, each in its own layout style — equal-width, one row on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <EarningsCard />
        <ActiveProjectsCard projects={projects} />
        <PendingInvoicesCard />
      </div>

      {/* 2 equal-width charts, filling the same width as the row above */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Earnings over time</h2>
            <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setMode('earnings')}
                className={`focus-ring px-2.5 py-1 rounded-full font-medium ${mode === 'earnings' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                Earnings
              </button>
              <button
                onClick={() => setMode('hours')}
                className={`focus-ring px-2.5 py-1 rounded-full font-medium ${mode === 'hours' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                Hours
              </button>
            </div>
          </div>
          <div className="h-64">
            {earningsChartReady && <AreaChart
              className="h-64"
              data={EARNINGS_BY_MONTH}
              index="month"
              categories={[mode]}
              colors={['emerald']}
              valueFormatter={(v) => (mode === 'earnings' ? fmtMoney(v) : `${v}h`)}
              showLegend={false}
              showAnimation
            />}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Invoice status</h2>
          <p className="mt-1 text-sm text-slate-500">Breakdown of invoiced amounts by status.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
             <div className="h-[13.5rem]">
               {invoiceChartReady && <DonutChart
                 className="h-[13.5rem]"
                 data={invoiceStatusData}
                 category="amount"
                 index="status"
                 colors={INVOICE_STATUS_COLORS}
                 valueFormatter={fmtMoney}
                 showTooltip={false}
                 showAnimation
               />}
             </div>
            <ul className="space-y-3">
              {invoiceStatusData.map((d, i) => (
                <li key={d.status} className="flex gap-3">
                  <span className={`w-1 shrink-0 rounded ${INVOICE_STATUS_BARS[i]}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {fmtMoney(d.amount)}{' '}
                      <span className="font-normal text-slate-500">
                        ({((d.amount / invoiceTotal) * 100).toFixed(1)}%)
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">{d.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Read-only project snapshot; the Projects page owns project management actions. */}
      <Card className="p-0 overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 pt-5 pb-3">
          <div>
            <h2 className="text-base font-semibold">Project snapshot</h2>
            <p className="text-xs text-slate-500 mt-0.5">Read-only overview. Manage projects from Projects.</p>
          </div>
        </div>
        <Table>
          <TableHead className="bg-slate-50">
            <TableRow>
              {PROJECT_COLS.map((col) => (
                <TableHeaderCell
                  key={col.key}
                  aria-sort={projectSort.key === col.key ? (projectSort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                  className="select-none"
                >
                  <button
                    type="button"
                    onClick={() => sortProjectsBy(col.key)}
                    className="focus-ring inline-flex items-center gap-1 rounded"
                  >
                    {col.label}
                    <SortIcon active={projectSort.key === col.key} dir={projectSort.dir} />
                  </button>
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {projectPreview.map((p) => {
              return (
                <TableRow key={p.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <ProjectIcon seed={p.id} />
                      <span className="truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar name={p.client} />
                      {p.client}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-slate-600">{fmtDate(p.deadline)}</TableCell>
                  <TableCell className="font-medium">{fmtMoney(p.value)}</TableCell>
                  <TableCell className="w-36">
                    <ProgressWithLabel value={p.progress} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

      </Card>
    </div>
  );
}
