import { useEffect } from 'react';

/** Trava a rolagem da página (classe `no-scroll` no <html>) enquanto `locked` for true. */
export function useLockScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    root.classList.add('no-scroll');
    return () => root.classList.remove('no-scroll');
  }, [locked]);
}
