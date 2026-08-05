import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';

export type IconMotionProps = {
  icon: LucideIcon;
  iconProps?: LucideProps;
  className?: string;
  style?: CSSProperties;
};

export type HoverIconEffect = 'rotate' | 'lift' | 'draw' | 'slide' | 'bounce' | 'tilt' | 'none';

export type IconTransform = {
  rotate?: number;
  scale?: number;
  opacity?: number;
};

export type IconTransition = {
  duration?: number;
  ease?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
};

const DEFAULT_TRANSITION: IconTransition = { duration: 0.16, ease: 'easeOut' };

const HOVER_EFFECTS: Record<HoverIconEffect, {
  rotate?: number | number[];
  scale?: number | number[];
  opacity?: number | number[];
  x?: number | number[];
  y?: number | number[];
}> = {
  rotate: { rotate: 8 },
  lift: { y: -2, opacity: 0.92 },
  draw: { scale: 1.08, opacity: 0.84 },
  slide: { x: 2, opacity: 0.92 },
  bounce: { y: [0, -2, 0] },
  tilt: { rotate: -5 },
  none: {},
};

function MotionIcon({ icon: Icon, iconProps }: IconMotionProps) {
  return <Icon {...iconProps} className={iconProps?.className} aria-hidden={iconProps?.['aria-hidden'] ?? true} />;
}

export function HoverIcon({ icon: Icon, iconProps, className, style, effect = 'none' }: IconMotionProps & {
  effect?: HoverIconEffect;
}) {
  const prefersReducedMotion = useReducedMotion();
  const hoverEffect = prefersReducedMotion ? HOVER_EFFECTS.none : HOVER_EFFECTS[effect];

  return (
    <MotionConfig reducedMotion="user">
      <motion.span
        className={`motion-icon inline-flex ${className ?? ''}`}
        style={style}
        whileHover={hoverEffect}
        transition={effect === 'bounce' ? { duration: 0.22, ease: 'easeInOut' } : DEFAULT_TRANSITION}
      >
        <MotionIcon icon={Icon} iconProps={iconProps} />
      </motion.span>
    </MotionConfig>
  );
}

export function PressIcon({ icon: Icon, iconProps, className, style }: IconMotionProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.span
        className={`motion-icon inline-flex ${className ?? ''}`}
        style={style}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      >
        <MotionIcon icon={Icon} iconProps={iconProps} />
      </motion.span>
    </MotionConfig>
  );
}

export function MorphIcon({
  icon: Icon,
  iconProps,
  iconKey,
  className,
  style,
}: IconMotionProps & { iconKey?: string | number }) {
  const prefersReducedMotion = useReducedMotion();
  const key = iconKey ?? 'icon';

  return (
    <MotionConfig reducedMotion="user">
      <motion.span
        className={`motion-icon inline-flex ${className ?? ''}`}
        style={style}
        whileHover={{ scale: 1.04 }}
        transition={DEFAULT_TRANSITION}
      >
        <AnimatePresence mode="sync" initial={false}>
          <motion.span
            key={key}
            className="inline-flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.14, ease: 'easeOut' }}
          >
            <MotionIcon icon={Icon} iconProps={iconProps} />
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </MotionConfig>
  );
}

export function AnimatedIcon({
  icon: Icon,
  iconProps,
  className,
  style,
  animate,
  initial,
  transition = DEFAULT_TRANSITION,
}: IconMotionProps & {
  animate?: IconTransform;
  initial?: IconTransform;
  transition?: IconTransition;
}) {
  const prefersReducedMotion = useReducedMotion();
  const safeTransition = prefersReducedMotion ? { duration: 0 } : transition;

  return (
    <MotionConfig reducedMotion="user">
      <motion.span
        className={`motion-icon inline-flex ${className ?? ''}`}
        style={style}
        initial={initial}
        animate={animate}
        transition={safeTransition}
      >
        <MotionIcon icon={Icon} iconProps={iconProps} />
      </motion.span>
    </MotionConfig>
  );
}
