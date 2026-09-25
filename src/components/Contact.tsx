/* Contato: bento com formulário (→ WhatsApp), canais, horários, departamentos, redes e mapa. */
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { AgencyData, Contato, Formulario } from '../types/agencia';
import { cx, objs, spans, txt, type SpanCfg } from '../lib/data';
import { fullAddress } from '../lib/format';
import { initialValues, normalizeFields, validate, type FormValues } from '../lib/forms';
import { mapInfo, present, socials } from '../lib/sections';
import { linkProps, safeUrl } from '../lib/url';
import { openWhatsApp, waGreeting, waMainLink } from '../lib/whatsapp';
import { Field, type FormControl } from './Field';
import { Icon, Reveal, SectionHead } from './ui';

interface Horario {
  dias?: string | null;
  horario?: string | null;
}
interface Departamento {
  setor?: string | null;
  email?: string | null;
}

/** Aviso do formulário com "Política de Privacidade" linkada, quando a página existe. */
function PrivacyText({ text, url }: { text: string; url: string }) {
  const i = text.search(/pol[ií]tica de privacidade/i);
  if (i < 0) return <span>{text}</span>;
  const label = text.slice(i, i + "Política de Privacidade".length);
  return (
    <span>
      {text.slice(0, i)}
      <a {...linkProps(url)}>{label}</a>
      {text.slice(i + label.length)}
    </span>
  );
}

function ContactForm({ form, contato, privacyUrl }: { form: Formulario; contato: Contato; privacyUrl?: string }) {
  const fields = useMemo(() => normalizeFields(form.campos, 'contato'), [form.campos]);
  const [values, setValues] = useState<FormValues>(() => initialValues(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const controls = useRef(new Map<string, FormControl>());
  const successTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(successTimer.current), []);

  const byName = (name: string) => fields.find((f) => f.name === name);

  const onChange = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    const f = byName(name);
    if (f && errors[name]) setErrors((e) => ({ ...e, [name]: validate(f, value) }));
  };

  const onBlur = (name: string) => {
    const f = byName(name);
    const v = values[name] ?? '';
    if (f && (v.trim() || errors[name])) setErrors((e) => ({ ...e, [name]: validate(f, v) }));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    let firstInvalid = '';
    fields.forEach((f) => {
      const msg = validate(f, values[f.name] ?? '');
      next[f.name] = msg;
      if (msg && !firstInvalid) firstInvalid = f.name;
    });
    setErrors(next);
    if (firstInvalid) {
      controls.current.get(firstInvalid)?.focus();
      return;
    }
    const lines = fields
      .map((f) => [f.label, (values[f.name] ?? '').trim()] as const)
      .filter(([, v]) => v)
      .map(([label, v]) => `• ${label}: ${v}`);
    const title = txt(form.titulo);
    openWhatsApp(contato, `${waGreeting(contato)}${title ? `\n\n${title}:` : '\n'}\n${lines.join('\n')}`);
    setSuccess(true);
    setValues(initialValues(fields));
    setErrors({});
    window.clearTimeout(successTimer.current);
    successTimer.current = window.setTimeout(() => setSuccess(false), 9000);
  };

  return (
    <form className="contact-form" noValidate onSubmit={onSubmit}>
      <div className="form-grid">
        {fields.map((f) => (
          <Field
            key={f.id}
            field={f}
            value={values[f.name] ?? ''}
            error={errors[f.name]}
            onChange={onChange}
            onBlur={onBlur}
            controlRef={(el) => {
              if (el) controls.current.set(f.name, el);
              else controls.current.delete(f.name);
            }}
          />
        ))}
      </div>
      <div className="contact-form__foot">
        {txt(form.aviso_privacidade) && (
          <p className="privacy">
            <i className="fa-solid fa-lock" aria-hidden="true" />
            {privacyUrl ? <PrivacyText text={txt(form.aviso_privacidade)} url={privacyUrl} /> : txt(form.aviso_privacidade)}
          </p>
        )}
        <button className="btn btn-primary btn-lg" type="submit">
          <span>{txt(form.botao) || 'Enviar'}</span>
          <i className="fa-brands fa-whatsapp" aria-hidden="true" />
        </button>
      </div>
      <p className="form-success" role="status" aria-live="polite" hidden={!success}>
        <i className="fa-solid fa-circle-check" aria-hidden="true" /> {txt(form.mensagem_sucesso) || 'Mensagem enviada!'}
      </p>
    </form>
  );
}

export function Contact({ data }: { data: AgencyData }) {
  const c = data.contato;
  if (!present(c)) return null;

  const form = present(c.formulario) && objs(c.formulario.campos).length ? c.formulario : null;
  const wa = c.whatsapp;
  const waLink = waMainLink(c);
  const tel = c.telefone;
  const mail = c.email;
  const hours = objs<Horario>(c.horario_atendimento).filter((h) => txt(h.dias) || txt(h.horario));
  const depts = objs<Departamento>(c.emails_departamentos).filter((x) => txt(x.email));
  const nets = socials(data);
  const addr = fullAddress(data.endereco);
  const ref = txt(data.endereco?.referencia);
  const map = mapInfo(c, addr);
  const tiles: ReactNode[] = [];
  const privacyUrl = objs<{ rotulo?: string; link?: string }>(data.rodape?.links_legais).find((l) => /privacidade/i.test(txt(l.rotulo)))?.link ?? undefined;

  if (form) {
    tiles.push(
      <Reveal key="form" className="tile contact-form-tile" style={spans({ c: 7, r: 4, t: 6, m: 2 })}>
        {txt(form.titulo) && (
          <h3 className="contact-form-tile__title">
            <span className="icon-sq icon-sq--sm" aria-hidden="true">
              <i className="fa-solid fa-paper-plane" />
            </span>
            {txt(form.titulo)}
          </h3>
        )}
        <ContactForm form={form} contato={c} privacyUrl={privacyUrl} />
      </Reveal>,
    );
  }

  const channel = (key: string, href: string, iconCls: string, label: string, value: string, extraCls: string, cfg: SpanCfg) => (
    <Reveal as="a" key={key} className={cx('tile channel', extraCls)} {...linkProps(href)} style={spans(cfg)}>
      <span className="icon-sq" aria-hidden="true">
        <i className={iconCls} />
      </span>
      <span className="channel__text">
        <span className="channel__label">{label}</span>
        <strong className="channel__value">{value}</strong>
      </span>
      <span className="channel__arrow" aria-hidden="true">
        <i className="fa-solid fa-arrow-up-right-from-square" />
      </span>
    </Reveal>
  );
  if (txt(wa?.exibicao) && waLink) {
    tiles.push(channel('wa', waLink, 'fa-brands fa-whatsapp', 'WhatsApp', txt(wa?.exibicao), 'channel--wa tile--gradient', { c: 5, t: 3, m: 2, d: 60 }));
  }
  if (txt(tel?.exibicao)) {
    const href = safeUrl(tel?.link, `tel:${txt(tel?.exibicao).replace(/[^\d+]/g, '')}`);
    tiles.push(channel('tel', href, 'fa-solid fa-phone', 'Telefone', txt(tel?.exibicao), '', { c: 5, t: 3, m: 2, d: 120 }));
  }
  if (txt(mail?.exibicao)) {
    const href = safeUrl(mail?.link, `mailto:${txt(mail?.exibicao)}`);
    tiles.push(channel('email', href, 'fa-regular fa-envelope', 'E-mail', txt(mail?.exibicao), 'channel--email', { c: 5, t: 6, m: 2, d: 180 }));
  }

  if (hours.length) {
    tiles.push(
      <Reveal key="hours" className="tile hours-tile" style={spans({ c: 5, t: 3, m: 2, d: 240 })}>
        <div className="tile-head">
          <span className="icon-sq icon-sq--sm" aria-hidden="true">
            <i className="fa-regular fa-clock" />
          </span>
          <h3 className="tile-title">Horário de atendimento</h3>
        </div>
        <ul className="hours-list">
          {hours.map((h, i) => (
            <li key={i}>
              <span>{txt(h.dias)}</span>
              <strong className={/fechado/i.test(txt(h.horario)) ? 'is-closed' : ''}>{txt(h.horario)}</strong>
            </li>
          ))}
        </ul>
      </Reveal>,
    );
  }
  if (depts.length) {
    tiles.push(
      <Reveal key="depts" className="tile depts-tile" style={spans({ c: 5, t: 3, m: 2 })}>
        <div className="tile-head">
          <span className="icon-sq icon-sq--sm" aria-hidden="true">
            <i className="fa-solid fa-sitemap" />
          </span>
          <h3 className="tile-title">Departamentos</h3>
        </div>
        <ul className="depts-list">
          {depts.map((x, i) => (
            <li key={i}>
              <span className="depts-list__label">{txt(x.setor)}</span>
              <a href={safeUrl(`mailto:${txt(x.email)}`)}>{txt(x.email)}</a>
            </li>
          ))}
        </ul>
      </Reveal>,
    );
  }
  if (nets.length) {
    const wide = !depts.length;
    tiles.push(
      <Reveal key="socials" className={cx('tile socials-tile', wide && 'socials-tile--wide')} style={spans({ c: wide ? 12 : 7, t: wide ? 6 : 3, m: 2, d: 70 })}>
        <div className="tile-head">
          <span className="icon-sq icon-sq--sm" aria-hidden="true">
            <i className="fa-solid fa-hashtag" />
          </span>
          <h3 className="tile-title">Redes sociais</h3>
        </div>
        <ul className="socials-list">
          {nets.map((r, i) => (
            <li key={i}>
              <a
                className="social-row"
                {...linkProps(r.url)}
                aria-label={`${txt(r.nome)}${txt(r.seguidores) ? ` — ${txt(r.seguidores)} seguidores` : ''} (abre em nova aba)`}
              >
                <span className="social-row__icon" aria-hidden="true">
                  <Icon cls={r.icone} fallback="fa-solid fa-link" />
                </span>
                <span className="social-row__text">
                  <strong>{txt(r.nome)}</strong>
                  <span>{txt(r.seguidores) ? `${txt(r.seguidores)} seguidores` : txt(r.usuario)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>,
    );
  }
  if (map.embed || addr) {
    const title = `Mapa de localização — ${txt(data.agencia?.nome)}`.replace(/ — $/, '');
    tiles.push(
      <Reveal key="map" className="tile tile--flush map-tile" style={spans({ c: 12, t: 6, m: 2 })}>
        {map.embed && <iframe src={map.embed} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />}
        <div className="map-card">
          <span className="icon-sq" aria-hidden="true">
            <i className="fa-solid fa-location-dot" />
          </span>
          <div className="map-card__body">
            {addr && <address>{addr}</address>}
            {ref && <p>{ref}</p>}
            {map.link && (
              <a className="btn btn-ghost btn-sm" href={map.link} target="_blank" rel="noopener">
                <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
                <span>Abrir no Google Maps</span>
              </a>
            )}
          </div>
        </div>
      </Reveal>,
    );
  }
  if (!tiles.length) return null;

  return (
    <section id="contato" className="section" aria-labelledby={txt(c.titulo) ? 'contato-title' : undefined}>
      <div className="container">
        <SectionHead id="contato" s={c} />
        <div className="bento contact-bento">{tiles}</div>
      </div>
    </section>
  );
}
