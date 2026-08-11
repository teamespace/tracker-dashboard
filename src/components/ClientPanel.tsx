import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { Activity, CalendarDays, CircleCheck, FolderKanban, X } from 'lucide-react';
import type { Client, Project } from '../data';
import { fmtDate, fmtMoney } from '../lib/format';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';
import { IconButton } from './motion/IconButton';

export default function ClientPanel({ client, projects = [], onClose }: { client: Client | null; projects?: Project[]; onClose: () => void }) {
  const clientProjects = client ? projects.filter((project) => project.client === client.name) : [];
  const outstanding = clientProjects.reduce((sum, project) => project.paymentStatus === 'Paid' ? sum : sum + Math.max(project.value - Math.round(project.value * project.progress / 100), 0), 0);

  return (
    <Transition show={client !== null} as={Fragment}>
      <Dialog open={client !== null} onClose={onClose} className="relative z-40">
        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px]" aria-hidden="true" />
        </TransitionChild>
        <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-5">
          <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-full sm:scale-95 sm:translate-y-0" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-full sm:scale-95 sm:translate-y-0">
            <DialogPanel className="w-full max-w-3xl max-h-[92dvh] overflow-y-auto rounded-t-2xl border border-hairline bg-white shadow-2xl sm:rounded-2xl">
              {client && (
                <>
                  <div className="flex items-center justify-between border-b border-hairline px-5 py-4 sm:px-7">
                    <p className="text-sm text-slate-500"><span>Clients</span><span className="mx-1.5">/</span><strong className="font-medium text-slate-800">{client.name}</strong></p>
                    <IconButton as="button" onClick={onClose} aria-label="Close client details" className="focus-ring rounded-full border border-hairline p-2 text-slate-500 hover:bg-slate-50"><X className="h-4 w-4" /></IconButton>
                  </div>

                  <div className="flex items-center gap-4 px-5 py-6 sm:px-7 sm:py-8">
                    <Avatar name={client.name} size={14} />
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><DialogTitle className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{client.name}</DialogTitle><StatusBadge status={client.status} /></div><p className="mt-1 text-base text-slate-500">{client.company}</p></div>
                  </div>

                  <div className="mx-5 overflow-hidden rounded-2xl border border-hairline sm:mx-7">
                    <div className="grid sm:grid-cols-3">
                      <div className="border-b border-hairline px-5 py-5 sm:border-b-0 sm:border-r sm:px-6"><p className="text-sm font-medium text-slate-500">Lifetime revenue</p><p className="mt-2 text-2xl font-bold text-slate-950">{fmtMoney(client.totalBilled)}</p></div>
                      <div className="border-b border-hairline px-5 py-5 sm:border-b-0 sm:border-r sm:px-6"><p className="text-sm font-medium text-slate-500">Active projects</p><p className="mt-2 text-2xl font-bold text-slate-950">{client.activeProjects}</p></div>
                      <div className="px-5 py-5 sm:px-6"><p className="text-sm font-medium text-slate-500">Outstanding</p><p className="mt-2 text-2xl font-bold text-slate-950">{fmtMoney(outstanding)}</p></div>
                    </div>
                  </div>

                  <div className="px-5 py-5 sm:px-7"><div className="divide-y divide-slate-100 rounded-2xl border border-hairline">
                    <div className="flex items-center justify-between gap-4 px-4 py-3.5 text-sm"><span className="flex items-center gap-2 text-slate-500"><CalendarDays className="h-4 w-4" /> Last activity</span><strong className="font-medium text-slate-800">{fmtDate(client.lastActivity)}</strong></div>
                    <div className="flex items-center justify-between gap-4 px-4 py-3.5 text-sm"><span className="flex items-center gap-2 text-slate-500"><Activity className="h-4 w-4" /> Client health</span><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700"><CircleCheck className="h-3.5 w-3.5" /> Healthy</span></div>
                    <div className="flex items-center justify-between gap-4 px-4 py-3.5 text-sm"><span className="flex items-center gap-2 text-slate-500"><FolderKanban className="h-4 w-4" /> Relationship</span><span className="font-medium text-slate-800">{client.status === 'Past' ? 'Past client' : 'Ongoing client'}</span></div>
                  </div></div>

                  <section className="border-t border-hairline px-5 py-5 sm:px-7 sm:py-6"><div className="mb-3 flex items-center justify-between"><h3 className="text-base font-semibold text-slate-900">Current projects</h3><span className="text-sm text-slate-500">{clientProjects.length} total</span></div><div className="overflow-hidden rounded-2xl border border-hairline">{clientProjects.length > 0 ? clientProjects.map((project) => <div key={project.id} className="flex items-center gap-3 border-t border-hairline px-4 py-3 first:border-t-0"><FolderKanban className="h-4 w-4 shrink-0 text-slate-400" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{project.name}</p><p className="mt-0.5 text-xs text-slate-500">{project.progress}% complete · {fmtDate(project.deadline)}</p></div><StatusBadge status={project.status} /></div>) : <p className="p-4 text-sm text-slate-500">No linked projects yet.</p>}</div></section>
                </>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
