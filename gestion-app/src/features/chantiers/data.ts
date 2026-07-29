import type { ChantierInput } from '@/types/chantier';

// Données d'exemple (placeholder) — Sprint 1 : saisies brutes, en
// attendant le branchement réel sur Google Sheets (Sprint 2). Les
// colonnes calculées ne sont jamais stockées ici : elles sont dérivées
// par `computeChantier()` (src/services/chantiers.ts).
export const chantiersRaw: ChantierInput[] = [
  { client: 'Rénovation Paul Bert', prixVenduHT: 96500, fournituresHT: 24800, sousTraitantHT: 18200, apporteurHT: 3800, jours: 74 },
  { client: 'Maison D. Carteret', prixVenduHT: 48500, fournituresHT: 12400, sousTraitantHT: 8600, apporteurHT: 2400, jours: 42 },
  { client: 'Appartement Vavin', prixVenduHT: 61200, fournituresHT: 19800, sousTraitantHT: 11400, apporteurHT: 2000, jours: 51 },
  { client: 'Maison Cesson', prixVenduHT: 33800, fournituresHT: 9200, sousTraitantHT: 5600, apporteurHT: 1200, jours: 29 },
  { client: 'Loft Montparnasse', prixVenduHT: 72400, fournituresHT: 21600, sousTraitantHT: 14800, apporteurHT: 3200, jours: 63 },
  { client: 'Atelier Sévigné', prixVenduHT: 28600, fournituresHT: 8800, sousTraitantHT: 4200, apporteurHT: 900, jours: 24 },
  { client: 'Penthouse Odéon', prixVenduHT: 118000, fournituresHT: 31200, sousTraitantHT: 22400, apporteurHT: 5400, jours: 88 },
  { client: 'Studio Bastille', prixVenduHT: 19400, fournituresHT: 6100, sousTraitantHT: 2800, apporteurHT: 600, jours: 17 },
];
