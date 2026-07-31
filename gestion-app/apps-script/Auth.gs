/**
 * Vérification du token partagé — seule protection réelle de ce Web
 * App (déployé en accès "Anyone", requis pour un appel serveur-à-
 * serveur sans OAuth). Apps Script ne permet pas de lire des en-têtes
 * HTTP personnalisés depuis doGet/doPost : le token voyage donc en
 * paramètre de requête (GET) ou dans le corps JSON (POST), jamais en
 * en-tête Authorization.
 *
 * Le token attendu est stocké dans les propriétés du script
 * (Propriétés du projet ▸ Propriétés du script ▸ API_TOKEN), jamais
 * codé en dur ici — voir README-APPS-SCRIPT.md.
 */
function checkToken_(token) {
  var expected = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  if (!expected) return false;
  return timingSafeEqual_(String(token || ''), expected);
}

/** Comparaison à temps constant — même principe que lib/session.ts côté Next.js. */
function timingSafeEqual_(a, b) {
  if (a.length !== b.length) return false;
  var mismatch = 0;
  for (var i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
