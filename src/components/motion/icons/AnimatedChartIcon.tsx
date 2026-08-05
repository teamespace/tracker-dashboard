import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedChartIconProps = { active?: boolean; className?: string };

export function AnimatedChartIcon({ active, className }: AnimatedChartIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.42, ease: 'easeOut' as const };

  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" animate={controlled ? (active ? 'active' : 'rest') : undefined} whileHover={controlled || reduced ? undefined : 'active'} whileFocus={controlled || reduced ? undefined : 'active'}>
         <path d="M3 3v18h18" />
        <motion.path d="M8 17v-4" variants={{ rest: { y: 0 }, active: { y: -1.5 } }} transition={{ ...transition, delay: reduced ? 0 : 0.04 }} />
        <motion.path d="M13 17V5" variants={{ rest: { y: 0 }, active: { y: 1 } }} transition={{ ...transition, delay: reduced ? 0 : 0.08 }} />
        <motion.path d="M18 17V9" variants={{ rest: { y: 0 }, active: { y: -1 } }} transition={{ ...transition, delay: reduced ? 0 : 0.12 }} />
      </motion.svg>
    </MotionConfig>
  );
}
