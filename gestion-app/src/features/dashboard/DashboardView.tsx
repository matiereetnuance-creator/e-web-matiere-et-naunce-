import Link from 'next/link';
import { ChartCard, DonutChart, PeriodChip } from '@/components/charts';
import { KpiCard } from '@/components/ui/KpiCard';
import { computeChantier } from '@/services/chantiers';
import { listChantiers } from '@/services/chantiers-repository';
import { computeCharge } from '@/services/charges';
import { listCharges } from '@/services/charges-repository';
import { computeDashboardData } from '@/services/dashboard';
import { AttentionNeutralIcon, AttentionWarningIcon, CaIcon, ChargesMoisIcon, ChevronRightIcon, MargeIcon, ResultatIcon } from './icons';

export async function DashboardView() {
  const chantiers = listChantiers().map(computeChantier);
  const charges = listCharges().map(computeCharge);
  const data = computeDashboardData(chantiers, charges);

  return (
    <div className="flex flex-col gap-5">
      <div className="stagger-children grid grid-cols-4 gap-5">
        <KpiCard
          icon={<CaIcon />}
          label="Chiffre d'affaires réalisé"
          value={data.kpis.caRealise.value}
          trend={{ value: data.kpis.caRealise.trendValue, direction: 'up', comparisonLabel: 'vs N-1' }}
        />
        <KpiCard
          icon={<MargeIcon />}
          label="Marge moyenne"
          value={data.kpis.margeMoyenne.value}
          trend={{ value: data.kpis.margeMoyenne.trendValue, direction: 'up', comparisonLabel: 'vs N-1' }}
        />
        <KpiCard
          icon={<ResultatIcon />}
          label="Résultat prévisionnel"
          value={data.kpis.resultatPrevisionnel.value}
          trend={{ value: data.kpis.resultatPrevisionnel.trendValue, direction: 'up', comparisonLabel: 'vs N-1' }}
        />
        <KpiCard
          icon={<ChargesMoisIcon />}
          label="Charges du mois"
          value={data.kpis.chargesDuMois.value}
          trend={{ value: data.kpis.chargesDuMois.trendValue, direction: 'down', comparisonLabel: 'vs N-1' }}
        />
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-5">
        <ChartCard title="Évolution du chiffre d'affaires" action={<PeriodChip label="Cette année" />}>
          <div className="flex h-[262px] flex-col items-center justify-center gap-1.5 text-center">
            <span className="text-[14px] font-semibold text-mn-ink-3">Données indisponibles</span>
            <span className="max-w-[320px] text-[12.5px] font-medium text-mn-muted-2">{data.caEvolutionIndisponibleRaison}</span>
          </div>
        </ChartCard>

        <ChartCard title="Répartition des charges" action={<PeriodChip label="Cette année" />}>
          <DonutChart segments={data.chargesRepartition} legend className="mt-[22px]" />
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
          {data.chantiersRentables.map((row) => (
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
            {data.pointsAttention.map((point) => (
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
