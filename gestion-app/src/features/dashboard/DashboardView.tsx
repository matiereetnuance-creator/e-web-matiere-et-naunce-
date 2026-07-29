import Link from 'next/link';
import { KpiCard } from '@/components/ui/KpiCard';
import { buildConicGradient, formatPct, paletteAt } from '@/lib/charts';
import { chantiersRentables, chargesRepartition, dashboardKpis, pointsAttention } from './data';
import { AttentionNeutralIcon, AttentionWarningIcon, CaIcon, ChargesMoisIcon, ChevronRightIcon, MargeIcon, ResultatIcon } from './icons';

export function DashboardView() {
  const donutGradient = buildConicGradient(chargesRepartition);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-5">
        <KpiCard icon={<CaIcon />} label="Chiffre d'affaires réalisé" value={dashboardKpis.caRealise.value} trend={{ value: dashboardKpis.caRealise.trendValue, direction: 'up', comparisonLabel: 'vs N-1' }} />
        <KpiCard icon={<MargeIcon />} label="Marge moyenne" value={dashboardKpis.margeMoyenne.value} trend={{ value: dashboardKpis.margeMoyenne.trendValue, direction: 'up', comparisonLabel: 'vs N-1' }} />
        <KpiCard icon={<ResultatIcon />} label="Résultat prévisionnel" value={dashboardKpis.resultatPrevisionnel.value} trend={{ value: dashboardKpis.resultatPrevisionnel.trendValue, direction: 'up', comparisonLabel: 'vs N-1' }} />
        <KpiCard icon={<ChargesMoisIcon />} label="Charges du mois" value={dashboardKpis.chargesDuMois.value} trend={{ value: dashboardKpis.chargesDuMois.trendValue, direction: 'down', comparisonLabel: 'vs N-1' }} />
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-5">
        <div className="rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="flex items-start justify-between">
            <div className="font-serif-display text-[23px] font-semibold">Évolution du chiffre d&apos;affaires</div>
            <button type="button" className="flex items-center gap-2 rounded-sm2 border border-mn-soft-border bg-mn-soft px-3 py-[7px] text-[12.5px] font-semibold text-mn-muted-4">
              Cette année
              <ChevronRightIcon />
            </button>
          </div>
          <div className="mt-4 flex gap-[22px] text-[12.5px] font-semibold">
            <span className="flex items-center gap-2 text-mn-ink-3">
              <span className="h-[3px] w-5 rounded bg-mn-ink" />
              CA réalisé
            </span>
            <span className="flex items-center gap-2 text-[#9A6E2E]">
              <span className="h-0 w-5 border-t-[3px] border-dashed border-[#B98A3E]" />
              CA en cours
            </span>
            <span className="flex items-center gap-2 text-mn-muted">
              <span className="h-0 w-5 border-t-2 border-dotted border-mn-label-2" />
              Objectif annuel
            </span>
          </div>
          <div className="relative mt-5">
            <svg viewBox="0 0 560 210" className="block h-[210px] w-full" preserveAspectRatio="none">
              <line x1="0" y1="4" x2="560" y2="4" stroke="#F0EADF" strokeWidth="1" />
              <line x1="0" y1="45" x2="560" y2="45" stroke="#F0EADF" strokeWidth="1" />
              <line x1="0" y1="86" x2="560" y2="86" stroke="#F0EADF" strokeWidth="1" />
              <line x1="0" y1="127" x2="560" y2="127" stroke="#F0EADF" strokeWidth="1" />
              <line x1="0" y1="168" x2="560" y2="168" stroke="#F0EADF" strokeWidth="1" />
              <line x1="0" y1="205" x2="560" y2="205" stroke="#EAE1D0" strokeWidth="1" />
              <path d="M20 250 L580 6" stroke="#B9AF98" strokeWidth="1.6" strokeDasharray="1 5" strokeLinecap="round" fill="none" transform="scale(1,0.82) translate(0,0)" />
              <path d="M20 199 L71 186 L122 172 L172 157 L223 141 L274 123 L325 99 L376 74" fill="none" stroke="#211E19" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M376 74 L427 60 L478 47 L529 36" fill="none" stroke="#C3B597" strokeWidth="2.6" strokeDasharray="7 6" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx="376" cy="74" r="4.5" fill="#211E19" />
              <circle cx="376" cy="74" r="8" fill="none" stroke="#211E19" strokeOpacity=".18" strokeWidth="2" />
            </svg>
            <div className="absolute left-[44%] top-0.5 rounded-sm2 border border-mn-border bg-mn-card px-[13px] py-2.5 shadow-popover">
              <div className="font-serif-display tnum text-[18px] font-semibold leading-none">842 560 €</div>
              <div className="mt-0.5 text-[11px] font-medium text-mn-label">réalisé à ce jour</div>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-medium text-mn-label-2">
            {['Janv.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="flex items-start justify-between">
            <div className="font-serif-display text-[23px] font-semibold">Répartition des charges</div>
            <button type="button" className="flex items-center gap-2 rounded-sm2 border border-mn-soft-border bg-mn-soft px-3 py-[7px] text-[12.5px] font-semibold text-mn-muted-4">
              Cette année
              <ChevronRightIcon />
            </button>
          </div>
          <div className="mt-[22px] flex items-center gap-[26px]">
            <div
              className="flex h-[150px] w-[150px] flex-none items-center justify-center rounded-full"
              style={{ background: donutGradient }}
            >
              <div className="h-[88px] w-[88px] rounded-full bg-mn-card" />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {chargesRepartition.map((segment, index) => (
                <div key={segment.label} className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-[3px] ${paletteAt(index).twBg}`} />
                  <span className="flex-1 text-[13.5px] font-medium text-mn-ink-2">{segment.label}</span>
                  <span className="tnum text-[13.5px] font-semibold">{formatPct(segment.pct)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1.55fr_1fr] gap-5">
        <div className="rounded-card border border-mn-card-border bg-mn-card px-7 pb-3 pt-[26px] shadow-card">
          <div className="flex items-center justify-between">
            <div className="font-serif-display text-[23px] font-semibold">Chantiers les plus rentables</div>
            <Link href="/chantiers" className="rounded-sm2 border border-mn-soft-border bg-mn-soft px-[13px] py-2 text-[12.5px] font-semibold text-mn-muted-4">
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
            <div key={row.client} className="grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr] items-center border-b border-mn-row-border px-0.5 py-3.5 last:border-0">
              <span className="text-[14px] font-semibold">{row.client}</span>
              <span className="text-[13.5px] font-medium text-mn-muted">{row.type}</span>
              <span className="tnum text-right text-[13.5px] font-semibold">{row.marge}</span>
              <span className="tnum text-right text-[13.5px] font-semibold text-success-line">{row.margePct}</span>
              <span className="tnum text-right text-[13.5px] font-semibold text-mn-ink-3">{row.eurJour}</span>
            </div>
          ))}
        </div>

        <div className="rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="flex items-center justify-between">
            <div className="font-serif-display text-[23px] font-semibold">Points d&apos;attention</div>
            <button type="button" className="rounded-sm2 border border-mn-soft-border bg-mn-soft px-[13px] py-2 text-[12.5px] font-semibold text-mn-muted-4">
              Voir tous
            </button>
          </div>
          <div className="mt-3.5 flex flex-col gap-1.5">
            {pointsAttention.map((point) => (
              <div key={point.title} className="flex items-center gap-3.5 border-b border-mn-row-border py-3.5 px-1.5 last:border-0">
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
