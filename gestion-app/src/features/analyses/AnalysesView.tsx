import { fournituresVsMarge, margeParType, reperesRentabilite } from './data';

export function AnalysesView() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
          <div className="font-serif-display text-[23px] font-semibold">Marge moyenne par type</div>
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
        </div>

        <div className="rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
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

      <div className="rounded-card border border-mn-card-border bg-mn-card p-[26px] px-7 shadow-card">
        <div className="font-serif-display text-[23px] font-semibold">Fournitures vs marge par chantier</div>
        <p className="mt-1.5 text-[13.5px] font-medium text-mn-muted-2">
          Plus la part de fournitures est basse, plus la marge est élevée.
        </p>
        <div className="mt-6 flex h-[180px] items-end gap-[18px]">
          {fournituresVsMarge.map((entree) => (
            <div key={entree.client} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-full w-full items-end gap-1.5">
                <div className="flex-1 rounded-t bg-chart-4" style={{ height: `${entree.fournituresPct}%` }} />
                <div className="flex-1 rounded-t bg-mn-ink" style={{ height: `${entree.margePct}%` }} />
              </div>
              <span className="text-center text-[10.5px] font-medium text-mn-label-2">{entree.client}</span>
            </div>
          ))}
        </div>
        <div className="mt-[18px] flex gap-[22px]">
          <span className="flex items-center gap-2 text-[12.5px] font-semibold text-mn-ink-3">
            <span className="h-3 w-3 rounded-[3px] bg-mn-ink" />
            Marge %
          </span>
          <span className="flex items-center gap-2 text-[12.5px] font-semibold text-mn-muted">
            <span className="h-3 w-3 rounded-[3px] bg-chart-4" />
            Fournitures %
          </span>
        </div>
      </div>
    </div>
  );
}
