import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedFolderIconProps = { active?: boolean; className?: string };

export function AnimatedFolderIcon({ active, className }: AnimatedFolderIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' as const };

  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" animate={controlled ? (active ? 'active' : 'rest') : undefined} whileHover={controlled || reduced ? undefined : 'active'} whileFocus={controlled || reduced ? undefined : 'active'}>
        <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9H12l-2-2H3Z" />
        <motion.path d="M3 7h7l2 2h9" variants={{ rest: { rotate: 0 }, active: { rotate: -8 } }} transition={transition} style={{ transformOrigin: '3px 7px' }} />
      </motion.svg>
    </MotionConfig>
  );
}
