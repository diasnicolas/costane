/* Cabeçalho de vidro: logo, navegação com "pill" deslizante, tema, CTA e menu móvel. */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type { AgencyData, MenuItem } from '../types/agencia';
import { cx, isObj, objs, txt, vars } from '../lib/data';
import { isLinkLive } from '../lib/sections';
import { linkProps, safeUrl } from '../lib/url';
import { waGreeting, waUrl } from '../lib/whatsapp';
import { useActiveSection } from '../hooks/useActiveSection';
import { useScrollPast } from '../hooks/useScrollPast';
import { Icon, Logo, ThemeToggle } from './ui';

interface NavItem {
  label: string;
  href: string;
  target: string;
}

export function Header({ data, visibleIds }: { data: AgencyData; visibleIds: ReadonlySet<string> }) {
  const ag = data.agencia;
  const scrolled = useScrollPast(8);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [indicator, setIndicator] = useState<CSSProperties>({ opacity: 0 });

  const items = useMemo<NavItem[]>(
    () =>
      objs<MenuItem>(data.menu)
        .filter((m) => txt(m.rotulo) && txt(m.ancora))
        .map((m) => {
          const href = safeUrl(m.ancora, '');
          return { label: txt(m.rotulo), href, target: href.startsWith('#') ? href.slice(1) : '' };
        })
        .filter((m) => (m.href.startsWith('#') ? visibleIds.has(m.target) : Boolean(m.href))),
    [data.menu, visibleIds],
  );
  const targets = useMemo(() => [...new Set(items.map((m) => m.target).filter(Boolean))], [items]);
  const active = useActiveSection(targets);

  // Indicador "pill" acompanha o link ativo
  const measure = useCallback(() => {
    const el = active ? linkRefs.current.get(active) : undefined;
    if (!el || !el.offsetParent) {
      setIndicator((s) => ({ ...s, opacity: 0 }));
      return;
    }
    setIndicator({ opacity: 1, width: `${el.offsetWidth}px`, transform: `translateX(${el.offsetLeft}px)` });
  }, [active]);

  useLayoutEffect(measure, [measure, items]);
  useEffect(() => {
    window.addEventListener('resize', measure, { passive: true });
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Menu móvel: Esc fecha (foco volta ao botão), clique fora fecha
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onDocClick = (e: globalThis.MouseEvent) => {
      if (e.target instanceof Node && headerRef.current && !headerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDocClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onDocClick);
    };
  }, [open]);

  // Fecha o menu ao voltar para o layout desktop (mesmo breakpoint do CSS)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1181px)');
    const onChange = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // CTA do cabeçalho → WhatsApp
  const wa = data.contato?.whatsapp;
  const btnData = isObj(data.cta_final?.botao) && txt(data.cta_final?.botao?.texto) ? data.cta_final?.botao : isObj(data.hero?.cta_primario) ? data.hero?.cta_primario : null;
  const ctaHref =
    safeUrl(wa?.link, '') || waUrl(data.contato, waGreeting(data.contato)) || (isLinkLive(data, btnData?.link) ? safeUrl(btnData?.link, '') : '');
  const ctaLabel = txt(btnData?.texto) || txt(wa?.exibicao);
  const ctaIcon = txt(btnData?.icone) || 'fa-brands fa-whatsapp';
  const hasCta = Boolean(ctaHref && ctaLabel);

  const onPanelClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof Element && e.target.closest('a')) setOpen(false);
  };

  const link = (m: NavItem, cls: string, i: number, withRef: boolean) => {
    const on = Boolean(m.target) && m.target === active;
    return (
      <li key={`${m.href}-${i}`}>
        <a
          ref={
            withRef && m.target
              ? (el) => {
                  if (el) linkRefs.current.set(m.target, el);
                  else linkRefs.current.delete(m.target);
                }
              : undefined
          }
          className={cx(cls, on && 'is-active')}
          aria-current={on ? 'location' : undefined}
          data-nav-target={m.target || undefined}
          style={withRef ? undefined : vars({ '--i': i })}
          {...linkProps(m.href)}
        >
          {m.label}
        </a>
      </li>
    );
  };

  return (
    <header id="site-header" ref={headerRef} className={cx('site-header', scrolled && 'is-scrolled', open && 'menu-open')}>
      <div className="header-bar">
        <a id="brand" className="brand" href="#hero" aria-label={`${txt(ag?.nome) || 'Início'} — início`}>
          <Logo agencia={ag} />
        </a>
        <nav id="main-nav" className="main-nav" aria-label="Navegação principal" hidden={!items.length}>
          <ul id="nav-list" className="main-nav__list">
            {items.map((m, i) => link(m, 'nav-link', i, true))}
            <li className="nav-indicator" aria-hidden="true" style={indicator} />
          </ul>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          {hasCta && (
            <a id="header-cta" className="btn btn-primary btn-sm header-cta" {...linkProps(ctaHref)}>
              <Icon cls={ctaIcon} />
              <span>{ctaLabel}</span>
            </a>
          )}
          <button
            id="menu-toggle"
            ref={toggleRef}
            className="icon-btn menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-panel"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="burger" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
      <div id="mobile-panel" className={cx('mobile-panel', open && 'is-open')} onClick={onPanelClick}>
        <nav aria-label="Menu móvel">
          <ul id="mobile-nav-list" className="mobile-panel__list">
            {items.map((m, i) => link(m, 'mobile-link', i, false))}
          </ul>
        </nav>
        {hasCta && (
          <div id="mobile-cta" className="mobile-panel__cta">
            <a className="btn btn-primary btn-block btn-lg" {...linkProps(ctaHref)}>
              <Icon cls={ctaIcon} />
              <span>{ctaLabel}</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
