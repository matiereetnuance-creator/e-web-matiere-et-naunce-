// Catégories déjà utilisées sur la page Charges (donut/tableau de
// synthèse Sprint 1) — aucune catégorie inventée pour ce module.
export const CHARGE_CATEGORIES = [
  'Fournitures',
  'Véhicules',
  'Charges fixes',
  'Sous-traitance',
  'Assurances',
  'Autres',
] as const;

export type ChargeCategorie = (typeof CHARGE_CATEGORIES)[number];

export const CHARGE_TAUX_TVA = [0, 0.055, 0.1, 0.2] as const;

export const CHARGE_PERIODICITES = ['Mensuelle', 'Trimestrielle', 'Annuelle', 'Ponctuelle'] as const;

export type ChargePeriodicite = (typeof CHARGE_PERIODICITES)[number];

export interface ChargeInput {
  id: string;
  date: string; // Date de prélèvement (YYYY-MM-DD)
  categorie: ChargeCategorie;
  motif: string;
  montantTTC: number;
  tauxTVA: number;
  periodicite: ChargePeriodicite;
  actif: boolean;
}

export interface ChargeComputed extends ChargeInput {
  montantHT: number;
  montantTVA: number;
}
