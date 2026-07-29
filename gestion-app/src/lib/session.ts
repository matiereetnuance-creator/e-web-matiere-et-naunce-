import { env } from './env';

// Session signée (HMAC-SHA256 via Web Crypto — compatible middleware Edge
// et Server Actions Node). Sprint 1 : un seul compte admin (cf. env.ts).
// À remplacer par une vraie gestion multi-utilisateurs quand le stockage
// définitif (PostgreSQL/Supabase) sera spécifié.

export const SESSION_COOKIE_NAME = 'mn_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

export interface SessionPayload {
  email: string;
  exp: number;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function getKey(): Promise<CryptoKey> {
  const secretBytes = new TextEncoder().encode(env.sessionSecret);
  return crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createSessionToken(email: string): Promise<string> {
  const payload: SessionPayload = { email, exp: Date.now() + SESSION_DURATION_MS };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const expectedSignature = await sign(payloadB64);
  if (!timingSafeEqual(expectedSignature, signature)) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
