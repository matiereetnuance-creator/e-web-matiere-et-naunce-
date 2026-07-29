import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-mn-ink text-[#F4F0E9] hover:opacity-90 shadow-control',
  secondary:
    'bg-mn-soft border border-mn-soft-border text-mn-muted-4 hover:bg-mn-card-alt',
  danger: 'bg-danger-fg text-white hover:opacity-90 shadow-control',
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 font-sans text-[13.5px] font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
