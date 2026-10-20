<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$pages = [
    'home' => 'Accueil',
    'savoir-faire' => 'Savoir-faire',
    'realisations' => 'Réalisations',
    'entreprise' => "L'entreprise",
    'avis' => 'Avis',
    'contact' => 'Contact',
];

$seo = load_content('seo', []);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();
    foreach ($pages as $key => $label) {
        $seo[$key] = [
            'title' => clean_text((string) ($_POST[$key]['title'] ?? ''), 160),
            'description' => clean_text((string) ($_POST[$key]['description'] ?? ''), 300),
            'og_title' => clean_text((string) ($_POST[$key]['og_title'] ?? ''), 160),
            'og_description' => clean_text((string) ($_POST[$key]['og_description'] ?? ''), 300),
        ];
    }
    save_content('seo', $seo);
    $_SESSION['flash'] = ['type' => 'ok', 'message' => 'SEO mis à jour pour toutes les pages.'];
    header('Location: seo.php');
    exit;
}

$csrf = admin_csrf_token();
$pageTitle = 'Référencement (SEO)';
$activeNav = 'seo';
require __DIR__ . '/includes/header.php';
?>
<form method="post">
  <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
  <?php foreach ($pages as $key => $label): $p = $seo[$key] ?? []; ?>
  <div class="card">
    <h2><?= htmlspecialchars($label) ?> <span class="muted">— <?= $key === 'home' ? '/' : '/' . $key ?></span></h2>
    <div class="field">
      <label>Meta Title</label>
      <input type="text" name="<?= $key ?>[title]" value="<?= htmlspecialchars($p['title'] ?? '') ?>">
    </div>
    <div class="field">
      <label>Meta Description</label>
      <textarea name="<?= $key ?>[description]" rows="2"><?= htmlspecialchars($p['description'] ?? '') ?></textarea>
    </div>
    <div class="field-row">
      <div class="field">
        <label>Titre Open Graph <span class="muted">(réseaux sociaux)</span></label>
        <input type="text" name="<?= $key ?>[og_title]" value="<?= htmlspecialchars($p['og_title'] ?? '') ?>">
      </div>
      <div class="field">
        <label>Description Open Graph</label>
        <input type="text" name="<?= $key ?>[og_description]" value="<?= htmlspecialchars($p['og_description'] ?? '') ?>">
      </div>
    </div>
  </div>
  <?php endforeach; ?>
  <div class="btn-row">
    <button type="submit" class="btn">Enregistrer</button>
    <a href="index.php" class="btn btn-ghost">Annuler</a>
  </div>
</form>
<?php require __DIR__ . '/includes/footer.php'; ?>
