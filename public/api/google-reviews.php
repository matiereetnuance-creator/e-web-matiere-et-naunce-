<?php
/**
 * Synchronisation des avis Google — Matière & Nuance
 *
 * Utilise l'API officielle Google Places (Place Details) pour récupérer
 * la note moyenne, le nombre d'avis et les derniers avis publiés sur la
 * fiche Google Business Profile. Résultat mis en cache sur disque pour
 * ne pas consommer le quota d'API à chaque visite.
 *
 * Tant que 'google_places_api_key' / 'google_place_id' ne sont pas
 * renseignés dans config.php, ce point d'API répond simplement
 * "configured => false" et le site continue d'afficher les avis de
 * secours (statiques) déjà présents dans le HTML.
 */

declare(strict_types=1);

require __DIR__ . '/lib/helpers.php';

header('Cache-Control: public, max-age=1800');

$config = require __DIR__ . '/config.php';
$apiKey = $config['google_places_api_key'];
$placeId = $config['google_place_id'];

if ($apiKey === '' || $placeId === '') {
    json_response([
        'success' => true,
        'configured' => false,
    ]);
}

$cacheFile = __DIR__ . '/data/reviews-cache.json';
$ttl = (int) $config['google_reviews_cache_ttl'];

if (is_file($cacheFile) && (time() - filemtime($cacheFile) < $ttl)) {
    $cached = json_decode((string) file_get_contents($cacheFile), true);
    if (is_array($cached)) {
        json_response($cached);
    }
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
    // En cas d'échec (quota, réseau, clé invalide…) on retombe sur le
    // cache existant s'il y en a un, sinon on signale "non configuré"
    // pour laisser l'affichage statique de secours en place.
    if (is_file($cacheFile)) {
        $cached = json_decode((string) file_get_contents($cacheFile), true);
        if (is_array($cached)) {
            json_response($cached);
        }
    }
    error_log('[matiereetnuance] Google Places API indisponible : ' . ($data['status'] ?? 'réponse invalide'));
    json_response(['success' => true, 'configured' => false]);
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

json_response($payload);

/** Récupère une URL en HTTPS via cURL si dispo, sinon file_get_contents. */
function fetch_url(string $url): ?string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $result = curl_exec($ch);
        $ok = curl_errno($ch) === 0;
        curl_close($ch);
        return $ok && is_string($result) ? $result : null;
    }

    if (ini_get('allow_url_fopen')) {
        $context = stream_context_create(['http' => ['timeout' => 8]]);
        $result = @file_get_contents($url, false, $context);
        return $result !== false ? $result : null;
    }

    return null;
}
