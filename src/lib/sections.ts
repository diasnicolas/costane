/* Quais seções têm conteúdo suficiente para serem exibidas (usado também para esconder links do menu). */
import type { AgencyData, Contato, Depoimento, Estatistica, Foto, HeroSlide, Numero, RedeSocial, Servico } from '../types/agencia';
import { isObj, objs, strs, txt } from './data';
import { fullAddress } from './format';
import { safeUrl } from './url';
import { waMainLink } from './whatsapp';

/** Type guard genérico para blocos opcionais do JSON. */
export function present<T extends object>(v: T | null | undefined): v is T {
  return isObj(v);
}

/** Redes sociais com URL válida. */
export const socials = (d: AgencyData): RedeSocial[] =>
  objs<RedeSocial>(d.redes_sociais).filter((r) => txt(r.url) && safeUrl(r.url, '') !== '');

export function hasHero(d: AgencyData): boolean {
  const h = d.hero;
  if (!present(h)) return false;
  const intro = txt(h.titulo) || txt(h.titulo_destaque) || txt(h.subtitulo) || txt(h.etiqueta);
  const media =
    safeUrl(h.video_fundo, '') || safeUrl(h.imagem_fundo, '') || objs<HeroSlide>(h.slides).some((s) => txt(s.imagem) || txt(s.titulo));
  const busca = h.busca?.ativo && objs(h.busca.campos).length > 0;
  const stats = objs<Estatistica>(h.estatisticas).some((s) => txt(s.valor) || txt(s.rotulo));
  return Boolean(intro || media || busca || stats);
}

export function hasSobre(d: AgencyData): boolean {
  const s = d.sobre;
  if (!present(s)) return false;
  const badge = present(s.selo_experiencia) && (txt(s.selo_experiencia.valor) || txt(s.selo_experiencia.rotulo));
  return Boolean(
    strs(s.paragrafos).length ||
      safeUrl(s.imagem_principal, '') ||
      safeUrl(s.imagem_secundaria, '') ||
      badge ||
      txt(s.missao) ||
      txt(s.visao) ||
      strs(s.valores).length ||
      objs<Numero>(s.numeros).some((n) => txt(n.valor) || txt(n.rotulo)) ||
      objs<{ nome?: string }>(s.equipe).some((p) => txt(p.nome)) ||
      txt(s.titulo),
  );
}

export const hasDiferenciais = (d: AgencyData): boolean =>
  present(d.diferenciais) && objs<{ titulo?: string; descricao?: string }>(d.diferenciais.itens).some((it) => txt(it.titulo) || txt(it.descricao));

export const hasServicos = (d: AgencyData): boolean =>
  present(d.servicos) &&
  (objs<Servico>(d.servicos.itens).some((it) => txt(it.titulo)) ||
    objs<{ titulo?: string }>(d.servicos.servicos_complementares).some((x) => txt(x.titulo)));

export const hasGaleria = (d: AgencyData): boolean =>
  present(d.galeria) && objs<Foto>(d.galeria.fotos).some((f) => txt(f.miniatura) || txt(f.url));

export const hasDepoimentos = (d: AgencyData): boolean =>
  present(d.depoimentos) && objs<Depoimento>(d.depoimentos.itens).some((it) => txt(it.texto));

export const hasFaq = (d: AgencyData): boolean =>
  present(d.faq) && objs<{ pergunta?: string }>(d.faq.itens).some((it) => txt(it.pergunta));

export const hasCtaFinal = (d: AgencyData): boolean =>
  present(d.cta_final) && Boolean(txt(d.cta_final.titulo) || txt(d.cta_final.botao?.texto));

/** Dados derivados do mapa (embed + link externo). */
export function mapInfo(c: Contato, addr: string): { embed: string; link: string } {
  const mapa = c.mapa ?? {};
  const lat = Number(mapa.latitude);
  const lng = Number(mapa.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && Boolean(lat || lng);
  const embed = safeUrl(mapa.embed_url, '') || (hasCoords ? `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed` : '');
  const link =
    safeUrl(mapa.link, '') ||
    (hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : addr
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
        : '');
  return { embed, link };
}

export function hasContato(d: AgencyData): boolean {
  const c = d.contato;
  if (!present(c)) return false;
  const form = present(c.formulario) && objs(c.formulario.campos).length > 0;
  const addr = fullAddress(d.endereco);
  return Boolean(
    form ||
      (txt(c.whatsapp?.exibicao) && waMainLink(c)) ||
      txt(c.telefone?.exibicao) ||
      txt(c.email?.exibicao) ||
      objs<{ dias?: string; horario?: string }>(c.horario_atendimento).some((h) => txt(h.dias) || txt(h.horario)) ||
      objs<{ email?: string }>(c.emails_departamentos).some((x) => txt(x.email)) ||
      socials(d).length ||
      mapInfo(c, addr).embed ||
      addr,
  );
}

const sectionsCache = new WeakMap<AgencyData, ReadonlySet<string>>();

/**
 * Ids de destino válidos para âncoras (menu, botões e links do rodapé).
 * Destinos e newsletter não são renderizados neste site: nunca entram aqui,
 * mesmo que o JSON traga esses blocos.
 */
export function visibleSections(d: AgencyData): ReadonlySet<string> {
  const cached = sectionsCache.get(d);
  if (cached) return cached;
  const checks: Array<[string, (d: AgencyData) => boolean]> = [
    ['hero', hasHero],
    ['sobre', hasSobre],
    ['diferenciais', hasDiferenciais],
    ['servicos', hasServicos],
    ['galeria', hasGaleria],
    ['depoimentos', hasDepoimentos],
    ['faq', hasFaq],
    ['cta-final', hasCtaFinal],
    ['contato', hasContato],
  ];
  const ids = new Set<string>(['main', 'footer']);
  checks.forEach(([id, fn]) => {
    if (fn(d)) ids.add(id);
  });
  sectionsCache.set(d, ids);
  return ids;
}

/** Link do JSON utilizável: âncora interna (#id) só se a seção de destino é exibida; demais URLs passam. */
export function isLinkLive(d: AgencyData, url: unknown): boolean {
  const href = safeUrl(url, '');
  if (!href.startsWith('#') || href.length < 2) return true;
  return visibleSections(d).has(href.slice(1));
}
