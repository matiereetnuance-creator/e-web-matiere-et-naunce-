import { appsScriptGet, appsScriptPost } from '@/lib/apps-script-client';
import type { ChargeInput } from '@/types/charge';

/**
 * Accès aux données Charges — Sprint 6 : client de l'API Apps Script
 * (Google Sheets comme base de données, feuille "Charges"). Interface
 * exportée strictement identique à celle du Sprint 3 (mêmes fonctions,
 * mêmes types) — seule l'implémentation interne change (HTTP au lieu
 * de `globalThis`), d'où le passage en async.
 *
 * Aucun calcul ici : Montant HT / TVA restent la responsabilité
 * exclusive de `services/charges.ts`.
 */

export type ChargeFormInput = Omit<ChargeInput, 'id'>;

export function listCharges(): Promise<ChargeInput[]> {
  return appsScriptGet<ChargeInput[]>('charges');
}

export function getCharge(id: string): Promise<ChargeInput | null> {
  return appsScriptGet<ChargeInput | null>('charges', { id });
}

export function createCharge(input: ChargeFormInput): Promise<ChargeInput> {
  return appsScriptPost<ChargeInput>('charges', 'create', { data: input });
}

export async function updateCharge(id: string, input: ChargeFormInput): Promise<ChargeInput | undefined> {
  try {
    return await appsScriptPost<ChargeInput>('charges', 'update', { id, data: input });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not_found')) return undefined;
    throw error;
  }
}

export async function deleteCharge(id: string): Promise<boolean> {
  try {
    await appsScriptPost<null>('charges', 'delete', { id });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not_found')) return false;
    throw error;
  }
}
