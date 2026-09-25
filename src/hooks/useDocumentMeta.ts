import { useEffect } from 'react';
import type { AgencyData } from '../types/agencia';
import { strs, txt } from '../lib/data';
import { safeUrl } from '../lib/url';

const BRAND_VARS: Array<[keyof NonNullable<NonNullable<AgencyData['agencia']>['identidade_visual']>, string]> = [
  ['cor_primaria', '--brand-primary'],
  ['cor_secundaria', '--brand-secondary'],
  ['cor_destaque', '--brand-accent'],
  ['cor_escura', '--brand-dark'],
  ['cor_clara', '--brand-light'],
];

function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  if (!content) return;
  let m = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!m) {
    m = document.createElement('meta');
    m.setAttribute(attr, key);
    document.head.appendChild(m);
  }
  m.setAttribute('content', content);
}

/** Cores da marca (variáveis CSS), favicon, título e meta tags de SEO/compartilhamento. */
export function useDocumentMeta(d: AgencyData): void {
  useEffect(() => {
    const ag = d.agencia ?? {};
    const seo = d.seo ?? {};
    const root = document.documentElement;

    const iv = ag.identidade_visual ?? {};
    BRAND_VARS.forEach(([key, prop]) => {
      const c = txt(iv[key]);
      if (c && window.CSS?.supports?.('color', c)) root.style.setProperty(prop, c);
    });

    const fav = safeUrl(ag.logotipo?.favicon, '');
    if (fav && fav !== '#') {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = fav;
    }

    const title = txt(seo.titulo) || [txt(ag.nome), txt(ag.slogan)].filter(Boolean).join(' | ') || document.title;
    const desc = txt(seo.descricao) || txt(ag.descricao_curta);
    document.title = title;
    setMeta('name', 'description', desc);
    setMeta('name', 'keywords', strs(seo.palavras_chave).join(', '));
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:site_name', txt(ag.nome));
    setMeta('property', 'og:locale', 'pt_BR');
    const img = safeUrl(seo.imagem_compartilhamento, '');
    if (/^https?:/i.test(img)) setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:card', 'summary_large_image');
  }, [d]);
}
