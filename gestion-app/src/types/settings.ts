export interface SettingsInput {
  objectifAnnuelCA: number;
  // Pourcentages exprimés sur une échelle 0-100 (comme DonutSegment.pct),
  // jamais en ratio 0-1.
  tauxMargeCible: number;
  chargesFixesMensuelles: number;
  partFournituresReference: number;
  arrondirMontants: boolean;
  comparaisonN1: boolean;
}
