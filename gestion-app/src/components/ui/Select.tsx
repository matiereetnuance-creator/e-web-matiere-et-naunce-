import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={selectId} className="lbl">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'rounded-control border bg-mn-soft px-4 py-3 font-sans text-[15px] text-mn-ink transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-mn-ink/15 focus:border-mn-ink/40',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-danger-fg' : 'border-mn-soft-border',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[12.5px] font-medium text-danger-fg">{error}</p>}
    </div>
  );
}
