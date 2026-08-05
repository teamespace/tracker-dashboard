import { useMemo, useState, type FormEvent } from 'react';
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Select, SelectItem } from '@tremor/react';
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { motion, AnimatePresence } from 'motion/react';
import { CLIENTS, type Project, type ProjectStatus } from '../data';
import type { ProjectPageProps } from '../App';
import { fmtDate, fmtMoney } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import ProjectIcon from '../components/ProjectIcon';
import ProgressWithLabel from '../components/ProgressWithLabel';
import ProjectDrawer from '../components/ProjectDrawer';
import SortIcon from '../components/SortIcon';
import Toast from '../components/Toast';
import CreateDialog from '../components/CreateDialog';
import { IconButton } from '../components/motion/IconButton';
import { AnimatedTrashIcon } from '../components/motion/AnimatedTrashIcon';
import { AnimatedCopyIcon } from '../components/motion/icons/AnimatedCopyIcon';
import { AnimatedNumber } from '../components/motion/AnimatedNumber';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Plus, Search, SlidersHorizontal } from 'lucide-react';

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

const fieldClass = 'focus-ring mt-1 w-full rounded-full border border-hairline px-3 py-2 text-sm';

export default function Projects({ projects, setProjects }: ProjectPageProps) {
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
  const [undoProjects, setUndoProjects] = useState<Project[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newProject, setNewProject] = useState({ name: '', client: '', value: '', deadline: '', status: 'To do' as ProjectStatus });
  const [draggedProjectId, setDraggedProjectId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ProjectStatus | null>(null);

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    duplicateProjects([p]);
  }

  function duplicateProjects(sourceProjects: Project[]) {
    if (sourceProjects.length === 0) return;
    setProjects((prev) => {
      let nextId = Math.max(0, ...prev.map((p) => p.id)) + 1;
      const duplicates = sourceProjects.map((p) => ({
        ...p,
        id: nextId++,
        name: `${p.name} (copy)`,
        status: 'To do' as const,
        progress: 0,
        paymentStatus: 'Draft' as const,
        tasks: p.tasks.map((task) => ({ ...task, done: false })),
      }));
      return [...prev, ...duplicates];
    });
    setToast(`Duplicated ${sourceProjects.length} project${sourceProjects.length === 1 ? '' : 's'} as To do`);
    setTimeout(() => setToast(''), 2200);
  }

  function deleteProjects(ids: number[]) {
    if (ids.length === 0) return;
    if (selected && ids.includes(selected.id)) setSelected(null);
    setProjects((prev) => {
      const removed = prev.filter((p) => ids.includes(p.id));
      setUndoProjects(removed);
      return prev.filter((p) => !ids.includes(p.id));
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setTimeout(() => setUndoProjects(null), 5000);
  }

  function undoDelete() {
    if (!undoProjects) return;
    setProjects((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      return [...prev, ...undoProjects.filter((p) => !existingIds.has(p.id))];
    });
    setUndoProjects(null);
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

  function addTask(label: string) {
    if (!selected) return;
    const task = { label, done: false };
    setProjects((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, tasks: [...p.tasks, task] } : p)),
    );
    setSelected((prev) => (prev ? { ...prev, tasks: [...prev.tasks, task] } : prev));
  }

  function removeTask(taskIndex: number) {
    if (!selected) return;
    setProjects((prev) => prev.map((project) => (
      project.id === selected.id
        ? { ...project, tasks: project.tasks.filter((_, index) => index !== taskIndex) }
        : project
    )));
    setSelected((prev) => prev ? { ...prev, tasks: prev.tasks.filter((_, index) => index !== taskIndex) } : prev);
    setToast('Task removed');
    setTimeout(() => setToast(''), 2200);
  }

  function updateProjectStatus(id: number, status: ProjectStatus) {
    setProjects((prev) => prev.map((project) => (project.id === id ? { ...project, status } : project)));
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
    setToast(`Moved project to ${status}`);
    setTimeout(() => setToast(''), 2200);
  }

  function handleDrop(status: ProjectStatus) {
    if (draggedProjectId === null) return;
    const project = projects.find((item) => item.id === draggedProjectId);
    if (project && project.status !== status) updateProjectStatus(draggedProjectId, status);
    setDraggedProjectId(null);
    setDragOverStatus(null);
  }

  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newProject.name.trim() || !newProject.client || !newProject.value || !newProject.deadline) {
      setCreateError('Complete all required fields.');
      return;
    }
    const createdName = newProject.name.trim();
    const project: Project = {
      id: Math.max(0, ...projects.map((item) => item.id)) + 1,
      name: createdName,
      client: newProject.client,
      status: newProject.status,
      value: Number(newProject.value),
      progress: 0,
      deadline: newProject.deadline,
      paymentStatus: 'Draft',
       tasks: [],
       timeline: [],
    };
    setProjects((prev) => [...prev, project]);
    setCreateOpen(false);
    setCreateError('');
    setNewProject({ name: '', client: '', value: '', deadline: '', status: 'To do' });
    setToast('Project created');
    setTimeout(() => setToast(''), 2200);
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
        <div className="flex items-center gap-3">
            <IconButton as="button" onClick={() => setCreateOpen(true)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700">
             <><Plus className="h-4 w-4" /> New project</>
           </IconButton>
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-sm">
          <button
            onClick={() => setView('board')}
             className={`focus-ring px-3 py-1.5 rounded-full font-medium ${view === 'board' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
          >
            Board
          </button>
          <button
            onClick={() => setView('table')}
             className={`focus-ring px-3 py-1.5 rounded-full font-medium ${view === 'table' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
          >
            Table
          </button>
          </div>
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
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
                 {clientFilter && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}</>}
              </PopoverButton>
               <PopoverPanel className="absolute top-full right-0 z-30 mt-2 w-56 rounded-xl border border-hairline bg-white shadow-lg p-3">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Client</label>
                 <Select className="rounded-full" value={clientFilter} onValueChange={(v) => { setClientFilter(v); setPage(1); }} placeholder="Any client" enableClear>
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
                 <div
                   key={status}
                   onDragOver={(event) => {
                     event.preventDefault();
                     event.dataTransfer.dropEffect = 'move';
                     setDragOverStatus(status);
                   }}
                   onDragLeave={() => setDragOverStatus((current) => (current === status ? null : current))}
                   onDrop={(event) => {
                     event.preventDefault();
                     handleDrop(status);
                   }}
                   className={`bg-slate-100/60 rounded-xl p-3 transition-colors ${dragOverStatus === status ? 'bg-emerald-50 ring-2 ring-emerald-200' : ''}`}
                 >
                   <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center justify-between">
                     <span>{status}</span>
                     <span className="text-xs bg-white rounded-full px-2 py-0.5 border border-hairline">
                        {items.length}
                     </span>
                   </h3>
                   <div className="space-y-2">
                     {items.map((p) => (
                       <motion.div
                         key={p.id}
                         draggable
                         onDragStart={(event) => {
                           setDraggedProjectId(p.id);
                           const dragEvent = event as unknown as globalThis.DragEvent;
                           const dataTransfer = dragEvent.dataTransfer;
                           if (!dataTransfer) return;
                           dataTransfer.effectAllowed = 'move';
                           dataTransfer.setData('text/plain', String(p.id));
                         }}
                         onDragEnd={() => {
                           setDraggedProjectId(null);
                           setDragOverStatus(null);
                         }}
                         whileHover={{ y: -2 }}
                         className={`w-full bg-white rounded-lg border border-hairline shadow-sm p-3 hover:shadow-md transition-shadow ${draggedProjectId === p.id ? 'opacity-50' : ''}`}
                       >
                        <button onClick={() => setSelected(p)} className="focus-ring block w-full text-left">
                          <div className="flex items-center gap-2">
                            <ProjectIcon seed={p.id} />
                            <p className="text-sm font-medium truncate">{p.name}</p>
                          </div>
                        </button>
                        <p className="text-xs text-slate-500 truncate mt-1">{p.client}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">{fmtDate(p.deadline)}</span>
                          <span className="text-xs font-semibold"><AnimatedNumber value={p.value} format={fmtMoney} duration={600} /></span>
                        </div>
                        <div className="mt-2">
                          <ProgressWithLabel value={p.progress} animateLabel />
                        </div>
                        <label className="block mt-2 text-xs font-medium text-slate-500" onClick={(event) => event.stopPropagation()}>
                          Status
                          <select
                            value={p.status}
                            aria-label={`Status for ${p.name}`}
                            onChange={(event) => updateProjectStatus(p.id, event.target.value as ProjectStatus)}
                             className="focus-ring mt-1 w-full rounded-full border border-hairline bg-white px-2 py-1.5 text-xs text-slate-700"
                          >
                            {STATUSES.map((option) => <option key={option}>{option}</option>)}
                          </select>
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
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
                    {cols.map((col) => (
                      <TableHeaderCell
                        key={col.key}
                        aria-sort={sort.key === col.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                        className="select-none"
                      >
                        <button
                          type="button"
                          onClick={() => sortBy(col.key)}
                          className="focus-ring inline-flex items-center gap-1 rounded"
                        >
                          {col.label}
                          <SortIcon active={sort.key === col.key} dir={sort.dir} />
                        </button>
                      </TableHeaderCell>
                    ))}
                    <TableHeaderCell className="w-10" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((p) => {
                    const isSelected = selectedIds.has(p.id);
                    return (
                      <TableRow
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className={`hover:bg-slate-50 ${isSelected ? 'bg-slate-50' : ''}`}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label={`Select ${p.name}`}
                            checked={isSelected}
                            onChange={() => toggleRow(p.id)}
                            className="focus-ring w-4 h-4 rounded accent-slate-900"
                          />
                        </TableCell>
                        <TableCell className="font-medium cursor-pointer">
                          <div className="flex items-center gap-2">
                            <ProjectIcon seed={p.id} />
                            <span className="truncate max-w-[200px]">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Avatar name={p.client} />
                            {p.client}
                          </div>
                        </TableCell>
                        <TableCell className="cursor-pointer">
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-slate-600 cursor-pointer">
                          {fmtDate(p.deadline)}
                        </TableCell>
                        <TableCell className="font-medium cursor-pointer">
                          {fmtMoney(p.value)}
                        </TableCell>
                        <TableCell className="w-36 cursor-pointer">
                          <ProgressWithLabel value={p.progress} />
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Menu as="div" className="relative">
                             <MenuButton className="focus-ring p-1.5 rounded-full text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${p.name}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </MenuButton>
                             <MenuItems className="absolute top-full right-0 z-30 mt-2 w-40 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                              <MenuItem>
                                  <IconButton as="button" onClick={() => duplicateProject(p)} className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm text-slate-700 data-[focus]:bg-slate-50">
                                       <><AnimatedCopyIcon className="w-3.5 h-3.5" /> Duplicate</>
                                 </IconButton>
                              </MenuItem>
                              <MenuItem>
                                  <IconButton as="button" onClick={() => deleteProjects([p.id])} className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm text-rose-600 data-[focus]:bg-rose-50">
                                       <><AnimatedTrashIcon className="w-3.5 h-3.5" /> Delete</>
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
                      <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                        No projects match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
               </Table>
             </div>

             <div className="sm:hidden divide-y divide-hairline">
               {pageRows.map((p) => {
                 const isSelected = selectedIds.has(p.id);
                 return (
                   <div key={p.id} className={`p-4 ${isSelected ? 'bg-slate-50' : ''}`}>
                     <div className="flex items-start gap-3">
                       <input
                         type="checkbox"
                         aria-label={`Select ${p.name}`}
                         checked={isSelected}
                         onChange={() => toggleRow(p.id)}
                         className="focus-ring mt-1 w-4 h-4 rounded accent-slate-900"
                       />
                       <button onClick={() => setSelected(p)} className="focus-ring min-w-0 flex-1 text-left">
                         <div className="flex items-center gap-2">
                           <ProjectIcon seed={p.id} />
                           <span className="font-medium truncate">{p.name}</span>
                         </div>
                         <p className="mt-1 text-sm text-slate-500 truncate">{p.client}</p>
                         <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                           <span>Due <strong className="font-medium text-slate-700">{fmtDate(p.deadline)}</strong></span>
                           <span>Value <strong className="font-medium text-slate-700">{fmtMoney(p.value)}</strong></span>
                         </div>
                         <div className="mt-3"><ProgressWithLabel value={p.progress} /></div>
                         <div className="mt-2"><StatusBadge status={p.status} /></div>
                       </button>
                       <Menu as="div" className="relative">
                            <MenuButton className="focus-ring p-1.5 rounded-full text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${p.name}`}>
                                <MoreHorizontal className="w-4 h-4" />
                         </MenuButton>
                          <MenuItems className="absolute top-full right-0 z-30 mt-2 w-40 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                             <MenuItem><button onClick={() => duplicateProject(p)} className="w-full px-3 py-2 rounded-full text-left text-sm text-slate-700 data-[focus]:bg-slate-50"><AnimatedCopyIcon className="mr-2 inline w-3.5 h-3.5" />Duplicate</button></MenuItem>
                              <MenuItem><button onClick={() => deleteProjects([p.id])} className="w-full px-3 py-2 rounded-full text-left text-sm text-rose-600 data-[focus]:bg-rose-50"><AnimatedTrashIcon className="mr-2 inline w-3.5 h-3.5" />Delete</button></MenuItem>
                         </MenuItems>
                       </Menu>
                     </div>
                   </div>
                 );
               })}
                {pageRows.length === 0 && <div className="px-4 py-8 text-center text-slate-500">No projects match your filters.</div>}
             </div>

             {/* Bulk action bar */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="fixed inset-x-0 bottom-16 sm:bottom-0 z-20 flex flex-wrap items-center gap-3 px-4 py-3 border-t border-hairline bg-slate-50 shadow-lg"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    {selectedIds.size} selected
                  </span>
                   <IconButton as="button"
                     onClick={() => duplicateProjects(projects.filter((p) => selectedIds.has(p.id)))}
                     className="focus-ring p-2 rounded-full border border-hairline bg-white text-slate-500 hover:bg-slate-100"
                    aria-label="Duplicate selected"
                  >
                         <AnimatedCopyIcon className="w-4 h-4" />
                   </IconButton>

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
                    onClick={() => {
                       deleteProjects([...selectedIds]);
                    }}
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
          </>
        )}
      </Card>

      <ProjectDrawer project={selected} onClose={() => setSelected(null)} onToggleTask={toggleTask} onAddTask={addTask} onRemoveTask={removeTask} />
      <CreateDialog open={createOpen} onClose={() => { setCreateOpen(false); setCreateError(''); }} title="New project" description="Add a project to your board.">
        <form onSubmit={createProject} className="mt-5 space-y-4">
          <div>
            <label htmlFor="project-name" className="text-sm font-medium text-slate-700">Project name *</label>
            <input id="project-name" required value={newProject.name} onChange={(event) => setNewProject({ ...newProject, name: event.target.value })} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="project-client" className="text-sm font-medium text-slate-700">Client *</label>
            <select id="project-client" required value={newProject.client} onChange={(event) => setNewProject({ ...newProject, client: event.target.value })} className={fieldClass}>
              <option value="">Select a client</option>
              {CLIENTS.map((client) => <option key={client.id}>{client.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="project-value" className="text-sm font-medium text-slate-700">Value *</label><input id="project-value" required min="0" type="number" value={newProject.value} onChange={(event) => setNewProject({ ...newProject, value: event.target.value })} className={fieldClass} /></div>
            <div><label htmlFor="project-deadline" className="text-sm font-medium text-slate-700">Deadline *</label><input id="project-deadline" required type="date" value={newProject.deadline} onChange={(event) => setNewProject({ ...newProject, deadline: event.target.value })} className={fieldClass} /></div>
          </div>
          <div><label htmlFor="project-status" className="text-sm font-medium text-slate-700">Status</label><select id="project-status" value={newProject.status} onChange={(event) => setNewProject({ ...newProject, status: event.target.value as ProjectStatus })} className={fieldClass}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></div>
          {createError && <p className="text-sm text-rose-600" role="alert">{createError}</p>}
           <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setCreateOpen(false)} className="focus-ring rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="focus-ring rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700">Create project</button></div>
        </form>
      </CreateDialog>
      <Toast show={!!toast} text={toast} />
      <AnimatePresence>
        {undoProjects && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-6 left-6 z-50 flex items-center gap-3 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
            role="status"
            aria-live="polite"
          >
            Deleted {undoProjects.length} project{undoProjects.length === 1 ? '' : 's'}.
            <button onClick={undoDelete} className="focus-ring font-semibold underline underline-offset-2">Undo</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
