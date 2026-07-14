<?php
/**
 * Accès au contenu éditable (réalisations, textes, réglages, SEO) et aux
 * photos envoyées depuis l'administration. Stockage en fichiers JSON — pas
 * de base de données nécessaire, adapté à l'hébergement mutualisé o2switch.
 */

declare(strict_types=1);

define('MN_CONTENT_DIR', __DIR__ . '/../data/content');
define('MN_BACKUPS_DIR', MN_CONTENT_DIR . '/backups');
define('MN_UPLOADS_DIR', __DIR__ . '/../../assets/img/uploads');
define('MN_UPLOADS_URL', '/assets/img/uploads');

function content_path(string $name): string
{
    return MN_CONTENT_DIR . '/' . $name . '.json';
}

function load_content(string $name, array $default = []): array
{
    $path = content_path($name);
    if (!is_file($path)) {
        return $default;
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : $default;
}

/** Sauvegarde un contenu, avec copie horodatée automatique du fichier précédent. */
function save_content(string $name, array $data): bool
{
    if (!is_dir(MN_CONTENT_DIR)) {
        mkdir(MN_CONTENT_DIR, 0775, true);
    }
    $path = content_path($name);

    if (is_file($path)) {
        backup_content($name);
    }

    $fp = fopen($path, 'c+');
    if (!$fp) {
        return false;
    }
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

/** Copie horodatée avant modification ; conserve les 20 dernières par contenu. */
function backup_content(string $name): void
{
    if (!is_dir(MN_BACKUPS_DIR)) {
        mkdir(MN_BACKUPS_DIR, 0775, true);
    }
    $src = content_path($name);
    if (!is_file($src)) {
        return;
    }
    $stamp = date('Y-m-d_His');
    copy($src, MN_BACKUPS_DIR . "/{$name}-{$stamp}.json");

    $backups = glob(MN_BACKUPS_DIR . "/{$name}-*.json") ?: [];
    sort($backups);
    while (count($backups) > 20) {
        @unlink(array_shift($backups));
    }
}

/** Valeur d'un texte éditable, échappée pour affichage HTML. */
function t(array $textes, string $key, string $fallback = ''): string
{
    $v = $textes[$key] ?? '';
    return $v !== '' ? htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8') : htmlspecialchars($fallback, ENT_QUOTES, 'UTF-8');
}

/** Valeur brute, non échappée (utilisée uniquement pour les rares champs HTML simples validés). */
function t_raw(array $textes, string $key, string $fallback = ''): string
{
    $v = $textes[$key] ?? '';
    return $v !== '' ? (string) $v : $fallback;
}

/**
 * URL d'une photo "slot" (visuels uniques du design : hero, portraits…).
 * Priorité à un envoi admin (assets/img/uploads/{slot}.*), sinon le visuel
 * temporaire du design (assets/img/placeholders/{slot}.svg).
 */
function photo_src(string $slot): string
{
    static $cache = null;
    if ($cache === null) {
        $cache = [];
        if (is_dir(MN_UPLOADS_DIR)) {
            foreach (scandir(MN_UPLOADS_DIR) ?: [] as $f) {
                if ($f === '.' || $f === '..' || is_dir(MN_UPLOADS_DIR . '/' . $f)) {
                    continue;
                }
                $base = pathinfo($f, PATHINFO_FILENAME);
                $cache[$base] = $f;
            }
        }
    }
    if (isset($cache[$slot])) {
        return MN_UPLOADS_URL . '/' . rawurlencode($cache[$slot]) . '?v=' . filemtime(MN_UPLOADS_DIR . '/' . $cache[$slot]);
    }
    return 'assets/img/placeholders/' . $slot . '.svg';
}

/** URL publique d'une photo de réalisation (galerie / image principale / avant-après). */
function realisation_photo_url(string $realisationId, string $filename): string
{
    return MN_UPLOADS_URL . '/realisations/' . rawurlencode($realisationId) . '/' . rawurlencode($filename);
}

function realisation_photo_dir(string $realisationId): string
{
    return MN_UPLOADS_DIR . '/realisations/' . $realisationId;
}

/** Image principale d'une réalisation : photo envoyée, sinon visuel de secours du design. */
function realisation_main_image_url(array $realisation): string
{
    if (!empty($realisation['image_main'])) {
        $path = realisation_photo_dir($realisation['id']) . '/' . $realisation['image_main'];
        if (is_file($path)) {
            return realisation_photo_url($realisation['id'], $realisation['image_main']) . '?v=' . filemtime($path);
        }
    }
    $slot = $realisation['fallback_slot'] ?? $realisation['id'];
    return 'assets/img/placeholders/' . $slot . '.svg';
}

/** Étend/répète un motif de tailles pour un nombre variable d'éléments (fidélité visuelle du design). */
function cycle_pattern(array $pattern, int $index)
{
    return $pattern[$index % count($pattern)];
}

/**
 * Optimise une image envoyée (redimensionnement + compression) et l'enregistre
 * en JPEG. Nécessite l'extension GD (présente par défaut sur o2switch).
 *
 * @return string|null Nom de fichier final (ex. "photo-1.jpg") ou null en cas d'échec
 */
function optimize_and_store_upload(array $file, string $destDir, string $destBaseName, int $maxWidth = 1600, int $quality = 82): ?string
{
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return null;
    }
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return null;
    }
    // 8 Mo max en entrée (avant optimisation)
    if (($file['size'] ?? 0) > 8 * 1024 * 1024) {
        return null;
    }

    $info = @getimagesize($file['tmp_name']);
    if (!$info) {
        return null;
    }
    [$width, $height, $type] = $info;

    switch ($type) {
        case IMAGETYPE_JPEG:
            $src = @imagecreatefromjpeg($file['tmp_name']);
            break;
        case IMAGETYPE_PNG:
            $src = @imagecreatefrompng($file['tmp_name']);
            break;
        case IMAGETYPE_WEBP:
            $src = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($file['tmp_name']) : false;
            break;
        default:
            return null;
    }
    if (!$src) {
        return null;
    }

    // Corrige l'orientation EXIF si présente (photos de téléphone)
    if (function_exists('exif_read_data') && $type === IMAGETYPE_JPEG) {
        $exif = @exif_read_data($file['tmp_name']);
        $orientation = $exif['Orientation'] ?? 1;
        if ($orientation === 3) {
            $src = imagerotate($src, 180, 0);
        } elseif ($orientation === 6) {
            $src = imagerotate($src, -90, 0);
            [$width, $height] = [$height, $width];
        } elseif ($orientation === 8) {
            $src = imagerotate($src, 90, 0);
            [$width, $height] = [$height, $width];
        }
    }

    if ($width > $maxWidth) {
        $newWidth = $maxWidth;
        $newHeight = (int) round($height * ($maxWidth / $width));
        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagefill($resized, 0, 0, imagecolorallocate($resized, 255, 255, 255));
        imagecopyresampled($resized, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($src);
        $src = $resized;
    } elseif ($type !== IMAGETYPE_JPEG) {
        // Aplati la transparence PNG éventuelle sur fond blanc avant conversion JPEG
        $flat = imagecreatetruecolor($width, $height);
        imagefill($flat, 0, 0, imagecolorallocate($flat, 255, 255, 255));
        imagecopy($flat, $src, 0, 0, 0, 0, $width, $height);
        imagedestroy($src);
        $src = $flat;
    }

    if (!is_dir($destDir)) {
        mkdir($destDir, 0775, true);
    }
    $filename = $destBaseName . '.jpg';
    $ok = imagejpeg($src, $destDir . '/' . $filename, $quality);

    // Version WebP (plus légère) servie en priorité via <picture> quand le
    // navigateur la supporte ; on ne bloque jamais sur son échec.
    if (function_exists('imagewebp')) {
        @imagewebp($src, $destDir . '/' . $destBaseName . '.webp', $quality);
    }

    imagedestroy($src);

    return $ok ? $filename : null;
}

/**
 * Affiche une balise <picture> WebP + JPEG si une version WebP existe à côté
 * du JPEG, sinon une simple <img> (cas des visuels de secours SVG).
 */
function render_photo(string $jpgUrlOrSvg, string $alt, string $extraAttrs = ''): string
{
    $alt = htmlspecialchars($alt, ENT_QUOTES, 'UTF-8');
    if (!str_ends_with($jpgUrlOrSvg, '.jpg') && strpos($jpgUrlOrSvg, '.jpg?') === false) {
        return '<img class="mn-ph" src="' . htmlspecialchars($jpgUrlOrSvg, ENT_QUOTES, 'UTF-8') . '" alt="' . $alt . '" ' . $extraAttrs . '>';
    }
    $webpUrl = preg_replace('/\.jpg(\?.*)?$/', '.webp$1', $jpgUrlOrSvg);
    $webpDisk = MN_UPLOADS_DIR . '/' . ltrim(explode('?', str_replace(MN_UPLOADS_URL . '/', '', $webpUrl))[0], '/');
    $hasWebp = is_file($webpDisk);
    if (!$hasWebp) {
        return '<img class="mn-ph" src="' . htmlspecialchars($jpgUrlOrSvg, ENT_QUOTES, 'UTF-8') . '" alt="' . $alt . '" ' . $extraAttrs . '>';
    }
    return '<picture>'
        . '<source srcset="' . htmlspecialchars($webpUrl, ENT_QUOTES, 'UTF-8') . '" type="image/webp">'
        . '<img class="mn-ph" src="' . htmlspecialchars($jpgUrlOrSvg, ENT_QUOTES, 'UTF-8') . '" alt="' . $alt . '" ' . $extraAttrs . '>'
        . '</picture>';
}

/** Suggestion de texte ALT (modifiable dans l'admin, stockée telle quelle une fois éditée). */
function suggest_alt(string $title, string $ville, string $context = ''): string
{
    $parts = array_filter([$title, $ville, $context]);
    $text = implode(' — ', $parts);
    return $text !== '' ? $text : 'Réalisation Matière & Nuance';
}

/** Slug propre et unique pour l'URL d'une réalisation. */
function slugify_text(string $text): string
{
    $ascii = @iconv('UTF-8', 'ASCII//TRANSLIT', $text);
    $text = $ascii !== false ? $ascii : $text;
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text) ?? '';
    return trim($text, '-') ?: 'realisation';
}

function unique_slug(string $desired, array $existingIds, string $ignoreId = ''): string
{
    $base = slugify_text($desired);
    $slug = $base;
    $n = 2;
    while (in_array($slug, $existingIds, true) && $slug !== $ignoreId) {
        $slug = $base . '-' . $n;
        $n++;
    }
    return $slug;
}

/** Titre/description SEO d'une réalisation : valeur saisie, sinon suggestion automatique. */
function realisation_meta_title(array $r): string
{
    if (!empty($r['meta_title'])) {
        return $r['meta_title'];
    }
    return trim(($r['title'] ?? '') . ' — ' . ($r['ville'] ?? '')) . ' | Matière & Nuance';
}

function realisation_meta_description(array $r): string
{
    if (!empty($r['meta_description'])) {
        return $r['meta_description'];
    }
    if (!empty($r['description'])) {
        return mb_substr($r['description'], 0, 155);
    }
    $bits = array_filter([$r['prestations'] ?? '', $r['ville'] ?? '']);
    return 'Réalisation ' . ($r['title'] ?? '') . ' par Matière & Nuance' . ($bits ? ' — ' . implode(', ', $bits) : '') . '.';
}
