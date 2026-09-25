import type { NormField } from '../lib/forms';
import { cx } from '../lib/data';

export type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const FIELD_ICONS: Record<string, string> = {
  text: 'fa-solid fa-location-dot',
  select: 'fa-solid fa-user-group',
  email: 'fa-regular fa-envelope',
  tel: 'fa-solid fa-phone',
};

interface FieldProps {
  field: NormField;
  value: string;
  error?: string;
  withIcon?: boolean;
  min?: string;
  onChange: (name: string, value: string) => void;
  onBlur?: (name: string) => void;
  controlRef?: (el: FormControl | null) => void;
}

/** Campo controlado gerado a partir do JSON (text/email/tel/date/select/textarea). */
export function Field({ field: f, value, error = '', withIcon = false, min, onChange, onBlur, controlRef }: FieldProps) {
  const errId = `${f.id}-err`;
  const icon = withIcon ? FIELD_ICONS[f.type] : undefined;
  const common = {
    id: f.id,
    name: f.name,
    value,
    required: f.required || undefined,
    'aria-required': f.required || undefined,
    'aria-describedby': errId,
    'aria-invalid': error ? true : undefined,
    onBlur: onBlur ? () => onBlur(f.name) : undefined,
  };

  let control;
  if (f.type === 'select') {
    control = (
      <div className="select-wrap">
        <select {...common} ref={controlRef} onChange={(e) => onChange(f.name, e.target.value)}>
          {!f.phIsOption && <option value="">{f.placeholder || 'Selecione'}</option>}
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </div>
    );
  } else if (f.type === 'textarea') {
    control = <textarea {...common} ref={controlRef} rows={4} placeholder={f.placeholder} onChange={(e) => onChange(f.name, e.target.value)} />;
  } else {
    const auto = f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : /nome|name/i.test(f.name) ? 'name' : 'off';
    control = (
      <input
        {...common}
        ref={controlRef}
        type={f.type}
        placeholder={f.placeholder}
        autoComplete={auto}
        min={f.type === 'date' ? min : undefined}
        onChange={(e) => onChange(f.name, e.target.value)}
      />
    );
  }

  return (
    <div className={cx('field', `field--${f.type}`, icon && 'field--icon', error && 'has-error')} data-field={f.name}>
      <label htmlFor={f.id}>
        {f.label}
        {f.required && (
          <>
            {' '}
            <span className="req" aria-hidden="true">
              *
            </span>
          </>
        )}
      </label>
      <div className="field__control">
        {icon && <i className={`${icon} field__icon`} aria-hidden="true" />}
        {control}
      </div>
      <p className="field__error" id={errId}>
        {error}
      </p>
    </div>
  );
}
