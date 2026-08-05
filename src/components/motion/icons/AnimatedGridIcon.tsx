import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedGridIconProps = { active?: boolean; className?: string };

export function AnimatedGridIcon({ active, className }: AnimatedGridIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' as const };

  return (
    <MotionConfig reducedMotion="user">
      <motion.svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
        focusable="false"
        initial="rest"
        animate={controlled ? (active ? 'active' : 'rest') : undefined}
        whileHover={controlled || reduced ? undefined : 'active'}
        whileFocus={controlled || reduced ? undefined : 'active'}
      >
        <motion.rect x="3" y="3" width="7" height="7" rx="1" variants={{ rest: { x: 0, y: 0 }, active: { x: 0, y: -0.5 } }} transition={transition} />
        <motion.rect x="14" y="3" width="7" height="7" rx="1" variants={{ rest: { x: 0, y: 0 }, active: { x: 0.5, y: 0 } }} transition={transition} />
        <motion.rect x="3" y="14" width="7" height="7" rx="1" variants={{ rest: { x: 0, y: 0 }, active: { x: -0.5, y: 0 } }} transition={transition} />
        <motion.rect x="14" y="14" width="7" height="7" rx="1" variants={{ rest: { x: 0, y: 0 }, active: { x: 0, y: 0.5 } }} transition={transition} />
      </motion.svg>
    </MotionConfig>
  );
}
