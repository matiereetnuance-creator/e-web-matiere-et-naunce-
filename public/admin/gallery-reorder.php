<?php
/**
 * Sauvegarde automatique de l'ordre des photos d'une galerie (glisser-
 * déposer, desktop + tactile — voir admin/assets/gallery-reorder.js).
 * Ne modifie rien d'autre (textes ALT, suppressions) : uniquement l'ordre.
 */
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'method_not_allowed'], 405);
}
admin_csrf_check();

$id = clean_text((string) ($_POST['id'] ?? ''), 80);
$order = $_POST['order'] ?? [];
if ($id === '' || !is_array($order) || !$order) {
    json_response(['success' => false, 'error' => 'invalid_request'], 400);
}
$order = array_map('strval', $order);

$realisations = load_content('realisations', []);
$index = null;
foreach ($realisations as $k => $r) {
    if (($r['id'] ?? '') === $id) {
        $index = $k;
        break;
    }
}
if ($index === null) {
    json_response(['success' => false, 'error' => 'not_found'], 404);
}

$gallery = $realisations[$index]['gallery'] ?? [];
$byFile = [];
foreach ($gallery as $g) {
    $item = is_array($g) ? $g : ['file' => $g, 'alt' => ''];
    $byFile[$item['file']] = $item;
}

// L'ordre reçu doit correspondre exactement à l'ensemble actuel des photos
// (mêmes fichiers, même nombre) — sinon la galerie a changé entre le
// chargement de la page et ce glisser-déposer (photo ajoutée/retirée par un
// autre onglet) : on refuse plutôt que de risquer de perdre une photo.
if (count($order) !== count($byFile) || array_diff($order, array_keys($byFile)) || array_diff(array_keys($byFile), $order)) {
    json_response(['success' => false, 'error' => 'gallery_mismatch'], 409);
}

$reordered = array_map(static fn ($file) => $byFile[$file], $order);
$realisations[$index]['gallery'] = $reordered;
save_content('realisations', $realisations);

json_response(['success' => true]);
