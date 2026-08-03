const AVATAR_COLORS = ['bg-emerald-600', 'bg-sky-600', 'bg-violet-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'];

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function Avatar({ name, size = 7 }: { name: string; size?: 6 | 7 | 8 | 10 | 14 }) {
  const dims = {
    6: 'w-6 h-6 text-[10px]',
    7: 'w-7 h-7 text-[11px]',
    8: 'w-8 h-8 text-xs',
    10: 'w-10 h-10 text-sm',
    14: 'w-14 h-14 text-lg',
  }[size];
  return (
    <span className={`rounded-full ${avatarColor(name)} text-white font-semibold flex items-center justify-center shrink-0 ${dims}`}>
      {initials(name)}
    </span>
  );
}
