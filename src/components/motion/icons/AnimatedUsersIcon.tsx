import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedUsersIconProps = { active?: boolean; className?: string };

export function AnimatedUsersIcon({ active, className }: AnimatedUsersIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.24, ease: 'easeInOut' as const };
  const state = controlled ? (active ? 'active' : 'rest') : undefined;

  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" animate={state} whileHover={controlled || reduced ? undefined : 'active'} whileFocus={controlled || reduced ? undefined : 'active'}>
        <motion.g variants={{ rest: { y: 0 }, active: { y: -0.8 } }} transition={transition}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </motion.g>
        <motion.g variants={{ rest: { y: 0 }, active: { y: 0.8 } }} transition={{ ...transition, delay: reduced ? 0 : 0.05 }}>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </motion.g>
      </motion.svg>
    </MotionConfig>
  );
}
