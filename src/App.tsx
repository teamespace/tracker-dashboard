import { useEffect, useState, type ComponentType, type Dispatch, type SetStateAction } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import TopNav from './components/TopNav';
import Overview from './pages/Overview';
import Projects from './pages/Projects';
import Earnings from './pages/Earnings';
import Clients from './pages/Clients';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import { pageTransition } from './components/motion/variants';
import { PROJECTS, type Project } from './data';
import TimedNotification from './components/TimedNotification';

export type Page = 'overview' | 'projects' | 'earnings' | 'clients' | 'invoices' | 'settings';
export type ProjectPageProps = {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
};

const PAGES: Record<Page, ComponentType<ProjectPageProps>> = {
  overview: Overview,
  projects: Projects,
  earnings: Earnings,
  clients: Clients,
  invoices: Invoices,
  settings: Settings,
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [page, setPageState] = useState<Page>(() => {
    const hash = window.location.hash.slice(1) as Page;
    return hash in PAGES ? hash : 'overview';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Page;
      if (hash in PAGES) setPageState(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  function setPage(nextPage: Page) {
    setPageState(nextPage);
    if (window.location.hash !== `#${nextPage}`) window.history.pushState({}, '', `#${nextPage}`);
  }

  const ActivePage = PAGES[page];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-slate-900 focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="min-h-screen flex flex-col bg-slate-50">
      <TopNav page={page} setPage={setPage} />
      <TimedNotification />

      <main id="main-content" className="flex-1 px-4 sm:px-6 py-6 pb-20 lg:pb-6 max-w-[1920px] w-full mx-auto">
        <AnimatePresence>
          <motion.div key={page} variants={pageTransition} initial="initial" animate="animate" exit="exit">
             <ActivePage projects={projects} setProjects={setProjects} />
          </motion.div>
        </AnimatePresence>
      </main>
      </div>
    </>
  );
}
