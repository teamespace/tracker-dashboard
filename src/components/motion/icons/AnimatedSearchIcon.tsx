import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedSearchIconProps = { active?: boolean; className?: string };

export function AnimatedSearchIcon({ active, className }: AnimatedSearchIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        <motion.circle cx="10.8" cy="10.8" r="6.8" animate={controlled ? (active ? { scale: 1.08 } : { scale: 1 }) : undefined} whileHover={controlled || reduced ? undefined : { scale: 1.08 }} transition={transition} style={{ transformOrigin: '10.8px 10.8px', transformBox: 'view-box' }} />
        <motion.path d="m16 16 5 5" animate={controlled ? (active ? { x: 1, y: 1 } : { x: 0, y: 0 }) : undefined} variants={{ rest: { x: 0, y: 0 }, active: { x: 1, y: 1 } }} transition={transition} />
      </motion.svg>
    </MotionConfig>
  );
}
