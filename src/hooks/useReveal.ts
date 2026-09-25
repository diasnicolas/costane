import { useEffect, useRef, useState, type RefObject } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/* Um único IntersectionObserver compartilhado por todos os elementos com animação de entrada. */
const callbacks = new WeakMap<Element, () => void>();
let shared: IntersectionObserver | null = null;

function observer(): IntersectionObserver {
  if (!shared) {
    shared = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          callbacks.get(en.target)?.();
          callbacks.delete(en.target);
          io.unobserve(en.target);
        });
      },
      { rootMargin: '0px 0px -5% 0px', threshold: 0.06 },
    );
  }
  return shared;
}

/**
 * Scroll-reveal: devolve [ref, visível]. O componente aplica `reveal` + `is-in`.
 * Com movimento reduzido (ou sem IntersectionObserver) já nasce visível.
 */
export function useReveal<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = observer();
    callbacks.set(el, () => setInView(true));
    io.observe(el);
    return () => {
      callbacks.delete(el);
      io.unobserve(el);
    };
  }, [reduced, inView]);

  return [ref, inView];
}
