import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export type FilterPhase = 'idle' | 'leaving' | 'entering';

/**
 * Filtro com transição: o chip ativa na hora, a grade some (200ms), aplica o filtro e entra de novo.
 * Ao fim da entrada a classe é removida (a animação com `fill: both` não bloqueia mais o hover dos cards).
 */
export function useFilterTransition(initial: string) {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(initial);
  const [applied, setApplied] = useState(initial);
  const [phase, setPhase] = useState<FilterPhase>('idle');
  const [touched, setTouched] = useState(false);
  const leaveTimer = useRef(0);
  const enterTimer = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(leaveTimer.current);
      window.clearTimeout(enterTimer.current);
    },
    [],
  );

  const select = (value: string, onApply?: (value: string) => void) => {
    setActive(value);
    window.clearTimeout(leaveTimer.current);
    window.clearTimeout(enterTimer.current);
    const apply = () => {
      setApplied(value);
      setTouched(true);
      onApply?.(value);
      if (reduced) {
        setPhase('idle');
        return;
      }
      setPhase('entering');
      enterTimer.current = window.setTimeout(() => setPhase('idle'), 750);
    };
    if (reduced) apply();
    else {
      setPhase('leaving');
      leaveTimer.current = window.setTimeout(apply, 200);
    }
  };

  return { active, applied, phase, touched, select };
}
