import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export function useDataVizReady(delay: number) {
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(delay === 0 || reduced === true);

  useEffect(() => {
    if (delay === 0 || reduced) return;
    const timer = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay, reduced]);

  return ready;
}
