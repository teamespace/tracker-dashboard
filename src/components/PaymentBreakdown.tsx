import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { motion } from 'motion/react';
import { Check, FilePlus, X } from 'lucide-react';
import type { Project } from '../data';
import { fmtMoney } from '../lib/format';
import { IconButton } from './motion/IconButton';

type PaymentBreakdownProps = {
  project: Project | null;
  onClose: () => void;
  onCreateInvoice?: (project: Project) => void;
};

const PAYMENT_STAGES = [
  { label: 'Deposit', percentage: 30 },
  { label: 'Milestone', percentage: 40 },
  { label: 'Final payment', percentage: 30 },
] as const;

function getPaymentState(amount: number, paid: number): 'Paid' | 'Partially paid' | 'Upcoming' {
  if (paid >= amount) return 'Paid';
  if (paid > 0) return 'Partially paid';
  return 'Upcoming';
}

export default function PaymentBreakdown({ project, onClose, onCreateInvoice }: PaymentBreakdownProps) {
  const paid = project ? Math.round(project.value * Math.min(Math.max(project.progress, 0), 100) / 100) : 0;
  const remaining = project ? Math.max(project.value - paid, 0) : 0;
  let paidBeforeStage = paid;

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
            <DialogPanel className="w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-2xl border border-hairline bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl sm:max-h-[85vh] sm:rounded-2xl sm:pb-6">
              {project && (
                <>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <DialogTitle className="text-lg font-bold">Payment breakdown</DialogTitle>
                      <p className="mt-1 text-sm text-slate-500">{project.name} - {project.client}</p>
                    </div>
                    <IconButton
                      as="button"
                      onClick={onClose}
                      aria-label="Close payment breakdown"
                      className="focus-ring -mr-1 -mt-1 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </IconButton>
                  </div>

                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Paid</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-800">{fmtMoney(paid)}</p>
                      <p className="mt-1 text-xs text-emerald-700">{project.progress}% of project value</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Remaining</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{fmtMoney(remaining)}</p>
                      <p className="mt-1 text-xs text-slate-500">of {fmtMoney(project.value)}</p>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2">
                    {PAYMENT_STAGES.map((stage) => {
                      const amount = Math.round(project.value * stage.percentage / 100);
                      const stagePaid = Math.min(Math.max(paidBeforeStage, 0), amount);
                      paidBeforeStage -= amount;
                      const state = getPaymentState(amount, stagePaid);

                      return (
                        <motion.div
                          key={stage.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="rounded-2xl border border-hairline p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{stage.label}</p>
                              <p className="mt-1 text-xs text-slate-500">{stage.percentage}% of project value</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">{fmtMoney(amount)}</p>
                              <p className={`mt-1 text-xs font-medium ${state === 'Paid' ? 'text-emerald-600' : state === 'Partially paid' ? 'text-amber-600' : 'text-slate-500'}`}>
                                {state === 'Paid' && <Check className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />}
                                {state}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${amount ? (stagePaid / amount) * 100 : 0}%` }} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {onCreateInvoice && (
                    <button
                      type="button"
                      onClick={() => onCreateInvoice(project)}
                      className="focus-ring inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                    >
                      <FilePlus className="h-4 w-4" aria-hidden="true" />
                      Create invoice
                    </button>
                  )}
                </>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
