import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { buildConicGradient, formatPct, paletteAt, type DonutSegment } from '@/lib/charts';

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  holeSize?: number;
  center?: ReactNode;
  legend?: boolean;
  align?: 'start' | 'center';
  className?: string;
}

export function DonutChart({
  segments,
  size = 150,
  holeSize = 88,
  center,
  legend = false,
  align = 'start',
  className,
}: DonutChartProps) {
  const gradient = buildConicGradient(segments);

  const ring = (
    <div
      className="flex flex-none items-center justify-center rounded-full"
      style={{ width: size, height: size, background: gradient }}
    >
      {center && (
        <div
          className="flex flex-col items-center justify-center rounded-full bg-mn-card"
          style={{ width: holeSize, height: holeSize }}
        >
          {center}
        </div>
      )}
    </div>
  );

  if (align === 'center') {
    return <div className={cn('flex justify-center', className)}>{ring}</div>;
  }

  return (
    <div className={cn('flex items-center gap-[26px]', className)}>
      {ring}
      {legend && (
        <div className="flex flex-1 flex-col gap-3">
          {segments.map((segment, index) => (
            <div key={segment.label} className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-[3px] ${paletteAt(index).twBg}`} />
              <span className="flex-1 text-[13.5px] font-medium text-mn-ink-2">{segment.label}</span>
              <span className="tnum text-[13.5px] font-semibold">{formatPct(segment.pct)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
