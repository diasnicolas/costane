import { useEffect, useRef, useState, type RefObject } from 'react';
import { fmtNum } from '../lib/format';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Contagem animada (easing cúbico) disparada quando o elemento fica 40% visível. */
export function useCountUp<T extends Element>(end: number, dec = 0, suffix = '', duration = 1700): [RefObject<T | null>, string] {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const final = `${fmtNum(end, dec)}${suffix}`;
  const [text, setText] = useState(`0${suffix}`);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setText(final);
      return;
    }
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setText(p < 1 ? `${fmtNum(end * eased, dec)}${suffix}` : final);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, dec, suffix, duration, final, reduced]);

  return [ref, text];
}
