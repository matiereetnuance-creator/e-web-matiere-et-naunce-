import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="lbl">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'rounded-control border bg-mn-soft px-4 py-3 font-sans text-[15px] text-mn-ink placeholder:text-mn-label transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-mn-ink/15 focus:border-mn-ink/40',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-danger-fg' : 'border-mn-soft-border',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="text-[12.5px] font-medium text-danger-fg">{error}</p>}
    </div>
  );
}
