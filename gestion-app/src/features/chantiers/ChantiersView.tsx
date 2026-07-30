import { Badge } from '@/components/ui/Badge';
import { Table, type TableColumn } from '@/components/ui/Table';
import { formatEuro, formatRatioPct } from '@/lib/format';
import { computeChantier, computeChantiersTotals, margeNiveau } from '@/services/chantiers';
import type { ChantierComputed } from '@/types/chantier';
import { chantiersRaw } from './data';

const columns: Array<TableColumn<ChantierComputed>> = [
  { key: 'client', header: 'Client', sticky: true, render: (r) => r.client, footer: 'Total' },
  { key: 'prix', header: 'Prix vendu HT', align: 'right', render: (r) => formatEuro(r.prixVenduHT) },
  { key: 'fournitures', header: 'Fournitures HT', align: 'right', render: (r) => formatEuro(r.fournituresHT) },
  { key: 'soustraitant', header: 'Sous-traitant HT', align: 'right', render: (r) => formatEuro(r.sousTraitantHT) },
  { key: 'apporteur', header: 'Apporteur HT', align: 'right', render: (r) => formatEuro(r.apporteurHT) },
  { key: 'cout', header: 'Coût total HT', align: 'right', render: (r) => formatEuro(r.coutTotalHT) },
  { key: 'marge', header: 'Marge (€ HT)', align: 'right', render: (r) => formatEuro(r.margeHT) },
  {
    key: 'margePct',
    header: 'Marge (%)',
    align: 'right',
    render: (r) => <Badge variant={margeNiveau(r.margePct)}>{formatRatioPct(r.margePct)}</Badge>,
  },
  { key: 'jours', header: 'Jours', align: 'right', render: (r) => r.jours },
  { key: 'eurJour', header: '€/Jour', align: 'right', render: (r) => formatEuro(r.eurParJour) },
  { key: 'pctFournitures', header: '% Fournitures', align: 'right', render: (r) => formatRatioPct(r.pctFournitures) },
];

export function ChantiersView() {
  const rows = chantiersRaw.map(computeChantier);
  const totals = computeChantiersTotals(rows);

  const columnsWithFooter = columns.map((column) => {
    switch (column.key) {
      case 'prix':
        return { ...column, footer: formatEuro(totals.prixVenduHT) };
      case 'fournitures':
        return { ...column, footer: formatEuro(totals.fournituresHT) };
      case 'soustraitant':
        return { ...column, footer: formatEuro(totals.sousTraitantHT) };
      case 'apporteur':
        return { ...column, footer: formatEuro(totals.apporteurHT) };
      case 'cout':
        return { ...column, footer: formatEuro(totals.coutTotalHT) };
      case 'marge':
        return { ...column, footer: formatEuro(totals.margeHT) };
      case 'margePct':
        return { ...column, footer: formatRatioPct(totals.margePct) };
      case 'jours':
        return { ...column, footer: totals.jours };
      case 'eurJour':
        return { ...column, footer: formatEuro(totals.eurParJour) };
      case 'pctFournitures':
        return { ...column, footer: formatRatioPct(totals.pctFournitures) };
      default:
        return column;
    }
  });

  return (
    <div className="card-hover overflow-hidden rounded-card border border-mn-card-border bg-mn-card shadow-card">
      <div className="flex items-center gap-3 px-[26px] pb-[18px] pt-[22px]">
        <div className="font-serif-display text-[20px] font-semibold">{rows.length} chantiers terminés</div>
        <div className="flex-1" />
        <button
          type="button"
          className="flex items-center gap-[7px] rounded-sm2 border border-mn-soft-border bg-mn-soft px-[13px] py-2.5 text-[13px] font-semibold text-mn-muted-4 transition-colors duration-150 hover:bg-mn-card-alt"
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M3 5.5h14M6 10h8M9 14.5h2" />
          </svg>
          Filtrer
        </button>
      </div>
      <Table columns={columnsWithFooter} rows={rows} getRowKey={(row) => row.client} showFooter />
    </div>
  );
}
