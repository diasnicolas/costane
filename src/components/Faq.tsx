/* FAQ: acordeão acessível em duas colunas. */
import { useState } from 'react';
import type { AgencyData } from '../types/agencia';
import { cx, objs, pad2, txt, vars } from '../lib/data';
import { present } from '../lib/sections';
import { Reveal, SectionHead } from './ui';

interface Qa {
  pergunta?: string | null;
  resposta?: string | null;
}

export function Faq({ data }: { data: AgencyData }) {
  const s = data.faq;
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set());
  if (!present(s)) return null;
  const items = objs<Qa>(s.itens).filter((it) => txt(it.pergunta));
  if (!items.length) return null;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const item = (it: Qa, i: number) => {
    const isOpen = open.has(i);
    return (
      <Reveal key={i} className={cx('tile faq-item', isOpen && 'is-open')} style={vars({ '--d': `${(i % 3) * 60}ms` })}>
        <h3 className="faq-item__h">
          <button className="faq-q" type="button" id={`faq-q-${i}`} aria-expanded={isOpen} aria-controls={`faq-a-${i}`} onClick={() => toggle(i)}>
            <span className="faq-q__num" aria-hidden="true">
              {pad2(i + 1)}
            </span>
            <span className="faq-q__text">{txt(it.pergunta)}</span>
            <span className="faq-q__icon" aria-hidden="true">
              <i className="fa-solid fa-plus" />
            </span>
          </button>
        </h3>
        <div className="faq-a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
          <div className="faq-a__inner">
            <p>{txt(it.resposta)}</p>
          </div>
        </div>
      </Reveal>
    );
  };

  const half = Math.ceil(items.length / 2);
  const colB = items.slice(half);
  return (
    <section id="faq" className="section" aria-labelledby={txt(s.titulo) ? 'faq-title' : undefined}>
      <div className="container">
        <SectionHead id="faq" s={s} align="center" />
        <div className="faq-cols">
          <div className="faq-col">{items.slice(0, half).map((it, i) => item(it, i))}</div>
          {colB.length > 0 && <div className="faq-col">{colB.map((it, i) => item(it, i + half))}</div>}
        </div>
      </div>
    </section>
  );
}
