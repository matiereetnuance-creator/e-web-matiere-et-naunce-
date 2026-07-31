import { appsScriptGet, appsScriptPost } from '@/lib/apps-script-client';
import type { ChantierInput } from '@/types/chantier';

/**
 * Accès aux données Chantiers — Sprint 6 : client de l'API Apps
 * Script (Google Sheets comme base de données, feuille "Chantiers").
 * Interface exportée strictement identique à celle du Sprint 2 (mêmes
 * fonctions, mêmes types) — seule l'implémentation interne change
 * (HTTP au lieu de `globalThis`), d'où le passage en async.
 *
 * Aucun calcul ici : les colonnes dérivées restent la responsabilité
 * exclusive de `services/chantiers.ts` (moteur de calcul, inchangé).
 */

export type ChantierFormInput = Omit<ChantierInput, 'id'>;

export function listChantiers(): Promise<ChantierInput[]> {
  return appsScriptGet<ChantierInput[]>('chantiers');
}

export function getChantier(id: string): Promise<ChantierInput | null> {
  return appsScriptGet<ChantierInput | null>('chantiers', { id });
}

export function createChantier(input: ChantierFormInput): Promise<ChantierInput> {
  return appsScriptPost<ChantierInput>('chantiers', 'create', { data: input });
}

export async function updateChantier(id: string, input: ChantierFormInput): Promise<ChantierInput | undefined> {
  try {
    return await appsScriptPost<ChantierInput>('chantiers', 'update', { id, data: input });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not_found')) return undefined;
    throw error;
  }
}

export async function deleteChantier(id: string): Promise<boolean> {
  try {
    await appsScriptPost<null>('chantiers', 'delete', { id });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not_found')) return false;
    throw error;
  }
}
