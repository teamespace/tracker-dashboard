export function fmtMoney(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function fmtDate(d: string): string {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Maps our statuses to Tremor's fixed color palette (tailwind color names).
export type TremorColor = 'emerald' | 'blue' | 'amber' | 'gray' | 'red';

const STATUS_COLOR: Record<string, TremorColor> = {
  Done: 'emerald',
  Paid: 'emerald',
  Active: 'emerald',
  'In progress': 'blue',
  Sent: 'blue',
  Review: 'amber',
  Draft: 'gray',
  'To do': 'gray',
  Overdue: 'red',
  Lead: 'amber',
  Past: 'gray',
};

export function statusColor(status: string): TremorColor {
  return STATUS_COLOR[status] ?? 'gray';
}
