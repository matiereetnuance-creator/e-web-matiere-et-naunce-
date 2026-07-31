'use client';

import { useEffect, type ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Panneau latéral droit — pleine hauteur, largeur fixe. Réservé aux
 * formulaires (Créer/Modifier) ; les confirmations restent sur `Modal`.
 * Mêmes tokens que le reste du Design System (pas de rayon propre :
 * aucun autre composant n'utilise de coins arrondis d'un seul côté).
 */
export function Drawer({ open, onClose, title, children, footer }: DrawerProps) {
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-mn-ink/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-full w-[560px] max-w-full flex-col bg-mn-card shadow-popover"
      >
        <div className="flex items-center justify-between border-b border-mn-card-border px-7 py-5">
          <h2 className="font-serif-display text-[22px] font-semibold text-mn-ink">{title}</h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-sm2 text-mn-muted transition-colors duration-150 hover:bg-mn-card-alt"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
        {footer && (
          <div className="flex flex-none items-center justify-end gap-3 border-t border-mn-card-border px-7 py-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
