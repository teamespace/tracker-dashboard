import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedCloseIconProps = { active?: boolean; className?: string };

export function AnimatedCloseIcon({ active, className }: AnimatedCloseIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        <motion.path d="m6 6 12 12" animate={controlled ? (active ? { x: 1, y: -1 } : { x: 0, y: 0 }) : undefined} variants={{ rest: { x: 0, y: 0 }, active: { x: 1, y: -1 } }} transition={transition} />
        <motion.path d="m18 6-12 12" animate={controlled ? (active ? { x: -1, y: -1 } : { x: 0, y: 0 }) : undefined} variants={{ rest: { x: 0, y: 0 }, active: { x: -1, y: -1 } }} transition={transition} />
      </motion.svg>
    </MotionConfig>
  );
}
