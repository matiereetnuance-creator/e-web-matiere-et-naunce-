import type { ChargeInput } from '@/types/charge';

/**
 * Accès aux données Charges — stockage en mémoire côté serveur
 * (perdu au redémarrage, partagé globalement), même approche que
 * `chantiers-repository.ts` (Sprint 2). Le store vit sur `globalThis` :
 * une simple variable de module ne survit pas de façon fiable à la
 * séparation Server Actions / Server Components de Next.js en
 * production (constaté au Sprint 2) — `globalThis` est un singleton
 * réellement partagé pour tout le process Node.
 *
 * Aucun calcul ici : Montant HT / TVA restent la responsabilité
 * exclusive de `services/charges.ts`.
 */

export type ChargeFormInput = Omit<ChargeInput, 'id'>;

interface ChargesStore {
  items: ChargeInput[];
  nextId: number;
}

// Seed — exemples illustratifs (placeholder, comme le reste du Sprint 1/2).
function seedCharges(): ChargeInput[] {
  return [
    { id: 'charge-1', date: '2024-01-05', categorie: 'Véhicules', motif: 'Leasing camionnette', montantTTC: 890, tauxTVA: 0.2, periodicite: 'Mensuelle', actif: true },
    { id: 'charge-2', date: '2024-01-10', categorie: 'Assurances', motif: 'Assurance décennale', montantTTC: 420, tauxTVA: 0, periodicite: 'Trimestrielle', actif: true },
    { id: 'charge-3', date: '2024-02-03', categorie: 'Fournitures', motif: 'Peinture et enduit', montantTTC: 2150, tauxTVA: 0.2, periodicite: 'Ponctuelle', actif: true },
    { id: 'charge-4', date: '2024-02-15', categorie: 'Charges fixes', motif: 'Loyer atelier', montantTTC: 1200, tauxTVA: 0.2, periodicite: 'Mensuelle', actif: true },
    { id: 'charge-5', date: '2024-03-01', categorie: 'Sous-traitance', motif: 'Renfort plâtrerie', montantTTC: 3600, tauxTVA: 0.1, periodicite: 'Ponctuelle', actif: true },
    { id: 'charge-6', date: '2024-01-20', categorie: 'Autres', motif: 'Abonnement logiciel devis', montantTTC: 59, tauxTVA: 0.2, periodicite: 'Mensuelle', actif: false },
  ];
}

const globalForCharges = globalThis as unknown as { __chargesStore?: ChargesStore };

function getStore(): ChargesStore {
  if (!globalForCharges.__chargesStore) {
    globalForCharges.__chargesStore = { items: seedCharges(), nextId: 7 };
  }
  return globalForCharges.__chargesStore;
}

function generateId(store: ChargesStore): string {
  const id = `charge-${store.nextId}`;
  store.nextId += 1;
  return id;
}

export function listCharges(): ChargeInput[] {
  return getStore().items;
}

export function getCharge(id: string): ChargeInput | undefined {
  return getStore().items.find((charge) => charge.id === id);
}

export function createCharge(input: ChargeFormInput): ChargeInput {
  const store = getStore();
  const charge: ChargeInput = { id: generateId(store), ...input };
  store.items = [...store.items, charge];
  return charge;
}

export function updateCharge(id: string, input: ChargeFormInput): ChargeInput | undefined {
  const store = getStore();
  if (!store.items.some((charge) => charge.id === id)) return undefined;
  const updated: ChargeInput = { id, ...input };
  store.items = store.items.map((charge) => (charge.id === id ? updated : charge));
  return updated;
}

export function deleteCharge(id: string): boolean {
  const store = getStore();
  const before = store.items.length;
  store.items = store.items.filter((charge) => charge.id !== id);
  return store.items.length < before;
}
