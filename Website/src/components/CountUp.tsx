import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** Target number; null shows a dash (e.g. while a counter is still loading). */
  value: number | null;
  /** Minimum digits, zero-padded (e.g. 2 → "08"). */
  pad?: number;
  durationMs?: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Animates a number counting up from 0 (or from its previous value) to `value`. */
export function CountUp({ value, pad = 0, durationMs = 1400 }: CountUpProps) {
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    if (value === null) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const from = shownRef.current;
    if (reduceMotion || from === value) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const next = Math.round(from + (value - from) * easeOutCubic(t));
      shownRef.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  if (value === null) return <>—</>;
  const text = shown.toLocaleString('en-US');
  return <>{pad ? text.padStart(pad, '0') : text}</>;
}
