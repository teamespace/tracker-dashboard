import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedFilterIconProps = { active?: boolean; className?: string };

export function AnimatedFilterIcon({ active, className }: AnimatedFilterIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        <path d="M4 5h16M7 12h10M10 19h4" opacity=".5" />
        <motion.path d="M4 5h16l-6.5 7.5V19h-3v-6.5L4 5Z" animate={controlled ? (active ? { y: 1 } : { y: 0 }) : undefined} variants={{ rest: { y: 0 }, active: { y: 1 } }} transition={transition} />
      </motion.svg>
    </MotionConfig>
  );
}
