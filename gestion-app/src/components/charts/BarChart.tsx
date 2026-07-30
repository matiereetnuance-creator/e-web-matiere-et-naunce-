import { cn } from '@/lib/cn';

export interface BarChartGroup {
  label: string;
  values: number[];
  colors: string[];
}

export interface BarChartLegendItem {
  label: string;
  color: string;
}

interface BarChartProps {
  groups: BarChartGroup[];
  maxValue?: number;
  height?: number;
  legend?: BarChartLegendItem[];
  className?: string;
}

/**
 * Barres verticales génériques. Couvre à la fois une série unique avec
 * une couleur propre à chaque barre (Charges — Évolution mensuelle) et
 * plusieurs séries groupées avec une légende (Analyses — Fournitures
 * vs marge). Les couleurs sont toujours fournies par l'appelant
 * (`group.colors`) : ce composant ne décide d'aucune teinte.
 */
export function BarChart({ groups, maxValue, height = 200, legend, className }: BarChartProps) {
  const computedMax = maxValue ?? Math.max(1, ...groups.flatMap((g) => g.values));
  const multiSeries = groups.some((g) => g.values.length > 1);

  return (
    <div className={className}>
      <div className={cn('flex items-end gap-3', multiSeries && 'gap-[18px]')} style={{ height }}>
        {groups.map((group) => (
          <div key={group.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            {multiSeries ? (
              <div className="flex h-full w-full items-end gap-1.5">
                {group.values.map((value, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{ height: `${(value / computedMax) * 100}%`, background: group.colors[i] }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="w-[60%] rounded-t-[5px]"
                style={{ height: `${(group.values[0]! / computedMax) * 100}%`, background: group.colors[0] }}
              />
            )}
            <span
              className={cn(
                'font-medium text-mn-label-2',
                multiSeries ? 'text-center text-[10.5px]' : 'text-[11px]',
              )}
            >
              {group.label}
            </span>
          </div>
        ))}
      </div>
      {legend && legend.length > 0 && (
        <div className="mt-[18px] flex gap-[22px]">
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-2 text-[12.5px] font-semibold text-mn-ink-3">
              <span className="h-3 w-3 rounded-[3px]" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
