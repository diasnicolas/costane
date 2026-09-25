/** Permite apenas http(s), mailto, tel, âncoras e caminhos relativos. */
export function safeUrl(value: unknown, fallback = '#'): string {
  if (typeof value !== 'string') return fallback;
  const url = value.trim();
  if (!url) return fallback;
  if (url.startsWith('#')) return url;
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  if (url.startsWith('//')) return fallback;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return fallback; // javascript:, data:, etc.
  return url; // relativo
}

export const isExternal = (url: string): boolean => /^https?:/i.test(url);

/** Props de link: externos abrem em nova aba. */
export function linkProps(url: unknown, fallback = '#'): { href: string; target?: string; rel?: string } {
  const href = safeUrl(url, fallback);
  return isExternal(href) ? { href, target: '_blank', rel: 'noopener' } : { href };
}
