import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CheckCircle2, Info, X } from 'lucide-react';

const MESSAGES = [
  { title: 'Deadline reminder', body: 'Brand identity refresh is overdue.', tone: 'warning' as const },
  { title: 'Payment update', body: 'An invoice is ready for your review.', tone: 'info' as const },
  { title: 'Workspace update', body: 'Your monthly performance summary is ready.', tone: 'success' as const },
];

export default function TimedNotification() {
  const [notification, setNotification] = useState<{ id: number; title: string; body: string; tone: 'warning' | 'info' | 'success' } | null>(() => ({ id: 0, ...MESSAGES[0] }));

  useEffect(() => {
    let index = 0;
    const interval = window.setInterval(() => {
      index = (index + 1) % MESSAGES.length;
      setNotification({ id: Date.now(), ...MESSAGES[index] });
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const Icon = notification?.tone === 'success' ? CheckCircle2 : notification?.tone === 'warning' ? Bell : Info;
  const tone = notification?.tone === 'success' ? 'success' : notification?.tone === 'warning' ? 'warning' : 'info';

  return (
    <div className="pointer-events-none fixed inset-x-4 top-20 z-50 flex justify-center sm:inset-x-auto sm:right-5 sm:top-20 sm:w-[min(30rem,calc(100vw-2.5rem))] sm:justify-end" aria-live="polite">
      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -12, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: .98 }}
            transition={{ duration: .2, ease: 'easeOut' }}
            className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border bg-white p-4 shadow-xl ${tone === 'success' ? 'border-emerald-100' : tone === 'warning' ? 'border-amber-100' : 'border-blue-100'}`}
            role="status"
          >
            <div className="flex items-start gap-3">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tone === 'success' ? 'bg-emerald-50 text-emerald-600' : tone === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">{notification.title}</p><p className="mt-1 text-sm text-slate-500">{notification.body}</p></div>
              <button type="button" onClick={() => setNotification(null)} aria-label="Dismiss notification" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100"><span key={notification.id} className={`block h-full w-full origin-left animate-notification-progress ${tone === 'success' ? 'bg-emerald-500' : tone === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} /></div>
            <p className="mt-2 text-xs text-slate-400">Next update in 1 minute</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
