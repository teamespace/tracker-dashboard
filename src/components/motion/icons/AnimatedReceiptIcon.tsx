import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedReceiptIconProps = { active?: boolean; className?: string };

export function AnimatedReceiptIcon({ active, className }: AnimatedReceiptIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' as const };

  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" animate={controlled ? (active ? 'active' : 'rest') : undefined} whileHover={controlled || reduced ? undefined : 'active'} whileFocus={controlled || reduced ? undefined : 'active'}>
        <motion.path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" variants={{ rest: { y: 0 }, active: { y: -0.5 } }} transition={transition} />
        <motion.path d="M16 8h-6" variants={{ rest: { y: 0 }, active: { y: [-1.8, 0.5, 0] } }} transition={{ ...transition, delay: reduced ? 0 : 0.03 }} />
        <motion.path d="M16 12h-6" variants={{ rest: { y: 0 }, active: { y: [1.4, -0.6, 0] } }} transition={{ ...transition, delay: reduced ? 0 : 0.07 }} />
        <motion.path d="M13 16h-3" variants={{ rest: { y: 0 }, active: { y: [-1.4, 0.4, 0] } }} transition={{ ...transition, delay: reduced ? 0 : 0.11 }} />
      </motion.svg>
    </MotionConfig>
  );
}
