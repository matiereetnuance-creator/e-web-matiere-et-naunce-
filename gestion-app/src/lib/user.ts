export function deriveDisplayName(email: string): string {
  const local = email.split('@')[0] ?? email;
  const firstPart = local.split(/[.+_-]/)[0] ?? local;
  if (!firstPart) return email;
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
}
