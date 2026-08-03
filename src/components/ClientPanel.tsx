import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';
import type { Client } from '../data';
import { fmtDate, fmtMoney } from '../lib/format';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';

export default function ClientPanel({ client, onClose }: { client: Client | null; onClose: () => void }) {
  return (
    <Transition show={client !== null} as={Fragment}>
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
            <DialogPanel className="w-full max-w-sm max-h-[85vh] overflow-y-auto bg-white rounded-2xl border border-hairline shadow-xl p-6">
              {client && (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={client.name} size={10} />
                      <div>
                        <DialogTitle className="text-lg font-bold">{client.name}</DialogTitle>
                        <p className="text-sm text-slate-500">{client.company}</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      aria-label="Close dialog"
                      className="focus-ring p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      <X className="w-5 h-5" aria-hidden />
                    </button>
                  </div>
                  <StatusBadge status={client.status} />
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Active projects</dt>
                      <dd className="font-medium">{client.activeProjects}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Total billed</dt>
                      <dd className="font-medium">{fmtMoney(client.totalBilled)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Last activity</dt>
                      <dd className="font-medium">{fmtDate(client.lastActivity)}</dd>
                    </div>
                  </dl>
                </>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
