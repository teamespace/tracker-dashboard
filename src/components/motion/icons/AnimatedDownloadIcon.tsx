import { MotionConfig, motion, useReducedMotion } from 'motion/react';

export type AnimatedDownloadIconProps = { active?: boolean; className?: string };

export function AnimatedDownloadIcon({ active, className }: AnimatedDownloadIconProps) {
  const reduced = useReducedMotion();
  const controlled = active !== undefined;
  const transition = reduced ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' as const };
  return (
    <MotionConfig reducedMotion="user">
      <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false" initial="rest" whileHover={controlled || reduced ? undefined : "active"} whileFocus={controlled || reduced ? undefined : "active"}>
        <path d="M4 20h16" />
        <motion.g animate={controlled ? (active ? "active" : "rest") : undefined} variants={{ rest: { y: 0 }, active: { y: 2 } }} transition={transition}>
          <path d="M12 3v11" />
          <path d="m7 10 5 5 5-5" />
        </motion.g>
      </motion.svg>
    </MotionConfig>
  );
}
