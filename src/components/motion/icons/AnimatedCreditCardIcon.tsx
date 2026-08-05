import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedCreditCardIconProps = { active?: boolean; className?: string };

export function AnimatedCreditCardIcon({ active, className }: AnimatedCreditCardIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.26, ease: 'easeInOut' as const };
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
        <motion.rect x="2" y="5" width="20" height="14" rx="2" variants={{ rest: { y: 0 }, active: { y: -0.4 } }} transition={transition} />
        <motion.path d="M2 10h20" variants={{ rest: { y: 0 }, active: { y: 0.5 } }} transition={transition} />
      </motion.svg>
    </MotionConfig>
  );
}
