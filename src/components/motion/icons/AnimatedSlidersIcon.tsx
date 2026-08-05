import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedSlidersIconProps = { active?: boolean; className?: string };

export function AnimatedSlidersIcon({ active, className }: AnimatedSlidersIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        <path d="M4 6h16M4 12h16M4 18h16" opacity=".45" />
        <motion.g animate={controlled ? (active ? "active" : "rest") : undefined} variants={{ rest: { x: 0 }, active: { x: 1 } }} transition={transition}>
          <path d="M9 4v4M15 10v4M8 16v4" />
          <path d="M7 4h4v4H7zM13 10h4v4h-4zM6 16h4v4H6z" />
        </motion.g>
      </motion.svg>
    </MotionConfig>
  );
}
