/* Campos de formulário gerados a partir do JSON (busca do hero e contato). */
import type { CampoFormulario } from '../types/agencia';
import { objs, slug, strs, txt } from './data';

export interface NormField {
  name: string;
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  phIsOption: boolean;
}

export type FormValues = Record<string, string>;

const INPUT_TYPES = ['text', 'email', 'tel', 'date', 'number', 'url'];

export function normalizeFields(campos: unknown, prefix: string): NormField[] {
  return objs<CampoFormulario>(campos).map((f, i) => {
    const name = txt(f.nome) || `campo_${i}`;
    const raw = (txt(f.tipo) || 'text').toLowerCase();
    const type = raw === 'select' || raw === 'textarea' || INPUT_TYPES.includes(raw) ? raw : 'text';
    const options = strs(f.opcoes);
    const placeholder = txt(f.placeholder);
    return {
      name,
      id: `${prefix}-${slug(name) || i}`,
      type,
      label: txt(f.rotulo) || name,
      placeholder,
      required: f.obrigatorio === true,
      options,
      phIsOption: Boolean(placeholder) && options.includes(placeholder),
    };
  });
}

/** Valores iniciais (select cujo placeholder é uma das opções já vem selecionado). */
export const initialValues = (fields: NormField[]): FormValues =>
  Object.fromEntries(fields.map((f) => [f.name, f.type === 'select' && f.phIsOption ? f.placeholder : '']));

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Mensagem de erro do campo ('' quando válido). */
export function validate(f: NormField, value: string): string {
  const v = value.trim();
  if (f.required && !v) return 'Campo obrigatório.';
  if (v && f.type === 'email' && !EMAIL_RE.test(v)) return 'Informe um e-mail válido.';
  if (v && f.type === 'tel' && v.replace(/\D/g, '').length < 8) return 'Informe um telefone válido.';
  return '';
}

export const todayIso = (): string => new Date().toISOString().slice(0, 10);
