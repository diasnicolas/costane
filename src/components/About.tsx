/* Sobre: bento com textos, imagens, selo, missão/visão/valores, números animados e equipe. */
import type { ReactNode } from 'react';
import type { AgencyData, MembroEquipe, Numero } from '../types/agencia';
import { objs, spans, strs, txt, vars } from '../lib/data';
import { decimalsOf, parseNumber } from '../lib/format';
import { isLinkLive, present } from '../lib/sections';
import { linkProps, safeUrl } from '../lib/url';
import { CountUp, Reveal, SectionHead } from './ui';

export function About({ data }: { data: AgencyData }) {
  const s = data.sobre;
  if (!present(s)) return null;

  const agName = txt(data.agencia?.nome);
  const paras = strs(s.paragrafos);
  const img1 = safeUrl(s.imagem_principal, '');
  const img2 = safeUrl(s.imagem_secundaria, '');
  const badge = present(s.selo_experiencia) && (txt(s.selo_experiencia.valor) || txt(s.selo_experiencia.rotulo)) ? s.selo_experiencia : null;
  const valores = strs(s.valores);
  const nums = objs<Numero>(s.numeros).filter((n) => txt(n.valor) || txt(n.rotulo));
  const team = objs<MembroEquipe>(s.equipe).filter((p) => txt(p.nome));
  const tiles: ReactNode[] = [];
  let k = 0;
  const delay = () => (k++ % 4) * 70;

  if (paras.length) {
    tiles.push(
      <Reveal key="paras" className="tile about-paras" style={spans({ c: 5, r: 2, t: 6, m: 2, d: delay() })}>
        {paras.map((p, i) => (
          <p key={i} className={i === 0 ? 'lead' : undefined}>
            {p}
          </p>
        ))}
      </Reveal>,
    );
  }
  if (img1) {
    tiles.push(
      <Reveal as="figure" key="img1" className="tile tile--flush tile--img about-img1" style={spans({ c: 4, r: 2, t: 3, tr: 2, m: 2, d: delay() })}>
        <img src={img1} alt={[agName, txt(s.etiqueta)].filter(Boolean).join(' — ') || txt(s.titulo)} loading="lazy" decoding="async" />
      </Reveal>,
    );
  }
  if (badge) {
    const raw = txt(badge.valor);
    const numeric = /^\d+([.,]\d+)?$/.test(raw);
    const end = Number(raw.replace(',', '.'));
    const founded = Number(data.agencia?.ano_fundacao);
    tiles.push(
      <Reveal key="badge" className="tile tile--gradient about-badge" style={spans({ c: 3, t: 3, m: 1, d: delay() })}>
        <span className="about-badge__icon" aria-hidden="true">
          <i className="fa-solid fa-award" />
        </span>
        <strong className="about-badge__value">{numeric ? <CountUp end={end} dec={decimalsOf(end)} srText={raw} /> : raw}</strong>
        <span className="about-badge__label">{txt(badge.rotulo)}</span>
        {founded > 0 && <span className="about-badge__since">Desde {founded}</span>}
      </Reveal>,
    );
  }
  if (img2) {
    tiles.push(
      <Reveal as="figure" key="img2" className="tile tile--flush tile--img about-img2" style={spans({ c: 3, t: 3, m: 1, d: delay() })}>
        <img src={img2} alt={`Equipe ${agName}`.trim()} loading="lazy" decoding="async" />
      </Reveal>,
    );
  }
  const mv = (key: string, label: string, iconCls: string, body: ReactNode, t = 3) => (
    <Reveal key={key} className="tile about-mv" style={spans({ c: 4, t, m: 2, d: delay() })}>
      <div className="tile-head">
        <span className="icon-sq icon-sq--sm" aria-hidden="true">
          <i className={iconCls} />
        </span>
        <h3 className="tile-title">{label}</h3>
      </div>
      {body}
    </Reveal>
  );
  if (txt(s.missao)) tiles.push(mv('missao', 'Missão', 'fa-solid fa-bullseye', <p>{txt(s.missao)}</p>));
  if (txt(s.visao)) tiles.push(mv('visao', 'Visão', 'fa-solid fa-binoculars', <p>{txt(s.visao)}</p>));
  if (valores.length) {
    tiles.push(
      mv(
        'valores',
        'Valores',
        'fa-solid fa-gem',
        <ul className="chip-list">
          {valores.map((v, i) => (
            <li key={i} className="chip-static">
              <i className="fa-solid fa-check" aria-hidden="true" />
              {v}
            </li>
          ))}
        </ul>,
        txt(s.missao) && txt(s.visao) ? 6 : 3,
      ),
    );
  }

  // Números com contagem animada
  const n = nums.length;
  nums.forEach((item, i) => {
    const c = n <= 4 ? 12 / n : n % 3 === 0 ? 4 : 3;
    const lastOdd = n % 2 === 1 && i === n - 1;
    const value = parseNumber(item.valor);
    const suffix = txt(item.sufixo);
    tiles.push(
      <Reveal key={`num-${i}`} className="tile about-num" style={spans({ c, t: lastOdd ? 6 : 3, m: lastOdd ? 2 : 1, d: i * 70 })}>
        <strong className="about-num__value grad-text">
          {Number.isFinite(value) ? <CountUp end={value} dec={decimalsOf(value)} suffix={suffix} /> : `${txt(item.valor)}${suffix}`}
        </strong>
        <span className="about-num__label">{txt(item.rotulo)}</span>
        <span className="about-num__bar" aria-hidden="true" />
      </Reveal>,
    );
  });

  if (!tiles.length && !team.length && !txt(s.titulo)) return null;

  const cta =
    present(s.cta) && txt(s.cta.texto) && isLinkLive(data, s.cta.link) ? (
      <a className="btn btn-ghost" {...linkProps(s.cta.link)}>
        <span>{txt(s.cta.texto)}</span>
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </a>
    ) : null;

  return (
    <section id="sobre" className="section" aria-labelledby={txt(s.titulo) ? 'sobre-title' : undefined}>
      <div className="container">
        <SectionHead id="sobre" s={s} extra={cta} />
        {tiles.length > 0 && <div className="bento about-bento">{tiles}</div>}
        {team.length > 0 && (
          <div className="team">
            <Reveal as="h3" className="team__title">
              Nossa equipe
            </Reveal>
            <ul className="team-grid">
              {team.map((p, i) => (
                <Reveal as="li" key={i} className="tile team-card" style={vars({ '--d': `${i * 70}ms` })}>
                  {txt(p.foto) && (
                    <div className="team-card__photo">
                      <img src={safeUrl(p.foto, '')} alt={`Foto de ${txt(p.nome)}`} loading="lazy" decoding="async" width={400} height={400} />
                    </div>
                  )}
                  <div className="team-card__body">
                    <h4 className="team-card__name">{txt(p.nome)}</h4>
                    {txt(p.cargo) && <p className="team-card__role">{txt(p.cargo)}</p>}
                    {txt(p.especialidade) && (
                      <p className="team-card__spec">
                        <i className="fa-solid fa-compass" aria-hidden="true" />
                        {txt(p.especialidade)}
                      </p>
                    )}
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
