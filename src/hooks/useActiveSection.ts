import { useEffect, useState } from 'react';

/** Id da seção que ocupa a faixa central da tela (IntersectionObserver). */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState('');
  const key = ids.join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const targets = key
      .split('|')
      .map((id) => (id ? document.getElementById(id) : null))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id);
        });
      },
      { rootMargin: '-42% 0px -52% 0px' },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [key]);

  return active;
}
