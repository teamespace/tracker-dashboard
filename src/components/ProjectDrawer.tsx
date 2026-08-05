import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import type { Project } from '../data';
import { fmtDate, fmtMoney } from '../lib/format';
import StatusBadge from './StatusBadge';
import { IconButton } from './motion/IconButton';
import { X } from 'lucide-react';

export default function ProjectDrawer({
  project,
  onClose,
  onToggleTask,
  onAddTask,
  onRemoveTask,
}: {
  project: Project | null;
  onClose: () => void;
  onToggleTask: (taskIndex: number) => void;
  onAddTask: (label: string) => void;
  onRemoveTask: (taskIndex: number) => void;
}) {
  const [taskLabel, setTaskLabel] = useState('');
  const [taskError, setTaskError] = useState('');

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const label = taskLabel.trim();
    if (!label) {
      setTaskError('Enter a task name.');
      return;
    }
    onAddTask(label);
    setTaskLabel('');
    setTaskError('');
  }

  return (
    <Transition show={project !== null} as={Fragment}>
      <Dialog open={project !== null} onClose={onClose} className="relative z-40">
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

        <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-full sm:scale-95 sm:translate-y-0"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-full sm:scale-95 sm:translate-y-0"
          >
            <DialogPanel className="w-full max-w-md max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain bg-white rounded-t-2xl sm:rounded-2xl border border-hairline shadow-xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6">
              {project && (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <DialogTitle className="text-lg font-bold">{project.name}</DialogTitle>
                      <p className="text-sm text-slate-500">{project.client}</p>
                    </div>
                    <IconButton
                      as="button"
                      onClick={onClose}
                      aria-label="Close dialog"
                       className="focus-ring p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
                    >
                       <X className="w-5 h-5" />
                    </IconButton>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={project.status} />
                    <span className="text-sm font-semibold">{fmtMoney(project.value)}</span>
                     <span className="text-xs text-slate-500">due {fmtDate(project.deadline)}</span>
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
                   <ul className="space-y-2 mb-4">
                     {project.tasks.length > 0 ? project.tasks.map((task, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          id={`task-${i}`}
                          checked={task.done}
                          onChange={() => onToggleTask(i)}
                          className="focus-ring w-4 h-4 rounded accent-emerald-600"
                        />
                         <label htmlFor={`task-${i}`} className={`min-w-0 flex-1 ${task.done ? 'line-through text-slate-500' : ''}`}>
                           {task.label}
                          </label>
                          <button
                            type="button"
                            onClick={() => onRemoveTask(i)}
                            aria-label={`Remove task ${task.label}`}
                            className="focus-ring shrink-0 rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <X className="h-4 w-4" aria-hidden />
                          </button>
                       </li>
                     )) : <li className="text-sm text-slate-500">No tasks yet.</li>}
                   </ul>

                   <form onSubmit={addTask} className="mb-5">
                     <label htmlFor="new-task" className="sr-only">New task</label>
                     <div className="flex gap-2">
                       <input
                         id="new-task"
                         required
                         value={taskLabel}
                         onChange={(event) => {
                           setTaskLabel(event.target.value);
                           if (taskError) setTaskError('');
                         }}
                         placeholder="Add a task"
                         className="focus-ring min-w-0 flex-1 rounded-full border border-hairline px-3 py-2 text-sm"
                       />
                       <button type="submit" className="focus-ring rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700">
                         Add task
                       </button>
                     </div>
                     {taskError && <p className="mt-1 text-xs text-rose-600" role="alert">{taskError}</p>}
                   </form>

                   <section className="mb-5 rounded-xl border border-hairline bg-slate-50 p-3">
                     <h3 className="text-sm font-semibold">Deadline</h3>
                     <p className="mt-1 text-base font-semibold text-slate-800">{fmtDate(project.deadline)}</p>
                     <p className="mt-1 text-xs text-slate-500">
                       {project.status} · {project.progress}% complete
                     </p>
                   </section>

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
