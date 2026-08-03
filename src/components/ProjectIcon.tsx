const ICONS = ['✨', '🌊', '🔷', '🔺', '🌐', '🧩', '⚙️', '🎯'];
const COLORS = ['bg-violet-50', 'bg-sky-50', 'bg-amber-50', 'bg-rose-50', 'bg-emerald-50', 'bg-indigo-50'];

// Deterministic per-project icon + tint, keyed off the project id so it stays stable across renders.
export default function ProjectIcon({ seed }: { seed: number }) {
  return (
    <span className={`w-6 h-6 rounded flex items-center justify-center text-sm shrink-0 ${COLORS[seed % COLORS.length]}`}>
      {ICONS[seed % ICONS.length]}
    </span>
  );
}
