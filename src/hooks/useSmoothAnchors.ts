import { useEffect } from 'react';
import { prefersReducedMotion } from './usePrefersReducedMotion';

function findTarget(hash: string): HTMLElement | null {
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

/** Rolagem suave para âncoras internas, compensando o cabeçalho fixo; também trata a âncora inicial da URL. */
export function useSmoothAnchors(): void {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || !(e.target instanceof Element)) return;
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href') ?? '';
      if (hash === '#') {
        e.preventDefault();
        return;
      }
      const target = findTarget(hash);
      if (!target || target.hidden) return;
      e.preventDefault();
      const headerH = document.getElementById('site-header')?.offsetHeight ?? 0;
      const top = target.id === 'hero' ? 0 : target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      history.pushState(null, '', hash);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);

    // Âncora inicial (ex.: index.html#contato)
    let timer = 0;
    if (window.location.hash.length > 1) {
      const t = findTarget(window.location.hash);
      if (t) timer = window.setTimeout(() => t.scrollIntoView({ block: 'start' }), 50);
    }

    return () => {
      document.removeEventListener('click', onClick);
      window.clearTimeout(timer);
    };
  }, []);
}
