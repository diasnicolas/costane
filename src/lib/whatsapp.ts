import type { Contato } from '../types/agencia';
import { txt } from './data';
import { safeUrl } from './url';

type Maybe<T> = T | null | undefined;

/** Monta o link do WhatsApp com mensagem ('' se não houver número nem link). */
export function waUrl(contato: Maybe<Contato>, message: string): string {
  const wa = contato?.whatsapp;
  const num = txt(wa?.numero).replace(/\D/g, '');
  if (num) return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  const link = safeUrl(wa?.link, '');
  return /^https?:/i.test(link) ? link : '';
}

export const waGreeting = (contato: Maybe<Contato>): string =>
  txt(contato?.whatsapp?.mensagem_padrao) || 'Olá! Vim pelo site e gostaria de mais informações.';

/** Link "geral" do WhatsApp: o link do JSON ou um gerado com a saudação padrão. */
export const waMainLink = (contato: Maybe<Contato>): string =>
  safeUrl(contato?.whatsapp?.link, '') || waUrl(contato, waGreeting(contato));

export function openWhatsApp(contato: Maybe<Contato>, message: string): boolean {
  const url = waUrl(contato, message);
  if (url) window.open(url, '_blank', 'noopener');
  return Boolean(url);
}
