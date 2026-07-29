'use client';

import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-mn-ink/40"
      />
      <div className="relative w-full max-w-lg rounded-card border border-mn-card-border bg-mn-card p-7 shadow-popover">
        {title && <h2 className="font-serif-display text-[22px] font-semibold text-mn-ink">{title}</h2>}
        <div className={title ? 'mt-5' : undefined}>{children}</div>
      </div>
    </div>
  );
}
