import type { ReactNode } from 'react';

const COLORS = ['#111827', '#2563eb', '#ef4444', '#7c3aed', '#059669', '#f59e0b', '#db2777', '#0891b2'];

function LogoMark({ variant, color }: { variant: number; color: string }): ReactNode {
  if (variant === 0) return <><rect x="6" y="6" width="11" height="11" rx="2" transform="rotate(45 6 6)" fill="#d1d5db" /><rect x="11" y="6" width="13" height="13" rx="2" transform="rotate(45 11 6)" fill={color} /></>;
  if (variant === 1) return <path d="M16 2l2.5 11.5L28 16l-9.5 2.5L16 30l-2.5-11.5L4 16l9.5-2.5L16 2z" fill={color} />;
  if (variant === 2) return <><circle cx="16" cy="16" r="12" fill={color} /><circle cx="16" cy="16" r="6" fill="white" /><circle cx="20" cy="12" r="5" fill={color} /></>;
  if (variant === 3) return <><circle cx="16" cy="7" r="5" fill={color} /><circle cx="8" cy="23" r="5" fill={color} /><circle cx="24" cy="23" r="5" fill={color} /></>;
  if (variant === 4) return <path d="M16 2c-7.7 0-14 6.3-14 14s6.3 14 14 14c2.8 0 5.4-.8 7.6-2.2l-4.2-4.8c-1 .6-2.1 1-3.4 1-4.4 0-8-3.6-8-8s3.6-8 8-8c1.3 0 2.5.3 3.5 1l4.1-4.8A13.9 13.9 0 0016 2z" fill={color} />;
  if (variant === 5) return <><path d="M16 3c8 1 12 5 13 13-8 1-12-3-13-13z" fill={color} /><path d="M16 3C8 4 4 8 3 16c8 1 12-3 13-13z" fill={color} opacity=".65" /><path d="M16 14v15" stroke={color} strokeWidth="2.5" strokeLinecap="round" /></>;
  if (variant === 6) return <><rect x="4" y="19" width="6" height="9" rx="2" fill={color} opacity=".65" /><rect x="13" y="11" width="6" height="17" rx="2" fill={color} /><rect x="22" y="4" width="6" height="24" rx="2" fill={color} opacity=".8" /></>;
  return <><path d="M4 8l8 8-8 8 4 4 8-8 8 8 4-4-8-8 8-8-4-4-8 8-8-8-4 4z" fill={color} /><circle cx="16" cy="16" r="3" fill="white" /></>;
}

export default function ProjectIcon({ seed }: { seed: number }) {
  const variant = Math.abs(seed) % 8;
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center">
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true"><LogoMark variant={variant} color={COLORS[variant]} /></svg>
    </span>
  );
}
