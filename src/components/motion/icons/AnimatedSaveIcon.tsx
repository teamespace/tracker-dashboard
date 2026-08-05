import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedSaveIconProps = { active?: boolean; className?: string };

export function AnimatedSaveIcon({ active, className }: AnimatedSaveIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        <path d="M5 3h12l2 2v16H5z" />
        <path d="M8 3v6h8V3M8 21v-7h8v7" opacity=".5" />
        <motion.path d="m9 17 2 2 4-4" animate={controlled ? (active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }) : undefined} initial={{ pathLength: 0, opacity: 0 }} variants={{ rest: { pathLength: 0, opacity: 0 }, active: { pathLength: 1, opacity: 1 } }} transition={transition} />
      </motion.svg>
    </MotionConfig>
  );
}
