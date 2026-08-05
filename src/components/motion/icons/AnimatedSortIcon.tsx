import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedSortDirection = 'up' | 'down' | 'idle';
export type AnimatedSortIconProps = { active?: boolean; className?: string; direction?: AnimatedSortDirection };

export function AnimatedSortIcon({ active, className, direction = 'idle' }: AnimatedSortIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined || direction !== 'idle';
  const transition = reduced ? { duration: 0 } : { duration: 0.28, ease: 'easeInOut' as const };
  const state = direction !== 'idle' ? direction : active ? 'up' : 'idle';

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
        initial="idle"
        animate={controlled ? state : undefined}
        whileHover={controlled ? undefined : 'up'}
        whileFocus={controlled ? undefined : 'up'}
      >
        <motion.path d="m3 16 4 4 4-4" variants={{ idle: { y: 0 }, up: { y: -1 }, down: { y: 1 } }} transition={transition} />
        <motion.path d="M7 20V4" variants={{ idle: { y: 0 }, up: { y: -1 }, down: { y: 1 } }} transition={transition} />
        <motion.path d="m21 8-4-4-4 4" variants={{ idle: { y: 0 }, up: { y: 1 }, down: { y: -1 } }} transition={transition} />
        <motion.path d="M17 4v16" variants={{ idle: { y: 0 }, up: { y: 1 }, down: { y: -1 } }} transition={transition} />
      </motion.svg>
    </MotionConfig>
  );
}
