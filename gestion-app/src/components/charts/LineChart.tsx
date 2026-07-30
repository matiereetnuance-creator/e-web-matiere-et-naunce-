export interface LineChartSeries {
  values: Array<number | null>;
  color: string;
  dashed?: boolean;
  strokeWidth?: number;
}

export interface LineChartLegendItem {
  label: string;
  color: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface LineChartCallout {
  seriesIndex: number;
  index: number;
  value: string;
  caption: string;
}

interface LineChartProps {
  categories: string[];
  series: LineChartSeries[];
  maxValue: number;
  yAxisLabels: string[];
  callout?: LineChartCallout;
  legend?: LineChartLegendItem[];
  height?: number;
}

const WIDTH = 560;
const X_PAD = 20;
const Y_TOP = 4;
const Y_BOTTOM = 205;

function seriesPath(values: Array<number | null>, maxValue: number): string {
  const step = (WIDTH - X_PAD * 2) / (values.length - 1);
  const points = values
    .map((value, index) => (value === null ? null : { x: X_PAD + index * step, y: Y_BOTTOM - (value / maxValue) * (Y_BOTTOM - Y_TOP) }))
    .filter((p): p is { x: number; y: number } => p !== null);
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

function pointPosition(values: Array<number | null>, index: number, maxValue: number): { x: number; y: number } {
  const step = (WIDTH - X_PAD * 2) / (values.length - 1);
  const value = values[index] ?? 0;
  return { x: X_PAD + index * step, y: Y_BOTTOM - (value / maxValue) * (Y_BOTTOM - Y_TOP) };
}

const GRID_LINE_COUNT = 5;

/** Légende générique — un swatch (trait plein/pointillé/tireté) + libellé. */
function LegendSwatch({ item }: { item: LineChartLegendItem }) {
  if (item.style === 'dashed') {
    return <span className="h-0 w-5 border-t-[3px] border-dashed" style={{ borderColor: item.color }} />;
  }
  if (item.style === 'dotted') {
    return <span className="h-0 w-5 border-t-2 border-dotted" style={{ borderColor: item.color }} />;
  }
  return <span className="h-[3px] w-5 rounded" style={{ background: item.color }} />;
}

export function LineChart({ categories, series, maxValue, yAxisLabels, callout, legend, height = 210 }: LineChartProps) {
  const calloutSeries = callout ? series[callout.seriesIndex] : undefined;
  const calloutPos = calloutSeries ? pointPosition(calloutSeries.values, callout!.index, maxValue) : null;

  return (
    <div>
      {legend && legend.length > 0 && (
        <div className="mt-4 flex gap-[22px] text-[12.5px] font-semibold">
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-2 text-mn-ink-3">
              <LegendSwatch item={item} />
              {item.label}
            </span>
          ))}
        </div>
      )}
      <div className="relative mt-5 flex gap-2.5">
        <div
          className="tnum flex flex-col justify-between py-0.5 text-right text-[11px] font-medium text-mn-label-2"
          style={{ height }}
        >
          {yAxisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <svg viewBox={`0 0 ${WIDTH} ${height}`} className="block w-full" style={{ height }} preserveAspectRatio="none">
            {Array.from({ length: GRID_LINE_COUNT + 1 }, (_, i) => Y_TOP + (i * (Y_BOTTOM - Y_TOP)) / GRID_LINE_COUNT).map((y, i) => (
              <line key={y} x1="0" y1={y} x2={WIDTH} y2={y} stroke={i === GRID_LINE_COUNT ? '#EAE1D0' : '#F0EADF'} strokeWidth="1" />
            ))}
            {series.map((s, i) => (
              <path
                key={i}
                d={seriesPath(s.values, maxValue)}
                fill="none"
                stroke={s.color}
                strokeWidth={s.strokeWidth ?? 2.6}
                strokeDasharray={s.dashed ? '7 6' : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {calloutPos && calloutSeries && (
              <>
                <circle cx={calloutPos.x} cy={calloutPos.y} r="4.5" fill={calloutSeries.color} />
                <circle cx={calloutPos.x} cy={calloutPos.y} r="8" fill="none" stroke={calloutSeries.color} strokeOpacity=".18" strokeWidth="2" />
              </>
            )}
          </svg>
          {calloutPos && callout && (
            <div
              className="absolute top-0.5 -translate-x-1/2 rounded-sm2 border border-mn-border bg-mn-card px-[13px] py-2.5 shadow-popover"
              style={{ left: `${(calloutPos.x / WIDTH) * 100}%` }}
            >
              <div className="font-serif-display tnum text-[18px] font-semibold leading-none">{callout.value}</div>
              <div className="mt-0.5 text-[11px] font-medium text-mn-label">{callout.caption}</div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-mn-label-2">
        {categories.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
