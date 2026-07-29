export interface ChantierInput {
  client: string;
  prixVenduHT: number;
  fournituresHT: number;
  sousTraitantHT: number;
  apporteurHT: number;
  jours: number;
}

export interface ChantierComputed extends ChantierInput {
  coutTotalHT: number;
  margeHT: number;
  margePct: number;
  eurParJour: number;
  pctFournitures: number;
}
