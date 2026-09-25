/* Utilitários de leitura defensiva do JSON (qualquer campo pode faltar ou vir com tipo errado). */
import type { CSSProperties } from 'react';

export const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

/** Texto aparado ('' quando ausente). Números finitos viram string. */
export const txt = (v: unknown): string =>
  typeof v === 'string' ? v.trim() : typeof v === 'number' && Number.isFinite(v) ? String(v) : '';

/** Array sem itens nulos/vazios ([] quando não é array). */
export function arr<T>(v: Maybe<readonly T[]> | unknown): T[] {
  return Array.isArray(v) ? (v as T[]).filter((x) => x !== null && x !== undefined && (x as unknown) !== '') : [];
}
type Maybe<T> = T | null | undefined;

/** Apenas os itens que são objetos. */
export function objs<T extends object>(v: Maybe<readonly T[]> | unknown): T[] {
  return arr<T>(v).filter((x): x is T => isObj(x));
}

/** Lista de strings não vazias. */
export const strs = (v: unknown): string[] => arr<unknown>(v).map(txt).filter(Boolean);

/** Classe de ícone Font Awesome segura. */
export const cleanClass = (c: unknown): string => txt(c).replace(/[^\w\s-]/g, '');

export const slug = (s: unknown): string =>
  txt(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const pad2 = (n: number): string => String(n).padStart(2, '0');

/** Junta classes ignorando valores falsos. */
export const cx = (...parts: Array<string | false | null | undefined>): string => parts.filter(Boolean).join(' ');

export interface SpanCfg {
  c?: number;
  r?: number;
  t?: number;
  tr?: number;
  m?: number;
  mr?: number;
  d?: number;
}

/** Spans do bento (desktop c/r, tablet t/tr, mobile m/mr) + atraso da animação, como variáveis CSS. */
export function spans({ c = 12, r = 1, t = 6, tr = 1, m = 2, mr = 1, d = 0 }: SpanCfg = {}): CSSProperties {
  return {
    '--c': String(c),
    '--r': String(r),
    '--t': String(t),
    '--tr': String(tr),
    '--m': String(m),
    '--mr': String(mr),
    '--d': `${d}ms`,
  } as CSSProperties;
}

/** Estilo com variáveis CSS arbitrárias. */
export const vars = (v: Record<string, string | number>): CSSProperties => {
  const out: Record<string, string> = {};
  Object.entries(v).forEach(([k, val]) => {
    out[k] = String(val);
  });
  return out as CSSProperties;
};
