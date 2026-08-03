import { useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import TopNav from './components/TopNav';
import Overview from './pages/Overview';
import Projects from './pages/Projects';
import Earnings from './pages/Earnings';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import { pageTransition } from './components/motion/interactions';

export type Page = 'overview' | 'projects' | 'earnings' | 'clients' | 'invoices' | 'settings';

const PAGES: Record<Page, ComponentType> = {
  overview: Overview,
  projects: Projects,
  earnings: Earnings,
  clients: Clients,
  invoices: Invoices,
  settings: Settings,
};

export default function App() {
  const [page, setPage] = useState<Page>('overview');

  const ActivePage = PAGES[page];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNav page={page} setPage={setPage} />

      <main className="flex-1 px-4 sm:px-6 py-6 pb-20 lg:pb-6 max-w-[1440px] w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={page} variants={pageTransition} initial="initial" animate="animate" exit="exit">
            <ActivePage />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
