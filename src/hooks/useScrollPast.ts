import { useEffect, useState } from 'react';

/** true quando window.scrollY passou do limite (atualização limitada a 1x por frame). */
export function useScrollPast(threshold: number): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    let ticking = false;
    let raf = 0;
    const update = () => {
      ticking = false;
      setPast(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [threshold]);
  return past;
}
