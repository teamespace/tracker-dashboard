import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedCalendarIconProps = { active?: boolean; className?: string };

export function AnimatedCalendarIcon({ active, className }: AnimatedCalendarIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
        <motion.path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" animate={controlled ? (active ? { y: 1 } : { y: 0 }) : undefined} variants={{ rest: { y: 0 }, active: { y: 1 } }} transition={transition} />
      </motion.svg>
    </MotionConfig>
  );
}
