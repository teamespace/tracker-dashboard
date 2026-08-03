import { statusColor, type TremorColor } from '../lib/format';

// Soft outlined pill: tinted background, matching border, colored text — no filled/solid badges.
const VARIANT_CLASSES: Record<TremorColor, string> = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  gray: 'border-slate-200 bg-white text-slate-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium ${VARIANT_CLASSES[statusColor(status)]}`}
    >
      {status}
    </span>
  );
}
