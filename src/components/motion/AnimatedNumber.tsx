import { useEffect, useRef, useState } from 'react';

export type AnimatedNumberProps = {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
};

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function AnimatedNumber({
  value,
  format = String,
  duration = 700,
  delay = 0,
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(() => (prefersReducedMotion() ? value : 0));
  const displayValueRef = useRef(displayValue);
  const finalText = format(value);
  displayValueRef.current = displayValue;

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayValue(value);
      return;
    }

    let animationFrame = 0;
    let delayTimeout: ReturnType<typeof setTimeout> | undefined;
    let startTime: number | undefined;
    const startValue = displayValueRef.current;
    const animationDuration = Math.max(0, duration);
    const animationDelay = Math.max(0, delay);

    const animate = (timestamp: number) => {
      startTime ??= timestamp;
      const progress = animationDuration === 0 ? 1 : Math.min((timestamp - startTime) / animationDuration, 1);
      setDisplayValue(startValue + (value - startValue) * easeOutCubic(progress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (animationDelay === 0) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      delayTimeout = setTimeout(() => {
        animationFrame = requestAnimationFrame(animate);
      }, animationDelay);
    }

    return () => {
      if (delayTimeout !== undefined) clearTimeout(delayTimeout);
      cancelAnimationFrame(animationFrame);
    };
  }, [delay, duration, value]);

  return (
    <span
      className={className}
      aria-label={finalText}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {format(displayValue)}
    </span>
  );
}
