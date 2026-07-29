// Données d'exemple (placeholder) — Sprint 1. À remplacer par le
// service `finance` (Sprint 2) branché sur Base_Calculs / Google Sheets.

export const santeFinanciere = {
  statut: 'Rentable' as const,
  depassementSeuil: '330 160 €',
  seuilRentabilite: '512 400 €',
  caRealise: '842 560 €',
  seuilAtteintPct: 60.8,
};

export const santeCartes = [
  { label: 'Charges fixes mensuelles', value: '12 540 €', note: 'Loyers, assurances, abonnements' },
  { label: 'Charges fixes annuelles', value: '150 480 €', note: 'Projection sur 12 mois' },
  { label: 'Fournitures', value: '28,0 %', note: 'Part moyenne du chiffre d’affaires' },
  { label: 'Taux moyen de marge', value: '31,2 %', note: 'Sur chantiers terminés' },
  { label: 'CA minimum mensuel', value: '42 700 €', note: 'Pour couvrir vos charges' },
  { label: 'CA minimum annuel', value: '512 400 €', note: 'Votre seuil de rentabilité', accent: true },
];
