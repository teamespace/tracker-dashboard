import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedUserPlusIconProps = { active?: boolean; className?: string };

export function AnimatedUserPlusIcon({ active, className }: AnimatedUserPlusIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' as const };

  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" animate={controlled ? (active ? 'active' : 'rest') : undefined} whileHover={controlled || reduced ? undefined : 'active'} whileFocus={controlled || reduced ? undefined : 'active'}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M19 13v6M16 16h6" />
        <motion.g
          variants={{ rest: { scale: 1 }, active: { scale: 1.14 } }}
          transition={transition}
          style={{ transformOrigin: '19px 16px', transformBox: 'view-box' }}
        >
          <motion.path d="M19 13v6" variants={{ rest: { pathLength: 0 }, active: { pathLength: 1 } }} transition={transition} />
          <motion.path d="M16 16h6" variants={{ rest: { pathLength: 0 }, active: { pathLength: 1 } }} transition={{ ...transition, delay: reduced ? 0 : 0.04 }} />
        </motion.g>
      </motion.svg>
    </MotionConfig>
  );
}
