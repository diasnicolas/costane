/* Peças compartilhadas: reveal, ícones, estrelas, cabeçalho de seção, logo, contador e botão de tema. */
import { createElement, type AllHTMLAttributes, type ReactNode } from 'react';
import type { Agencia, Maybe } from '../types/agencia';
import { cleanClass, cx, txt } from '../lib/data';
import { fmtNum, fmtRating } from '../lib/format';
import { safeUrl } from '../lib/url';
import { useCountUp } from '../hooks/useCountUp';
import { useReveal } from '../hooks/useReveal';
import { useTheme } from '../hooks/useTheme';

type RevealTag = 'div' | 'article' | 'figure' | 'header' | 'li' | 'a' | 'form' | 'nav' | 'button' | 'h3';

type RevealProps = AllHTMLAttributes<HTMLElement> & {
  as?: RevealTag;
  /** força o estado visível (ex.: itens exibidos após um filtro) */
  force?: boolean;
  children?: ReactNode;
};

/** Elemento com animação de entrada ao rolar (classes `reveal` / `is-in`). */
export function Reveal({ as = 'div', className, force = false, ...rest }: RevealProps) {
  const [ref, inView] = useReveal<HTMLElement>();
  return createElement(as, { ...rest, ref, className: cx(className, 'reveal', (inView || force) && 'is-in') });
}

/** Ícone Font Awesome decorativo (classe vinda do JSON, com fallback opcional). */
export function Icon({ cls, fallback, className }: { cls?: unknown; fallback?: string; className?: string }) {
  const c = cleanClass(cls) || fallback || '';
  return c ? <i className={cx(c, className)} aria-hidden="true" /> : null;
}

export function Stars({ value }: { value: unknown }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="stars" role="img" aria-label={`Avaliação ${fmtRating(v)} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={v >= i - 0.25 ? 'fa-solid fa-star' : v >= i - 0.75 ? 'fa-solid fa-star-half-stroke' : 'fa-regular fa-star'}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

interface HeadData {
  etiqueta?: Maybe<string>;
  titulo?: Maybe<string>;
  subtitulo?: Maybe<string>;
}

/** Cabeçalho padrão de seção (etiqueta + título + subtítulo + extra). */
export function SectionHead({ id, s, align = 'split', extra }: { id: string; s: HeadData; align?: 'split' | 'center'; extra?: ReactNode }) {
  const et = txt(s.etiqueta);
  const ti = txt(s.titulo);
  const su = txt(s.subtitulo);
  if (!et && !ti && !su && !extra) return null;
  return (
    <Reveal as="header" className={`sec-head sec-head--${align}`}>
      <div className="sec-head__main">
        {et && (
          <span className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            {et}
          </span>
        )}
        {ti && (
          <h2 className="sec-title" id={`${id}-title`}>
            {ti}
          </h2>
        )}
      </div>
      {(su || extra) && (
        <div className="sec-head__aside">
          {su && <p className="sec-sub">{su}</p>}
          {extra}
        </div>
      )}
    </Reveal>
  );
}

/** Logo: colorida no tema claro, branca no escuro (ou só a branca sobre fundos escuros). */
export function Logo({ agencia, variant = 'auto' }: { agencia: Maybe<Agencia>; variant?: 'auto' | 'white' }) {
  const logo = agencia?.logotipo;
  const alt = txt(logo?.alt) || txt(agencia?.nome);
  const main = safeUrl(logo?.principal, '');
  const white = safeUrl(logo?.branco, '');
  const name = txt(agencia?.nome_curto) || txt(agencia?.nome);
  if (!main && !white) {
    const initials = name
      .split(/\s+/)
      .map((w) => w[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return (
      <>
        <span className="brand__mark" aria-hidden="true">
          {initials}
        </span>
        <span className="brand__name">{name}</span>
      </>
    );
  }
  if (variant === 'white') return <img className="brand__logo" src={white || main} alt={alt} width={320} height={96} />;
  return (
    <>
      <img className="brand__logo brand__logo--light" src={main || white} alt={alt} width={320} height={96} />
      <img className="brand__logo brand__logo--dark" src={white || main} alt={alt} width={320} height={96} />
    </>
  );
}

/** Número com contagem animada (texto real disponível para leitores de tela). */
export function CountUp({ end, dec = 0, suffix = '', srText }: { end: number; dec?: number; suffix?: string; srText?: string }) {
  const [ref, text] = useCountUp<HTMLSpanElement>(end, dec, suffix);
  return (
    <>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
      <span className="sr-only">{srText ?? `${fmtNum(end, dec)}${suffix}`}</span>
    </>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button id="theme-toggle" className="icon-btn theme-toggle" type="button" aria-label="Tema escuro" aria-pressed={theme === 'dark'} onClick={toggle}>
      <i className="fa-solid fa-sun" aria-hidden="true" />
      <i className="fa-solid fa-moon" aria-hidden="true" />
    </button>
  );
}
