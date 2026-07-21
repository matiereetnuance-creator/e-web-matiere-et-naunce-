<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$realisations = load_content('realisations', []);
$settings = load_content('settings', []);
$textes = load_content('textes', []);
$config = require __DIR__ . '/../api/config.php';
$googleConfigured = !empty($config['google_places_api_key']) && !empty($config['google_place_id']);
$avis = avis_display_snapshot($textes);
$deploy = deploy_info_snapshot();
$seoHealth = seo_health_snapshot();

$totalPhotos = 0;
foreach ($realisations as $r) {
    if (!empty($r['image_main'])) $totalPhotos++;
    if (!empty($r['avant'])) $totalPhotos++;
    if (!empty($r['apres'])) $totalPhotos++;
    $totalPhotos += count($r['gallery'] ?? []);
}

/** Formatte une date ISO 8601 en "21/07/2026 à 14h32" (français, sans dépendance). */
function admin_format_datetime(?string $iso): ?string
{
    if (!$iso) {
        return null;
    }
    $ts = strtotime($iso);
    return $ts !== false ? date('d/m/Y \à H\hi', $ts) : null;
}

$pageTitle = 'Tableau de bord';
$activeNav = 'dashboard';
require __DIR__ . '/includes/header.php';
?>
<?php if (admin_using_default_password()): ?>
<div class="card" style="border:1px solid #d99;background:#fff5f5">
  <h2 style="color:#a33">⚠️ Mot de passe par défaut en cours d'utilisation</h2>
  <p style="margin:0 0 12px;color:var(--ink-soft)">Aucun mot de passe personnalisé n'a été enregistré sur cet hébergement : le site utilise le mot de passe par défaut du code source. Définissez votre propre mot de passe dès maintenant.</p>
  <a class="btn" href="password.php">Changer le mot de passe →</a>
</div>
<?php endif; ?>
<div class="card">
  <h2>Bienvenue</h2>
  <p style="margin:0;color:var(--ink-soft)">Gérez ici le contenu du site — réalisations, textes, photos, SEO — sans toucher au code. Le design public reste toujours strictement identique à celui validé.</p>
</div>

<div class="card">
  <h2>État du site</h2>
  <div class="stat-grid">
    <div class="stat-tile">
      <div class="stat-tile__label">Site</div>
      <div class="stat-tile__value"><span class="pill pill-ok">● En ligne</span></div>
    </div>
    <div class="stat-tile">
      <div class="stat-tile__label">Dernier déploiement</div>
      <?php if ($deploy && admin_format_datetime($deploy['deployed_at'] ?? null)): ?>
        <div class="stat-tile__value" style="font-size:19px"><?= htmlspecialchars(admin_format_datetime($deploy['deployed_at'])) ?></div>
        <?php if (!empty($deploy['version'])): ?><div class="stat-tile__sub">Version <?= htmlspecialchars($deploy['version']) ?></div><?php endif; ?>
      <?php else: ?>
        <div class="stat-tile__value" style="font-size:19px;color:var(--ink-soft)">—</div>
      <?php endif; ?>
    </div>
    <div class="stat-tile">
      <div class="stat-tile__label">Google Business</div>
      <?php if ($avis['score_raw'] !== null): ?>
        <div class="stat-tile__value"><?= htmlspecialchars($avis['score']) ?> <span style="font-size:14px;font-weight:400;color:var(--ink-soft)">/ 5</span></div>
        <div class="stat-tile__sub"><?= htmlspecialchars($avis['count']) ?> avis<?php $syncedAt = admin_format_datetime($avis['fetched_at'] ?? null); ?><?= $syncedAt ? ' · synchronisé le ' . htmlspecialchars($syncedAt) : '' ?></div>
      <?php else: ?>
        <div class="stat-tile__value" style="font-size:19px;color:var(--ink-soft)">Non configuré</div>
        <div class="stat-tile__sub"><a href="avis.php">Voir →</a></div>
      <?php endif; ?>
    </div>
    <div class="stat-tile">
      <div class="stat-tile__label">Réalisations</div>
      <div class="stat-tile__value"><?= count($realisations) ?></div>
      <div class="stat-tile__sub"><a href="realisations.php">Gérer →</a></div>
    </div>
    <div class="stat-tile">
      <div class="stat-tile__label">Photos publiées</div>
      <div class="stat-tile__value"><?= $totalPhotos ?></div>
    </div>
    <div class="stat-tile stat-tile--wide">
      <div class="stat-tile__label">État SEO</div>
      <div class="stat-tile__seo-rows">
        <div>Sitemap <span class="pill <?= $seoHealth['sitemap'] ? 'pill-ok' : 'pill-danger' ?>"><?= $seoHealth['sitemap'] ? '✓' : '✕' ?></span></div>
        <div>Robots.txt <span class="pill <?= $seoHealth['robots'] ? 'pill-ok' : 'pill-danger' ?>"><?= $seoHealth['robots'] ? '✓' : '✕' ?></span></div>
        <div>Données structurées <span class="pill <?= $seoHealth['schema'] ? 'pill-ok' : 'pill-danger' ?>"><?= $seoHealth['schema'] ? '✓' : '✕' ?></span></div>
        <div>OpenGraph <span class="pill <?= $seoHealth['opengraph'] ? 'pill-ok' : 'pill-danger' ?>"><?= $seoHealth['opengraph'] ? '✓' : '✕' ?></span></div>
      </div>
    </div>
  </div>
  <div class="btn-row">
    <?php if ($avis['google_url']): ?><a class="btn" href="<?= htmlspecialchars($avis['google_url']) ?>" target="_blank" rel="noopener">Ouvrir la fiche Google →</a><?php endif; ?>
    <a class="btn btn-ghost" href="avis.php">Section Avis : <?= !empty($settings['avis_section_enabled']) ? 'affichée' : 'masquée' ?> →</a>
    <a class="btn btn-ghost" href="parametres.php"><?= htmlspecialchars($settings['contact_recipient'] ?? 'Réglages') ?> →</a>
  </div>
</div>

<div class="card">
  <h2>Actions rapides</h2>
  <div class="btn-row">
    <a class="btn" href="realisation-edit.php">+ Ajouter une réalisation</a>
    <a class="btn btn-ghost" href="textes.php">Modifier les textes</a>
    <a class="btn btn-ghost" href="photos.php">Changer une photo</a>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
