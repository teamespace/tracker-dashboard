import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState, type FormEvent } from 'react';
import { CalendarDays, Check, Tag, UserRound, X } from 'lucide-react';
import type { Project } from '../data';
import { fmtDate } from '../lib/format';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';
import { IconButton } from './motion/IconButton';

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
        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px]" aria-hidden="true" />
        </TransitionChild>
        <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-full sm:scale-95 sm:translate-y-0" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-full sm:scale-95 sm:translate-y-0">
            <DialogPanel className="w-full max-w-4xl max-h-[92dvh] overflow-y-auto rounded-t-2xl border border-hairline bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:p-5 sm:pb-5">
              {project && (
                <>
                  <div className="flex items-center gap-2 border-b border-hairline pb-4">
                    <p className="min-w-0 flex-1 truncate text-sm text-slate-500"><span>Client projects</span><span className="mx-1.5">/</span><strong className="font-medium text-slate-800">{project.name}</strong></p>
                    <IconButton as="button" onClick={onClose} aria-label="Close project details" className="focus-ring rounded-full border border-hairline p-2 text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></IconButton>
                  </div>

                  <div className="pt-5"><DialogTitle className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{project.name}</DialogTitle></div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-[8rem_1fr] sm:gap-y-5 sm:text-sm">
                    <div className="flex items-center gap-2 text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50"><Check className="h-4 w-4" /></span>Status</div>
                    <div><StatusBadge status={project.status} /></div>
                    <div className="flex items-center gap-2 text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50"><UserRound className="h-4 w-4" /></span>Client</div>
                    <div className="flex items-center gap-2"><Avatar name={project.client} /><span className="font-medium text-slate-800">{project.client}</span></div>
                    <div className="flex items-center gap-2 text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50"><CalendarDays className="h-4 w-4" /></span>Deadline</div>
                    <div className="flex items-center gap-2 text-slate-700">{fmtDate(project.deadline)}<span className="text-slate-300">→</span><span className="font-medium">{project.progress}% complete</span></div>
                    <div className="flex items-center gap-2 text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-50"><Tag className="h-4 w-4" /></span>Tags</div>
                    <div className="flex flex-wrap gap-2"><span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">Client work</span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Freelance</span></div>
                  </div>

                  <section className="mt-6"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">Task list</h3><span className="text-xs text-slate-500">{project.tasks.filter((task) => task.done).length}/{project.tasks.length} completed</span></div><div className="overflow-hidden rounded-2xl border border-hairline"><div className="hidden grid-cols-[3rem_1fr_8rem_7rem_2rem] gap-3 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 sm:grid"><span>No</span><span>Task</span><span>Category</span><span>Status</span><span /></div>{project.tasks.length > 0 ? project.tasks.map((task, index) => <div key={`${task.label}-${index}`} className="grid items-center gap-3 border-t border-hairline px-4 py-3 text-sm first:border-t-0 sm:grid-cols-[3rem_1fr_8rem_7rem_2rem]"><span className="text-slate-400">{index + 1}</span><label className={`flex items-center gap-2 ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}><input type="checkbox" checked={task.done} onChange={() => onToggleTask(index)} className="focus-ring h-4 w-4 rounded accent-emerald-600" />{task.label}</label><span className="hidden text-xs text-slate-500 sm:block">Project</span><span className={`text-xs font-medium ${task.done ? 'text-emerald-600' : 'text-amber-600'}`}>{task.done ? 'Completed' : 'In progress'}</span><button type="button" onClick={() => onRemoveTask(index)} aria-label={`Remove task ${task.label}`} className="justify-self-end rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X className="h-4 w-4" /></button></div>) : <p className="p-4 text-sm text-slate-500">No tasks yet.</p>}</div></section>

                  <form onSubmit={addTask} className="mt-4 flex gap-2"><label htmlFor="new-task" className="sr-only">New task</label><input id="new-task" required value={taskLabel} onChange={(event) => { setTaskLabel(event.target.value); if (taskError) setTaskError(''); }} placeholder="Add a task" className="focus-ring min-w-0 flex-1 rounded-full border border-hairline px-3 py-2 text-sm" /><button type="submit" className="focus-ring rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Add task</button></form>
                  {taskError && <p className="mt-1 text-xs text-rose-600" role="alert">{taskError}</p>}
                </>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
