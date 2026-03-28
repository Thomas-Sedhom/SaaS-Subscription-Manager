import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export default function InputField({ label, hint, error, ...props }: InputFieldProps) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className={`field__input ${error ? 'field__input--error' : ''}`.trim()} {...props} />
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
