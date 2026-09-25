/* Lightbox da galeria: modal com foco preso, Esc/setas, clique fora fecha e trava a rolagem. */
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Foto } from '../types/agencia';
import { cx, txt } from '../lib/data';
import { safeUrl } from '../lib/url';
import { useLockScroll } from '../hooks/useLockScroll';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface LightboxProps {
  photos: Foto[];
  /** índices (em `photos`) das fotos visíveis com o filtro atual */
  visible: number[];
  index: number | null;
  onClose: () => void;
  onStep: (dir: number) => void;
}

export function Lightbox({ photos, visible, index, onClose, onStep }: LightboxProps) {
  const reduced = usePrefersReducedMotion();
  const isOpen = index !== null;
  const [closingIndex, setClosingIndex] = useState<number | null>(null);
  const [animIn, setAnimIn] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useLockScroll(isOpen);

  // Mantém a última foto montada durante a animação de saída
  useEffect(() => {
    if (index !== null) {
      setClosingIndex(index);
      return;
    }
    const t = window.setTimeout(() => setClosingIndex(null), reduced ? 0 : 220);
    return () => window.clearTimeout(t);
  }, [index, reduced]);

  // Entrada: foco no botão fechar e fade-in no próximo frame
  useEffect(() => {
    if (!isOpen) {
      setAnimIn(false);
      return;
    }
    closeRef.current?.focus();
    const raf = requestAnimationFrame(() => setAnimIn(true));
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Teclado: Esc fecha, setas navegam, Tab fica preso nos botões do diálogo
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onStep(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onStep(-1);
      } else if (e.key === 'Tab') {
        const focusables = [...(dialogRef.current?.querySelectorAll<HTMLButtonElement>('.lb-btn') ?? [])].filter((b) => !b.hidden);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeEl = document.activeElement;
        if (!dialogRef.current?.contains(activeEl)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && activeEl === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, onStep]);

  const current = index ?? closingIndex;
  const f = current === null ? undefined : photos[current];
  if (current === null || !f) return null;

  const src = safeUrl(f.url, '') || safeUrl(f.miniatura, '');
  const alt = txt(f.alt) || txt(f.titulo);
  const pos = visible.indexOf(current);
  const multi = visible.length > 1;

  const onBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    if (isOpen && e.target instanceof Element && !e.target.closest('.lightbox__img-wrap img, .lightbox__caption, .lb-btn')) onClose();
  };

  return createPortal(
    <div id="lightbox" className={cx('lightbox', isOpen && animIn && 'is-open')} onClick={onBackdrop}>
      <div ref={dialogRef} className="lightbox__dialog" role="dialog" aria-modal="true" aria-labelledby="lb-title">
        <button ref={closeRef} className="lb-btn lb-close" type="button" aria-label="Fechar" onClick={onClose}>
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <button className="lb-btn lb-prev" type="button" aria-label="Anterior" hidden={!multi} onClick={() => onStep(-1)}>
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </button>
        <figure className="lightbox__figure">
          <div className="lightbox__img-wrap">{src && <img key={src} src={src} alt={alt} />}</div>
          <figcaption className="lightbox__caption">
            <div>
              <strong id="lb-title">{txt(f.titulo) || alt}</strong>
              <span>
                {txt(f.local) && (
                  <>
                    <i className="fa-solid fa-location-dot" aria-hidden="true" /> {txt(f.local)}
                  </>
                )}
              </span>
            </div>
            <span className="lightbox__count">
              {pos + 1} / {visible.length}
            </span>
          </figcaption>
        </figure>
        <button className="lb-btn lb-next" type="button" aria-label="Próximo" hidden={!multi} onClick={() => onStep(1)}>
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
