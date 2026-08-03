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
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, FolderKanban, Users, Clock, ArrowUpRight, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import { PROJECTS, EARNINGS_BY_MONTH, INVOICES, KPIS, GOAL, type InvoiceStatus, type Project } from '../data';
import { fmtMoney, fmtDate } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import ProjectIcon from '../components/ProjectIcon';
import ProgressWithLabel from '../components/ProgressWithLabel';
import SortIcon from '../components/SortIcon';
import Toast from '../components/Toast';
import { staggerContainer, staggerItem } from '../components/motion/interactions';

const INVOICE_STATUS_ORDER: InvoiceStatus[] = ['Paid', 'Sent', 'Overdue', 'Draft'];
const INVOICE_STATUS_COLORS = ['emerald', 'blue', 'rose', 'gray'];
const INVOICE_STATUS_BARS = ['bg-emerald-500', 'bg-blue-500', 'bg-rose-500', 'bg-gray-400'];
const TODAY = new Date('2026-08-02T00:00:00');

// Style: title, big number, then each breakdown line gets its own full-width bar (ref: "Total tokens").
function StatRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-800">
          {value} <span className="font-normal text-slate-400">({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
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
        <p className="text-3xl font-bold mt-1">{fmtMoney(KPIS.pendingInvoices)}</p>
      </div>
      <div className="space-y-3">
        <StatRow label="Sent" value={fmtMoney(sentAmount)} pct={(sentAmount / total) * 100} color="bg-teal-400" />
        <StatRow label="Overdue" value={fmtMoney(overdueAmount)} pct={(overdueAmount / total) * 100} color="bg-violet-500" />
      </div>
    </Card>
  );
}

// Style 3 (ref: "Outstanding balance") — title, big number, shared bar + legend, divider, highlighted next-payment panel.
function EarningsCard() {
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
        <p className="text-3xl font-bold mt-1">{fmtMoney(GOAL.current)}</p>
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mt-4 mb-2.5">
          <div className="bg-teal-400" style={{ width: `${goalPct}%` }} />
          <div className="bg-violet-500" style={{ width: `${100 - goalPct}%` }} />
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-teal-400" />
            <strong className="text-slate-700 font-semibold">{fmtMoney(GOAL.current)}</strong> Earned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-violet-500" />
            <strong className="text-slate-700 font-semibold">{fmtMoney(remaining)}</strong> To goal
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
            <button className="focus-ring inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 shrink-0">
              View <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Style 4 (ref: "Emma's Online-Shop") — title (matches cards 1 & 4), fact pills, colored day-strip.
function ActiveProjectsCard() {
  const active = PROJECTS.filter((p) => p.status !== 'Done');
  const sortedByDeadline = [...active].sort((a, b) => a.deadline.localeCompare(b.deadline));
  const inProgressCount = active.filter((p) => p.status === 'In progress').length;
  const clientCount = new Set(active.map((p) => p.client)).size;
  const nearest = sortedByDeadline[0];

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active projects</p>
        <p className="text-3xl font-bold mt-1">{KPIS.activeProjects}</p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
            <FolderKanban className="w-3.5 h-3.5" aria-hidden /> {inProgressCount} in progress
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
            <Users className="w-3.5 h-3.5" aria-hidden /> {clientCount} clients
          </span>
          {nearest && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
              <Clock className="w-3.5 h-3.5" aria-hidden /> Next due {fmtDate(nearest.deadline)}
            </span>
          )}
        </div>

        <div className="flex gap-[3px] mt-4" aria-hidden>
          {sortedByDeadline.map((p) => {
            const days = Math.round((new Date(p.deadline + 'T00:00:00').getTime() - TODAY.getTime()) / 86400000);
            const color = days < 0 ? 'bg-rose-500' : days <= 7 ? 'bg-amber-400' : 'bg-emerald-500';
            return <span key={p.id} className={`flex-1 h-6 rounded-sm ${color}`} title={`${p.name} — due ${fmtDate(p.deadline)}`} />;
          })}
        </div>
        <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400">
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

export default function Overview() {
  const [mode, setMode] = useState<'earnings' | 'hours'>('earnings');
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [projectSort, setProjectSort] = useState<{ key: ProjectSortKey; dir: 1 | -1 }>({ key: 'deadline', dir: 1 });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState('');

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

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAllPreviewRows() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = projectPreview.every((p) => next.has(p.id));
      projectPreview.forEach((p) => (allSelected ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  }

  function duplicateProject(p: Project) {
    const maxId = Math.max(...projects.map((x) => x.id));
    setProjects((prev) => [...prev, { ...p, id: maxId + 1, name: `${p.name} (copy)` }]);
  }

  function deleteProject(id: number) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function deleteSelected() {
    setToast(`Deleted ${selectedIds.size} project${selectedIds.size === 1 ? '' : 's'}`);
    setTimeout(() => setToast(''), 2200);
    selectedIds.forEach((id) => deleteProject(id));
  }

  const allPreviewSelected = projectPreview.length > 0 && projectPreview.every((p) => selectedIds.has(p.id));

  const invoiceTotal = invoiceStatusData.reduce((s, d) => s + d.amount, 0) || 1;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Overview</h1>
          <p className="text-sm text-slate-500">Here's how things are looking this month.</p>
        </div>
        <button className="focus-ring flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-hairline bg-white text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 shrink-0">
          <Filter className="w-4 h-4" aria-hidden />
          Filter
        </button>
      </div>

      {/* 3 KPIs, each in its own layout style — equal-width, one row on large screens */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <EarningsCard />
        </motion.div>
        <motion.div variants={staggerItem}>
          <ActiveProjectsCard />
        </motion.div>
        <motion.div variants={staggerItem}>
          <PendingInvoicesCard />
        </motion.div>
      </motion.div>

      {/* 2 equal-width charts, filling the same width as the row above */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Earnings over time</h2>
            <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setMode('earnings')}
                className={`focus-ring px-2.5 py-1 rounded-md font-medium ${mode === 'earnings' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                Earnings
              </button>
              <button
                onClick={() => setMode('hours')}
                className={`focus-ring px-2.5 py-1 rounded-md font-medium ${mode === 'hours' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
              >
                Hours
              </button>
            </div>
          </div>
          <AreaChart
            className="h-64"
            data={EARNINGS_BY_MONTH}
            index="month"
            categories={[mode]}
            colors={['emerald']}
            valueFormatter={(v) => (mode === 'earnings' ? fmtMoney(v) : `${v}h`)}
            showLegend={false}
            showAnimation
          />
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Invoice status</h2>
          <p className="mt-1 text-sm text-slate-500">Breakdown of invoiced amounts by status.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <DonutChart
              className="h-[13.5rem]"
              data={invoiceStatusData}
              category="amount"
              index="status"
              colors={INVOICE_STATUS_COLORS}
              valueFormatter={fmtMoney}
              showTooltip={false}
            />
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

      {/* Full-width projects table — same style/behavior as the Projects page table */}
      <Card className="p-0 overflow-x-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-base font-semibold">Projects</h2>
          <span className="text-xs text-slate-400">Showing {projectPreview.length} of {projects.length}</span>
        </div>
        <Table>
          <TableHead className="bg-slate-50">
            <TableRow>
              <TableHeaderCell className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all rows"
                  checked={allPreviewSelected}
                  onChange={toggleAllPreviewRows}
                  className="focus-ring w-4 h-4 rounded accent-slate-900"
                />
              </TableHeaderCell>
              {PROJECT_COLS.map((col) => (
                <TableHeaderCell
                  key={col.key}
                  tabIndex={0}
                  onClick={() => sortProjectsBy(col.key)}
                  onKeyDown={(e) => e.key === 'Enter' && sortProjectsBy(col.key)}
                  aria-sort={projectSort.key === col.key ? (projectSort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                  className="focus-ring cursor-pointer select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon active={projectSort.key === col.key} dir={projectSort.dir} />
                  </span>
                </TableHeaderCell>
              ))}
              <TableHeaderCell className="w-10" />
            </TableRow>
          </TableHead>
          <TableBody>
            {projectPreview.map((p) => {
              const isSelected = selectedIds.has(p.id);
              return (
                <TableRow key={p.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-slate-50' : ''}`}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${p.name}`}
                      checked={isSelected}
                      onChange={() => toggleRow(p.id)}
                      className="focus-ring w-4 h-4 rounded accent-slate-900"
                    />
                  </TableCell>
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
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Menu as="div" className="relative">
                      <MenuButton className="focus-ring p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${p.name}`}>
                        <MoreHorizontal className="w-4 h-4" aria-hidden />
                      </MenuButton>
                      <MenuItems anchor="bottom end" className="z-30 w-40 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                        <MenuItem>
                          <button
                            onClick={() => duplicateProject(p)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 data-[focus]:bg-slate-50"
                          >
                            <Copy className="w-3.5 h-3.5" aria-hidden /> Duplicate
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => deleteProject(p.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-600 data-[focus]:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden /> Delete
                          </button>
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-hairline bg-slate-50"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                {selectedIds.size} selected
              </span>
              <button
                onClick={deleteSelected}
                className="focus-ring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-hairline bg-white text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" aria-hidden />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Toast show={!!toast} text={toast} />
    </div>
  );
}
