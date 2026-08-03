import { Fragment, useMemo, useState } from 'react';
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Select, SelectItem } from '@tremor/react';
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import {
  Search,
  SlidersHorizontal,
  ListFilter,
  Download,
  UserPlus,
  Copy,
  Bell,
  MoreHorizontal,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INVOICES, PROJECTS, CLIENTS, type Invoice, type InvoiceStatus } from '../data';
import { fmtMoney } from '../lib/format';
import Toast from '../components/Toast';
import SortIcon from '../components/SortIcon';
import ProjectIcon from '../components/ProjectIcon';

type SortKey = 'number' | 'client' | 'amount' | 'issued' | 'due' | 'status';
type Pill = 'all' | 'Overdue' | 'Upcoming' | 'High risk' | 'Enterprise';

const PILLS: Pill[] = ['all', 'Overdue', 'Upcoming', 'High risk', 'Enterprise'];
const STATUSES: InvoiceStatus[] = ['Draft', 'Sent', 'Paid', 'Overdue'];
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'due', label: 'Due date' },
  { key: 'amount', label: 'Amount' },
  { key: 'issued', label: 'Issued date' },
  { key: 'status', label: 'Status' },
  { key: 'number', label: 'Invoice ID' },
];

const STATUS_DOT: Record<InvoiceStatus, string> = {
  Draft: 'bg-slate-400 text-slate-600',
  Sent: 'bg-violet-500 text-violet-700',
  Paid: 'bg-emerald-500 text-emerald-700',
  Overdue: 'bg-rose-500 text-rose-700',
};

function fmtDateLong(d: string): string {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function StatusDot({ status }: { status: InvoiceStatus }) {
  const [dot, text] = STATUS_DOT[status].split(' ');
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [pill, setPill] = useState<Pill>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'due', dir: 1 });
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState('15');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');

  // Best-effort invoice -> project lookup (our data model links invoices to clients, not
  // projects directly), purely for the "Project" column shown in the reference design.
  const projectByInvoice = useMemo(() => {
    const map = new Map<number, { name: string; id: number }>();
    invoices.forEach((inv, i) => {
      const project = PROJECTS.find((p) => p.client === inv.client) ?? PROJECTS[i % PROJECTS.length];
      map.set(inv.id, { name: project.name, id: project.id });
    });
    return map;
  }, [invoices]);

  const clientTotalBilled = useMemo(() => {
    const map = new Map<string, number>();
    CLIENTS.forEach((c) => map.set(c.name, c.totalBilled));
    return map;
  }, []);

  function matchesPill(inv: Invoice): boolean {
    switch (pill) {
      case 'all':
        return true;
      case 'Overdue':
        return inv.status === 'Overdue';
      case 'Upcoming':
        return inv.status === 'Sent';
      case 'High risk':
        return inv.status === 'Overdue' && inv.amount > 2500;
      case 'Enterprise':
        return (clientTotalBilled.get(inv.client) ?? 0) > 3000;
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter(
      (inv) =>
        matchesPill(inv) &&
        (!statusFilter || inv.status === statusFilter) &&
        (!q ||
          inv.number.toLowerCase().includes(q) ||
          inv.client.toLowerCase().includes(q) ||
          projectByInvoice.get(inv.id)?.name.toLowerCase().includes(q)),
    );
  }, [invoices, pill, statusFilter, search, projectByInvoice, clientTotalBilled]);

  const sorted = useMemo(() => {
    const { key, dir } = sort;
    return [...filtered].sort((a, b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir);
  }, [filtered, sort]);

  const perPage = parseInt(rowsPerPage, 10);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  function sortBy(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));
  }

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = pageRows.every((r) => next.has(r.id));
      pageRows.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  }

  function markSelectedAs(status: InvoiceStatus) {
    setInvoices((prev) => prev.map((inv) => (selected.has(inv.id) ? { ...inv, status } : inv)));
    setToast(`Marked ${selected.size} invoice${selected.size === 1 ? '' : 's'} as ${status}`);
    setTimeout(() => setToast(''), 2200);
    setSelected(new Set());
  }

  function remind() {
    setToast(`Reminder sent for ${selected.size} invoice${selected.size === 1 ? '' : 's'}`);
    setTimeout(() => setToast(''), 2200);
    setSelected(new Set());
  }

  function duplicateInvoice(inv: Invoice) {
    const maxId = Math.max(...invoices.map((i) => i.id));
    setInvoices((prev) => [...prev, { ...inv, id: maxId + 1, number: `${inv.number}-copy`, status: 'Draft' }]);
  }

  function deleteInvoice(id: number) {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: 'number', label: 'Invoice ID' },
    { key: 'client', label: 'Client' },
    { key: 'amount', label: 'Amount' },
    { key: 'due', label: 'Due Date' },
    { key: 'status', label: 'Status' },
  ];

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Invoices</h1>
      <p className="text-sm text-slate-500 mb-6">Track what's billed and what's owed.</p>

      <Card className="p-0 overflow-visible">
        {/* Filter pills + toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-hairline">
          <div className="flex flex-wrap items-center gap-2">
            {PILLS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPill(p);
                  setPage(1);
                }}
                className={`focus-ring px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  pill === p
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-hairline hover:bg-slate-50'
                }`}
              >
                {p === 'all' ? 'All' : p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search client, invoice, etc"
                aria-label="Search invoices"
                className="focus-ring w-full pl-9 pr-3 py-2 text-sm rounded-full border border-hairline bg-white"
              />
            </div>

            {/* Sort by */}
            <Popover className="relative">
              <PopoverButton className="focus-ring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-hairline text-sm font-medium text-slate-700 hover:bg-slate-50">
                <SlidersHorizontal className="w-4 h-4" aria-hidden />
                Sort by
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden />
              </PopoverButton>
              <PopoverPanel anchor="bottom end" className="z-30 mt-2 w-48 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                {({ close }) => (
                  <>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          sortBy(opt.key);
                          close();
                        }}
                        className="focus-ring w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                      >
                        {opt.label}
                        {sort.key === opt.key && <span className="text-xs text-slate-400">{sort.dir === 1 ? '▲' : '▼'}</span>}
                      </button>
                    ))}
                  </>
                )}
              </PopoverPanel>
            </Popover>

            {/* Filter */}
            <Popover className="relative">
              <PopoverButton className="focus-ring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-hairline text-sm font-medium text-slate-700 hover:bg-slate-50">
                <ListFilter className="w-4 h-4" aria-hidden />
                Filter
                {statusFilter && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
              </PopoverButton>
              <PopoverPanel anchor="bottom end" className="z-30 mt-2 w-56 rounded-xl border border-hairline bg-white shadow-lg p-3">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }} placeholder="Any status" enableClear>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </Select>
              </PopoverPanel>
            </Popover>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead className="bg-slate-50">
              <TableRow>
                <TableHeaderCell className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    checked={allOnPageSelected}
                    onChange={toggleAllOnPage}
                    className="focus-ring w-4 h-4 rounded accent-slate-900"
                  />
                </TableHeaderCell>
                {cols.map((col, i) => (
                  <Fragment key={col.key}>
                    {i === 1 && <TableHeaderCell>Project</TableHeaderCell>}
                    <TableHeaderCell
                      tabIndex={0}
                      onClick={() => sortBy(col.key)}
                      onKeyDown={(e) => e.key === 'Enter' && sortBy(col.key)}
                      aria-sort={sort.key === col.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                      className="focus-ring cursor-pointer select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        <SortIcon active={sort.key === col.key} dir={sort.dir} />
                      </span>
                    </TableHeaderCell>
                  </Fragment>
                ))}
                <TableHeaderCell className="w-10" />
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((inv) => {
                const project = projectByInvoice.get(inv.id);
                const isSelected = selected.has(inv.id);
                return (
                  <TableRow key={inv.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-slate-50' : ''}`}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Select invoice ${inv.number}`}
                        checked={isSelected}
                        onChange={() => toggleRow(inv.id)}
                        className="focus-ring w-4 h-4 rounded accent-slate-900"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{inv.number}</TableCell>
                    <TableCell>
                      {project && (
                        <div className="flex items-center gap-2">
                          <ProjectIcon seed={project.id} />
                          <span className="text-sm text-slate-700 truncate max-w-[140px]">{project.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{inv.client}</TableCell>
                    <TableCell className="font-medium">{fmtMoney(inv.amount)}</TableCell>
                    <TableCell className="text-slate-600">{fmtDateLong(inv.due)}</TableCell>
                    <TableCell>
                      <StatusDot status={inv.status} />
                    </TableCell>
                    <TableCell>
                      <Menu as="div" className="relative">
                        <MenuButton className="focus-ring p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${inv.number}`}>
                          <MoreHorizontal className="w-4 h-4" aria-hidden />
                        </MenuButton>
                        <MenuItems anchor="bottom end" className="z-30 w-40 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                          <MenuItem>
                            <button
                              onClick={() => duplicateInvoice(inv)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 data-[focus]:bg-slate-50"
                            >
                              <Copy className="w-3.5 h-3.5" aria-hidden /> Duplicate
                            </button>
                          </MenuItem>
                          <MenuItem>
                            <button
                              onClick={() => deleteInvoice(inv.id)}
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
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                    No invoices match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bulk action bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-hairline bg-slate-50"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                {selected.size} selected
              </span>
              <div className="flex items-center gap-1.5">
                <button className="focus-ring p-2 rounded-lg border border-hairline bg-white text-slate-500 hover:bg-slate-100" aria-label="Export selected">
                  <Download className="w-4 h-4" aria-hidden />
                </button>
                <button className="focus-ring p-2 rounded-lg border border-hairline bg-white text-slate-500 hover:bg-slate-100" aria-label="Assign owner">
                  <UserPlus className="w-4 h-4" aria-hidden />
                </button>
                <button
                  onClick={() => selected.forEach((id) => duplicateInvoice(invoices.find((i) => i.id === id)!))}
                  className="focus-ring p-2 rounded-lg border border-hairline bg-white text-slate-500 hover:bg-slate-100"
                  aria-label="Duplicate selected"
                >
                  <Copy className="w-4 h-4" aria-hidden />
                </button>
              </div>

              <Menu as="div" className="relative">
                <MenuButton className="focus-ring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-hairline bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Mark as
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden />
                </MenuButton>
                <MenuItems anchor="top start" className="z-30 w-40 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                  {STATUSES.map((s) => (
                    <MenuItem key={s}>
                      <button
                        onClick={() => markSelectedAs(s)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 data-[focus]:bg-slate-50"
                      >
                        {s}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>

              <button
                onClick={remind}
                className="focus-ring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-hairline bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Bell className="w-4 h-4" aria-hidden />
                Remind
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer: rows per page + pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-hairline">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            Rows per page
            <div className="w-20">
              <Select value={rowsPerPage} onValueChange={(v) => { setRowsPerPage(v); setPage(1); }} enableClear={false}>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            Page
            <span className="font-medium text-slate-800">
              {currentPage}/{totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={currentPage === 1} className="focus-ring p-1.5 rounded-lg border border-hairline disabled:opacity-40" aria-label="First page">
                <ChevronsLeft className="w-4 h-4" aria-hidden />
              </button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="focus-ring p-1.5 rounded-lg border border-hairline disabled:opacity-40" aria-label="Previous page">
                <ChevronLeft className="w-4 h-4" aria-hidden />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="focus-ring p-1.5 rounded-lg border border-hairline disabled:opacity-40" aria-label="Next page">
                <ChevronRight className="w-4 h-4" aria-hidden />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="focus-ring p-1.5 rounded-lg border border-hairline disabled:opacity-40" aria-label="Last page">
                <ChevronsRight className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Toast show={!!toast} text={toast} />
    </div>
  );
}
