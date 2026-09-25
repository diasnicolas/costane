import { useEffect, useState } from 'react';
import type { AgencyData } from '../types/agencia';
import { isObj } from '../lib/data';

export const DATA_URL =
  new URLSearchParams(window.location.search).get('data') ?? `${import.meta.env.BASE_URL}agencia-viagens.json`;

export type DataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: AgencyData };

/** Carrega o JSON da agência: loading → ready | error (aborta ao desmontar). */
export function useAgencyData(url: string = DATA_URL): DataState {
  const [state, setState] = useState<DataState>({ status: 'loading' });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    (async () => {
      try {
        const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: unknown = await res.json();
        if (!isObj(json)) throw new Error('JSON inválido');
        setState({ status: 'ready', data: json as AgencyData });
      } catch (err: unknown) {
        if (ctrl.signal.aborted) return;
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
      }
    })();
    return () => ctrl.abort();
  }, [url]);

  return state;
}
