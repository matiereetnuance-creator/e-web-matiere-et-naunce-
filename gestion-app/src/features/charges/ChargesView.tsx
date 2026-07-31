import { BarChart, ChartCard, DonutChart } from '@/components/charts';
import { cn } from '@/lib/cn';
import { computeCharge, computeChargesTotals } from '@/services/charges';
import { listCharges } from '@/services/charges-repository';
import { chargesEvolutionMensuelle, chargesParCategorie, chargesParCategorieDetail, chargesTotal } from './data';
import { ChargesInteractive } from './ChargesInteractive';

const EVOLUTION_TONE_CLASS: Record<'warning' | 'neutral' | 'positive', string> = {
  warning: 'text-warning-line',
  neutral: 'text-mn-muted-2',
  positive: 'text-success-line',
};

export async function ChargesView() {
  const rows = listCharges().map(computeCharge);
  const totals = computeChargesTotals(rows);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[1fr_1.4fr] gap-5">
        <ChartCard title="Par catégorie">
          <DonutChart
            segments={chargesParCategorie}
            size={170}
            holeSize={104}
            align="center"
            className="mt-6 mb-2"
            center={
              <>
                <span className="lbl text-[10px]">Total</span>
                <span className="font-serif-display tnum text-[22px] font-semibold">{chargesTotal}</span>
              </>
            }
          />
        </ChartCard>

        <ChartCard title="Évolution mensuelle" action={<span className="text-[12.5px] font-medium text-mn-muted-2">2024</span>}>
          <BarChart
            className="mt-6"
            height={200}
            maxValue={100}
            groups={chargesEvolutionMensuelle.map((barre) => ({
              label: barre.mois,
              values: [barre.hauteurPct],
              colors: [barre.colorHex],
            }))}
          />
        </ChartCard>
      </div>

      <div className="card-hover overflow-hidden rounded-card border border-mn-card-border bg-mn-card shadow-card">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-mn-table-head px-[26px] py-4">
          <span className="lbl">Catégorie</span>
          <span className="lbl text-right">Montant</span>
          <span className="lbl text-right">% du total</span>
          <span className="lbl text-right">vs N-1</span>
        </div>
        {chargesParCategorieDetail.map((ligne) => (
          <div
            key={ligne.categorie}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-mn-row-border px-[26px] py-[15px] transition-colors duration-150 last:border-0 hover:bg-mn-table-head"
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

      <ChargesInteractive rows={rows} totals={totals} />
    </div>
  );
}
