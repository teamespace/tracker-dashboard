import { AnimatePresence, motion } from 'motion/react';

export default function Toast({ show, text }: { show: boolean; text: string }) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-50" role="status" aria-live="polite">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
