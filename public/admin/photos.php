<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$slots = [
    'Accueil' => [
        'hero-main' => 'Photo principale du hero',
        'hero-detail' => 'Détail matière (hero)',
        'sf-platrerie' => 'Carte « Plâtrerie »',
        'sf-peinture' => 'Carte « Peinture »',
        'sf-beton' => 'Carte « Béton ciré »',
        'entreprise-portrait' => 'Portrait (section entreprise)',
        'zone-carte' => 'Carte de zone d\'intervention',
    ],
    'Savoir-faire' => [
        'sf-page-platrerie' => 'Plâtrerie — photo pleine page',
        'sf-page-peinture' => 'Peinture — photo pleine page',
        'sf-page-beton' => 'Béton ciré — photo pleine page',
    ],
    'L\'entreprise' => [
        'ent-portrait' => 'Portrait du fondateur',
        'ent-garanties' => 'Détail — outils, nuancier',
    ],
    'Réalisations — comparateur avant/après' => [
        'ba-avant' => 'Photo « avant »',
        'ba-apres' => 'Photo « après »',
    ],
    'Contact' => [
        'contact-carte' => 'Carte de zone d\'intervention',
    ],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();
    $slot = clean_text((string) ($_POST['slot'] ?? ''), 60);
    $allSlots = array_merge(...array_values($slots));
    if (isset($allSlots[$slot]) && !empty($_FILES['photo']['name'])) {
        $result = optimize_and_store_upload($_FILES['photo'], MN_UPLOADS_DIR, $slot);
        $_SESSION['flash'] = $result['ok']
            ? ['type' => 'ok', 'message' => 'Photo mise à jour : ' . $allSlots[$slot] . '.']
            : ['type' => 'error', 'message' => upload_error_with_details($result)];
    }
    header('Location: photos.php');
    exit;
}

$csrf = admin_csrf_token();
$pageTitle = 'Photos du site';
$activeNav = 'photos';
require __DIR__ . '/includes/header.php';
?>
<script src="assets/dropzone.js" defer></script>

<?php foreach ($slots as $group => $items): ?>
<div class="card">
  <h2><?= htmlspecialchars($group) ?></h2>
  <?php foreach ($items as $slot => $label): ?>
    <div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--line)">
      <img class="thumb" style="width:96px;height:66px" src="../<?= htmlspecialchars(photo_src($slot)) ?>" alt="">
      <div style="flex:1"><?= htmlspecialchars($label) ?></div>
      <form method="post" enctype="multipart/form-data" style="display:flex;align-items:center;gap:8px">
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
        <input type="hidden" name="slot" value="<?= htmlspecialchars($slot) ?>">
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" required style="font-size:12px;max-width:190px">
        <button type="submit" class="btn btn-ghost" style="padding:8px 14px">Remplacer</button>
      </form>
    </div>
  <?php endforeach; ?>
</div>
<?php endforeach; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>
