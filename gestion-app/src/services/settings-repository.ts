import type { SettingsInput } from '@/types/settings';

/**
 * Accès aux données Paramètres — Sprint 5. Même approche que les autres
 * repositories (`globalThis`, singleton réellement partagé pour tout le
 * process Node — cf. chantiers-repository.ts pour le détail du
 * contournement Next.js). Ici une fiche unique (pas de liste) : pas
 * d'id, seulement lecture et mise à jour.
 */

const DEFAULT_SETTINGS: SettingsInput = {
  objectifAnnuelCA: 1250000,
  tauxMargeCible: 31,
  chargesFixesMensuelles: 12540,
  partFournituresReference: 28,
  arrondirMontants: true,
  comparaisonN1: true,
};

const globalForSettings = globalThis as unknown as { __settingsStore?: SettingsInput };

function getStore(): SettingsInput {
  if (!globalForSettings.__settingsStore) {
    globalForSettings.__settingsStore = { ...DEFAULT_SETTINGS };
  }
  return globalForSettings.__settingsStore;
}

export function getSettings(): SettingsInput {
  return getStore();
}

export function updateSettings(input: SettingsInput): SettingsInput {
  globalForSettings.__settingsStore = input;
  return input;
}
