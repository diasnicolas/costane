/* Depoimentos: bento com card destaque, resumo das avaliações e demais depoimentos. */
import type { ReactNode } from 'react';
import type { AgencyData, Depoimento } from '../types/agencia';
import { objs, spans, txt } from '../lib/data';
import { fmtMonthYear, fmtNum, fmtRating } from '../lib/format';
import { present } from '../lib/sections';
import { safeUrl } from '../lib/url';
import { Reveal, SectionHead, Stars } from './ui';

function Author({ t }: { t: Depoimento }) {
  return (
    <div className="testi__author">
      {txt(t.foto) ? (
        <img src={safeUrl(t.foto, '')} alt={`Foto de ${txt(t.nome)}`} loading="lazy" decoding="async" width={56} height={56} />
      ) : (
        <span className="testi__initial" aria-hidden="true">
          {txt(t.nome).charAt(0)}
        </span>
      )}
      <div>
        <strong>{txt(t.nome)}</strong>
        {txt(t.cidade) && <span>{txt(t.cidade)}</span>}
      </div>
    </div>
  );
}

function Trip({ t }: { t: Depoimento }) {
  if (!txt(t.viagem) && !txt(t.data)) return null;
  return (
    <p className="testi__trip">
      <i className="fa-solid fa-plane-departure" aria-hidden="true" />
      {[txt(t.viagem), fmtMonthYear(t.data)].filter(Boolean).join(' · ')}
    </p>
  );
}

export function Testimonials({ data }: { data: AgencyData }) {
  const s = data.depoimentos;
  if (!present(s)) return null;
  const items = objs<Depoimento>(s.itens).filter((it) => txt(it.texto));
  if (!items.length) return null;
  const avg = Number(s.media_avaliacao) || items.reduce((a, t) => a + (Number(t.avaliacao) || 0), 0) / items.length;
  const total = Number(s.total_avaliacoes);
  const fonte = txt(s.fonte);
  const [featured, ...rest] = items;
  const tiles: ReactNode[] = [];

  tiles.push(
    <Reveal as="figure" key="featured" className="tile testi testi--featured" style={spans({ c: 6, r: 2, t: 6, m: 2 })}>
      <i className="fa-solid fa-quote-left testi__quote" aria-hidden="true" />
      {Number(featured.avaliacao) > 0 && <Stars value={featured.avaliacao} />}
      <blockquote>
        <p>{txt(featured.texto)}</p>
      </blockquote>
      <figcaption>
        <Author t={featured} />
        <Trip t={featured} />
      </figcaption>
    </Reveal>,
  );

  const hasRating = avg > 0;
  if (hasRating) {
    const faces = items.filter((t) => txt(t.foto)).slice(0, 5);
    const fonteIcon = /google/i.test(fonte)
      ? 'fa-brands fa-google'
      : /face/i.test(fonte)
        ? 'fa-brands fa-facebook-f'
        : /trip/i.test(fonte)
          ? 'fa-solid fa-plane'
          : 'fa-solid fa-star';
    tiles.push(
      <Reveal key="summary" className="tile testi-summary" style={spans({ c: 3, t: 6, m: 2, d: 70 })}>
        <span className="testi-summary__score grad-text">{fmtRating(avg)}</span>
        <Stars value={avg} />
        {total > 0 && (
          <p className="testi-summary__total">
            <strong>{fmtNum(total)}</strong> avaliações
          </p>
        )}
        {fonte && (
          <p className="testi-summary__src">
            <i className={fonteIcon} aria-hidden="true" />
            {fonte}
          </p>
        )}
        {faces.length > 0 && (
          <span className="avatar-stack avatar-stack--sm" aria-hidden="true">
            {faces.map((t, i) => (
              <img key={i} src={safeUrl(t.foto, '')} alt="" loading="lazy" width={40} height={40} />
            ))}
          </span>
        )}
      </Reveal>,
    );
  }

  const small = hasRating ? 3 : 4;
  const r = Math.max(0, rest.length - small);
  rest.forEach((t, i) => {
    const c = i < small ? 3 : r >= 3 ? 4 : 12 / r;
    const lastOdd = rest.length % 2 === 1 && i === rest.length - 1;
    tiles.push(
      <Reveal as="figure" key={`t-${i}`} className="tile testi" style={spans({ c, t: lastOdd ? 6 : 3, m: 2, d: (i % 3) * 70 })}>
        <div className="testi__top">
          {Number(t.avaliacao) > 0 && <Stars value={t.avaliacao} />}
          <i className="fa-solid fa-quote-right testi__mark" aria-hidden="true" />
        </div>
        <blockquote>
          <p>{txt(t.texto)}</p>
        </blockquote>
        <figcaption>
          <Trip t={t} />
          <Author t={t} />
        </figcaption>
      </Reveal>,
    );
  });

  return (
    <section id="depoimentos" className="section" aria-labelledby={txt(s.titulo) ? 'depoimentos-title' : undefined}>
      <div className="container">
        <SectionHead id="depoimentos" s={s} />
        <div className="bento testi-bento">{tiles}</div>
      </div>
    </section>
  );
}
