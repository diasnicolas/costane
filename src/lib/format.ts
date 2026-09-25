import { txt } from './data';

/** Número no padrão pt-BR com casas decimais fixas. */
export const fmtNum = (n: number, dec = 0): string =>
  Number(n).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const fmtRating = (n: unknown): string => fmtNum(Number(n) || 0, 1);

/** "2026-06-18" → "junho de 2026" */
export function fmtMonthYear(iso: unknown): string {
  const s = txt(iso);
  if (!s) return '';
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T12:00:00` : s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/** "2026-10-12" → "12/10/2026" */
export const fmtDateBR = (iso: string): string =>
  /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : iso;

/** Converte "15.000" / "4,5" / 15000 em número (NaN se inválido). */
export function parseNumber(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  const s = txt(raw);
  if (!s) return Number.NaN;
  return Number(s.replace(/\./g, '').replace(',', '.'));
}

/** Casas decimais de um número (4.5 → 1). */
export const decimalsOf = (n: number): number => (Number.isFinite(n) ? (String(n).split('.')[1] || '').length : 0);

/** Endereço completo (campo `completo` ou composto das partes). */
export function fullAddress(e: unknown): string {
  if (!e || typeof e !== 'object') return '';
  const r = e as Record<string, unknown>;
  if (txt(r.completo)) return txt(r.completo);
  const street = [txt(r.logradouro), txt(r.numero)].filter(Boolean).join(', ');
  const line1 = [street, txt(r.complemento)].filter(Boolean).join(', ');
  const city = [txt(r.cidade), txt(r.uf) || txt(r.estado)].filter(Boolean).join(' - ');
  return [[line1, txt(r.bairro)].filter(Boolean).join(' - '), city, txt(r.cep)].filter(Boolean).join(', ');
}
