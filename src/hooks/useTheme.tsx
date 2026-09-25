import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'bento-theme';

const readStored = (): Theme | null => {
  try {
    const s = localStorage.getItem(THEME_KEY);
    return s === 'dark' || s === 'light' ? s : null;
  } catch {
    return null; // storage bloqueado
  }
};

const readParam = (): Theme | null => {
  const p = new URLSearchParams(window.location.search).get('theme');
  return p === 'dark' || p === 'light' ? p : null;
};

/** Prioridade: ?theme=dark|light > localStorage > claro (padrão; o escuro só pelo botão). */
export const initialTheme = (): Theme => readParam() ?? readStored() ?? 'light';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => undefined });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const animate = useRef(false);

  // Aplica o tema no <html> (+ transição suave quando muda pelo botão)
  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    if (animate.current) {
      root.classList.add('theme-anim');
      timer = window.setTimeout(() => root.classList.remove('theme-anim'), 450);
    }
    root.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#070B14' : '#F5F7FB');
    return () => {
      window.clearTimeout(timer);
      root.classList.remove('theme-anim');
    };
  }, [theme]);

  const toggle = useCallback(() => {
    animate.current = true;
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage indisponível */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = (): ThemeCtx => useContext(Ctx);
