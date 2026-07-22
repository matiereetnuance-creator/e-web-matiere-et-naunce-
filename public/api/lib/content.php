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

/**
 * Horodatage d'un fichier CSS/JS pour le paramètre ?v= de cache-busting —
 * même principe que $cssVersion dans includes/seo-head.php, généralisé aux
 * autres fichiers statiques. Nécessaire car .htaccess sert ces fichiers
 * avec Cache-Control: immutable (1 an) : sans ce paramètre, un navigateur
 * ayant déjà visité le site continuerait de servir l'ancienne version
 * indéfiniment après toute mise à jour, quel que soit le contenu réellement
 * déployé — jusqu'ici seul style.css en bénéficiait, pas les scripts JS.
 *
 * @param string $publicRelativePath chemin depuis la racine de public/, ex. "assets/js/main.js"
 */
function asset_version(string $publicRelativePath): int
{
    $path = __DIR__ . '/../../' . ltrim($publicRelativePath, '/');
    return @filemtime($path) ?: time();
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
                $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
                // Un même slot produit toujours {base}.jpg ET {base}.webp : on
                // garde le .jpg comme référence (celui attendu par render_photo()
                // pour construire la paire <picture> WebP+JPEG), quel que soit
                // l'ordre alphabétique renvoyé par scandir().
                if (isset($cache[$base]) && $ext !== 'jpg') {
                    continue;
                }
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
        // Cas d'un RAW convertible détecté dans un envoi groupé (galerie) : la
        // conversion n'y est volontairement pas proposée (voir realisation-edit.php) ;
        // le message oriente vers le champ photo unique qui, lui, la propose.
        'raw_convertible' => 'Cette photo semble avoir été prise en Apple ProRAW. Renvoyez-la seule via « Image principale », « Avant » ou « Après » pour qu\'une conversion automatique en JPEG vous soit proposée — ce n\'est pas possible dans un envoi groupé.',
        'heic_unsupported' => 'Votre serveur ne permet actuellement pas la conversion HEIC. Activez Imagick dans PHP ou utilisez un JPG.',
        'too_large' => "Ce fichier est trop volumineux (limite : {$maxMb} Mo). Une photo iPhone classique (HEIC ou JPG) dépasse rarement cette taille : il s'agit probablement d'une vidéo ou d'un format RAW.",
        'unsupported_format' => 'Format de fichier non reconnu. Formats acceptés : JPG, PNG, WebP, ainsi que HEIC (photos iPhone, converties automatiquement si le serveur le permet).',
        'write_failed' => "Une erreur technique est survenue lors de l'enregistrement de l'image. Merci de réessayer.",
        'raw_expired' => "Le délai pour confirmer la conversion de cette photo RAW est dépassé (30 minutes). Merci de la renvoyer.",
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

/** Texte de la proposition de conversion automatique d'un RAW mis en attente (accepte les clés 'name'/'original_name' et 'size'). */
function raw_convert_prompt(array $meta): string
{
    $name = htmlspecialchars((string) ($meta['name'] ?? $meta['original_name'] ?? 'ce fichier'), ENT_QUOTES, 'UTF-8');
    $sizeMb = round((int) ($meta['size'] ?? 0) / 1024 / 1024, 1);
    return "Cette photo ({$name}, {$sizeMb} Mo) semble être un fichier Apple ProRAW (.dng). Voulez-vous convertir cette photo en JPEG optimisé ?";
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
 * Cœur du pipeline d'optimisation : à partir d'un chemin de fichier déjà
 * lisible par GD (JPEG/PNG/WebP — y compris un fichier temporaire issu
 * d'une conversion HEIC ou RAW préalable via Imagick), redimensionne,
 * corrige l'orientation EXIF, enregistre le JPEG + WebP final et sa
 * miniature. Partagé par l'envoi direct et par la confirmation de
 * conversion RAW, pour ne pas dupliquer cette logique.
 *
 * @return array{ok:bool, filename:?string, error:?string, details:?string}
 */
function gd_finish_pipeline(string $sourcePath, string $destDir, string $destBaseName, int $maxWidth, int $quality): array
{
    $fail = static fn (string $code) => ['ok' => false, 'filename' => null, 'error' => $code, 'details' => null, 'stage_token' => null];

    $info = @getimagesize($sourcePath);
    if (!$info) {
        return $fail('unsupported_format');
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
            return $fail('unsupported_format');
    }
    if (!$src) {
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

    return $ok ? ['ok' => true, 'filename' => $filename, 'error' => null, 'details' => null, 'stage_token' => null] : $fail('write_failed');
}

const MN_RAW_STAGING_DIR_NAME = 'raw-staging';
/** Taille max. d'un RAW pour lequel on propose la conversion automatique (plutôt que le refus immédiat). */
const MN_RAW_CONVERT_MAX_BYTES = 45 * 1024 * 1024;
/** Durée de conservation d'un RAW mis en attente de confirmation. */
const MN_RAW_STAGING_TTL = 1800;

function raw_staging_dir(): string
{
    return MN_CONTENT_DIR . '/' . MN_RAW_STAGING_DIR_NAME;
}

/** true si le serveur peut décoder un DNG (Apple ProRAW) — Imagick avec le délégué RAW (dcraw/libraw). */
function raw_conversion_available(): bool
{
    return class_exists('Imagick') && in_array('DNG', \Imagick::queryFormats(), true);
}

/** Purge les envois RAW en attente de confirmation plus vieux que MN_RAW_STAGING_TTL. */
function raw_staging_gc(): void
{
    $dir = raw_staging_dir();
    foreach (glob($dir . '/*.json') ?: [] as $metaPath) {
        $meta = json_decode((string) file_get_contents($metaPath), true);
        $token = basename($metaPath, '.json');
        if (!is_array($meta) || time() - ($meta['created_at'] ?? 0) > MN_RAW_STAGING_TTL) {
            @unlink($metaPath);
            @unlink($dir . '/' . $token . '.raw');
        }
    }
}

/**
 * Met de côté un fichier RAW en attente de confirmation ("voulez-vous le
 * convertir en JPEG ?") au lieu de le refuser immédiatement. Le fichier
 * temporaire PHP est déplacé (il serait sinon supprimé à la fin de la
 * requête) vers un stockage propre à l'admin, hors du dossier public.
 *
 * @return string|null jeton à renvoyer pour confirmer, ou null si l'envoi a échoué
 */
function stage_raw_upload(array $file, string $destDir, string $destBaseName): ?string
{
    $dir = raw_staging_dir();
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    raw_staging_gc();

    $tmpName = (string) ($file['tmp_name'] ?? '');
    if ($tmpName === '' || !is_uploaded_file($tmpName)) {
        return null;
    }

    $token = bin2hex(random_bytes(16));
    $rawPath = $dir . '/' . $token . '.raw';
    if (!move_uploaded_file($tmpName, $rawPath)) {
        return null;
    }

    file_put_contents($dir . '/' . $token . '.json', json_encode([
        'original_name' => $file['name'] ?? '',
        'size' => $file['size'] ?? 0,
        'dest_dir' => $destDir,
        'dest_base_name' => $destBaseName,
        'created_at' => time(),
    ]));

    return $token;
}

/** Relit les métadonnées d'un RAW en attente, ou null si le jeton est invalide/expiré. */
function get_staged_raw(string $token): ?array
{
    if (!preg_match('/^[a-f0-9]{32}$/', $token)) {
        return null;
    }
    $dir = raw_staging_dir();
    $metaPath = $dir . '/' . $token . '.json';
    $rawPath = $dir . '/' . $token . '.raw';
    if (!is_file($metaPath) || !is_file($rawPath)) {
        return null;
    }
    $meta = json_decode((string) file_get_contents($metaPath), true);
    if (!is_array($meta)) {
        return null;
    }
    if (time() - ($meta['created_at'] ?? 0) > MN_RAW_STAGING_TTL) {
        @unlink($metaPath);
        @unlink($rawPath);
        return null;
    }
    $meta['raw_path'] = $rawPath;
    return $meta;
}

/** Supprime un RAW en attente (confirmé, annulé, ou son jeton n'est plus utile). */
function discard_staged_raw(string $token): void
{
    if (!preg_match('/^[a-f0-9]{32}$/', $token)) {
        return;
    }
    $dir = raw_staging_dir();
    @unlink($dir . '/' . $token . '.raw');
    @unlink($dir . '/' . $token . '.json');
}

/**
 * Convertit un RAW précédemment mis en attente (stage_raw_upload) en JPEG
 * optimisé + WebP + miniature, à l'endroit prévu au moment de la mise en
 * attente. Le fichier temporaire est supprimé quoi qu'il arrive.
 *
 * @return array{ok:bool, filename:?string, error:?string, details:?string}
 */
function confirm_raw_conversion(string $token, int $maxWidth = 1600, int $quality = 82): array
{
    $fail = static fn (string $code) => ['ok' => false, 'filename' => null, 'error' => $code, 'details' => null, 'stage_token' => null];

    $meta = get_staged_raw($token);
    if ($meta === null) {
        return $fail('raw_expired');
    }
    if (!raw_conversion_available()) {
        discard_staged_raw($token);
        return $fail('heic_unsupported');
    }

    $tempJpeg = tempnam(sys_get_temp_dir(), 'raw') . '.jpg';
    try {
        $im = new \Imagick($meta['raw_path']);
        $im->setImageFormat('jpeg');
        $im->setImageCompressionQuality(95);
        $im->writeImage($tempJpeg);
        $im->clear();
    } catch (\Throwable $e) {
        @unlink($tempJpeg);
        discard_staged_raw($token);
        return $fail('raw_unsupported');
    }

    discard_staged_raw($token);
    $result = gd_finish_pipeline($tempJpeg, $meta['dest_dir'], $meta['dest_base_name'], $maxWidth, $quality);
    @unlink($tempJpeg);

    return $result;
}

/**
 * Optimise une image envoyée (redimensionnement + compression), l'enregistre
 * en JPEG + WebP, et génère une miniature (JPEG + WebP) à côté. Convertit
 * automatiquement les photos HEIC/HEIF (iPhone) si le serveur le permet.
 * Nécessite l'extension GD (présente par défaut sur o2switch).
 *
 * Un RAW (.dng/.jxl…) de taille raisonnable (≤ MN_RAW_CONVERT_MAX_BYTES)
 * n'est pas refusé directement si le serveur sait le décoder : il est mis
 * en attente ('raw_convertible', avec un jeton) pour que l'admin confirme
 * explicitement la conversion — voir confirm_raw_conversion().
 *
 * @return array{ok:bool, filename:?string, error:?string, details:?string, stage_token:?string} filename ex. "photo-1.jpg" ; details = diagnostic technique (admin uniquement)
 */
function optimize_and_store_upload(array $file, string $destDir, string $destBaseName, int $maxWidth = 1600, int $quality = 82): array
{
    $fail = static fn (string $code) => ['ok' => false, 'filename' => null, 'error' => $code, 'details' => upload_technical_details($file), 'stage_token' => null];

    // RAW/JPEG-XL : détecté EN PREMIER, sur le seul nom de fichier — donc
    // même si le fichier est si volumineux que PHP l'a déjà tronqué côté
    // serveur (upload_max_filesize dépassé, cas le plus fréquent pour un
    // vrai fichier ProRAW de 25 à 100 Mo : $file['name'] reste renseigné
    // même quand tmp_name/size sont vidés par PHP). Sans cette priorité,
    // le cas réel le plus courant afficherait "fichier trop volumineux"
    // au lieu du message ProRAW explicite demandé.
    if (is_raw_or_jxl_upload($file)) {
        $ext = strtolower((string) pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
        $sizeOk = ($file['size'] ?? 0) > 0 && ($file['size'] ?? 0) <= MN_RAW_CONVERT_MAX_BYTES;
        $tmpOk = !empty($file['tmp_name']) && is_uploaded_file((string) $file['tmp_name']);
        if ($ext === 'dng' && $sizeOk && $tmpOk && raw_conversion_available()) {
            $token = stage_raw_upload($file, $destDir, $destBaseName);
            if ($token !== null) {
                return ['ok' => false, 'filename' => null, 'error' => 'raw_convertible', 'details' => upload_technical_details($file), 'stage_token' => $token];
            }
        }
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
        } else {
            return $fail('unsupported_format');
        }
    }

    $result = gd_finish_pipeline($sourcePath, $destDir, $destBaseName, $maxWidth, $quality);
    if ($heicTempFile) {
        @unlink($heicTempFile);
    }
    if (!$result['ok'] && $result['error'] === 'unsupported_format' && $heicTempFile) {
        // La conversion HEIC a réussi mais le JPEG produit reste illisible : cas quasi impossible, message dédié tout de même.
        return $fail('heic_unsupported');
    }
    return $result['ok'] ? $result : $fail($result['error'] ?? 'write_failed');
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

/**
 * Dernier cache d'avis Google écrit par api/cron/sync-google-reviews.php,
 * ou null si aucune synchronisation n'a encore eu lieu (ou API non
 * configurée) — jamais d'appel réseau ici, uniquement une lecture disque.
 *
 * @return array{success:bool,configured:bool,rating:?float,total:?int,google_url:?string,reviews:array,fetched_at:?string}|null
 */
function google_reviews_snapshot(): ?array
{
    $path = __DIR__ . '/../data/reviews-cache.json';
    if (!is_file($path)) {
        return null;
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) && !empty($data['configured']) ? $data : null;
}

/**
 * Valeurs d'avis Google prêtes à afficher côté serveur (score, nombre,
 * lien) : cache Google Business en priorité, texte éditable de secours
 * (textes.json) tant que la synchronisation n'a pas encore eu lieu.
 * Réutilisée par index.php et avis.php pour rester identique aux deux
 * endroits (aucune duplication de la logique de repli).
 *
 * @return array{score:string,count:string,score_raw:?float,count_raw:?int,google_url:?string,fetched_at:?string}
 */
function avis_display_snapshot(array $textes): array
{
    $snapshot = google_reviews_snapshot();
    $scoreRaw = isset($snapshot['rating']) ? (float) $snapshot['rating'] : null;
    $countRaw = isset($snapshot['total']) ? (int) $snapshot['total'] : null;

    // Priorité : lien saisi manuellement dans l'admin (Réglages) — contrôle
    // total et immédiat pour le client — puis la synchronisation Google
    // (Mission 2) si configurée, puis un lien construit depuis le Place ID,
    // sinon aucun (le gabarit appelant applique alors son propre repli).
    $settings = load_content('settings', []);
    $googleUrl = !empty($settings['google_reviews_url']) ? $settings['google_reviews_url'] : ($snapshot['google_url'] ?? null);
    if ($googleUrl === null) {
        $config = require __DIR__ . '/../config.php';
        $placeId = $config['google_place_id'] ?? '';
        $googleUrl = $placeId !== '' ? ('https://search.google.com/local/writereview?placeid=' . rawurlencode($placeId)) : null;
    }

    return [
        'score' => $scoreRaw !== null ? str_replace('.', ',', (string) $scoreRaw) : t($textes, 'avis_score', '4,9'),
        'count' => $countRaw !== null ? (string) $countRaw : t($textes, 'avis_count', '47'),
        'score_raw' => $scoreRaw,
        'count_raw' => $countRaw,
        'google_url' => $googleUrl,
        'fetched_at' => $snapshot['fetched_at'] ?? null,
    ];
}

/**
 * Horodatage/version de la dernière livraison, si renseigné (voir
 * api/data/deploy-info.json — régénéré à chaque reconstruction du ZIP de
 * déploiement). Retourne null si le fichier n'existe pas encore.
 *
 * @return array{deployed_at:?string,version:?string}|null
 */
function deploy_info_snapshot(): ?array
{
    $path = __DIR__ . '/../data/deploy-info.json';
    if (!is_file($path)) {
        return null;
    }
    $data = json_decode((string) file_get_contents($path), true);
    return is_array($data) ? $data : null;
}

/**
 * État sommaire des mécanismes SEO du site (présence structurelle, sans
 * appel réseau) : sitemap, robots.txt, données structurées, OpenGraph.
 * Réutilisée par le tableau de bord admin (Mission 5) et la vérification
 * SEO (Mission 6).
 *
 * @return array{sitemap:bool,robots:bool,schema:bool,opengraph:bool}
 */
function seo_health_snapshot(): array
{
    $publicDir = __DIR__ . '/../..';

    $robotsPath = $publicDir . '/robots.txt';
    $robotsOk = false;
    if (is_file($robotsPath)) {
        $robots = (string) file_get_contents($robotsPath);
        $robotsOk = str_contains($robots, 'Disallow: /admin/') && str_contains($robots, 'Sitemap:');
    }

    $seo = load_content('seo', []);
    $expectedPages = ['home', 'savoir-faire', 'realisations', 'entreprise', 'avis', 'contact'];
    $schemaOk = true;
    foreach ($expectedPages as $key) {
        if (empty($seo[$key]['title'])) {
            $schemaOk = false;
            break;
        }
    }

    return [
        'sitemap' => is_file($publicDir . '/sitemap.php'),
        'robots' => $robotsOk,
        'schema' => $schemaOk,
        'opengraph' => is_file($publicDir . '/assets/img/og-cover.png'),
    ];
}

/**
 * Avis de secours affichés tant que la synchronisation Google (Mission 2)
 * n'est pas configurée — gérés depuis l'admin (admin/avis.php) plutôt que
 * via le Gestionnaire de fichiers. Remplacés dynamiquement côté client par
 * les vrais avis Google dès que google-reviews.js les a récupérés (voir
 * data-mn-reviews-grid) ; ce fichier reste sinon la seule source affichée.
 *
 * @return array<int, array{id:string, author_name:string, commune:string, rating:int, text:string, relative_time:string}>
 */
function fallback_avis(): array
{
    return load_content('avis', []);
}

/** Étoiles pleines/vides pour une note 0-5 (même logique que google-reviews.js côté client). */
function avis_star_string(int $rating): string
{
    $r = max(0, min(5, $rating));
    return str_repeat('★', $r) . str_repeat('☆', 5 - $r);
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
