'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Rejoue la transition d'apparition à chaque changement de page : la
 * clé React basée sur le chemin force un nouveau montage du conteneur,
 * ce qui relance l'animation CSS `.animate-fade-up` (globals.css).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
