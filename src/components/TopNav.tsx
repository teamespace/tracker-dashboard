import { LayoutGrid, FolderKanban, LineChart, Users, Receipt, Settings } from 'lucide-react';
import type { Page } from '../App';
import NotificationsMenu from './NotificationsMenu';
import logo from '../assets/logo.svg';

const NAV: { id: Page; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'earnings', label: 'Earnings', icon: LineChart },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const DESKTOP_NAV = NAV.filter((item) => item.id !== 'settings');

export default function TopNav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  return (
    <>
      {/* Desktop top bar — no fill of its own; only the pill nav gets its own capsule background */}
      <header className="sticky top-0 z-20 bg-slate-50 py-2">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-14">
          <div className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="" className="w-8 h-8 shrink-0" />
            <span className="font-semibold text-lg">Studio</span>
          </div>

          <nav
            className="hidden lg:flex items-center gap-1 bg-white border border-hairline rounded-full shadow-sm p-1"
            aria-label="Primary"
          >
            {DESKTOP_NAV.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`focus-ring flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {active && <Icon className="w-4 h-4" aria-hidden />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPage('settings')}
              aria-label="Settings"
              aria-current={page === 'settings' ? 'page' : undefined}
              className={`focus-ring p-2 rounded-full transition-colors ${
                page === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Settings className="w-5 h-5" aria-hidden />
            </button>
            <NotificationsMenu />
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                RM
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile / tablet bottom tab bar (below the lg breakpoint, where the pill nav is hidden) */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-hairline flex justify-around py-1.5 lg:hidden"
        aria-label="Primary"
      >
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`focus-ring flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium ${
                active ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
