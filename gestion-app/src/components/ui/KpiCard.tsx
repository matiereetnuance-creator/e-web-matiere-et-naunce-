import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface KpiTrend {
  value: string;
  direction: 'up' | 'down';
  positive?: boolean;
  comparisonLabel?: string;
}

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  trend?: KpiTrend;
  accent?: boolean;
  className?: string;
}

export function KpiCard({ icon, label, value, trend, accent = false, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'card-hover rounded-card border p-6 pb-[22px] shadow-card',
        accent ? 'bg-mn-card-alt border-mn-card-alt-border' : 'bg-mn-card border-mn-card-border',
        className,
      )}
    >
      <div className="flex h-[42px] w-[42px] items-center justify-center rounded-sm2 bg-mn-card-alt text-mn-muted">
        {icon}
      </div>
      <div className="lbl mt-[22px]">{label}</div>
      <div className="font-serif-display tnum mt-2 text-[34px] font-medium leading-none">{value}</div>
      {trend && (
        <div className="mt-3.5 flex items-center gap-1.5 text-[13px] font-semibold">
          <TrendArrow direction={trend.direction} />
          <span className={cn('tnum', trend.positive === false ? 'text-danger-fg' : 'text-success-line')}>
            {trend.value}
          </span>
          {trend.comparisonLabel && <span className="font-medium text-mn-label">{trend.comparisonLabel}</span>}
        </div>
      )}
    </div>
  );
}

function TrendArrow({ direction }: { direction: 'up' | 'down' }) {
  const path = direction === 'up' ? 'M5 13l5-5 5 5' : 'M5 7l5 5 5-5';
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-success-line">
      <path d={path} />
    </svg>
  );
}
