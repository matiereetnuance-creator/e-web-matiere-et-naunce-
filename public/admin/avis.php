<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$settings = load_content('settings', []);
$config = require __DIR__ . '/../api/config.php';
$googleConfigured = !empty($config['google_places_api_key']) && !empty($config['google_place_id']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();
    $settings['avis_section_enabled'] = !empty($_POST['avis_enabled']);
    save_content('settings', $settings);
    $_SESSION['flash'] = ['type' => 'ok', 'message' => 'Réglage mis à jour.'];
    header('Location: avis.php');
    exit;
}

$csrf = admin_csrf_token();
$pageTitle = 'Avis Google';
$activeNav = 'avis';
require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <h2>Synchronisation Google</h2>
  <p style="color:var(--ink-soft);margin-top:0">
    Les avis affichés sur le site proviennent automatiquement de votre fiche Google Business Profile
    (API officielle Google Places) — ils ne se modifient pas ici, exactement comme sur votre fiche Google.
  </p>
  <table>
    <tr><td>État</td><td><strong><?= $googleConfigured ? '✅ Synchronisation active' : '⏳ Non configurée pour l\'instant' ?></strong></td></tr>
  </table>
  <?php if (!$googleConfigured): ?>
    <div class="help" style="margin-top:10px">
      Tant que la clé API Google n'est pas renseignée (voir <code>docs/DEPLOIEMENT.md</code>, section 5),
      le site affiche des avis de secours identiques à ceux du design validé.
    </div>
  <?php endif; ?>
</div>

<div class="card">
  <h2>Affichage de la section</h2>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
    <div class="toggle-row">
      <div>
        <div style="font-weight:600">Afficher la section « Avis » sur le site</div>
        <div class="help">Masque à la fois la page /avis et le bloc d'avis sur l'accueil, si besoin.</div>
      </div>
      <label class="switch">
        <input type="checkbox" name="avis_enabled" <?= !empty($settings['avis_section_enabled']) ? 'checked' : '' ?> onchange="this.form.submit()">
        <span class="slider"></span>
      </label>
    </div>
  </form>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
