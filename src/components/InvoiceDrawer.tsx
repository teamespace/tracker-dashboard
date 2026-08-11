import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { motion } from 'motion/react';
import { Bell, Check, X } from 'lucide-react';
import type { Invoice } from '../data';
import { fmtDate, fmtMoney } from '../lib/format';
import StatusBadge from './StatusBadge';
import { IconButton } from './motion/IconButton';

type InvoiceDrawerProps = {
  invoice: Invoice | null;
  onClose: () => void;
  onMarkPaid?: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
};

export default function InvoiceDrawer({ invoice, onClose, onMarkPaid, onSendReminder }: InvoiceDrawerProps) {
  return (
    <Transition show={invoice !== null} as={Fragment}>
      <Dialog open={invoice !== null} onClose={onClose} className="relative z-40">
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
            <DialogPanel className="w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-2xl border border-hairline bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl sm:max-h-[85vh] sm:rounded-2xl sm:pb-6">
              {invoice && (
                <>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <DialogTitle className="text-lg font-bold">{invoice.number}</DialogTitle>
                      <p className="mt-1 text-sm text-slate-500">{invoice.client}</p>
                    </div>
                    <IconButton
                      as="button"
                      onClick={onClose}
                      aria-label="Close invoice"
                      className="focus-ring -mr-1 -mt-1 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </IconButton>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Amount due</p>
                        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{fmtMoney(invoice.amount)}</p>
                      </div>
                      <StatusBadge status={invoice.status} />
                    </div>
                  </motion.div>

                  <dl className="mb-6 divide-y divide-slate-100 rounded-2xl border border-hairline">
                    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                      <dt className="text-slate-500">Issued</dt>
                      <dd className="font-medium text-slate-800">{fmtDate(invoice.issued)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                      <dt className="text-slate-500">Due</dt>
                      <dd className="font-medium text-slate-800">{fmtDate(invoice.due)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                      <dt className="text-slate-500">Project</dt>
                      <dd className="font-medium text-slate-800">#{invoice.projectId}</dd>
                    </div>
                  </dl>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {onMarkPaid && invoice.status !== 'Paid' && (
                      <button
                        type="button"
                        onClick={() => onMarkPaid(invoice)}
                        className="focus-ring inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Mark as paid
                      </button>
                    )}
                    {onSendReminder && invoice.status !== 'Paid' && (
                      <button
                        type="button"
                        onClick={() => onSendReminder(invoice)}
                        className="focus-ring inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Bell className="h-4 w-4" aria-hidden="true" />
                        Send reminder
                      </button>
                    )}
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
