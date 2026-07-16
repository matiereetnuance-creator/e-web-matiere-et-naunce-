<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

/**
 * Diagnostic serveur — lecture seule, aucune configuration modifiée.
 * Reprend exactement les mêmes fonctions que le pipeline d'envoi réel
 * (heic_conversion_available(), MN_UPLOAD_MAX_BYTES…) pour que ce que
 * cette page annonce corresponde toujours à ce que vivra un envoi réel.
 */

$gdOk = extension_loaded('gd');
$gdFlags = $gdOk ? imagetypes() : 0;
$gdFormats = [
    'JPEG' => (bool) ($gdFlags & IMG_JPG),
    'PNG'  => (bool) ($gdFlags & IMG_PNG),
    'GIF'  => (bool) ($gdFlags & IMG_GIF),
    'WebP' => (bool) ($gdFlags & IMG_WEBP),
];

$imagickOk = class_exists('Imagick');
$imagickVersion = null;
$imagickFormats = [];
if ($imagickOk) {
    try {
        $v = \Imagick::getVersion();
        $imagickVersion = $v['versionString'] ?? null;
    } catch (\Throwable $e) {
        // Extension présente mais binaire ImageMagick introuvable/cassé.
    }
    try {
        $imagickFormats = \Imagick::queryFormats();
    } catch (\Throwable $e) {
        $imagickFormats = [];
    }
}
$heicOk = heic_conversion_available();

$exifOk = extension_loaded('exif');

$appMaxMb = (int) (MN_UPLOAD_MAX_BYTES / 1024 / 1024);
$thumbWidth = MN_THUMB_WIDTH;

$phpUploadMax = ini_get('upload_max_filesize') ?: '?';
$phpPostMax = ini_get('post_max_size') ?: '?';
$phpMaxFiles = ini_get('max_file_uploads') ?: '?';

function pill(bool $ok, string $yes = 'Oui', string $no = 'Non'): string
{
    $class = $ok ? 'pill-ok' : 'pill-danger';
    return '<span class="pill ' . $class . '">' . ($ok ? $yes : $no) . '</span>';
}

$pageTitle = 'Diagnostic serveur';
$activeNav = 'diagnostic';
require __DIR__ . '/includes/header.php';
?>

<div class="card">
  <h2>Support des photos iPhone (HEIC)</h2>
  <p class="help" style="margin-top:0">Cette section répond directement à la question « le problème vient-il du serveur ? » pour un envoi de photo qui échoue.</p>
  <table>
    <tr><td>Conversion automatique HEIC → JPEG</td><td><?= pill($heicOk, 'Disponible', 'Indisponible') ?></td></tr>
    <tr><td>Extension Imagick</td><td><?= pill($imagickOk, 'Installée', 'Absente') ?></td></tr>
    <?php if ($imagickOk): ?>
    <tr><td>Version ImageMagick</td><td><?= htmlspecialchars($imagickVersion ?? '—') ?></td></tr>
    <tr><td>Formats HEIC/HEIF reconnus par Imagick</td><td><?= pill(count(array_intersect(['HEIC', 'HEIF'], $imagickFormats)) > 0) ?></td></tr>
    <?php endif; ?>
  </table>
  <?php if (!$heicOk): ?>
    <div class="help" style="margin-top:12px">
      <?php if (!$imagickOk): ?>
        L'extension Imagick n'est pas installée sur cet hébergement. Sur o2switch, elle s'active dans cPanel > « Sélecteur de version PHP » > Extensions PHP (cochez « imagick »). Si elle reste indisponible après activation, contactez le support o2switch pour confirmer que le délégué <strong>libheif</strong> est compilé avec ImageMagick — certaines offres mutualisées ne l'incluent pas.
      <?php else: ?>
        Imagick est installé mais ne sait pas décoder le HEIC/HEIF sur ce serveur (délégué libheif absent du binaire ImageMagick). Cela se configure côté hébergeur, pas depuis ce site — contactez le support o2switch en leur indiquant ce diagnostic.
      <?php endif; ?>
      En attendant, l'administration affiche un message clair à l'envoi d'une photo HEIC, demandant de l'exporter en JPG depuis l'iPhone.
    </div>
  <?php else: ?>
    <div class="help" style="margin-top:12px">Les photos HEIC envoyées depuis l'administration sont converties automatiquement — aucune action n'est nécessaire côté iPhone.</div>
  <?php endif; ?>
</div>

<div class="card">
  <h2>Formats d'image acceptés par le serveur</h2>
  <table>
    <tr><td>Extension GD</td><td><?= pill($gdOk, 'Installée', 'Absente') ?></td></tr>
    <?php foreach ($gdFormats as $label => $ok): ?>
    <tr><td>Lecture/écriture <?= htmlspecialchars($label) ?> (GD)</td><td><?= pill($ok) ?></td></tr>
    <?php endforeach; ?>
    <tr><td>Lecture des données EXIF (orientation photo)</td><td><?= pill($exifOk) ?></td></tr>
  </table>
  <div class="help" style="margin-top:12px">JPG, PNG et WebP sont pris en charge nativement par GD, requis pour que l'administration fonctionne. Le HEIC dépend d'Imagick (ci-dessus) et passe par une conversion préalable en JPEG avant le même traitement.</div>
</div>

<div class="card">
  <h2>Limites d'envoi</h2>
  <table>
    <tr><td>Taille max. par photo (réglage de ce site)</td><td><strong><?= $appMaxMb ?> Mo</strong></td></tr>
    <tr><td>Largeur des miniatures générées</td><td><strong><?= $thumbWidth ?> px</strong></td></tr>
    <tr><td><code>upload_max_filesize</code> (serveur PHP)</td><td><?= htmlspecialchars($phpUploadMax) ?></td></tr>
    <tr><td><code>post_max_size</code> (serveur PHP)</td><td><?= htmlspecialchars($phpPostMax) ?></td></tr>
    <tr><td><code>max_file_uploads</code> (serveur PHP)</td><td><?= htmlspecialchars((string) $phpMaxFiles) ?></td></tr>
  </table>
  <div class="help" style="margin-top:12px">Si <code>upload_max_filesize</code> ou <code>post_max_size</code> affichent une valeur plus basse que celle attendue (voir <code>admin/.user.ini</code>), le réglage n'a pas encore été pris en compte par le serveur — cela peut prendre quelques minutes après la mise en ligne (mise en cache de PHP-FPM), ou nécessiter que l'hébergeur autorise ce fichier de configuration.</div>
</div>

<div class="card">
  <h2>Informations générales</h2>
  <table>
    <tr><td>Version PHP</td><td><?= htmlspecialchars(PHP_VERSION) ?></td></tr>
    <tr><td>Système</td><td><?= htmlspecialchars(PHP_OS) ?></td></tr>
  </table>
  <div class="help" style="margin-top:12px">Cette page est en lecture seule : elle ne modifie aucun réglage. Elle observe uniquement ce que le serveur propose actuellement.</div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
