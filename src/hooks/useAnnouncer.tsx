import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Announce = (msg: string) => void;
const Ctx = createContext<Announce>(() => undefined);

/** Região aria-live única para anunciar resultados de filtros a leitores de tela. */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const timer = useRef(0);

  const announce = useCallback<Announce>((msg) => {
    setMessage('');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(msg), 60);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Ctx.Provider value={announce}>
      {children}
      <div className="sr-only" aria-live="polite">
        {message}
      </div>
    </Ctx.Provider>
  );
}

export const useAnnounce = (): Announce => useContext(Ctx);
