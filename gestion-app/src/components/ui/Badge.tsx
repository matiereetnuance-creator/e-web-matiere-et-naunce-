import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type BadgeVariant = 'success' | 'info' | 'warning' | 'error';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success-bg text-success-fg',
  info: 'bg-mn-card-alt text-mn-muted',
  warning: 'bg-warning-bg text-warning-fg',
  error: 'bg-danger-bg text-danger-fg',
};

export function Badge({ variant = 'info', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'tnum inline-flex items-center rounded-pill px-2.5 py-[3px] text-[12.5px] font-semibold',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
