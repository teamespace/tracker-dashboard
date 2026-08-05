import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedBellIconProps = { active?: boolean; className?: string };

export function AnimatedBellIcon({ active, className }: AnimatedBellIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' as const };

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
        <path d="M6.5 10.5a5.5 5.5 0 0 1 11 0c0 6 2 6.5 2 8.5H4.5c0-2 2-2.5 2-8.5Z" />
        <motion.path
          d="M9.5 19c.4 1.2 1.2 2 2.5 2s2.1-.8 2.5-2"
          variants={{ rest: { y: 0 }, active: { y: 1 } }}
          transition={transition}
        />
        <motion.g
          variants={{ rest: { opacity: 0.45 }, active: { opacity: 1 } }}
          transition={transition}
        >
          <motion.path
            d="M4.5 9.5c-.7.8-1 1.7-1 2.7"
            variants={{ rest: { x: 0 }, active: { x: -0.5 } }}
            transition={transition}
          />
          <motion.path
            d="M19.5 9.5c.7.8 1 1.7 1 2.7"
            variants={{ rest: { x: 0 }, active: { x: 0.5 } }}
            transition={transition}
          />
        </motion.g>
      </motion.svg>
    </MotionConfig>
  );
}
