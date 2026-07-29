// Données d'exemple (placeholder) — Sprint 1 : affichage seul, pas de
// persistance. La sauvegarde réelle (Google Sheets, feuille
// Configuration) est un développement de Sprint 2.

export const objectifs = [
  { label: 'Objectif annuel de CA', value: '1 250 000', unit: '€' },
  { label: 'Taux de marge cible', value: '31', unit: '%' },
];

export const hypotheses = [
  { label: 'Charges fixes mensuelles', value: '12 540', unit: '€' },
  { label: 'Part fournitures de référence', value: '28', unit: '%' },
];

export const preferencesAffichage = [
  { label: 'Arrondir les montants', description: 'Masquer les décimales', actif: true },
  { label: 'Comparaison N-1', description: 'Afficher les évolutions annuelles', actif: true },
];
