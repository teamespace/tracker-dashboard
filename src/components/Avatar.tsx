export default function Avatar({ name, size = 7 }: { name: string; size?: 6 | 7 | 8 | 10 | 14 }) {
  const dims = {
    6: 'w-6 h-6 text-[10px]',
    7: 'w-7 h-7 text-[11px]',
    8: 'w-8 h-8 text-xs',
    10: 'w-10 h-10 text-sm',
    14: 'w-14 h-14 text-lg',
  }[size];
  return (
    <img
      src={`https://api.dicebear.com/9.x/toon-head/svg?seed=${encodeURIComponent(name)}&backgroundColor=d1fae5`}
      alt={`${name} avatar`}
      loading="lazy"
      className={`rounded-full bg-emerald-100 object-cover shrink-0 ${dims}`}
    />
  );
}
