// Palette de graphiques "par catégorie" — alignée sur les tokens
// chart.1..6 de tailwind.config.ts (mêmes valeurs hex).
export const CHART_PALETTE = [
  { hex: '#211E19', twBg: 'bg-chart-1' },
  { hex: '#8A7B60', twBg: 'bg-chart-2' },
  { hex: '#B6A585', twBg: 'bg-chart-3' },
  { hex: '#CBBEA4', twBg: 'bg-chart-4' },
  { hex: '#DCD3C0', twBg: 'bg-chart-5' },
  { hex: '#EAE2D2', twBg: 'bg-chart-6' },
] as const;

export interface DonutSegment {
  label: string;
  pct: number;
}

// Accès sûr : l'index est toujours ramené dans [0, CHART_PALETTE.length)
// par le modulo, donc l'entrée existe toujours malgré noUncheckedIndexedAccess.
export function paletteAt(index: number): (typeof CHART_PALETTE)[number] {
  return CHART_PALETTE[index % CHART_PALETTE.length] as (typeof CHART_PALETTE)[number];
}

export function buildConicGradient(segments: DonutSegment[]): string {
  let cursor = 0;
  const stops = segments.map((segment, index) => {
    const start = cursor;
    cursor += segment.pct;
    return `${paletteAt(index).hex} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(',')})`;
}

export function formatPct(value: number): string {
  return `${value.toFixed(1).replace('.', ',')} %`;
}
