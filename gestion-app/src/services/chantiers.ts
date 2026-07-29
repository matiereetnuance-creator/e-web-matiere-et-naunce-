import type { ChantierComputed, ChantierInput } from '@/types/chantier';

/**
 * Moteur de calcul Chantiers — s'exécute côté application (jamais dans
 * Google Sheets, cf. Blueprint Technique §4). Google Sheets ne sert
 * qu'au stockage des colonnes saisies (Client, Prix vendu HT,
 * Fournitures HT, Sous-traitant HT, Apporteur HT, Jours) ; les colonnes
 * calculées (Coût total HT, Marge € HT, Marge %, €/Jour, % Fournitures)
 * sont dérivées ici, jamais éditables par l'utilisateur.
 */
export function computeChantier(input: ChantierInput): ChantierComputed {
  const coutTotalHT = input.fournituresHT + input.sousTraitantHT + input.apporteurHT;
  const margeHT = input.prixVenduHT - coutTotalHT;
  const margePct = input.prixVenduHT === 0 ? 0 : margeHT / input.prixVenduHT;
  const eurParJour = input.jours === 0 ? 0 : input.prixVenduHT / input.jours;
  const pctFournitures = input.prixVenduHT === 0 ? 0 : input.fournituresHT / input.prixVenduHT;

  return { ...input, coutTotalHT, margeHT, margePct, eurParJour, pctFournitures };
}

export function computeChantiersTotals(rows: ChantierComputed[]): ChantierComputed {
  const sum = (key: keyof ChantierInput | 'coutTotalHT' | 'margeHT') =>
    rows.reduce((total, row) => total + (row[key] as number), 0);

  const prixVenduHT = sum('prixVenduHT');
  const fournituresHT = sum('fournituresHT');
  const sousTraitantHT = sum('sousTraitantHT');
  const apporteurHT = sum('apporteurHT');
  const coutTotalHT = sum('coutTotalHT');
  const margeHT = sum('margeHT');
  const jours = sum('jours');

  return {
    client: 'Total',
    prixVenduHT,
    fournituresHT,
    sousTraitantHT,
    apporteurHT,
    jours,
    coutTotalHT,
    margeHT,
    margePct: prixVenduHT === 0 ? 0 : margeHT / prixVenduHT,
    eurParJour: jours === 0 ? 0 : prixVenduHT / jours,
    pctFournitures: prixVenduHT === 0 ? 0 : fournituresHT / prixVenduHT,
  };
}

export type MargeNiveau = 'success' | 'warning' | 'error';

export function margeNiveau(margePct: number): MargeNiveau {
  if (margePct >= 0.5) return 'success';
  if (margePct >= 0.4) return 'warning';
  return 'error';
}
