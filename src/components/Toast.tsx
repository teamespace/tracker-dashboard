import { AnimatePresence, motion } from 'motion/react';

export default function Toast({ show, text, onUndo }: { show: boolean; text: string; onUndo?: () => void }) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-6 z-50" role="status" aria-live="polite">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="flex items-center gap-4 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg"
          >
            <span>{text}</span>
            {onUndo && (
              <button onClick={onUndo} className="focus-ring rounded px-1.5 py-1 text-emerald-300 hover:text-emerald-200">
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
