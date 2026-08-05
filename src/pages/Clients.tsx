import { useMemo, useState, type FormEvent } from 'react';
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Select, SelectItem } from '@tremor/react';
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { motion, AnimatePresence } from 'motion/react';
import { CLIENTS, type Client, type ClientStatus } from '../data';
import { fmtDate, fmtMoney } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import ClientPanel from '../components/ClientPanel';
import SortIcon from '../components/SortIcon';
import Toast from '../components/Toast';
import CreateDialog from '../components/CreateDialog';
import { IconButton } from '../components/motion/IconButton';
import { AnimatedTrashIcon } from '../components/motion/AnimatedTrashIcon';
import { ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search, SlidersHorizontal } from 'lucide-react';

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

const fieldClass = 'focus-ring mt-1 w-full rounded-full border border-hairline px-3 py-2 text-sm';

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
  const [undoClients, setUndoClients] = useState<Client[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newClient, setNewClient] = useState({ name: '', company: '', status: 'Lead' as ClientStatus });

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

  function markSelectedAs(status: ClientStatus) {
    setClients((prev) => prev.map((c) => (selectedIds.has(c.id) ? { ...c, status } : c)));
    setToast(`Marked ${selectedIds.size} client${selectedIds.size === 1 ? '' : 's'} as ${status}`);
    setTimeout(() => setToast(''), 2200);
    setSelectedIds(new Set());
  }

  function deleteClients(ids: number[]) {
    if (ids.length === 0) return;
    setClients((prev) => {
      const removed = prev.filter((c) => ids.includes(c.id));
      setUndoClients(removed);
      return prev.filter((c) => !ids.includes(c.id));
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setToast(`Deleted ${ids.length} client${ids.length === 1 ? '' : 's'}`);
    setTimeout(() => {
      setToast('');
      setUndoClients(null);
    }, 5000);
  }

  function undoDelete() {
    if (!undoClients) return;
    setClients((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      return [...prev, ...undoClients.filter((c) => !existingIds.has(c.id))];
    });
    setUndoClients(null);
    setToast('Clients restored');
  }

  function createClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newClient.name.trim() || !newClient.company.trim()) {
      setCreateError('Complete all required fields.');
      return;
    }
    const client: Client = {
      id: Math.max(0, ...clients.map((item) => item.id)) + 1,
      name: newClient.name.trim(),
      company: newClient.company.trim(),
      status: newClient.status,
      lastActivity: new Date().toISOString().slice(0, 10),
      activeProjects: 0,
      totalBilled: 0,
    };
    setClients((prev) => [...prev, client]);
    setCreateOpen(false);
    setCreateError('');
    setNewClient({ name: '', company: '', status: 'Lead' });
    setToast('Client created');
    setTimeout(() => setToast(''), 2200);
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold mb-1">Clients</h1><p className="text-sm text-slate-500">Everyone you work with.</p></div>
          <IconButton as="button" onClick={() => setCreateOpen(true)} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700"><><Plus className="h-4 w-4" /> New client</></IconButton>
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
                placeholder="Search clients or company"
                aria-label="Search clients"
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
                {cols.map((col) => (
                  <TableHeaderCell
                    key={col.key}
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
                         <MenuButton className="focus-ring p-1.5 rounded-full text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${c.name}`}>
                           <MoreHorizontal className="w-4 h-4" />
                        </MenuButton>
                         <MenuItems className="absolute top-full right-0 z-30 mt-2 w-40 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                          <MenuItem>
                              <IconButton as="button" onClick={() => deleteClients([c.id])} className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-sm text-rose-600 data-[focus]:bg-rose-50">
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
                  <TableCell colSpan={8} className="text-center text-slate-600 py-8">
                    No clients match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
           </Table>
         </div>

         <div className="sm:hidden divide-y divide-hairline">
           {pageRows.map((c) => {
             const isSelected = selectedIds.has(c.id);
             return (
               <div key={c.id} className={`p-4 ${isSelected ? 'bg-slate-50' : ''}`}>
                 <div className="flex items-start gap-3">
                   <input
                     type="checkbox"
                     aria-label={`Select ${c.name}`}
                     checked={isSelected}
                     onChange={() => toggleRow(c.id)}
                     className="focus-ring mt-1 w-4 h-4 rounded accent-slate-900"
                   />
                   <button onClick={() => setSelected(c)} className="focus-ring min-w-0 flex-1 text-left">
                     <div className="flex items-center gap-2">
                       <Avatar name={c.name} />
                       <span className="font-medium truncate">{c.name}</span>
                     </div>
                     <p className="mt-1 text-sm text-slate-500 truncate">{c.company}</p>
                     <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                       <span>Projects <strong className="font-medium text-slate-700">{c.activeProjects}</strong></span>
                       <span>Billed <strong className="font-medium text-slate-700">{fmtMoney(c.totalBilled)}</strong></span>
                       <span>Activity <strong className="font-medium text-slate-700">{fmtDate(c.lastActivity)}</strong></span>
                       <span><StatusBadge status={c.status} /></span>
                     </div>
                   </button>
                   <Menu as="div" className="relative">
                        <MenuButton className="focus-ring p-1.5 rounded-full text-slate-400 hover:bg-slate-100" aria-label={`More actions for ${c.name}`}>
                           <MoreHorizontal className="w-4 h-4" />
                     </MenuButton>
                      <MenuItems className="absolute top-full right-0 z-30 mt-2 w-40 rounded-xl border border-hairline bg-white shadow-lg p-1.5">
                            <MenuItem><IconButton as="button" onClick={() => deleteClients([c.id])} className="w-full px-3 py-2 rounded-full text-left text-sm text-rose-600 data-[focus]:bg-rose-50"><><AnimatedTrashIcon className="mr-2 inline w-3.5 h-3.5" />Delete</></IconButton></MenuItem>
                     </MenuItems>
                   </Menu>
                 </div>
               </div>
             );
           })}
           {pageRows.length === 0 && <div className="px-4 py-8 text-center text-slate-600">No clients match your filters.</div>}
         </div>

         {/* Bulk action bar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="fixed bottom-14 inset-x-3 z-40 flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-slate-50 px-4 py-3 shadow-lg sm:static sm:rounded-none sm:border-x-0 sm:border-b-0 sm:shadow-none"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                {selectedIds.size} selected
              </span>

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
                onClick={() => deleteClients([...selectedIds])}
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

      <ClientPanel client={selected} onClose={() => setSelected(null)} />
      <CreateDialog open={createOpen} onClose={() => { setCreateOpen(false); setCreateError(''); }} title="New client" description="Add a client to your workspace.">
        <form onSubmit={createClient} className="mt-5 space-y-4">
          <div><label htmlFor="client-name" className="text-sm font-medium text-slate-700">Client name *</label><input id="client-name" required value={newClient.name} onChange={(event) => setNewClient({ ...newClient, name: event.target.value })} className={fieldClass} /></div>
          <div><label htmlFor="client-company" className="text-sm font-medium text-slate-700">Company *</label><input id="client-company" required value={newClient.company} onChange={(event) => setNewClient({ ...newClient, company: event.target.value })} className={fieldClass} /></div>
          <div><label htmlFor="client-status" className="text-sm font-medium text-slate-700">Status</label><select id="client-status" value={newClient.status} onChange={(event) => setNewClient({ ...newClient, status: event.target.value as ClientStatus })} className={fieldClass}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></div>
          {createError && <p className="text-sm text-rose-600" role="alert">{createError}</p>}
           <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setCreateOpen(false)} className="focus-ring rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="focus-ring rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700">Create client</button></div>
        </form>
      </CreateDialog>
      <Toast show={!!toast} text={toast} onUndo={undoClients ? undoDelete : undefined} />
    </div>
  );
}
