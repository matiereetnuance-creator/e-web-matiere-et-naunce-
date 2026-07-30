import { BarChart, ChartCard } from '@/components/charts';
import { fournituresVsMarge, margeParType, reperesRentabilite } from './data';

export function AnalysesView() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <ChartCard title="Marge moyenne par type">
          <div className="mt-[26px] flex flex-col gap-5">
            {margeParType.map((ligne) => (
              <div key={ligne.type}>
                <div className="mb-2.5 flex justify-between text-[13.5px] font-semibold">
                  <span>{ligne.type}</span>
                  <span className="tnum">{ligne.pct.toString().replace('.', ',')} %</span>
                </div>
                <div className="h-3 rounded-pill bg-mn-table-border">
                  <div
                    className="h-full rounded-pill"
                    style={{ width: `${ligne.largeurPct}%`, background: ligne.colorHex }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <div className="card-hover rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="font-serif-display text-[23px] font-semibold">Repères de rentabilité</div>
          <div className="mt-[22px] grid grid-cols-2 gap-4">
            {reperesRentabilite.map((repere) => (
              <div key={repere.label} className="rounded-[14px] bg-mn-soft p-[18px]">
                <div className="lbl">{repere.label}</div>
                <div className="font-serif-display tnum mt-1.5 text-[28px] font-semibold">{repere.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ChartCard
        title="Fournitures vs marge par chantier"
        footnote="Plus la part de fournitures est basse, plus la marge est élevée."
      >
        <BarChart
          className="mt-6"
          height={180}
          maxValue={100}
          groups={fournituresVsMarge.map((entree) => ({
            label: entree.client,
            values: [entree.fournituresPct, entree.margePct],
            colors: ['#CBBEA4', '#211E19'],
          }))}
          legend={[
            { label: 'Marge %', color: '#211E19' },
            { label: 'Fournitures %', color: '#CBBEA4' },
          ]}
        />
      </ChartCard>
    </div>
  );
}
