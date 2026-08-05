import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedUserIconProps = { active?: boolean; className?: string };

export function AnimatedUserIcon({ active, className }: AnimatedUserIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' as const };
  const state = controlled ? (active ? 'active' : 'rest') : undefined;

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
        animate={state}
        whileHover={controlled ? undefined : 'active'}
        whileFocus={controlled ? undefined : 'active'}
      >
        <motion.circle cx="12" cy="8" r="4" variants={{ rest: { y: 0 }, active: { y: -0.7 } }} transition={transition} />
        <motion.path
          d="M4 20a8 8 0 0 1 16 0"
          variants={{ rest: { y: 0 }, active: { y: 0.7 } }}
          transition={transition}
        />
      </motion.svg>
    </MotionConfig>
  );
}
