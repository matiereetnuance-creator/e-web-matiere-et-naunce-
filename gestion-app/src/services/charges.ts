import type { ChargeComputed, ChargeInput } from '@/types/charge';

/**
 * Moteur de calcul Charges — s'exécute côté application (jamais dans
 * Google Sheets, cf. Blueprint Technique §4). Montant HT et TVA sont
 * dérivés du Montant TTC saisi et du Taux TVA, jamais éditables
 * directement par l'utilisateur.
 */
export function computeCharge(input: ChargeInput): ChargeComputed {
  const montantHT = input.montantTTC / (1 + input.tauxTVA);
  const montantTVA = input.montantTTC - montantHT;

  return { ...input, montantHT, montantTVA };
}

export function computeChargesTotals(rows: ChargeComputed[]): { montantTTC: number; montantHT: number; montantTVA: number } {
  return rows.reduce(
    (totals, row) => ({
      montantTTC: totals.montantTTC + row.montantTTC,
      montantHT: totals.montantHT + row.montantHT,
      montantTVA: totals.montantTVA + row.montantTVA,
    }),
    { montantTTC: 0, montantHT: 0, montantTVA: 0 },
  );
}
