/* Rodapé em tiles: marca, links, contato, pagamentos, selos e barra final. */
import type { ReactNode } from 'react';
import type { AgencyData } from '../types/agencia';
import { cx, objs, spans, strs, txt } from '../lib/data';
import { fullAddress } from '../lib/format';
import { isLinkLive, socials } from '../lib/sections';
import { linkProps, safeUrl } from '../lib/url';
import { waGreeting, waUrl } from '../lib/whatsapp';
import { Icon, Logo } from './ui';

const PAY_ICONS: Array<[RegExp, string]> = [
  [/visa/i, 'fa-brands fa-cc-visa'],
  [/master/i, 'fa-brands fa-cc-mastercard'],
  [/amex|american/i, 'fa-brands fa-cc-amex'],
  [/pix/i, 'fa-brands fa-pix'],
  [/paypal/i, 'fa-brands fa-cc-paypal'],
  [/diners/i, 'fa-brands fa-cc-diners-club'],
  [/apple/i, 'fa-brands fa-cc-apple-pay'],
  [/google/i, 'fa-brands fa-google-pay'],
  [/boleto/i, 'fa-solid fa-barcode'],
];
const SEAL_ICONS: Array<[RegExp, string]> = [
  [/cadastur/i, 'fa-solid fa-certificate'],
  [/abav|associa/i, 'fa-solid fa-award'],
  [/ssl|segur/i, 'fa-solid fa-lock'],
];

interface FLink {
  rotulo?: string | null;
  link?: string | null;
}
interface Selo {
  nome?: string | null;
  descricao?: string | null;
}

export function Footer({ data }: { data: AgencyData }) {
  const ag = data.agencia;
  const r = data.rodape;
  const c = data.contato;
  const nets = socials(data);
  // Links para seções não exibidas (ex.: #destinos) são omitidos
  const quick = objs<FLink>(r?.links_rapidos).filter((l) => txt(l.rotulo) && isLinkLive(data, l.link));
  const legal = objs<FLink>(r?.links_legais).filter((l) => txt(l.rotulo) && isLinkLive(data, l.link));
  const pays = strs(r?.formas_pagamento);
  const seals = objs<Selo>(r?.selos).filter((s) => txt(s.nome));
  const addr = fullAddress(data.endereco);
  const about = txt(r?.sobre) || txt(ag?.descricao_curta);

  const contactRows: ReactNode[] = [];
  if (addr)
    contactRows.push(
      <li key="addr">
        <i className="fa-solid fa-location-dot" aria-hidden="true" />
        <span>{addr}</span>
      </li>,
    );
  if (txt(c?.telefone?.exibicao))
    contactRows.push(
      <li key="tel">
        <i className="fa-solid fa-phone" aria-hidden="true" />
        <a href={safeUrl(c?.telefone?.link)}>{txt(c?.telefone?.exibicao)}</a>
      </li>,
    );
  if (txt(c?.whatsapp?.exibicao))
    contactRows.push(
      <li key="wa">
        <i className="fa-brands fa-whatsapp" aria-hidden="true" />
        <a href={safeUrl(c?.whatsapp?.link, '') || waUrl(c, waGreeting(c)) || '#contato'} target="_blank" rel="noopener">
          {txt(c?.whatsapp?.exibicao)}
        </a>
      </li>,
    );
  if (txt(c?.email?.exibicao))
    contactRows.push(
      <li key="email">
        <i className="fa-regular fa-envelope" aria-hidden="true" />
        <a href={safeUrl(c?.email?.link)}>{txt(c?.email?.exibicao)}</a>
      </li>,
    );

  const ids = [txt(ag?.cnpj) ? `CNPJ ${txt(ag?.cnpj)}` : '', txt(ag?.cadastur) ? `Cadastur ${txt(ag?.cadastur)}` : ''].filter(Boolean);

  const linkTile = (key: string, title: string, links: FLink[], cfg: Parameters<typeof spans>[0]) => (
    <nav key={key} className="tile f-links" aria-label={title} style={spans(cfg)}>
      <h2 className="f-title">{title}</h2>
      <ul>
        {links.map((l, i) => (
          <li key={i}>
            <a {...linkProps(l.link)}>{txt(l.rotulo)}</a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <footer id="footer" className="site-footer">
      <div className="container">
        <div className="bento footer-bento">
          <div className="tile f-brand" style={spans({ c: 4, r: 2, t: 6, m: 2 })}>
            <a className="f-brand__logo" href="#hero" aria-label={`${txt(ag?.nome)} — voltar ao início`}>
              <Logo agencia={ag} variant="white" />
            </a>
            {txt(ag?.slogan) && <p className="f-brand__slogan">{txt(ag?.slogan)}</p>}
            {about && <p className="f-brand__about">{about}</p>}
            {nets.length > 0 && (
              <ul className="f-socials">
                {nets.map((n, i) => (
                  <li key={i}>
                    <a {...linkProps(n.url)} aria-label={txt(n.nome)}>
                      <Icon cls={n.icone} fallback="fa-solid fa-link" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {quick.length > 0 && linkTile('quick', 'Links rápidos', quick, { c: 2, t: 2, m: legal.length ? 1 : 2 })}
          {legal.length > 0 && linkTile('legal', 'Institucional', legal, { c: 3, t: 2, m: 1 })}
          {contactRows.length > 0 && (
            <div className="tile f-contact" style={spans({ c: legal.length ? 3 : 6, t: legal.length ? 2 : 4, m: 2 })}>
              <h2 className="f-title">Contato</h2>
              <ul className="f-contact__list">{contactRows}</ul>
            </div>
          )}
          {pays.length > 0 && (
            <div className="tile f-pay" style={spans({ c: 4, t: 3, m: 2 })}>
              <h2 className="f-title">Formas de pagamento</h2>
              <ul className="pay-list">
                {pays.map((p, i) => {
                  const found = PAY_ICONS.find(([re]) => re.test(p));
                  const brand = Boolean(found && found[1].startsWith('fa-brands'));
                  return (
                    <li key={i} className={cx('pay-chip', brand && 'pay-chip--icon')} title={p}>
                      {found && <i className={found[1]} aria-hidden="true" />}
                      <span className={brand ? 'sr-only' : undefined}>{p}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {seals.length > 0 && (
            <div className="tile f-seals" style={spans({ c: pays.length ? 4 : 8, t: pays.length ? 3 : 6, m: 2 })}>
              <h2 className="f-title">Selos e certificações</h2>
              <ul className="seal-list">
                {seals.map((s, i) => {
                  const found = SEAL_ICONS.find(([re]) => re.test(`${txt(s.nome)} ${txt(s.descricao)}`));
                  return (
                    <li key={i}>
                      <span className="icon-sq icon-sq--xs" aria-hidden="true">
                        <i className={found ? found[1] : 'fa-solid fa-shield-halved'} />
                      </span>
                      <span>
                        <strong>{txt(s.nome)}</strong>
                        {txt(s.descricao) && <small>{txt(s.descricao)}</small>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="tile f-bottom" style={spans({ c: 12, t: 6, m: 2 })}>
            <div className="f-bottom__text">
              <p>{txt(r?.copyright) || `© ${new Date().getFullYear()} ${txt(ag?.nome)}`}</p>
              {ids.length > 0 && (
                <p className="f-bottom__ids">
                  {ids.map((id, i) => (
                    <span key={id}>
                      {i > 0 && <span aria-hidden="true"> · </span>}
                      {id}
                    </span>
                  ))}
                </p>
              )}
              <p className="f-bottom__credit">
                Desenvolvido por{' '}
                <a href="https://zapturize.com.br" target="_blank" rel="noopener noreferrer">
                  Zapturize
                </a>
              </p>
            </div>
            {txt(r?.aviso_demo) && (
              <p className="f-bottom__demo">
                <i className="fa-solid fa-circle-info" aria-hidden="true" />
                {txt(r?.aviso_demo)}
              </p>
            )}
            <a className="f-bottom__top" href="#hero">
              <span>Voltar ao topo</span>
              <i className="fa-solid fa-arrow-up" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
