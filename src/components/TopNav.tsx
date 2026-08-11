import type { ComponentType } from 'react';
import { useState } from 'react';
import { motion } from 'motion/react';
import type { Page } from '../App';
import NotificationsMenu from './NotificationsMenu';
import logo from '../assets/logo.svg';
import { BarChart3, Folder, LayoutGrid, Receipt, Settings, Users } from 'lucide-react';
import { AnimatedChartIcon } from './motion/icons/AnimatedChartIcon';
import { AnimatedUsersIcon } from './motion/icons/AnimatedUsersIcon';
import { AnimatedReceiptIcon } from './motion/icons/AnimatedReceiptIcon';

type NavIcon = ComponentType<{ className?: string }>;

const NAV: { id: Page; label: string; icon: NavIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'earnings', label: 'Earnings', icon: BarChart3 },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const DESKTOP_NAV = NAV.filter((item) => item.id !== 'settings');

export default function TopNav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const [hoveredPage, setHoveredPage] = useState<Page | null>(null);

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
                  onMouseEnter={() => setHoveredPage(item.id)}
                  onMouseLeave={() => setHoveredPage((current) => (current === item.id ? null : current))}
                  onFocus={() => setHoveredPage(item.id)}
                  onBlur={() => setHoveredPage((current) => (current === item.id ? null : current))}
                  aria-current={active ? 'page' : undefined}
                  className={`focus-ring flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.id === 'earnings' ? (
                    <AnimatedChartIcon className="w-4 h-4" active={hoveredPage === item.id} />
                  ) : item.id === 'clients' ? (
                    <AnimatedUsersIcon className="w-4 h-4" active={hoveredPage === item.id} />
                  ) : item.id === 'invoices' ? (
                    <AnimatedReceiptIcon className="w-4 h-4" active={hoveredPage === item.id} />
                  ) : item.id === 'overview' ? (
                    <motion.span
                      className="inline-flex"
                      animate={{ rotate: hoveredPage === item.id ? 45 : 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.span>
                  ) : item.id === 'projects' ? (
                    <motion.span
                      className="inline-flex"
                      animate={hoveredPage === item.id ? { x: [0, -1.5, 1.5, 0], rotate: [0, -3, 3, 0] } : { x: 0, rotate: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.span>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
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
               className={`focus-ring inline-flex w-9 h-9 items-center justify-center rounded-full transition-colors ${
                page === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <motion.span
                className="inline-flex"
                whileHover={{ rotate: 180, scale: 1 }}
                whileFocus={{ rotate: 180, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <Settings className="w-5 h-5" />
              </motion.span>
            </button>
            <NotificationsMenu />
            <div className="relative">
              <img
                src="https://api.dicebear.com/9.x/toon-head/svg?seed=Raka%20Mahendra&backgroundColor=d1fae5"
                alt="Raka Mahendra avatar"
                className="w-9 h-9 rounded-full bg-emerald-100 object-cover shrink-0"
              />
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
              onMouseEnter={() => setHoveredPage(item.id)}
              onMouseLeave={() => setHoveredPage((current) => (current === item.id ? null : current))}
              onFocus={() => setHoveredPage(item.id)}
              onBlur={() => setHoveredPage((current) => (current === item.id ? null : current))}
               className={`focus-ring flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-medium ${
                active ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              {item.id === 'earnings' ? (
                <AnimatedChartIcon className="w-5 h-5" active={hoveredPage === item.id} />
              ) : item.id === 'clients' ? (
                <AnimatedUsersIcon className="w-5 h-5" active={hoveredPage === item.id} />
              ) : item.id === 'invoices' ? (
                <AnimatedReceiptIcon className="w-5 h-5" active={hoveredPage === item.id} />
              ) : item.id === 'overview' ? (
                <motion.span
                  className="inline-flex"
                  animate={{ rotate: hoveredPage === item.id ? 45 : 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <Icon className="w-5 h-5" />
                </motion.span>
              ) : item.id === 'projects' ? (
                <motion.span
                  className="inline-flex"
                  animate={hoveredPage === item.id ? { x: [0, -1.5, 1.5, 0], rotate: [0, -3, 3, 0] } : { x: 0, rotate: 0 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                >
                  <Icon className="w-5 h-5" />
                </motion.span>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
