import { cn } from '@/lib/cn';
import { santeCartes, santeFinanciere } from './data';

export function FinanceView() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[1fr_1.3fr] items-center gap-10 rounded-card bg-mn-hero p-[34px] px-[38px] text-mn-hero-fg shadow-hero">
        <div>
          <div className="inline-flex items-center gap-2 rounded-pill bg-success-line/[0.22] px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#A9BCA0]">
            <span className="h-[7px] w-[7px] rounded-full bg-success-line2" />
            {santeFinanciere.statut}
          </div>
          <div className="font-serif-display mt-[18px] text-[30px] font-medium leading-[1.15] text-[#F4EFE4]">
            Vous avez dépassé votre seuil de rentabilité de{' '}
            <span className="text-success-line2">{santeFinanciere.depassementSeuil}</span>.
          </div>
          <p className="mt-3.5 text-[14px] font-medium leading-[1.55] text-mn-hero-muted">
            Chaque euro facturé au-delà de ce seuil contribue directement à votre résultat.
          </p>
        </div>
        <div className="rounded-[16px] border border-white/[0.09] bg-white/[0.04] p-[26px] px-7">
          <div className="flex items-end justify-between">
            <div>
              <div className="lbl text-mn-hero-label">Seuil de rentabilité</div>
              <div className="font-serif-display tnum mt-1 text-[34px] font-semibold text-[#F4EFE4]">
                {santeFinanciere.seuilRentabilite}
              </div>
            </div>
            <div className="text-right">
              <div className="lbl text-mn-hero-label">CA réalisé</div>
              <div className="font-serif-display tnum mt-1 text-[34px] font-semibold text-success-line2">
                {santeFinanciere.caRealise}
              </div>
            </div>
          </div>
          <div className="relative mt-[22px] h-2.5 overflow-hidden rounded-pill bg-white/10">
            <div className="absolute inset-0 w-full rounded-pill bg-gradient-to-r from-success-line to-success-line2" />
          </div>
          <div className="relative mt-2 h-4">
            <span
              className="absolute -translate-x-1/2 text-[11px] font-semibold text-[#C9BFAD]"
              style={{ left: `${santeFinanciere.seuilAtteintPct}%` }}
            >
              seuil · {santeFinanciere.seuilAtteintPct.toString().replace('.', ',')} %
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {santeCartes.map((carte) => (
          <div
            key={carte.label}
            className={cn(
              'rounded-card border p-[26px] shadow-card',
              carte.accent ? 'bg-mn-card-alt border-mn-card-alt-border' : 'bg-mn-card border-mn-card-border',
            )}
          >
            <div className="lbl">{carte.label}</div>
            <div className="font-serif-display tnum mt-2 text-[34px] font-semibold">{carte.value}</div>
            <div className="mt-2 text-[13px] font-medium text-mn-muted-2">{carte.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
