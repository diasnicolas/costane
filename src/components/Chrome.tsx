/* Elementos globais: fundo em malha, preloader, botão flutuante do WhatsApp e voltar ao topo. */
import { useEffect, useState } from 'react';
import { cx } from '../lib/data';
import { prefersReducedMotion, usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScrollPast } from '../hooks/useScrollPast';

/** Fundo decorativo: gradientes desfocados com as cores da marca. */
export function Mesh() {
  return (
    <div className="mesh" aria-hidden="true">
      <span className="blob blob--1" />
      <span className="blob blob--2" />
      <span className="blob blob--3" />
      <span className="blob blob--4" />
    </div>
  );
}

/** Preloader: some com fade quando `done` e é removido em seguida. */
export function Preloader({ done }: { done: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [removed, setRemoved] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setRemoved(true), reduced ? 0 : 600);
    return () => window.clearTimeout(t);
  }, [done, reduced]);
  if (removed) return null;
  return (
    <div id="preloader" className={cx('preloader', done && 'is-done')} role="status" aria-live="polite">
      <div className="preloader__grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

export function WhatsAppFloat({ href }: { href: string }) {
  return (
    <a id="wa-float" className="wa-float" href={href} target="_blank" rel="noopener" aria-label="Conversar no WhatsApp">
      <i className="fa-brands fa-whatsapp" aria-hidden="true" />
    </a>
  );
}

export function BackToTop({ solo }: { solo: boolean }) {
  const visible = useScrollPast(700);
  const onClick = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  };
  return (
    <button id="to-top" className={cx('to-top', visible && 'is-visible', solo && 'to-top--solo')} type="button" aria-label="Voltar ao topo" onClick={onClick}>
      <i className="fa-solid fa-arrow-up" aria-hidden="true" />
    </button>
  );
}
