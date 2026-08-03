import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import type { Project } from '../data';
import { fmtDate, fmtMoney } from '../lib/format';
import StatusBadge from './StatusBadge';

export default function ProjectDrawer({
  project,
  onClose,
  onToggleTask,
}: {
  project: Project | null;
  onClose: () => void;
  onToggleTask: (taskIndex: number) => void;
}) {
  return (
    <Transition show={project !== null} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-40">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-white rounded-2xl border border-hairline shadow-xl p-6">
              {project && (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <DialogTitle className="text-lg font-bold">{project.name}</DialogTitle>
                      <p className="text-sm text-slate-500">{project.client}</p>
                    </div>
                    <button
                      onClick={onClose}
                      aria-label="Close dialog"
                      className="focus-ring p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" aria-hidden />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={project.status} />
                    <span className="text-sm font-semibold">{fmtMoney(project.value)}</span>
                    <span className="text-xs text-slate-400">due {fmtDate(project.deadline)}</span>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold mb-2">Tasks</h3>
                  <ul className="space-y-2 mb-5">
                    {project.tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          id={`task-${i}`}
                          checked={task.done}
                          onChange={() => onToggleTask(i)}
                          className="focus-ring w-4 h-4 rounded accent-emerald-600"
                        />
                        <label htmlFor={`task-${i}`} className={task.done ? 'line-through text-slate-400' : ''}>
                          {task.label}
                        </label>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-sm font-semibold mb-2">Timeline</h3>
                  <ul className="space-y-3 mb-5 border-l-2 border-hairline pl-3">
                    {project.timeline.map((ev, i) => (
                      <li key={i}>
                        <p className="text-sm">{ev.text}</p>
                        <p className="text-xs text-slate-400">{ev.date}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between border-t border-hairline pt-4 text-sm">
                    <span className="text-slate-500">Payment status</span>
                    <StatusBadge status={project.paymentStatus} />
                  </div>
                </>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
