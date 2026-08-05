import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import { AnimatedNumber } from './motion/AnimatedNumber';

export default function ProgressWithLabel({ value, animateLabel = false }: { value: number; animateLabel?: boolean }) {
  const reduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 h-2 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.42, ease: 'easeOut' }}
          />
        </div>
        <motion.span
          className="text-xs text-slate-500 tabular-nums shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.16, delay: 0.5, ease: 'easeOut' }}
        >
          {animateLabel ? <AnimatedNumber value={value} format={(current) => `${Math.round(current)}%`} duration={600} /> : `${value}%`}
        </motion.span>
      </div>
    </MotionConfig>
  );
}
