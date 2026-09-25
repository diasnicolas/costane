/* Diferenciais: bento com spans variados, card destaque em gradiente e imagem com slogan. */
import type { ReactNode } from 'react';
import type { AgencyData, ItemIcone } from '../types/agencia';
import { cx, objs, pad2, spans, txt } from '../lib/data';
import { present } from '../lib/sections';
import { safeUrl } from '../lib/url';
import { Icon, Reveal, SectionHead } from './ui';

const PATTERN = [4, 4, 4, 4, 7, 5];

export function Differentials({ data }: { data: AgencyData }) {
  const s = data.diferenciais;
  if (!present(s)) return null;
  const items = objs<ItemIcone>(s.itens).filter((it) => txt(it.titulo) || txt(it.descricao));
  if (!items.length) return null;
  const img = safeUrl(s.imagem, '');

  const tiles: ReactNode[] = items.map((it, i) => {
    const c = PATTERN[i % PATTERN.length];
    const lastOdd = items.length % 2 === 1 && i === items.length - 1;
    return (
      <Reveal
        as="article"
        key={`feat-${i}`}
        className={cx('tile feat', i === 0 && 'tile--gradient feat--lead', c >= 7 && 'feat--wide')}
        style={spans({ c, t: lastOdd ? 6 : 3, m: 2, d: (i % 3) * 70 })}
      >
        <span className="feat__num" aria-hidden="true">
          {pad2(i + 1)}
        </span>
        <span className="icon-sq" aria-hidden="true">
          <Icon cls={it.icone} fallback="fa-solid fa-star" />
        </span>
        <div className="feat__body">
          {txt(it.titulo) && <h3 className="tile-title">{txt(it.titulo)}</h3>}
          {txt(it.descricao) && <p>{txt(it.descricao)}</p>}
        </div>
      </Reveal>
    );
  });

  if (img) {
    const ag = data.agencia;
    const iconImg = safeUrl(ag?.logotipo?.icone, '');
    const slogan = txt(ag?.slogan);
    tiles.splice(
      Math.min(1, tiles.length),
      0,
      <Reveal as="figure" key="feat-img" className="tile tile--flush tile--img feat-img" style={spans({ c: 4, r: 2, t: 6, m: 2, d: 70 })}>
        <img src={img} alt={txt(s.titulo) || txt(s.etiqueta)} loading="lazy" decoding="async" />
        {slogan && (
          <figcaption className="feat-img__chip">
            {iconImg && <img src={iconImg} alt="" width={36} height={36} />}
            <span>{slogan}</span>
          </figcaption>
        )}
      </Reveal>,
    );
  }

  return (
    <section id="diferenciais" className="section" aria-labelledby={txt(s.titulo) ? 'diferenciais-title' : undefined}>
      <div className="container">
        <SectionHead id="diferenciais" s={s} />
        <div className="bento feat-bento">{tiles}</div>
      </div>
    </section>
  );
}
