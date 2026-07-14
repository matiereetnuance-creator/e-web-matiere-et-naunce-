<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$realisations = load_content('realisations', []);
$settings = load_content('settings', []);
$config = require __DIR__ . '/../api/config.php';
$googleConfigured = !empty($config['google_places_api_key']) && !empty($config['google_place_id']);

$pageTitle = 'Tableau de bord';
$activeNav = 'dashboard';
require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <h2>Bienvenue</h2>
  <p style="margin:0;color:var(--ink-soft)">Gérez ici le contenu du site — réalisations, textes, photos, SEO — sans toucher au code. Le design public reste toujours strictement identique à celui validé.</p>
</div>

<div class="card">
  <h2>Aperçu</h2>
  <table>
    <tr><td>Réalisations publiées</td><td><strong><?= count($realisations) ?></strong></td><td><a href="realisations.php">Gérer →</a></td></tr>
    <tr><td>Section Avis</td><td><strong><?= !empty($settings['avis_section_enabled']) ? 'Affichée' : 'Masquée' ?></strong></td><td><a href="avis.php">Gérer →</a></td></tr>
    <tr><td>Synchronisation Google Avis</td><td><strong><?= $googleConfigured ? 'Active' : 'Non configurée' ?></strong></td><td><a href="avis.php">Voir →</a></td></tr>
    <tr><td>E-mail de réception du formulaire</td><td><strong><?= htmlspecialchars($settings['contact_recipient'] ?? '—') ?></strong></td><td><a href="parametres.php">Gérer →</a></td></tr>
  </table>
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
