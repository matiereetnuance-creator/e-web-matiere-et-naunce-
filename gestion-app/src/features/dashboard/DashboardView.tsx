import Link from 'next/link';
import { ChartCard, DonutChart, LineChart, PeriodChip } from '@/components/charts';
import { KpiCard } from '@/components/ui/KpiCard';
import {
  caEvolutionCategories,
  caEvolutionMax,
  caEvolutionObjectif,
  caEvolutionProjection,
  caEvolutionRealise,
  caEvolutionYAxisLabels,
  chantiersRentables,
  chargesRepartition,
  dashboardKpis,
  pointsAttention,
} from './data';
import { AttentionNeutralIcon, AttentionWarningIcon, CaIcon, ChargesMoisIcon, ChevronRightIcon, MargeIcon, ResultatIcon } from './icons';

export function DashboardView() {
  return (
    <div className="flex flex-col gap-5">
      <div className="stagger-children grid grid-cols-4 gap-5">
        <KpiCard icon={<CaIcon />} label="Chiffre d'affaires réalisé" value={dashboardKpis.caRealise.value} trend={{ value: dashboardKpis.caRealise.trendValue, direction: 'up', comparisonLabel: 'vs N-1' }} />
        <KpiCard icon={<MargeIcon />} label="Marge moyenne" value={dashboardKpis.margeMoyenne.value} trend={{ value: dashboardKpis.margeMoyenne.trendValue, direction: 'up', comparisonLabel: 'vs N-1' }} />
        <KpiCard icon={<ResultatIcon />} label="Résultat prévisionnel" value={dashboardKpis.resultatPrevisionnel.value} trend={{ value: dashboardKpis.resultatPrevisionnel.trendValue, direction: 'up', comparisonLabel: 'vs N-1' }} />
        <KpiCard icon={<ChargesMoisIcon />} label="Charges du mois" value={dashboardKpis.chargesDuMois.value} trend={{ value: dashboardKpis.chargesDuMois.trendValue, direction: 'down', comparisonLabel: 'vs N-1' }} />
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-5">
        <ChartCard title="Évolution du chiffre d'affaires" action={<PeriodChip label="Cette année" />}>
          <LineChart
            categories={caEvolutionCategories}
            maxValue={caEvolutionMax}
            yAxisLabels={caEvolutionYAxisLabels}
            series={[
              { values: caEvolutionRealise, color: '#211E19' },
              { values: caEvolutionProjection, color: '#C3B597', dashed: true },
              { values: caEvolutionObjectif, color: '#B9AF98', dashed: true, strokeWidth: 1.6 },
            ]}
            callout={{ seriesIndex: 0, index: 7, value: dashboardKpis.caRealise.value, caption: 'réalisé à ce jour' }}
            legend={[
              { label: 'CA réalisé', color: '#211E19', style: 'solid' },
              { label: 'CA en cours', color: '#B98A3E', style: 'dashed' },
              { label: 'Objectif annuel', color: '#B3A992', style: 'dotted' },
            ]}
          />
        </ChartCard>

        <ChartCard title="Répartition des charges" action={<PeriodChip label="Cette année" />}>
          <DonutChart segments={chargesRepartition} legend className="mt-[22px]" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-5">
        <div className="card-hover rounded-card border border-mn-card-border bg-mn-card px-7 pb-3 pt-[26px] shadow-card">
          <div className="flex items-center justify-between">
            <div className="font-serif-display text-[23px] font-semibold">Chantiers les plus rentables</div>
            <Link href="/chantiers" className="rounded-sm2 border border-mn-soft-border bg-mn-soft px-[13px] py-2 text-[12.5px] font-semibold text-mn-muted-4 transition-colors duration-150 hover:bg-mn-card-alt">
              Voir tous les chantiers
            </Link>
          </div>
          <div className="grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr] border-b border-mn-table-border px-0.5 py-4 pt-4">
            <span className="lbl">Chantier</span>
            <span className="lbl">Type</span>
            <span className="lbl text-right">Marge</span>
            <span className="lbl text-right">Marge %</span>
            <span className="lbl text-right">€/Jour</span>
          </div>
          {chantiersRentables.map((row) => (
            <div key={row.client} className="grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr] items-center border-b border-mn-row-border px-0.5 py-3.5 transition-colors duration-150 last:border-0 hover:bg-mn-table-head">
              <span className="text-[14px] font-semibold">{row.client}</span>
              <span className="text-[13.5px] font-medium text-mn-muted">{row.type}</span>
              <span className="tnum text-right text-[13.5px] font-semibold">{row.marge}</span>
              <span className="tnum text-right text-[13.5px] font-semibold text-success-line">{row.margePct}</span>
              <span className="tnum text-right text-[13.5px] font-semibold text-mn-ink-3">{row.eurJour}</span>
            </div>
          ))}
        </div>

        <div className="card-hover rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="flex items-center justify-between">
            <div className="font-serif-display text-[23px] font-semibold">Points d&apos;attention</div>
            <button type="button" className="rounded-sm2 border border-mn-soft-border bg-mn-soft px-[13px] py-2 text-[12.5px] font-semibold text-mn-muted-4 transition-colors duration-150 hover:bg-mn-card-alt">
              Voir tous
            </button>
          </div>
          <div className="mt-3.5 flex flex-col gap-1.5">
            {pointsAttention.map((point) => (
              <div key={point.title} className="flex items-center gap-3.5 border-b border-mn-row-border py-3.5 px-1.5 transition-colors duration-150 last:border-0 hover:bg-mn-table-head">
                <div
                  className={`flex h-[38px] w-[38px] flex-none items-center justify-center rounded-sm2 ${
                    point.tone === 'warning' ? 'bg-[#F4E9D7] text-warning-line' : 'bg-mn-card-alt text-mn-muted'
                  }`}
                >
                  {point.tone === 'warning' ? <AttentionWarningIcon /> : <AttentionNeutralIcon />}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold">{point.title}</div>
                  <div className="mt-0.5 text-[12.5px] font-medium text-mn-muted-2">{point.detail}</div>
                </div>
                <ChevronRightIcon />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
