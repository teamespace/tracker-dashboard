import { ChevronsUpDown } from 'lucide-react';

export default function SortIcon({ active, dir: _dir }: { active: boolean; dir: 1 | -1 }) {
  return <ChevronsUpDown className={`w-3.5 h-3.5 ${active ? 'text-slate-700' : 'text-slate-400'}`} aria-hidden />;
}
