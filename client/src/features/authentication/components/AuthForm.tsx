import type { ChangeEvent, FormEvent } from 'react';

import Button from '../../../components/Button';
import InputField from '../../../components/InputField';

interface AuthField {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  fields: AuthField[];
  values: Record<string, string>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  error?: string;
  isLoading?: boolean;
}

export default function AuthForm({
  title,
  subtitle,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel,
  error,
  isLoading = false
}: AuthFormProps) {
  return (
    <div className="auth-card">
      <div className="page-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <form className="form-grid" onSubmit={onSubmit}>
        {fields.map((field) => (
          <InputField
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type ?? 'text'}
            placeholder={field.placeholder}
            value={values[field.name] ?? ''}
            onChange={onChange}
          />
        ))}
        {error ? <div className="alert alert--error">{error}</div> : null}
        <Button disabled={isLoading} type="submit">{isLoading ? 'Please wait...' : submitLabel}</Button>
      </form>
    </div>
  );
}
