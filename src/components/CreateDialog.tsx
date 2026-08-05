import { Dialog, DialogDescription, DialogPanel, DialogTitle } from '@headlessui/react';
import type { ReactNode } from 'react';
import { IconButton } from './motion/IconButton';
import { X } from 'lucide-react';

type CreateDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
};

export default function CreateDialog({ open, title, description, onClose, children }: CreateDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg font-semibold text-slate-900">{title}</DialogTitle>
            <IconButton
              as="button"
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
               className="focus-ring -mr-2 -mt-2 shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            >
               <X className="w-5 h-5" />
            </IconButton>
          </div>
          <DialogDescription className="mt-1 text-sm text-slate-500">{description}</DialogDescription>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
