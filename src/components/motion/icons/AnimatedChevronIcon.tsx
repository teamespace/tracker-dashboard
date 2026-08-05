import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedChevronIconProps = { active?: boolean; className?: string; direction?: 'left' | 'right' | 'up' | 'down' };

const rotations = { right: 0, down: 90, left: 180, up: -90 } as const;

export function AnimatedChevronIcon({ active, className, direction = 'right' }: AnimatedChevronIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
        <motion.path d="m9 5 7 7-7 7" animate={controlled ? (active ? { x: 1 } : { x: 0 }) : undefined} variants={{ rest: { x: 0 }, active: { x: 1 } }} transition={transition} style={{ transformOrigin: '12px 12px', transformBox: 'view-box' }} initial={{ rotate: rotations[direction] }} />
      </motion.svg>
    </MotionConfig>
  );
}
