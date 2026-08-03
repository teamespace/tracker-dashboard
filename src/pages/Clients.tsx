import { useMemo, useState } from 'react';
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Select, SelectItem } from '@tremor/react';
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CLIENTS, type Client, type ClientStatus } from '../data';
import { fmtDate, fmtMoney } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import ClientPanel from '../components/ClientPanel';
import SortIcon from '../components/SortIcon';
import Toast from '../components/Toast';

type SortKey = 'name' | 'company' | 'activeProjects' | 'totalBilled' | 'lastActivity' | 'status';
type Pill = 'All' | ClientStatus;

const STATUSES: ClientStatus[] = ['Active', 'Lead', 'Past'];
const PILLS: Pill[] = ['All', ...STATUSES];
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'lastActivity', label: 'Last activity' },
  { key: 'totalBilled', label: 'Total billed' },
  { key: 'activeProjects', label: 'Active projects' },
  { key: 'name', label: 'Client name' },
  { key: 'company', label: 'Company' },
];

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(CLIENTS);
  const [pill, setPill] = useState<Pill>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'lastActivity', dir: 1 });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Client | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState('15');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        (pill === 'All' || c.status === pill) &&
        (!q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)),
    );
  }, [clients, pill, search]);

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
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = pageRows.every((r) => next.has(r.id));
      pageRows.forEach((r) => (allSelected ? next.delete(r.id) : next.add(r.id)));
      return next;
    });
  }

  function markSelectedAs(status: ClientStatus) {
    setClients((prev) => prev.map((c) => (selectedIds.has(c.id) ? { ...c, status } : c)));
    setToast(`Marked ${selectedIds.size} client${selectedIds.size === 1 ? '' : 's'} as ${status}`);
    setTimeout(() => setToast(''), 2200);
    setSelectedIds(new Set());
  }

  function deleteClient(id: number) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Client' },
    { key: 'company', label: 'Company' },
    { key: 'activeProjects', label: 'Active projects' },
    { key: 'totalBilled', label: 'Total billed' },
    { key: 'lastActivity', label: 'Last activity' },
    { key: 'status', label: 'Status' },
  ];

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selectedIds.has(r.id));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Clients</h1>
      <p className="text-sm text-slate-500 mb-6">Everyone you work with.</p>

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
                {p}
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
                placeholder="Search clients or company"
                aria-label="Search clients"
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
                {cols.map((col) => (
                  <TableHeaderCell
                    key={col.key}
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
                ))}
                <TableHeaderCell className="w-10" />
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((c) => {
                const isSelected = selectedIds.has(c.id);
                return (
                  <TableRow key={c.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-slate-50' : ''}`}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${c.name}`}
                        checked={isSelected}
                        onChange={() => toggleRow(c.id)}
                        className="focus-ring w-4 h-4 rounded accent-slate-900"
                      />
                    </TableCell>
                    <TableCell className="font-medium cursor-pointer" onClick={() => setSelected(c)}>
                      <div className="flex items-center gap-2">
                        <Avatar name={c.name} />
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelected(c)}>
                      {c.company}
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelected(c)}>
                      {c.activeProjects}
                    </TableCell>
                    <TableCell className="font-medium cursor-pointer" onClick={() => setSelected(c)}>
                      {fmtMoney(c.totalBilled)}
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelected(c)}>
                      {fmtDate(c.lastActivity)}
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelected(c)}>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Menu as="div" className="relative">
                        <MenuButton className="focus-ring p-1.5 rounded-lg text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${c.name}`}>
                          <MoreHorizontal className="w-4 h-4" aria-hidden />
                        </MenuButton>
                        <MenuItems anchor="bottom end" className="z-30 w-40 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                          <MenuItem>
                            <button
                              onClick={() => deleteClient(c.id)}
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
                    No clients match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bulk action bar */}
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
                onClick={() => selectedIds.forEach((id) => deleteClient(id))}
                className="focus-ring inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-hairline bg-white text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" aria-hidden />
                Delete
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

      <ClientPanel client={selected} onClose={() => setSelected(null)} />
      <Toast show={!!toast} text={toast} />
    </div>
  );
}
