import { useMemo, useState } from 'react';
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Select, SelectItem } from '@tremor/react';
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import {
  Search,
  SlidersHorizontal,
  ListFilter,
  Copy,
  MoreHorizontal,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECTS, CLIENTS, type Project, type ProjectStatus } from '../data';
import { fmtDate, fmtMoney } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import ProjectIcon from '../components/ProjectIcon';
import ProgressWithLabel from '../components/ProgressWithLabel';
import ProjectDrawer from '../components/ProjectDrawer';
import SortIcon from '../components/SortIcon';
import Toast from '../components/Toast';

type SortKey = 'name' | 'client' | 'status' | 'deadline' | 'value' | 'progress';
type Pill = 'All' | ProjectStatus;

const STATUSES: ProjectStatus[] = ['To do', 'In progress', 'Review', 'Done'];
const PILLS: Pill[] = ['All', ...STATUSES];
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'deadline', label: 'Deadline' },
  { key: 'value', label: 'Value' },
  { key: 'progress', label: 'Progress' },
  { key: 'name', label: 'Project name' },
  { key: 'client', label: 'Client' },
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [view, setView] = useState<'board' | 'table'>('board');
  const [pill, setPill] = useState<Pill>('All');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'deadline', dir: 1 });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Project | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState('15');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        (pill === 'All' || p.status === pill) &&
        (!clientFilter || p.client === clientFilter) &&
        (!q || p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q)),
    );
  }, [projects, pill, clientFilter, search]);

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

  function markSelectedAs(status: ProjectStatus) {
    setProjects((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, status } : p)));
    setToast(`Marked ${selectedIds.size} project${selectedIds.size === 1 ? '' : 's'} as ${status}`);
    setTimeout(() => setToast(''), 2200);
    setSelectedIds(new Set());
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

  function toggleTask(taskIndex: number) {
    if (!selected) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? { ...p, tasks: p.tasks.map((t, i) => (i === taskIndex ? { ...t, done: !t.done } : t)) }
          : p,
      ),
    );
    setSelected((prev) =>
      prev ? { ...prev, tasks: prev.tasks.map((t, i) => (i === taskIndex ? { ...t, done: !t.done } : t)) } : prev,
    );
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Project' },
    { key: 'client', label: 'Client' },
    { key: 'status', label: 'Status' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'value', label: 'Value' },
    { key: 'progress', label: 'Progress' },
  ];

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selectedIds.has(r.id));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-slate-500">Everything you're working on.</p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-0.5 text-sm">
          <button
            onClick={() => setView('board')}
            className={`focus-ring px-3 py-1.5 rounded-md font-medium ${view === 'board' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
          >
            Board
          </button>
          <button
            onClick={() => setView('table')}
            className={`focus-ring px-3 py-1.5 rounded-md font-medium ${view === 'table' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
          >
            Table
          </button>
        </div>
      </div>

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
                placeholder="Search project or client"
                aria-label="Search projects"
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
                {clientFilter && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
              </PopoverButton>
              <PopoverPanel anchor="bottom end" className="z-30 mt-2 w-56 rounded-xl border border-hairline bg-white shadow-lg p-3">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Client</label>
                <Select value={clientFilter} onValueChange={(v) => { setClientFilter(v); setPage(1); }} placeholder="Any client" enableClear>
                  {CLIENTS.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </Select>
              </PopoverPanel>
            </Popover>
          </div>
        </div>

        {view === 'board' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {STATUSES.map((status) => {
              const items = sorted.filter((p) => p.status === status);
              return (
                <div key={status} className="bg-slate-100/60 rounded-xl p-3">
                  <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center justify-between">
                    <span>{status}</span>
                    <span className="text-xs bg-white rounded-full px-2 py-0.5 border border-hairline">
                      {items.length}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {items.map((p) => (
                      <motion.button
                        key={p.id}
                        onClick={() => setSelected(p)}
                        whileHover={{ y: -2 }}
                        className="focus-ring w-full text-left bg-white rounded-lg border border-hairline shadow-sm p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2">
                          <ProjectIcon seed={p.id} />
                          <p className="text-sm font-medium truncate">{p.name}</p>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">{p.client}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">{fmtDate(p.deadline)}</span>
                          <span className="text-xs font-semibold">{fmtMoney(p.value)}</span>
                        </div>
                        <div className="mt-2">
                          <ProgressWithLabel value={p.progress} />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
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
                  {pageRows.map((p) => {
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
                        <TableCell className="font-medium cursor-pointer" onClick={() => setSelected(p)}>
                          <div className="flex items-center gap-2">
                            <ProjectIcon seed={p.id} />
                            <span className="truncate max-w-[200px]">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="cursor-pointer" onClick={() => setSelected(p)}>
                          <div className="flex items-center gap-2">
                            <Avatar name={p.client} />
                            {p.client}
                          </div>
                        </TableCell>
                        <TableCell className="cursor-pointer" onClick={() => setSelected(p)}>
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-slate-600 cursor-pointer" onClick={() => setSelected(p)}>
                          {fmtDate(p.deadline)}
                        </TableCell>
                        <TableCell className="font-medium cursor-pointer" onClick={() => setSelected(p)}>
                          {fmtMoney(p.value)}
                        </TableCell>
                        <TableCell className="w-36 cursor-pointer" onClick={() => setSelected(p)}>
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
                  {pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                        No projects match your filters.
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
                  <button
                    onClick={() => selectedIds.forEach((id) => duplicateProject(projects.find((p) => p.id === id)!))}
                    className="focus-ring p-2 rounded-lg border border-hairline bg-white text-slate-500 hover:bg-slate-100"
                    aria-label="Duplicate selected"
                  >
                    <Copy className="w-4 h-4" aria-hidden />
                  </button>

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
                    onClick={() => {
                      selectedIds.forEach((id) => deleteProject(id));
                    }}
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
          </>
        )}
      </Card>

      <ProjectDrawer project={selected} onClose={() => setSelected(null)} onToggleTask={toggleTask} />
      <Toast show={!!toast} text={toast} />
    </div>
  );
}
