import { Card } from '@tremor/react';

export default function SplitBarStat({
  title,
  value,
  segments,
}: {
  title: string;
  value: string;
  segments: { label: string; sublabel: string; amount: number; bar: string; dot: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.amount, 0) || 1;
  return (
    <Card className="h-full flex flex-col justify-center">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="text-2xl font-bold mt-1 mb-3">{value}</p>
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mb-2.5">
        {segments.map((s) => (
          <div key={s.label} className={s.bar} style={{ width: `${(s.amount / total) * 100}%` }} />
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-sm ${s.dot}`} />
            <span>
              <strong className="text-slate-700 font-semibold">{s.sublabel}</strong> {s.label}
            </span>
          </span>
        ))}
      </div>
    </Card>
  );
}
