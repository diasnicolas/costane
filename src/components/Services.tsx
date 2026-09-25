/* Serviços: cards com borda gradiente animada (carrossel no mobile) + marquee de serviços complementares. */
import type { AgencyData, ItemIcone, Servico } from '../types/agencia';
import { cx, objs, slug, strs, txt, vars } from '../lib/data';
import { isLinkLive, present } from '../lib/sections';
import { linkProps, safeUrl } from '../lib/url';
import { Icon, Reveal, SectionHead } from './ui';

function Marquee({ extras }: { extras: ItemIcone[] }) {
  const reps = Math.max(1, Math.ceil(10 / extras.length));
  const group = (hidden: boolean) => (
    <ul className="marquee__group" aria-hidden={hidden || undefined}>
      {Array.from({ length: reps }, (_, r) =>
        extras.map((x, i) => {
          const dup = hidden || r > 0;
          return (
            <li key={`${r}-${i}`} className={cx('marquee__chip', dup && 'is-dup')} aria-hidden={dup || undefined}>
              <span className="icon-sq icon-sq--xs" aria-hidden="true">
                <Icon cls={x.icone} fallback="fa-solid fa-plus" />
              </span>
              {txt(x.titulo)}
            </li>
          );
        }),
      )}
    </ul>
  );
  return (
    <Reveal className="marquee">
      <div className="marquee__track">
        {group(false)}
        {group(true)}
      </div>
    </Reveal>
  );
}

export function Services({ data }: { data: AgencyData }) {
  const s = data.servicos;
  if (!present(s)) return null;
  const items = objs<Servico>(s.itens).filter((it) => txt(it.titulo));
  const extras = objs<ItemIcone>(s.servicos_complementares).filter((x) => txt(x.titulo));
  if (!items.length && !extras.length) return null;

  return (
    <section id="servicos" className="section" aria-labelledby={txt(s.titulo) ? 'servicos-title' : undefined}>
      <div className="container">
        <SectionHead id="servicos" s={s} />
        {items.length > 0 && (
          <div className="svc-grid">
            {items.map((it, i) => {
              const img = safeUrl(it.imagem, '');
              const id = slug(it.id) || slug(it.titulo);
              const benefits = strs(it.beneficios);
              const cta = present(it.cta) && txt(it.cta.texto) && isLinkLive(data, it.cta.link) ? it.cta : null;
              return (
                <Reveal as="article" key={`${id}-${i}`} id={id ? `servico-${id}` : undefined} className="svc-card" style={vars({ '--d': `${(i % 3) * 80}ms` })}>
                  <div className="svc-card__inner">
                    {img && (
                      <div className="svc-card__media">
                        <img src={img} alt={txt(it.titulo)} loading="lazy" decoding="async" />
                      </div>
                    )}
                    <div className="svc-card__body">
                      <span className="icon-sq svc-card__icon" aria-hidden="true">
                        <Icon cls={it.icone} fallback="fa-solid fa-plane" />
                      </span>
                      <h3 className="tile-title">{txt(it.titulo)}</h3>
                      {txt(it.descricao) && <p className="svc-card__desc">{txt(it.descricao)}</p>}
                      {benefits.length > 0 && (
                        <ul className="check-list">
                          {benefits.map((b, k) => (
                            <li key={k}>
                              <i className="fa-solid fa-circle-check" aria-hidden="true" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                      {cta && (
                        <a className="svc-card__cta" {...linkProps(cta.link)}>
                          <span>{txt(cta.texto)}</span>
                          <span className="svc-card__cta-arrow" aria-hidden="true">
                            <i className="fa-solid fa-arrow-right" />
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
      {extras.length > 0 && <Marquee extras={extras} />}
    </section>
  );
}
