import { ProgressBar } from '@tremor/react';

export default function ProgressWithLabel({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <ProgressBar value={value} color="emerald" />
      </div>
      <span className="text-xs text-slate-500 tabular-nums shrink-0">{value}%</span>
    </div>
  );
}
