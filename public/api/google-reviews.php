<?php
/**
 * Lecture du cache local des avis Google — Matière & Nuance
 *
 * Point d'API appelé par le navigateur (assets/js/google-reviews.js).
 * Ne contacte JAMAIS Google lui-même : le cache (api/data/reviews-cache.json)
 * est alimenté indépendamment par la tâche planifiée
 * api/cron/sync-google-reviews.php, découplée de toute visite du site.
 * Tant que la synchronisation n'a pas encore eu lieu (clé API / Place ID
 * non configurés, ou première exécution du cron pas encore passée),
 * répond "configured => false" et le site affiche les avis de secours.
 */

declare(strict_types=1);

require __DIR__ . '/lib/helpers.php';
require __DIR__ . '/lib/content.php';

header('Cache-Control: public, max-age=1800');

json_response(google_reviews_snapshot() ?? ['success' => true, 'configured' => false]);
