import { Calendar } from 'lucide-react';
import { SearchMorphInput, NotifBell } from './motion/interactions';

export default function Topbar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur border-b border-hairline flex items-center gap-4 px-4 sm:px-6">
      <div className="flex-1 max-w-sm">
        <SearchMorphInput value={search} onChange={setSearch} placeholder="Search projects, clients, invoices…" />
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-hairline rounded-lg px-3 py-2">
        <Calendar className="w-4 h-4" aria-hidden />
        This month <span aria-hidden="true">▾</span>
      </div>
      <NotifBell hasUnread />
      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
        RM
      </div>
    </header>
  );
}
