import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export default function SortIcon({ active, dir }: { active: boolean; dir: 1 | -1 }) {
  if (!active) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" aria-hidden />;
  const Icon = dir === 1 ? ArrowUp : ArrowDown;
  return <Icon className="w-3.5 h-3.5 text-slate-700" aria-hidden />;
}
