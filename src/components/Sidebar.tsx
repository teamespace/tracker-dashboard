import type { ComponentType } from 'react';
import { motion } from 'motion/react';
import type { Page } from '../App';
import { BarChart3, ChevronLeft, Folder, LayoutGrid, Receipt, Settings, Users } from 'lucide-react';

type NavIcon = ComponentType<{ className?: string }>;

const NAV: { id: Page; label: string; icon: NavIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'earnings', label: 'Earnings', icon: BarChart3 },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  page,
  setPage,
  open,
  setOpen,
}: {
  page: Page;
  setPage: (p: Page) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-hairline flex-col transition-all duration-200 hidden sm:flex ${
          open ? 'w-60' : 'w-16'
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-4 border-b border-hairline shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
            S
          </div>
          {open && <span className="font-semibold text-lg">Studio</span>}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto" aria-label="Primary">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                aria-current={active ? 'page' : undefined}
                 className={`focus-ring w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {open && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <motion.button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          className="focus-ring flex items-center justify-center h-12 border-t border-hairline text-slate-400 hover:text-slate-700"
          animate={{ rotate: open ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
      </aside>

      {/* Bottom tab bar (mobile) */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-hairline flex justify-around py-1.5 sm:hidden"
        aria-label="Primary"
      >
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
               className={`focus-ring flex flex-col items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-medium ${
                active ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
                <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
