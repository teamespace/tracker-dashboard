import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedMoreIconProps = { active?: boolean; className?: string };

export function AnimatedMoreIcon({ active, className }: AnimatedMoreIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        {[6, 12, 18].map((cx, index) => <motion.circle key={cx} cx={cx} cy="12" r="1.7" animate={controlled ? (active ? { y: index === 1 ? -1 : 1, scale: 1.08 } : { y: 0, scale: 1 }) : undefined} variants={{ rest: { y: 0, scale: 1 }, active: { y: index === 1 ? -1 : 1, scale: 1.08 } }} transition={{ ...transition, delay: reduced ? 0 : index * 0.02 }} />)}
      </motion.svg>
    </MotionConfig>
  );
}
