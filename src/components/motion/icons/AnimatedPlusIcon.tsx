import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedPlusIconProps = { active?: boolean; className?: string };

export function AnimatedPlusIcon({ active, className }: AnimatedPlusIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        <path d="M12 5v14M5 12h14" />
        <motion.g animate={controlled ? (active ? { scale: 1.12, rotate: 90 } : { scale: 1, rotate: 0 }) : undefined} variants={{ rest: { scale: 1, rotate: 0 }, active: { scale: 1.12, rotate: 90 } }} transition={transition} style={{ transformOrigin: '12px 12px', transformBox: 'view-box' }}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </motion.g>
      </motion.svg>
    </MotionConfig>
  );
}
