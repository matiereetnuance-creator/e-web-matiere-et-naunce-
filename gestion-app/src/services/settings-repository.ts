import { appsScriptGet, appsScriptPost } from '@/lib/apps-script-client';
import type { SettingsInput } from '@/types/settings';

/**
 * Accès aux données Paramètres — Sprint 6 : client de l'API Apps
 * Script (Google Sheets comme base de données, feuille "Settings",
 * ligne unique). Interface exportée strictement identique à celle du
 * Sprint 5 — seule l'implémentation interne change (HTTP au lieu de
 * `globalThis`), d'où le passage en async.
 */

export function getSettings(): Promise<SettingsInput> {
  return appsScriptGet<SettingsInput>('settings');
}

export function updateSettings(input: SettingsInput): Promise<SettingsInput> {
  return appsScriptPost<SettingsInput>('settings', 'update', { data: input });
}
