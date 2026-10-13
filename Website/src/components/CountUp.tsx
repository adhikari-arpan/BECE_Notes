import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** Target number; null shows a dash (e.g. while a counter is still loading). */
  value: number | null;
  /** Minimum digits, zero-padded (e.g. 2 → "08"). */
  pad?: number;
  /** Digits after the decimal point (e.g. 1 → "3.1"). */
  decimals?: number;
  /** Text after the number (e.g. " GB"). */
  suffix?: string;
  durationMs?: number;
  /** Wait until the number scrolls into view before counting (for stats further down the page). */
  whenVisible?: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Animates a number counting up from 0 (or from its previous value) to `value`. */
export function CountUp({ value, pad = 0, decimals = 0, suffix = '', durationMs = 1400, whenVisible = false }: CountUpProps) {
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const el = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(!whenVisible);

  useEffect(() => {
    if (visible || !el.current || !('IntersectionObserver' in window)) { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el.current);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (value === null || !visible) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const from = shownRef.current;
    if (reduceMotion || from === value) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    const step = 10 ** decimals;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const next = Math.round((from + (value - from) * easeOutCubic(t)) * step) / step;
      shownRef.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs, visible, decimals]);

  if (value === null) return <span ref={el} className="count-up">—</span>;
  const text = shown.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span ref={el} className="count-up">{pad ? text.padStart(pad, '0') : text}{suffix}</span>;
}
