// Données d'exemple (placeholder) — Sprint 1 : aucune connexion à
// Google Sheets. À remplacer par le service `finance` (Sprint 2) une
// fois le stockage réel branché. Cf. TODO Sprint 2.

export const dashboardKpis = {
  caRealise: { value: '842 560 €', trendValue: '17,6 %' },
  margeMoyenne: { value: '31,2 %', trendValue: '2,8 pts' },
  resultatPrevisionnel: { value: '146 850 €', trendValue: '24,1 %' },
  chargesDuMois: { value: '12 540 €', trendValue: '3,4 %' },
};

export const chargesRepartition = [
  { label: 'Fournitures', pct: 32.1 },
  { label: 'Véhicules', pct: 18.4 },
  { label: 'Charges fixes', pct: 16.7 },
  { label: 'Sous-traitance', pct: 11.3 },
  { label: 'Assurances', pct: 7.6 },
  { label: 'Autres', pct: 13.9 },
];

export const chantiersRentables = [
  { client: 'Rénovation Paul Bert', type: 'Rénovation', marge: '28 450 €', margePct: '34,2 %', eurJour: '284 €' },
  { client: 'Maison D. Carteret', type: 'Neuf', marge: '22 130 €', margePct: '29,1 %', eurJour: '246 €' },
  { client: 'Appartement Vavin', type: 'Rénovation', marge: '18 990 €', margePct: '33,7 %', eurJour: '271 €' },
  { client: 'Maison Cesson', type: 'Neuf', marge: '15 680 €', margePct: '28,4 %', eurJour: '223 €' },
  { client: 'Loft Montparnasse', type: 'Rénovation', marge: '14 220 €', margePct: '31,5 %', eurJour: '236 €' },
];

export const pointsAttention = [
  { title: 'Charges de véhicules', detail: '+12,4 % par rapport au mois dernier', tone: 'warning' as const },
  { title: '3 chantiers sans marge renseignée', detail: 'Pensez à compléter vos données', tone: 'neutral' as const },
  { title: 'Fournitures en hausse', detail: '+8,7 % par rapport au mois dernier', tone: 'warning' as const },
];
