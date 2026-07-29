/**
 * Sprint 1 : authentification à un seul compte admin, via variables
 * d'environnement (ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET).
 * Placeholder assumé — pas de base d'utilisateurs tant que le Sprint
 * traitant du stockage réel (PostgreSQL/Supabase, cf. Blueprint §3)
 * n'est pas spécifié.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export const env = {
  get adminEmail(): string {
    return requireEnv('ADMIN_EMAIL');
  },
  get adminPassword(): string {
    return requireEnv('ADMIN_PASSWORD');
  },
  get sessionSecret(): string {
    return requireEnv('SESSION_SECRET');
  },
};
