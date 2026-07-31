import type { ChantierInput } from '@/types/chantier';

/**
 * Accès aux données Chantiers — Sprint 2 : stockage en mémoire, côté
 * serveur (perdu au redémarrage, partagé globalement). Sert
 * uniquement à isoler la lecture/écriture derrière ces fonctions, pour
 * que le futur branchement Google Sheets remplace uniquement cette
 * implémentation, sans toucher aux Server Actions ni à l'UI.
 *
 * Le store vit sur `globalThis` plutôt que dans une simple variable de
 * module : Next.js peut regrouper les Server Actions et les Server
 * Components dans des graphes de modules distincts en production,
 * chacun avec sa propre instance du module si on utilisait `let`. Sans
 * `globalThis`, une création via Server Action reste invisible du
 * rendu de la page (constaté : le compteur ne montait jamais après
 * création). `globalThis` est un singleton réellement partagé pour
 * tout le process Node — c'est le contournement standard pour ce
 * problème connu de Next.js.
 *
 * Aucun calcul ici : les colonnes dérivées restent la responsabilité
 * exclusive de `services/chantiers.ts` (moteur de calcul, inchangé).
 */

export type ChantierFormInput = Omit<ChantierInput, 'id'>;

interface ChantiersStore {
  items: ChantierInput[];
  nextId: number;
}

// Seed — mêmes données d'exemple qu'au Sprint 1. `nomChantier` n'existait
// pas encore : initialisé avec la valeur de `client` pour ces lignes
// historiques (voir README).
function seedChantiers(): ChantierInput[] {
  return [
    { id: 'chantier-1', client: 'Rénovation Paul Bert', nomChantier: 'Rénovation Paul Bert', prixVenduHT: 96500, fournituresHT: 24800, sousTraitantHT: 18200, apporteurHT: 3800, jours: 74 },
    { id: 'chantier-2', client: 'Maison D. Carteret', nomChantier: 'Maison D. Carteret', prixVenduHT: 48500, fournituresHT: 12400, sousTraitantHT: 8600, apporteurHT: 2400, jours: 42 },
    { id: 'chantier-3', client: 'Appartement Vavin', nomChantier: 'Appartement Vavin', prixVenduHT: 61200, fournituresHT: 19800, sousTraitantHT: 11400, apporteurHT: 2000, jours: 51 },
    { id: 'chantier-4', client: 'Maison Cesson', nomChantier: 'Maison Cesson', prixVenduHT: 33800, fournituresHT: 9200, sousTraitantHT: 5600, apporteurHT: 1200, jours: 29 },
    { id: 'chantier-5', client: 'Loft Montparnasse', nomChantier: 'Loft Montparnasse', prixVenduHT: 72400, fournituresHT: 21600, sousTraitantHT: 14800, apporteurHT: 3200, jours: 63 },
    { id: 'chantier-6', client: 'Atelier Sévigné', nomChantier: 'Atelier Sévigné', prixVenduHT: 28600, fournituresHT: 8800, sousTraitantHT: 4200, apporteurHT: 900, jours: 24 },
    { id: 'chantier-7', client: 'Penthouse Odéon', nomChantier: 'Penthouse Odéon', prixVenduHT: 118000, fournituresHT: 31200, sousTraitantHT: 22400, apporteurHT: 5400, jours: 88 },
    { id: 'chantier-8', client: 'Studio Bastille', nomChantier: 'Studio Bastille', prixVenduHT: 19400, fournituresHT: 6100, sousTraitantHT: 2800, apporteurHT: 600, jours: 17 },
  ];
}

const globalForChantiers = globalThis as unknown as { __chantiersStore?: ChantiersStore };

function getStore(): ChantiersStore {
  if (!globalForChantiers.__chantiersStore) {
    globalForChantiers.__chantiersStore = { items: seedChantiers(), nextId: 9 };
  }
  return globalForChantiers.__chantiersStore;
}

function generateId(store: ChantiersStore): string {
  const id = `chantier-${store.nextId}`;
  store.nextId += 1;
  return id;
}

export function listChantiers(): ChantierInput[] {
  return getStore().items;
}

export function getChantier(id: string): ChantierInput | undefined {
  return getStore().items.find((chantier) => chantier.id === id);
}

export function createChantier(input: ChantierFormInput): ChantierInput {
  const store = getStore();
  const chantier: ChantierInput = { id: generateId(store), ...input };
  store.items = [...store.items, chantier];
  return chantier;
}

export function updateChantier(id: string, input: ChantierFormInput): ChantierInput | undefined {
  const store = getStore();
  if (!store.items.some((chantier) => chantier.id === id)) return undefined;
  const updated: ChantierInput = { id, ...input };
  store.items = store.items.map((chantier) => (chantier.id === id ? updated : chantier));
  return updated;
}

export function deleteChantier(id: string): boolean {
  const store = getStore();
  const before = store.items.length;
  store.items = store.items.filter((chantier) => chantier.id !== id);
  return store.items.length < before;
}
