import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import { ICON_MOTION_TRANSITION } from './iconTokens';

export type AnimatedTrashIconProps = {
  active?: boolean;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
};

const lidVariants = {
  closed: { rotate: 0, y: 0 },
  open: { rotate: -18, y: -0.75 },
};

export function AnimatedTrashIcon({ active, className, 'aria-hidden': ariaHidden = true }: AnimatedTrashIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const isControlled = active !== undefined;

  return (
    <MotionConfig reducedMotion="user">
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden={ariaHidden}
        focusable={ariaHidden ? 'false' : 'true'}
        tabIndex={ariaHidden ? -1 : 0}
        initial="closed"
        whileHover={isControlled || prefersReducedMotion ? undefined : 'open'}
        whileFocus={isControlled || prefersReducedMotion ? undefined : 'open'}
      >
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <motion.g
          variants={lidVariants}
          style={{ transformOrigin: '12px 6px', transformBox: 'view-box' }}
          animate={isControlled ? (active ? 'open' : 'closed') : undefined}
          transition={prefersReducedMotion ? { duration: 0 } : ICON_MOTION_TRANSITION}
        >
          <path d="M3 6h18" />
          <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </motion.g>
      </motion.svg>
    </MotionConfig>
  );
}
