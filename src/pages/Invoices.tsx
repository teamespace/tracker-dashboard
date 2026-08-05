import { Fragment, useCallback, useMemo, useState, type FormEvent } from 'react';
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Select, SelectItem } from '@tremor/react';
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { motion, AnimatePresence } from 'motion/react';
import { INVOICES, PROJECTS, CLIENTS, type Invoice, type InvoiceStatus } from '../data';
import { fmtMoney } from '../lib/format';
import Toast from '../components/Toast';
import SortIcon from '../components/SortIcon';
import ProjectIcon from '../components/ProjectIcon';
import CreateDialog from '../components/CreateDialog';
import { IconButton } from '../components/motion/IconButton';
import { AnimatedTrashIcon } from '../components/motion/AnimatedTrashIcon';
import { AnimatedCopyIcon } from '../components/motion/icons/AnimatedCopyIcon';
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Download, Filter, MoreHorizontal, Plus, Search, SlidersHorizontal, UserPlus } from 'lucide-react';

type SortKey = 'number' | 'client' | 'amount' | 'issued' | 'due' | 'status';
type Pill = 'all' | 'Overdue' | 'Upcoming' | 'High risk' | 'Enterprise';

const PILLS: { value: Pill; label: string }[] = [
  { value: 'all', label: 'All invoices' },
  { value: 'Overdue', label: 'Overdue invoices' },
  { value: 'Upcoming', label: 'Sent invoices' },
  { value: 'High risk', label: 'High-risk overdue' },
  { value: 'Enterprise', label: 'High-value clients' },
];
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

const fieldClass = 'focus-ring mt-1 w-full rounded-full border border-hairline px-3 py-2 text-sm';

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
  const [undoInvoices, setUndoInvoices] = useState<Invoice[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newInvoice, setNewInvoice] = useState({ client: '', projectId: '', amount: '', due: '' });

  const projectByInvoice = useMemo(() => {
    const map = new Map<number, { name: string; id: number }>();
    invoices.forEach((inv) => {
      const project = PROJECTS.find((p) => p.id === inv.projectId);
      if (project) map.set(inv.id, { name: project.name, id: project.id });
    });
    return map;
  }, [invoices]);

  const clientTotalBilled = useMemo(() => {
    const map = new Map<string, number>();
    CLIENTS.forEach((c) => map.set(c.name, c.totalBilled));
    return map;
  }, []);

  const matchesPill = useCallback((inv: Invoice): boolean => {
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
  }, [pill, clientTotalBilled]);

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
  }, [invoices, statusFilter, search, projectByInvoice, matchesPill]);

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
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

  function downloadInvoices(sourceInvoices: Invoice[]) {
    if (sourceInvoices.length === 0) return;
    const documents = sourceInvoices.map((inv) => {
      const project = projectByInvoice.get(inv.id);
      return [
        `Invoice ${inv.number}`,
        '========================',
        `Client: ${inv.client}`,
        `Project: ${project?.name ?? 'Not assigned'}`,
        `Amount: ${fmtMoney(inv.amount)}`,
        `Issued: ${fmtDateLong(inv.issued)}`,
        `Due: ${fmtDateLong(inv.due)}`,
        `Status: ${inv.status}`,
      ].join('\n');
    });
    const content = documents.join('\n\n------------------------\n\n');
    const filename = sourceInvoices.length === 1
      ? `${sourceInvoices[0].number}.txt`
      : 'selected-invoices.txt';
    const safeFilename = filename.replace(/[^a-z0-9._-]/gi, '_');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setToast(sourceInvoices.length === 1 ? `Downloaded ${sourceInvoices[0].number}` : `Downloaded ${sourceInvoices.length} invoices`);
    setTimeout(() => setToast(''), 2200);
  }

  function duplicateInvoice(inv: Invoice) {
    duplicateInvoices([inv]);
  }

  function duplicateInvoices(sourceInvoices: Invoice[]) {
    if (sourceInvoices.length === 0) return;
    setInvoices((prev) => {
      let nextId = Math.max(0, ...prev.map((i) => i.id)) + 1;
      const duplicates = sourceInvoices.map((inv) => ({
        ...inv,
        id: nextId++,
        number: `${inv.number}-copy`,
        status: 'Draft' as const,
      }));
      return [...prev, ...duplicates];
    });
    setToast(`Duplicated ${sourceInvoices.length} invoice${sourceInvoices.length === 1 ? '' : 's'}`);
    setTimeout(() => setToast(''), 2200);
  }

  function deleteInvoices(ids: number[]) {
    if (ids.length === 0) return;
    setInvoices((prev) => {
      const removed = prev.filter((i) => ids.includes(i.id));
      setUndoInvoices(removed);
      return prev.filter((i) => !ids.includes(i.id));
    });
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setToast(`Deleted ${ids.length} invoice${ids.length === 1 ? '' : 's'}`);
    setTimeout(() => {
      setToast('');
      setUndoInvoices(null);
    }, 5000);
  }

  function undoDelete() {
    if (!undoInvoices) return;
    setInvoices((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      return [...prev, ...undoInvoices.filter((i) => !existingIds.has(i.id))];
    });
    setUndoInvoices(null);
    setToast('Invoices restored');
  }

  function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newInvoice.client || !newInvoice.projectId || !newInvoice.amount || !newInvoice.due) {
      setCreateError('Complete all required fields.');
      return;
    }
    const invoice: Invoice = {
      id: Math.max(0, ...invoices.map((item) => item.id)) + 1,
      number: `INV-${1042 + Math.max(0, ...invoices.map((item) => item.id)) + 1}`,
      projectId: Number(newInvoice.projectId),
      client: newInvoice.client,
      amount: Number(newInvoice.amount),
      issued: new Date().toISOString().slice(0, 10),
      due: newInvoice.due,
      status: 'Draft',
    };
    setInvoices((prev) => [...prev, invoice]);
    setCreateOpen(false);
    setCreateError('');
    setNewInvoice({ client: '', projectId: '', amount: '', due: '' });
    setToast('Invoice created');
    setTimeout(() => setToast(''), 2200);
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold mb-1">Invoices</h1><p className="text-sm text-slate-500">Track what's billed and what's owed.</p></div>
         <IconButton as="button" onClick={() => setCreateOpen(true)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700"><><Plus className="h-4 w-4" /> New invoice</></IconButton>
      </div>

      <Card className="p-0 overflow-visible">
        {/* Filter pills + toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-hairline">
          <div className="flex flex-wrap items-center gap-2">
            {PILLS.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  setPill(p.value);
                  setPage(1);
                }}
                className={`focus-ring px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  pill === p.value
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-hairline hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                  {() => <><SlidersHorizontal className="w-4 h-4" />
                 Sort by
                   <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </>}
              </PopoverButton>
               <PopoverPanel className="absolute top-full right-0 z-30 mt-2 w-48 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                {({ close }) => (
                  <>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          sortBy(opt.key);
                          close();
                        }}
                         className="focus-ring w-full flex items-center justify-between px-3 py-2 rounded-full text-sm text-slate-700 hover:bg-slate-50"
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
                  {() => <><Filter className="w-4 h-4" />
                 Filter
                 {statusFilter && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}</>}
              </PopoverButton>
               <PopoverPanel className="absolute top-full right-0 z-30 mt-2 w-56 rounded-xl border border-hairline bg-white shadow-lg p-3">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Status</label>
                 <Select className="rounded-full" value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }} placeholder="Any status" enableClear>
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

         <div className="hidden sm:block overflow-x-auto">
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
                      aria-sort={sort.key === col.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                      className="select-none"
                    >
                      <button
                        type="button"
                        onClick={() => sortBy(col.key)}
                         className="focus-ring inline-flex items-center gap-1 rounded-full"
                        aria-label={`Sort by ${col.label}`}
                      >
                        {col.label}
                        <SortIcon active={sort.key === col.key} dir={sort.dir} />
                      </button>
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
                           <MenuButton className="focus-ring p-1.5 rounded-full text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${inv.number}`}>
                             <MoreHorizontal className="w-4 h-4" />
                        </MenuButton>
                          <MenuItems className="absolute top-full right-0 z-30 mt-2 w-52 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                          <MenuItem>
                              <IconButton as="button" onClick={() => downloadInvoices([inv])} className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm text-slate-700 data-[focus]:bg-slate-50">
                                 <><span className="flex w-4 shrink-0 justify-center"><Download className="w-3.5 h-3.5" /></span><span>Download invoice</span></>
                              </IconButton>
                           </MenuItem>
                           <MenuItem>
                               <IconButton as="button" onClick={() => duplicateInvoice(inv)} className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm text-slate-700 data-[focus]:bg-slate-50">
                                  <><span className="flex w-4 shrink-0 justify-center"><AnimatedCopyIcon className="w-3.5 h-3.5" /></span><span>Duplicate</span></>
                              </IconButton>
                          </MenuItem>
                          <MenuItem>
                              <IconButton as="button" onClick={() => deleteInvoices([inv.id])} className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm text-rose-600 data-[focus]:bg-rose-50">
                                 <><span className="flex w-4 shrink-0 justify-center"><AnimatedTrashIcon className="w-3.5 h-3.5" /></span><span>Delete</span></>
                             </IconButton>
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-slate-600 py-8">
                    No invoices match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="sm:hidden divide-y divide-hairline">
          {pageRows.map((inv) => {
            const project = projectByInvoice.get(inv.id);
            const isSelected = selected.has(inv.id);
            return (
              <div key={inv.id} className={`p-4 ${isSelected ? 'bg-slate-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Select invoice ${inv.number}`}
                    checked={isSelected}
                    onChange={() => toggleRow(inv.id)}
                    className="focus-ring mt-1 w-4 h-4 rounded accent-slate-900"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{inv.number}</span>
                      <StatusDot status={inv.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-600 truncate">{inv.client}</p>
                    {project && <p className="mt-1 text-xs text-slate-500 truncate">Project: {project.name}</p>}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <span>Amount <strong className="font-medium text-slate-700">{fmtMoney(inv.amount)}</strong></span>
                      <span>Due <strong className="font-medium text-slate-700">{fmtDateLong(inv.due)}</strong></span>
                    </div>
                  </div>
                  <Menu as="div" className="relative">
                       <MenuButton className="focus-ring p-1.5 rounded-full text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${inv.number}`}>
                          <MoreHorizontal className="w-4 h-4" />
                    </MenuButton>
                      <MenuItems className="absolute top-full right-0 z-30 mt-2 w-52 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                             <MenuItem><IconButton as="button" onClick={() => downloadInvoices([inv])} className="w-full px-3 py-2 rounded-full text-left text-sm text-slate-700 data-[focus]:bg-slate-50"><><span className="mr-2 flex w-4 shrink-0 justify-center"><Download className="w-3.5 h-3.5" /></span><span>Download invoice</span></></IconButton></MenuItem>
                             <MenuItem><IconButton as="button" onClick={() => duplicateInvoice(inv)} className="w-full px-3 py-2 rounded-full text-left text-sm text-slate-700 data-[focus]:bg-slate-50"><><span className="mr-2 flex w-4 shrink-0 justify-center"><AnimatedCopyIcon className="w-3.5 h-3.5" /></span><span>Duplicate</span></></IconButton></MenuItem>
                            <MenuItem><IconButton as="button" onClick={() => deleteInvoices([inv.id])} className="w-full px-3 py-2 rounded-full text-left text-sm text-rose-600 data-[focus]:bg-rose-50"><><span className="mr-2 flex w-4 shrink-0 justify-center"><AnimatedTrashIcon className="w-3.5 h-3.5" /></span><span>Delete</span></></IconButton></MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            );
          })}
          {pageRows.length === 0 && <div className="px-4 py-8 text-center text-slate-600">No invoices match your filters.</div>}
        </div>

        {/* Bulk action bar */}
        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="fixed bottom-14 inset-x-3 z-40 flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-slate-50 px-4 py-3 shadow-lg sm:static sm:rounded-none sm:border-x-0 sm:border-b-0 sm:shadow-none"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                {selected.size} selected
              </span>
              <div className="flex items-center gap-1.5">
                   <IconButton as="button" onClick={() => downloadInvoices(invoices.filter((inv) => selected.has(inv.id)))} className="focus-ring p-2 rounded-full border border-hairline bg-white text-slate-500 hover:bg-slate-100" aria-label="Export selected">
                     <Download className="w-4 h-4" />
                 </IconButton>
                  <IconButton as="button" className="focus-ring p-2 rounded-full border border-hairline bg-white text-slate-500 hover:bg-slate-100" aria-label="Assign owner">
                    <UserPlus className="w-4 h-4" />
                 </IconButton>
                 <IconButton as="button"
                   onClick={() => {
                     duplicateInvoices(invoices.filter((inv) => selected.has(inv.id)));
                     setSelected(new Set());
                   }}
                   className="focus-ring p-2 rounded-full border border-hairline bg-white text-slate-500 hover:bg-slate-100"
                  aria-label="Duplicate selected"
                >
                      <AnimatedCopyIcon className="w-4 h-4" />
                 </IconButton>
              </div>

              <Menu as="div" className="relative">
                 <MenuButton className="focus-ring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-hairline bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Mark as
                   <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </MenuButton>
                 <MenuItems className="absolute bottom-full left-0 z-30 mb-2 w-40 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                  {STATUSES.map((s) => (
                    <MenuItem key={s}>
               <IconButton as="button"
                        onClick={() => markSelectedAs(s)}
                         className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm text-slate-700 data-[focus]:bg-slate-50"
                      >
                        {s}
               </IconButton>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>

               <IconButton as="button"
                onClick={remind}
                 className="focus-ring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-hairline bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                     <><Bell className="w-4 h-4" /> Remind</>
               </IconButton>

               <IconButton as="button"
                onClick={() => deleteInvoices([...selected])}
                 className="focus-ring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-hairline bg-white text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                      <><AnimatedTrashIcon className="w-4 h-4" /> Delete</>
               </IconButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer: rows per page + pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-hairline">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            Rows per page
            <div className="w-20">
               <Select className="rounded-full" value={rowsPerPage} onValueChange={(v) => { setRowsPerPage(v); setPage(1); }} enableClear={false}>
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
                <IconButton as="button" onClick={() => setPage(1)} disabled={currentPage === 1} className="focus-ring p-1.5 rounded-full border border-hairline disabled:opacity-40" aria-label="First page"><ChevronLeft className="w-4 h-4" /></IconButton>
                <IconButton as="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="focus-ring p-1.5 rounded-full border border-hairline disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></IconButton>
                <IconButton as="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="focus-ring p-1.5 rounded-full border border-hairline disabled:opacity-40" aria-label="Next page"><ChevronRight className="w-4 h-4" /></IconButton>
                <IconButton as="button" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="focus-ring p-1.5 rounded-full border border-hairline disabled:opacity-40" aria-label="Last page"><ChevronRight className="w-4 h-4" /></IconButton>
            </div>
          </div>
        </div>
      </Card>

      <CreateDialog open={createOpen} onClose={() => { setCreateOpen(false); setCreateError(''); }} title="New invoice" description="Create a draft invoice for a project.">
        <form onSubmit={createInvoice} className="mt-5 space-y-4">
          <div><label htmlFor="invoice-client" className="text-sm font-medium text-slate-700">Client *</label><select id="invoice-client" required value={newInvoice.client} onChange={(event) => setNewInvoice({ ...newInvoice, client: event.target.value, projectId: '' })} className={fieldClass}><option value="">Select a client</option>{CLIENTS.map((client) => <option key={client.id}>{client.name}</option>)}</select></div>
          <div><label htmlFor="invoice-project" className="text-sm font-medium text-slate-700">Project *</label><select id="invoice-project" required value={newInvoice.projectId} onChange={(event) => setNewInvoice({ ...newInvoice, projectId: event.target.value })} className={fieldClass}><option value="">Select a project</option>{PROJECTS.filter((project) => !newInvoice.client || project.client === newInvoice.client).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3"><div><label htmlFor="invoice-amount" className="text-sm font-medium text-slate-700">Amount *</label><input id="invoice-amount" required min="0" type="number" value={newInvoice.amount} onChange={(event) => setNewInvoice({ ...newInvoice, amount: event.target.value })} className={fieldClass} /></div><div><label htmlFor="invoice-due" className="text-sm font-medium text-slate-700">Due date *</label><input id="invoice-due" required type="date" value={newInvoice.due} onChange={(event) => setNewInvoice({ ...newInvoice, due: event.target.value })} className={fieldClass} /></div></div>
          {createError && <p className="text-sm text-rose-600" role="alert">{createError}</p>}
           <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setCreateOpen(false)} className="focus-ring rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="focus-ring rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700">Create invoice</button></div>
        </form>
      </CreateDialog>
      <Toast show={!!toast} text={toast} onUndo={undoInvoices ? undoDelete : undefined} />
    </div>
  );
}
