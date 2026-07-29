'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { BadgeVariant } from './Badge';

interface ToastItem {
  id: number;
  message: string;
  variant: BadgeVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: BadgeVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DOT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success-line',
  info: 'bg-mn-muted',
  warning: 'bg-warning-line',
  error: 'bg-danger-fg',
};

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: BadgeVariant = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 rounded-control border border-mn-card-border bg-mn-card px-4 py-3 text-[13.5px] font-medium text-mn-ink shadow-popover"
          >
            <span className={cn('h-2 w-2 flex-none rounded-full', DOT_CLASSES[toast.variant])} />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast() doit être utilisé à l\'intérieur de <ToastProvider>.');
  }
  return context;
}
