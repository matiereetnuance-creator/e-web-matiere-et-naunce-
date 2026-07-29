// Données d'exemple (placeholder) — Sprint 1. À remplacer par le
// service `charges` (Sprint 2), calculé à partir des charges actives
// stockées (Catégorie, Motif, Montant TTC, Taux TVA, Périodicité, Actif).

export const chargesParCategorie = [
  { label: 'Fournitures', pct: 32.1 },
  { label: 'Véhicules', pct: 18.4 },
  { label: 'Charges fixes', pct: 16.7 },
  { label: 'Sous-traitance', pct: 11.3 },
  { label: 'Assurances', pct: 7.6 },
  { label: 'Autres', pct: 13.9 },
];

export const chargesTotal = '262 k€';

export const chargesEvolutionMensuelle = [
  { mois: 'Jan', hauteurPct: 52, colorHex: '#DCD3C0' },
  { mois: 'Fév', hauteurPct: 64, colorHex: '#CBBEA4' },
  { mois: 'Mar', hauteurPct: 48, colorHex: '#DCD3C0' },
  { mois: 'Avr', hauteurPct: 72, colorHex: '#B6A585' },
  { mois: 'Mai', hauteurPct: 58, colorHex: '#CBBEA4' },
  { mois: 'Juin', hauteurPct: 66, colorHex: '#CBBEA4' },
  { mois: 'Juil', hauteurPct: 90, colorHex: '#8A7B60' },
  { mois: 'Août', hauteurPct: 76, colorHex: '#211E19' },
];

export const chargesParCategorieDetail = [
  { categorie: 'Fournitures', montant: '84 100 €', pctTotal: '32,1 %', evolution: '+8,7 %', tone: 'warning' as const, colorHex: '#211E19' },
  { categorie: 'Véhicules', montant: '48 200 €', pctTotal: '18,4 %', evolution: '+12,4 %', tone: 'warning' as const, colorHex: '#8A7B60' },
  { categorie: 'Charges fixes', montant: '43 750 €', pctTotal: '16,7 %', evolution: '+1,1 %', tone: 'neutral' as const, colorHex: '#B6A585' },
  { categorie: 'Sous-traitance', montant: '29 600 €', pctTotal: '11,3 %', evolution: '−4,2 %', tone: 'positive' as const, colorHex: '#CBBEA4' },
  { categorie: 'Assurances', montant: '19 900 €', pctTotal: '7,6 %', evolution: '+0,3 %', tone: 'neutral' as const, colorHex: '#DCD3C0' },
];
