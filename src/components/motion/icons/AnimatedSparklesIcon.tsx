import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedSparklesIconProps = { active?: boolean; className?: string };

export function AnimatedSparklesIcon({ active, className }: AnimatedSparklesIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' as const };
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
        <motion.path
          d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
          variants={{ rest: { rotate: 0 }, active: { rotate: 10 } }}
          transition={transition}
          style={{ transformOrigin: '12px 12px' }}
        />
        <motion.path
          d="M5 3v4M3 5h4M19 17v4M17 19h4"
          variants={{ rest: { rotate: 0 }, active: { rotate: -12 } }}
          transition={{ ...transition, delay: reduced ? 0 : 0.04 }}
          style={{ transformOrigin: '19px 19px' }}
        />
      </motion.svg>
    </MotionConfig>
  );
}
