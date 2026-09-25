/* CTA final: grande tile em gradiente com imagem. */
import type { AgencyData } from '../types/agencia';
import { cx, txt } from '../lib/data';
import { isLinkLive, present } from '../lib/sections';
import { linkProps, safeUrl } from '../lib/url';
import { Icon, Reveal } from './ui';

export function CtaFinal({ data }: { data: AgencyData }) {
  const s = data.cta_final;
  if (!present(s) || !(txt(s.titulo) || txt(s.botao?.texto))) return null;
  const img = safeUrl(s.imagem_fundo, '');
  const b = present(s.botao) && txt(s.botao.texto) && isLinkLive(data, s.botao.link) ? s.botao : null;

  return (
    <section id="cta-final" className="section section--tight" aria-labelledby={txt(s.titulo) ? 'cta-final-title' : undefined}>
      <div className="container">
        <Reveal className={cx('tile tile--gradient cta-tile', !img && 'cta-tile--noimg')}>
          <div className="cta-tile__content">
            {txt(s.titulo) && (
              <h2 className="cta-tile__title" id="cta-final-title">
                {txt(s.titulo)}
              </h2>
            )}
            {txt(s.subtitulo) && <p className="cta-tile__sub">{txt(s.subtitulo)}</p>}
            {b && (
              <a className="btn btn-light btn-lg" {...linkProps(b.link)}>
                <Icon cls={b.icone} />
                <span>{txt(b.texto)}</span>
              </a>
            )}
          </div>
          {img && (
            <div className="cta-tile__media" aria-hidden="true">
              <img src={img} alt="" loading="lazy" decoding="async" />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
