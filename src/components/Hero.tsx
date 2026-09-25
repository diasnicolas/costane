/* Hero em grade bento: introdução, slides em crossfade, busca, estatísticas e avaliação média. */
import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent, type FocusEvent, type KeyboardEvent } from 'react';
import type { AgencyData, Botao, Busca, Contato, Depoimento, Estatistica, HeroSlide, Maybe } from '../types/agencia';
import { cx, isObj, objs, pad2, txt, vars } from '../lib/data';
import { fmtDateBR, fmtNum, fmtRating } from '../lib/format';
import { initialValues, normalizeFields, todayIso, type FormValues } from '../lib/forms';
import { isLinkLive, present } from '../lib/sections';
import { linkProps, safeUrl } from '../lib/url';
import { openWhatsApp, waGreeting } from '../lib/whatsapp';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Field } from './Field';
import { Icon, Reveal, Stars } from './ui';

const DURATION = 6000;

function Cta({ c, cls, iconAfter = false }: { c: Maybe<Botao>; cls: string; iconAfter?: boolean }) {
  if (!isObj(c) || !txt(c?.texto)) return null;
  return (
    <a className={`btn ${cls}`} {...linkProps(c?.link)}>
      {!iconAfter && <Icon cls={c?.icone} />}
      <span>{txt(c?.texto)}</span>
      {iconAfter && <Icon cls={c?.icone} />}
    </a>
  );
}

export function Hero({ data }: { data: AgencyData }) {
  const h = data.hero;
  if (!present(h)) return null;

  const title = txt(h.titulo);
  const highlight = txt(h.titulo_destaque);
  const sub = txt(h.subtitulo);
  const tag = txt(h.etiqueta);
  const video = safeUrl(h.video_fundo, '');
  const bg = safeUrl(h.imagem_fundo, '');
  const slides = objs<HeroSlide>(h.slides).filter((s) => txt(s.imagem) || txt(s.titulo));
  const hasMedia = Boolean(video || bg || slides.length);
  const busca = h.busca?.ativo && objs(h.busca.campos).length ? h.busca : null;
  const stats = objs<Estatistica>(h.estatisticas).filter((s) => txt(s.valor) || txt(s.rotulo));
  const dep = present(data.depoimentos) ? data.depoimentos : null;
  const depItems = objs<Depoimento>(dep?.itens);
  const avg =
    Number(dep?.media_avaliacao) ||
    (depItems.length ? depItems.reduce((a, t) => a + (Number(t.avaliacao) || 0), 0) / depItems.length : 0);
  const hasRating = avg > 0;
  // Botões cuja âncora aponta para seção inexistente ficam ocultos
  const liveCta = (c: Maybe<Botao>) => (isObj(c) && txt(c?.texto) && isLinkLive(data, c?.link) ? c : null);
  const ctaPri = liveCta(h.cta_primario);
  const ctaSec = liveCta(h.cta_secundario);
  const hasIntro = Boolean(title || highlight || sub || tag);
  if (!hasIntro && !hasMedia && !busca && !stats.length) return null;

  // Áreas da grade calculadas conforme os blocos existentes
  const left: string[] = [];
  if (hasIntro) left.push('intro');
  if (busca) left.push('search');
  const rows: string[] = [];
  if (hasMedia && left.length) left.forEach((a) => rows.push(`${a} media`));
  else if (hasMedia) rows.push('media media');
  else left.forEach((a) => rows.push(`${a} ${a}`));
  if (stats.length && hasRating) rows.push('stats rating');
  else if (stats.length) rows.push('stats stats');
  else if (hasRating) rows.push('rating rating');
  const areas = rows.map((r) => `"${r}"`).join(' ');

  const overlay = Math.max(0, Math.min(0.9, Number(h.overlay_opacidade) || 0.4));
  const avatars = depItems.filter((t) => txt(t.foto)).slice(0, 4);
  const total = Number(dep?.total_avaliacoes);
  const fonte = txt(dep?.fonte);

  return (
    <section id="hero" className="section hero" aria-label="Início">
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="container">
        <div className="hero-bento" style={vars({ '--hero-areas': areas })}>
          {hasIntro && (
            <Reveal className="tile hero-intro" style={{ gridArea: 'intro' }}>
              {tag && (
                <span className="eyebrow eyebrow--lg">
                  <span className="eyebrow__dot" aria-hidden="true" />
                  {tag}
                </span>
              )}
              {(title || highlight) && (
                <h1 className="hero-title">
                  {title}
                  {title && highlight && <span className="sr-only">, </span>}
                  {highlight && <span className="grad-text hero-title__hl">{highlight}</span>}
                </h1>
              )}
              {sub && <p className="hero-sub">{sub}</p>}
              {(ctaPri || ctaSec) && (
                <div className="hero-ctas">
                  <Cta c={ctaPri} cls="btn-primary btn-lg" />
                  <Cta c={ctaSec} cls="btn-ghost btn-lg" iconAfter />
                </div>
              )}
            </Reveal>
          )}

          {hasMedia && (
            <HeroMedia slides={slides} video={video} bg={bg} overlay={overlay} title={title} agencyName={txt(data.agencia?.nome)} />
          )}

          {busca && <HeroSearch busca={busca} contato={data.contato} />}

          {stats.length > 0 && (
            <div className="hero-stats" style={{ gridArea: 'stats' }}>
              {stats.map((s, i) => (
                <Reveal key={i} className="tile stat-tile" style={vars({ '--d': `${140 + i * 60}ms` })}>
                  <strong className="stat-tile__value grad-text">{txt(s.valor)}</strong>
                  <span className="stat-tile__label">{txt(s.rotulo)}</span>
                </Reveal>
              ))}
            </div>
          )}

          {hasRating && (
            <Reveal as="a" className="tile hero-rating" href="#depoimentos" style={{ gridArea: 'rating', ...vars({ '--d': '260ms' }) }}>
              {avatars.length > 0 && (
                <span className="avatar-stack" aria-hidden="true">
                  {avatars.map((t, i) => (
                    <img key={i} src={safeUrl(t.foto, '')} alt="" width={48} height={48} />
                  ))}
                </span>
              )}
              <span className="hero-rating__body">
                <span className="hero-rating__score">
                  <strong>{fmtRating(avg)}</strong>
                  <Stars value={avg} />
                </span>
                <span className="hero-rating__meta">
                  {total > 0 ? `${fmtNum(total)} avaliações` : ''}
                  {total > 0 && fonte ? ' · ' : ''}
                  {fonte}
                </span>
              </span>
              <span className="hero-rating__arrow" aria-hidden="true">
                <i className="fa-solid fa-arrow-right" />
              </span>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

interface HeroMediaProps {
  slides: HeroSlide[];
  video: string;
  bg: string;
  overlay: number;
  title: string;
  agencyName: string;
}

/** Slider do hero: crossfade, autoplay pausável, teclado, swipe e respeito a movimento reduzido. */
function HeroMedia({ slides, video, bg, overlay, title, agencyName }: HeroMediaProps) {
  const count = slides.length;
  const multi = count > 1;
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0); // muda a cada troca → reinicia timer e barra de progresso
  const [userPaused, setUserPaused] = useState(reduced);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [docHidden, setDocHidden] = useState(() => document.hidden);
  const remaining = useRef(DURATION);
  const startedAt = useRef(0);
  const startX = useRef<number | null>(null);
  const paused = userPaused || hoverPaused || docHidden;

  useEffect(() => {
    if (reduced) setUserPaused(true);
  }, [reduced]);

  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Novo slide → tempo cheio
  useEffect(() => {
    remaining.current = DURATION;
  }, [cycle]);

  // Autoplay com tempo restante preservado ao pausar
  useEffect(() => {
    if (!multi || paused) return;
    startedAt.current = performance.now();
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % count);
      setCycle((c) => c + 1);
    }, Math.max(0, remaining.current));
    return () => {
      window.clearTimeout(t);
      remaining.current -= performance.now() - startedAt.current;
    };
  }, [cycle, paused, multi, count]);

  const go = (n: number) => {
    setIndex(((n % count) + count) % count);
    setCycle((c) => c + 1);
  };

  const handlers = multi
    ? {
        onPointerEnter: (e: PointerEvent<HTMLElement>) => e.pointerType === 'mouse' && setHoverPaused(true),
        onPointerLeave: () => setHoverPaused(false),
        onFocus: () => setHoverPaused(true),
        onBlur: (e: FocusEvent<HTMLElement>) => {
          if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) setHoverPaused(false);
        },
        onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(index - 1);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            go(index + 1);
          }
        },
        onPointerDown: (e: PointerEvent<HTMLElement>) => {
          if (e.pointerType !== 'mouse') startX.current = e.clientX;
        },
        onPointerUp: (e: PointerEvent<HTMLElement>) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        },
      }
    : {};

  return (
    <Reveal
      className={cx('tile tile--flush hero-media', multi && paused && 'is-paused')}
      style={{ gridArea: 'media', ...vars({ '--overlay': overlay, '--d': '80ms', '--slide-duration': `${DURATION}ms` }) }}
      role={multi ? 'region' : undefined}
      aria-roledescription={multi ? 'carrossel' : undefined}
      aria-label={multi ? 'Destaques' : undefined}
      {...handlers}
    >
      {video && (
        <video className="hero-media__video" autoPlay muted loop playsInline poster={bg || undefined}>
          <source src={video} />
        </video>
      )}
      {!video && !count && bg && <img className="hero-media__bg" src={bg} alt={title || agencyName} fetchPriority="high" />}
      {video && !count && <span className="hero-media__shade" aria-hidden="true" />}
      <div className="hero-slides">
        {slides.map((s, i) => {
          const img = video ? '' : safeUrl(s.imagem, '') || bg;
          const active = i === index;
          return (
            <figure key={i} className={cx('hero-slide', active && 'is-active')} aria-hidden={active ? undefined : true}>
              {img && <img src={img} alt={txt(s.titulo) || title} fetchPriority={i === 0 ? 'high' : undefined} decoding="async" />}
              {(txt(s.titulo) || txt(s.subtitulo)) && (
                <figcaption className="hero-caption">
                  {multi && (
                    <span className="hero-caption__count">
                      {pad2(i + 1)} / {pad2(count)}
                    </span>
                  )}
                  {txt(s.titulo) && <strong>{txt(s.titulo)}</strong>}
                  {txt(s.subtitulo) && <span>{txt(s.subtitulo)}</span>}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
      {multi && (
        <>
          <div className="hero-media__top">
            <div className="hero-dots">
              {slides.map((s, i) => (
                <button
                  key={i}
                  className={cx('hero-dot', i === index && 'is-active')}
                  type="button"
                  aria-label={`Ir para o slide ${i + 1}: ${txt(s.titulo)}`}
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => go(i)}
                >
                  <span key={i === index ? `run-${cycle}` : 'idle'} className="hero-dot__fill" />
                </button>
              ))}
            </div>
            <button
              className="glass-btn hero-pause"
              type="button"
              aria-label={userPaused ? 'Reproduzir slides' : 'Pausar slides'}
              onClick={() => setUserPaused((p) => !p)}
            >
              <i className={`fa-solid ${userPaused ? 'fa-play' : 'fa-pause'}`} aria-hidden="true" />
            </button>
          </div>
          <div className="hero-media__nav">
            <button className="glass-btn hero-prev" type="button" aria-label="Anterior" onClick={() => go(index - 1)}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            </button>
            <button className="glass-btn hero-next" type="button" aria-label="Próximo" onClick={() => go(index + 1)}>
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </>
      )}
    </Reveal>
  );
}

/** Busca do hero: campos do JSON; envia um resumo pelo WhatsApp. */
function HeroSearch({ busca, contato }: { busca: Busca; contato: Maybe<Contato> }) {
  const fields = useMemo(() => normalizeFields(busca.campos, 'busca'), [busca.campos]);
  const [values, setValues] = useState<FormValues>(() => initialValues(fields));
  const today = todayIso();
  const dates = fields.filter((f) => f.type === 'date');

  const onChange = (name: string, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      // Datas encadeadas (ida → volta): a seguinte nunca fica antes da anterior
      const k = dates.findIndex((f) => f.name === name);
      const following = k >= 0 ? dates[k + 1] : undefined;
      if (following && value && next[following.name] && next[following.name] < value) next[following.name] = value;
      return next;
    });
  };

  const onSubmit = (e: FormEvent<HTMLElement>) => {
    e.preventDefault();
    const lines: string[] = [];
    fields.forEach((f) => {
      let v = (values[f.name] ?? '').trim();
      if (!v) return;
      if (f.type === 'date') v = fmtDateBR(v);
      lines.push(`• ${f.label}: ${v}`);
    });
    const label = txt(busca.botao) || 'Busca';
    const greeting = waGreeting(contato);
    openWhatsApp(contato, lines.length ? `${greeting}\n\n${label}:\n${lines.join('\n')}` : greeting);
  };

  return (
    <Reveal as="form" className="tile hero-search" style={{ gridArea: 'search', ...vars({ '--d': '120ms' }) }} noValidate onSubmit={onSubmit}>
      <div className="hero-search__fields">
        {fields.map((f) => {
          const k = dates.indexOf(f);
          const min = k > 0 ? values[dates[k - 1].name] || today : today;
          return <Field key={f.id} field={f} value={values[f.name] ?? ''} withIcon min={min} onChange={onChange} />;
        })}
        <div className="hero-search__submit">
          <button className="btn btn-primary" type="submit">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <span>{txt(busca.botao) || 'Buscar'}</span>
          </button>
        </div>
      </div>
    </Reveal>
  );
}
