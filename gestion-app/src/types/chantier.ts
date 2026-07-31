export interface ChantierInput {
  id: string;
  client: string;
  // Distinct du client (raison sociale) : le nom/repère du chantier
  // lui-même. Sprint 2 : saisi et stocké, pas encore affiché en
  // colonne dans le tableau (cf. README).
  nomChantier: string;
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
