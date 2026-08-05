import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedCopyIconProps = { active?: boolean; className?: string };

export function AnimatedCopyIcon({ active, className }: AnimatedCopyIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.24, ease: 'easeInOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2" />
        <motion.g
          animate={controlled ? (active ? 'active' : 'rest') : undefined}
          variants={{ rest: { rotate: 0 }, active: { rotate: [0, -3, 3, 0] } }}
          transition={transition}
          style={{ transformOrigin: '15px 15px' }}
        >
          <rect x="8" y="8" width="14" height="14" rx="2" />
        </motion.g>
      </motion.svg>
    </MotionConfig>
  );
}
