import { listChantiers } from '@/services/chantiers-repository';
import { computeChantier, computeChantiersTotals } from '@/services/chantiers';
import { ChantiersInteractive } from './ChantiersInteractive';

export async function ChantiersView() {
  const rows = (await listChantiers()).map(computeChantier);
  const totals = computeChantiersTotals(rows);

  return <ChantiersInteractive rows={rows} totals={totals} />;
}
