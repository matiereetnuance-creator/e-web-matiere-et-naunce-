import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChartCardProps {
  title: string;
  action?: ReactNode;
  footnote?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Carte hôte commune à tous les graphiques (Blueprint : "un seul
 * composant pour chaque élément"). Le contenu du graphique lui-même
 * (LineChart/BarChart/DonutChart) gère sa propre légende — cette carte
 * ne fournit que l'en-tête (titre + action) et l'éventuelle légende
 * textuelle sous le titre.
 */
export function ChartCard({ title, action, footnote, className, children }: ChartCardProps) {
  return (
    <div
      className={cn(
        'card-hover rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="font-serif-display text-[23px] font-semibold">{title}</div>
        {action}
      </div>
      {footnote && <p className="mt-1.5 text-[13.5px] font-medium text-mn-muted-2">{footnote}</p>}
      {children}
    </div>
  );
}
