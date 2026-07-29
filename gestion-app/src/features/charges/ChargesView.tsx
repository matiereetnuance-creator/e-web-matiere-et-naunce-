import { cn } from '@/lib/cn';
import { buildConicGradient } from '@/lib/charts';
import { chargesEvolutionMensuelle, chargesParCategorie, chargesParCategorieDetail, chargesTotal } from './data';

const EVOLUTION_TONE_CLASS: Record<'warning' | 'neutral' | 'positive', string> = {
  warning: 'text-warning-line',
  neutral: 'text-mn-muted-2',
  positive: 'text-success-line',
};

export function ChargesView() {
  const donutGradient = buildConicGradient(chargesParCategorie);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[1fr_1.4fr] gap-5">
        <div className="rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="font-serif-display text-[23px] font-semibold">Par catégorie</div>
          <div className="mt-6 mb-2 flex justify-center">
            <div className="flex h-[170px] w-[170px] items-center justify-center rounded-full" style={{ background: donutGradient }}>
              <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-mn-card">
                <span className="lbl text-[10px]">Total</span>
                <span className="font-serif-display tnum text-[22px] font-semibold">{chargesTotal}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="flex items-start justify-between">
            <div className="font-serif-display text-[23px] font-semibold">Évolution mensuelle</div>
            <span className="text-[12.5px] font-medium text-mn-muted-2">2024</span>
          </div>
          <div className="mt-6 flex h-[200px] items-end gap-3">
            {chargesEvolutionMensuelle.map((barre) => (
              <div key={barre.mois} className="flex h-full flex-1 flex-col items-center justify-end gap-2.5">
                <div
                  className="w-[60%] rounded-t-[5px]"
                  style={{ height: `${barre.hauteurPct}%`, background: barre.colorHex }}
                />
                <span className="text-[11px] font-medium text-mn-label-2">{barre.mois}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-mn-card-border bg-mn-card shadow-card">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-mn-table-head px-[26px] py-4">
          <span className="lbl">Catégorie</span>
          <span className="lbl text-right">Montant</span>
          <span className="lbl text-right">% du total</span>
          <span className="lbl text-right">vs N-1</span>
        </div>
        {chargesParCategorieDetail.map((ligne) => (
          <div
            key={ligne.categorie}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-mn-row-border px-[26px] py-[15px] last:border-0"
          >
            <span className="flex items-center gap-[11px] text-[14px] font-semibold">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: ligne.colorHex }} />
              {ligne.categorie}
            </span>
            <span className="tnum text-right text-[13.5px] font-semibold">{ligne.montant}</span>
            <span className="tnum text-right text-[13.5px] text-mn-muted-3">{ligne.pctTotal}</span>
            <span className={cn('tnum text-right text-[13px] font-semibold', EVOLUTION_TONE_CLASS[ligne.tone])}>
              {ligne.evolution}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
