/* Galeria: mosaico bento que sempre fecha as linhas (também após filtrar) + lightbox. */
import { useMemo, useRef, useState } from 'react';
import type { AgencyData, Foto } from '../types/agencia';
import { cx, objs, strs, txt, vars } from '../lib/data';
import { galleryPattern, type TileSize } from '../lib/gallery';
import { present } from '../lib/sections';
import { safeUrl } from '../lib/url';
import { useAnnounce } from '../hooks/useAnnouncer';
import { useFilterTransition } from '../hooks/useFilterTransition';
import { Lightbox } from './Lightbox';
import { Reveal, SectionHead } from './ui';

export function Gallery({ data }: { data: AgencyData }) {
  const g = data.galeria;
  const fotos = useMemo(() => objs<Foto>(g?.fotos).filter((f) => txt(f.miniatura) || txt(f.url)), [g]);
  const filter = useFilterTransition('');
  const announce = useAnnounce();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // Categorias: ordem do JSON (só as que têm fotos) + as presentes nas fotos e não listadas
  const { allLabel, cats } = useMemo(() => {
    const listed = strs(g?.categorias);
    const inPhotos = [...new Set(fotos.map((f) => txt(f.categoria)).filter(Boolean))];
    return {
      allLabel: listed.find((c) => c.toLowerCase() === 'todos') || 'Todos',
      cats: [...listed.filter((c) => c.toLowerCase() !== 'todos' && inPhotos.includes(c)), ...inPhotos.filter((c) => !listed.includes(c))],
    };
  }, [g, fotos]);

  const visible = useMemo(
    () => fotos.map((_, i) => i).filter((i) => !filter.applied || txt(fotos[i].categoria) === filter.applied),
    [fotos, filter.applied],
  );
  const sizes = useMemo(() => {
    const pattern = galleryPattern(visible.length);
    return new Map<number, TileSize>(visible.map((idx, k) => [idx, pattern[k] ?? 's']));
  }, [visible]);

  if (!present(g) || !fotos.length) return null;

  const countOf = (c: string) => (c ? fotos.filter((f) => txt(f.categoria) === c).length : fotos.length);
  const onFilter = (c: string) =>
    filter.select(c, (value) => {
      const n = countOf(value);
      announce(`${n} ${n === 1 ? 'foto exibida' : 'fotos exibidas'}`);
    });

  const step = (dir: number) => {
    setLightbox((cur) => {
      if (cur === null || visible.length < 2) return cur;
      const pos = visible.indexOf(cur);
      return visible[(pos + dir + visible.length) % visible.length];
    });
  };
  const close = () => {
    setLightbox(null);
    lastFocus.current?.focus();
  };

  return (
    <section id="galeria" className="section" aria-labelledby={txt(g.titulo) ? 'galeria-title' : undefined}>
      <div className="container">
        <SectionHead id="galeria" s={g} />
        {cats.length > 1 && (
          <Reveal className="chips-bar" role="group" aria-label="Filtrar galeria">
            {['', ...cats].map((c) => {
              const on = filter.active === c;
              return (
                <button key={c || '__all__'} className={cx('chip', on && 'is-active')} type="button" aria-pressed={on} onClick={() => onFilter(c)}>
                  {c || allLabel} <span className="chip__count">{countOf(c)}</span>
                </button>
              );
            })}
          </Reveal>
        )}
        <div className={cx('gallery', filter.phase === 'leaving' && 'is-leaving', filter.phase === 'entering' && 'is-entering')}>
          {fotos.map((f, i) => {
            const show = sizes.has(i);
            const thumb = safeUrl(f.miniatura, '') || safeUrl(f.url, '');
            const alt = txt(f.alt) || [txt(f.titulo), txt(f.local)].filter(Boolean).join(' — ');
            return (
              <Reveal
                as="button"
                key={i}
                type="button"
                className="g-tile"
                hidden={!show}
                force={filter.touched && show}
                data-index={i}
                data-cat={txt(f.categoria)}
                data-size={sizes.get(i) ?? 's'}
                style={vars({ '--d': `${(i % 4) * 60}ms` })}
                aria-label={`Ampliar foto: ${txt(f.titulo) || alt}`}
                onClick={(e) => {
                  lastFocus.current = e.currentTarget;
                  setLightbox(i);
                }}
              >
                <img src={thumb} alt={alt} loading="lazy" decoding="async" />
                {txt(f.categoria) && <span className="g-tile__cat">{txt(f.categoria)}</span>}
                <span className="g-tile__zoom" aria-hidden="true">
                  <i className="fa-solid fa-up-right-and-down-left-from-center" />
                </span>
                {(txt(f.titulo) || txt(f.local)) && (
                  <span className="g-tile__cap">
                    {txt(f.titulo) && <strong>{txt(f.titulo)}</strong>}
                    {txt(f.local) && (
                      <span>
                        <i className="fa-solid fa-location-dot" aria-hidden="true" />
                        {txt(f.local)}
                      </span>
                    )}
                  </span>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
      <Lightbox photos={fotos} visible={visible} index={lightbox} onClose={close} onStep={step} />
    </section>
  );
}
