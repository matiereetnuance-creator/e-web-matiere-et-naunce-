/**
 * Client HTTP bas niveau vers l'API Apps Script — Sprint 6. Jamais
 * importé depuis un composant `'use client'` : uniquement utilisé par
 * les repositories (`services/*-repository.ts`), eux-mêmes uniquement
 * appelés depuis des Server Components / Server Actions. Aucune
 * logique métier ici : transport HTTP + décodage de l'enveloppe
 * `{ ok, data }` / `{ ok, error }` renvoyée par Apps Script.
 *
 * Un Web App Apps Script répond toujours HTTP 200 : les erreurs se
 * détectent uniquement via le champ `ok` du JSON, jamais via le code
 * HTTP.
 */

interface AppsScriptSuccess<T> {
  ok: true;
  data: T;
}
interface AppsScriptFailure {
  ok: false;
  error: string;
}
type AppsScriptResponse<T> = AppsScriptSuccess<T> | AppsScriptFailure;

function getConfig(): { url: string; token: string } {
  const url = process.env.APPS_SCRIPT_URL;
  const token = process.env.APPS_SCRIPT_API_TOKEN;
  if (!url) throw new Error("Variable d'environnement manquante : APPS_SCRIPT_URL");
  if (!token) throw new Error("Variable d'environnement manquante : APPS_SCRIPT_API_TOKEN");
  return { url, token };
}

export async function appsScriptGet<T>(resource: string, params: Record<string, string> = {}): Promise<T> {
  const { url, token } = getConfig();
  const query = new URLSearchParams({ resource, token, ...params });
  const response = await fetch(`${url}?${query.toString()}`, { method: 'GET', cache: 'no-store' });
  const body = (await response.json()) as AppsScriptResponse<T>;
  if (!body.ok) throw new Error(`Apps Script (${resource}) : ${body.error}`);
  return body.data;
}

export async function appsScriptPost<T>(
  resource: string,
  action: 'create' | 'update' | 'delete',
  payload: Record<string, unknown> = {},
): Promise<T> {
  const { url, token } = getConfig();
  const response = await fetch(`${url}?resource=${resource}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, action, ...payload }),
  });
  const body = (await response.json()) as AppsScriptResponse<T>;
  if (!body.ok) throw new Error(`Apps Script (${resource}.${action}) : ${body.error}`);
  return body.data;
}
