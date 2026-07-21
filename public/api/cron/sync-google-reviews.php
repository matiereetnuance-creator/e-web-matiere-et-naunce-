<?php
/**
 * Tâche planifiée — synchronisation du cache local des avis Google.
 *
 * Contacte l'API Google Places (Place Details) et écrit le résultat dans
 * api/data/reviews-cache.json. Ce script est le SEUL point du site à
 * appeler Google : le rendu des pages (index.php, avis.php) et le point
 * d'API navigateur (api/google-reviews.php) ne font que lire ce cache,
 * jamais Google directement — la synchronisation est donc indépendante
 * de toute visite.
 *
 * Accès HTTP direct bloqué (voir api/.htaccess, règle "cron/"). Prévu
 * pour une tâche Cron o2switch (cPanel > Tâches Cron), exécutée en CLI :
 *   php /home/USER/matiereetnuance.fr/api/cron/sync-google-reviews.php
 * Fréquence conseillée : toutes les heures.
 */

declare(strict_types=1);

require __DIR__ . '/../lib/helpers.php';

$config = require __DIR__ . '/../config.php';
$apiKey = $config['google_places_api_key'];
$placeId = $config['google_place_id'];
$cacheFile = __DIR__ . '/../data/reviews-cache.json';

if ($apiKey === '' || $placeId === '') {
    fwrite(STDOUT, "[matiereetnuance] Avis Google non configurés (clé API / Place ID absents) — synchronisation ignorée.\n");
    exit(0);
}

$endpoint = 'https://maps.googleapis.com/maps/api/place/details/json?' . http_build_query([
    'place_id' => $placeId,
    'fields' => 'name,rating,user_ratings_total,reviews,url',
    'language' => 'fr',
    'reviews_no_translations' => 'true',
    'key' => $apiKey,
]);

$raw = fetch_url($endpoint);
$data = $raw ? json_decode($raw, true) : null;

if (!is_array($data) || ($data['status'] ?? '') !== 'OK') {
    // Le cache existant (précédente synchronisation réussie) reste en
    // place tel quel : mieux vaut des avis légèrement datés que plus
    // d'avis du tout en cas de panne/quota Google ponctuel.
    fwrite(STDERR, '[matiereetnuance] Synchronisation avis Google échouée : ' . ($data['status'] ?? 'réponse invalide') . "\n");
    exit(1);
}

$result = $data['result'] ?? [];
$reviews = array_map(static function (array $r): array {
    return [
        'author_name' => (string) ($r['author_name'] ?? 'Client Google'),
        'rating' => (int) ($r['rating'] ?? 5),
        'relative_time_description' => (string) ($r['relative_time_description'] ?? ''),
        'text' => (string) ($r['text'] ?? ''),
        'time' => (int) ($r['time'] ?? 0),
    ];
}, $result['reviews'] ?? []);

// Les avis les plus récents en premier
usort($reviews, static fn ($a, $b) => $b['time'] <=> $a['time']);

$payload = [
    'success' => true,
    'configured' => true,
    'rating' => $result['rating'] ?? null,
    'total' => $result['user_ratings_total'] ?? null,
    'google_url' => $result['url'] ?? ('https://www.google.com/maps/place/?q=place_id:' . $placeId),
    'reviews' => array_slice($reviews, 0, 6),
    'fetched_at' => date(DATE_ATOM),
];

$dir = dirname($cacheFile);
if (!is_dir($dir)) {
    mkdir($dir, 0775, true);
}
file_put_contents($cacheFile, json_encode($payload, JSON_UNESCAPED_UNICODE), LOCK_EX);

fwrite(STDOUT, "[matiereetnuance] Avis Google synchronisés : note {$payload['rating']}, {$payload['total']} avis.\n");
