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

/** Taille maximale acceptée en entrée, avant optimisation (photos de smartphone incluses). */
const MN_UPLOAD_MAX_BYTES = 20 * 1024 * 1024;

/** Largeur cible des miniatures générées à côté de chaque image (aperçus admin). */
const MN_THUMB_WIDTH = 480;

/**
 * Message clair et actionnable pour chaque code d'erreur retourné par
 * optimize_and_store_upload(). Centralisé ici pour rester identique quel
 * que soit l'écran d'administration qui déclenche l'envoi.
 */
function upload_error_message(?string $code): string
{
    $maxMb = (int) (MN_UPLOAD_MAX_BYTES / 1024 / 1024);
    return match ($code) {
        'raw_unsupported' => 'Cette photo semble avoir été prise en Apple ProRAW. Les photos RAW ne sont pas destinées à une publication web. Désactivez simplement RAW dans l\'application Appareil photo puis reprenez la photo.',
        'heic_unsupported' => 'Votre serveur ne permet actuellement pas la conversion HEIC. Activez Imagick dans PHP ou utilisez un JPG.',
        'too_large' => "Ce fichier est trop volumineux (limite : {$maxMb} Mo). Une photo iPhone classique (HEIC ou JPG) dépasse rarement cette taille : il s'agit probablement d'une vidéo ou d'un format RAW.",
        'unsupported_format' => 'Format de fichier non reconnu. Formats acceptés : JPG, PNG, WebP, ainsi que HEIC (photos iPhone, converties automatiquement si le serveur le permet).',
        'write_failed' => "Une erreur technique est survenue lors de l'enregistrement de l'image. Merci de réessayer.",
        default => "Ce fichier n'a pas pu être traité.",
    };
}

/**
 * Message d'erreur complet (clair + détail technique) à partir du résultat
 * de optimize_and_store_upload(). Le détail technique (taille réelle,
 * MIME détecté, limites serveur…) permet de vérifier en un coup d'œil si
 * un blocage vient de ce site ou de la configuration PHP de l'hébergeur —
 * usage admin uniquement (voir upload_technical_details()).
 */
function upload_error_with_details(array $result): string
{
    $message = upload_error_message($result['error'] ?? null);
    if (!empty($result['details'])) {
        $message .= ' [' . $result['details'] . ']';
    }
    return $message;
}

/**
 * true si le serveur peut décoder le format HEIC/HEIF (photos iPhone) —
 * nécessite l'extension Imagick compilée avec le délégué libheif, ce que
 * n'offrent pas tous les hébergements mutualisés.
 */
function heic_conversion_available(): bool
{
    return class_exists('Imagick') && count(array_intersect(['HEIC', 'HEIF'], \Imagick::queryFormats())) > 0;
}

function is_heic_upload(array $file): bool
{
    $ext = strtolower((string) pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    $mime = strtolower((string) ($file['type'] ?? ''));
    return in_array($ext, ['heic', 'heif'], true)
        || in_array($mime, ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'], true);
}

/**
 * true si le fichier est un format RAW (Apple ProRAW/.dng, et RAW
 * d'appareils photo classiques par cohérence) ou JPEG-XL — jamais adapté
 * à une publication web, quelle que soit sa taille. Détection par
 * extension en priorité (fiable), le type MIME envoyé par le navigateur
 * pour ces formats étant souvent générique ou absent.
 */
function is_raw_or_jxl_upload(array $file): bool
{
    $ext = strtolower((string) pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    $mime = strtolower((string) ($file['type'] ?? ''));
    $rawExtensions = ['dng', 'proraw', 'raw', 'cr2', 'cr3', 'nef', 'arw', 'orf', 'rw2', 'jxl'];
    $rawMimes = ['image/x-adobe-dng', 'image/dng', 'application/x-dng', 'image/jxl'];
    return in_array($ext, $rawExtensions, true) || in_array($mime, $rawMimes, true);
}

/**
 * Détail technique d'un envoi (taille reçue, type MIME réel détecté par
 * lecture du fichier, extension, réglages serveur effectifs) — utile pour
 * distinguer un blocage applicatif (ce CMS) d'un blocage PHP/serveur.
 * Réservé à l'administration : jamais affiché sur le site public.
 */
function upload_technical_details(array $file): string
{
    $sizeBytes = (int) ($file['size'] ?? 0);
    $sizeMb = round($sizeBytes / 1024 / 1024, 2);
    $ext = strtolower((string) pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    $declaredMime = (string) ($file['type'] ?? '?');

    $realMime = '?';
    $tmpName = (string) ($file['tmp_name'] ?? '');
    if ($tmpName !== '' && is_file($tmpName) && function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $detected = finfo_file($finfo, $tmpName);
            if ($detected !== false) {
                $realMime = $detected;
            }
            finfo_close($finfo);
        }
    }

    return sprintf(
        'Détail technique — taille reçue : %s Mo (%s octets) · type MIME déclaré par le navigateur : %s · type MIME réel (finfo) : %s · extension : .%s · limite de ce site : %d Mo · upload_max_filesize (PHP) : %s · post_max_size (PHP) : %s · memory_limit (PHP) : %s',
        $sizeMb,
        $sizeBytes,
        $declaredMime !== '' ? $declaredMime : '?',
        $realMime,
        $ext !== '' ? $ext : '?',
        (int) (MN_UPLOAD_MAX_BYTES / 1024 / 1024),
        ini_get('upload_max_filesize') ?: '?',
        ini_get('post_max_size') ?: '?',
        ini_get('memory_limit') ?: '?'
    );
}

/**
 * Optimise une image envoyée (redimensionnement + compression), l'enregistre
 * en JPEG + WebP, et génère une miniature (JPEG + WebP) à côté. Convertit
 * automatiquement les photos HEIC/HEIF (iPhone) si le serveur le permet.
 * Nécessite l'extension GD (présente par défaut sur o2switch).
 *
 * @return array{ok:bool, filename:?string, error:?string, details:?string} filename ex. "photo-1.jpg" ; details = diagnostic technique (admin uniquement)
 */
function optimize_and_store_upload(array $file, string $destDir, string $destBaseName, int $maxWidth = 1600, int $quality = 82): array
{
    $fail = static fn (string $code) => ['ok' => false, 'filename' => null, 'error' => $code, 'details' => upload_technical_details($file)];

    // RAW/JPEG-XL : détecté EN PREMIER, sur le seul nom de fichier — donc
    // même si le fichier est si volumineux que PHP l'a déjà tronqué côté
    // serveur (upload_max_filesize dépassé, cas le plus fréquent pour un
    // vrai fichier ProRAW de 25 à 100 Mo : $file['name'] reste renseigné
    // même quand tmp_name/size sont vidés par PHP). Sans cette priorité,
    // le cas réel le plus courant afficherait "fichier trop volumineux"
    // au lieu du message ProRAW explicite demandé.
    if (is_raw_or_jxl_upload($file)) {
        return $fail('raw_unsupported');
    }
    // Le code d'erreur PHP est vérifié ensuite, avant toute autre
    // inspection : quand upload_max_filesize/post_max_size sont dépassés
    // côté serveur, tmp_name/size/type arrivent vides ou à zéro, et
    // is_uploaded_file('') aurait autrement fait tomber ce cas dans
    // 'unsupported_format' (message trompeur) au lieu de 'too_large'.
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        return $fail(in_array($file['error'] ?? null, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) ? 'too_large' : 'unsupported_format');
    }
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return $fail('unsupported_format');
    }
    if (($file['size'] ?? 0) > MN_UPLOAD_MAX_BYTES) {
        return $fail('too_large');
    }

    $sourcePath = $file['tmp_name'];
    $heicTempFile = null;

    $info = @getimagesize($sourcePath);
    if (!$info) {
        if (is_heic_upload($file)) {
            if (!heic_conversion_available()) {
                return $fail('heic_unsupported');
            }
            try {
                $im = new \Imagick($sourcePath);
                $im->setImageFormat('jpeg');
                $im->setImageCompressionQuality(92);
                $heicTempFile = tempnam(sys_get_temp_dir(), 'heic') . '.jpg';
                $im->writeImage($heicTempFile);
                $im->clear();
            } catch (\Throwable $e) {
                if ($heicTempFile && is_file($heicTempFile)) {
                    @unlink($heicTempFile);
                }
                return $fail('heic_unsupported');
            }
            $sourcePath = $heicTempFile;
            $info = @getimagesize($sourcePath);
            if (!$info) {
                @unlink($heicTempFile);
                return $fail('heic_unsupported');
            }
        } else {
            return $fail('unsupported_format');
        }
    }
    [$width, $height, $type] = $info;

    switch ($type) {
        case IMAGETYPE_JPEG:
            $src = @imagecreatefromjpeg($sourcePath);
            break;
        case IMAGETYPE_PNG:
            $src = @imagecreatefrompng($sourcePath);
            break;
        case IMAGETYPE_WEBP:
            $src = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($sourcePath) : false;
            break;
        default:
            if ($heicTempFile) {
                @unlink($heicTempFile);
            }
            return $fail('unsupported_format');
    }
    if (!$src) {
        if ($heicTempFile) {
            @unlink($heicTempFile);
        }
        return $fail('unsupported_format');
    }

    // Corrige l'orientation EXIF si présente (photos de téléphone)
    if (function_exists('exif_read_data') && $type === IMAGETYPE_JPEG) {
        $exif = @exif_read_data($sourcePath);
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

    if ($heicTempFile) {
        @unlink($heicTempFile);
    }

    if ($width > $maxWidth) {
        $newWidth = $maxWidth;
        $newHeight = (int) round($height * ($maxWidth / $width));
        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagefill($resized, 0, 0, imagecolorallocate($resized, 255, 255, 255));
        imagecopyresampled($resized, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($src);
        $src = $resized;
        $width = $newWidth;
        $height = $newHeight;
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

    // Miniature (aperçus admin) : redimensionnement supplémentaire à partir
    // de l'image déjà orientée/redimensionnée, sans re-décoder le fichier.
    if ($width > MN_THUMB_WIDTH) {
        $thumbWidth = MN_THUMB_WIDTH;
        $thumbHeight = (int) round($height * ($thumbWidth / $width));
        $thumb = imagecreatetruecolor($thumbWidth, $thumbHeight);
        imagefill($thumb, 0, 0, imagecolorallocate($thumb, 255, 255, 255));
        imagecopyresampled($thumb, $src, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $width, $height);
        imagejpeg($thumb, $destDir . '/' . $destBaseName . '-thumb.jpg', $quality);
        if (function_exists('imagewebp')) {
            @imagewebp($thumb, $destDir . '/' . $destBaseName . '-thumb.webp', $quality);
        }
        imagedestroy($thumb);
    } else {
        // Déjà assez petite : la miniature est une copie de l'image principale.
        imagejpeg($src, $destDir . '/' . $destBaseName . '-thumb.jpg', $quality);
        if (function_exists('imagewebp')) {
            @imagewebp($src, $destDir . '/' . $destBaseName . '-thumb.webp', $quality);
        }
    }

    imagedestroy($src);

    return $ok ? ['ok' => true, 'filename' => $filename, 'error' => null, 'details' => null] : $fail('write_failed');
}

/** URL de la miniature associée à un fichier photo de réalisation (ex. "photo-1.jpg" -> "…/photo-1-thumb.jpg"), si elle existe, sinon l'image d'origine. */
function realisation_thumb_url(string $realisationId, string $filename): string
{
    $thumbName = preg_replace('/\.jpg$/', '-thumb.jpg', $filename) ?? $filename;
    $dir = realisation_photo_dir($realisationId);
    if (is_file($dir . '/' . $thumbName)) {
        return realisation_photo_url($realisationId, $thumbName);
    }
    return realisation_photo_url($realisationId, $filename);
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
