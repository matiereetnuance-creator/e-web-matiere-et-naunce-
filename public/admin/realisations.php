<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete') {
    admin_csrf_check();
    $id = clean_text((string) ($_POST['id'] ?? ''), 80);
    $list = load_content('realisations', []);
    $before = count($list);
    $list = array_values(array_filter($list, static fn ($r) => ($r['id'] ?? '') !== $id));
    if (count($list) < $before) {
        save_content('realisations', $list);
        // Les photos ne sont pas supprimées automatiquement du disque : elles
        // restent disponibles en cas d'annulation involontaire.
        $_SESSION['flash'] = ['type' => 'ok', 'message' => 'Réalisation supprimée.'];
    }
    header('Location: realisations.php');
    exit;
}

$realisations = load_content('realisations', []);
$csrf = admin_csrf_token();

$pageTitle = 'Réalisations';
$activeNav = 'realisations';
require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <h2>Toutes les réalisations <span class="muted">(<?= count($realisations) ?>)</span></h2>
  <?php if (!$realisations): ?>
    <p class="empty">Aucune réalisation pour l'instant.</p>
  <?php else: ?>
  <table>
    <tr><th>Photo</th><th>Titre</th><th>Ville</th><th>Prestations</th><th>Page publique</th><th></th></tr>
    <?php foreach ($realisations as $r): ?>
    <tr>
      <td><img class="thumb" src="../<?= htmlspecialchars(realisation_main_image_url($r)) ?>" alt=""></td>
      <td><?= htmlspecialchars($r['title'] ?? '') ?></td>
      <td><?= htmlspecialchars($r['ville'] ?? '') ?></td>
      <td><?php if (!empty($r['prestations'])): ?><span class="pill"><?= htmlspecialchars($r['prestations']) ?></span><?php endif; ?></td>
      <td><a href="/realisations/<?= rawurlencode($r['id']) ?>" target="_blank">Voir ↗</a></td>
      <td style="white-space:nowrap">
        <a class="btn btn-ghost" style="padding:6px 12px" href="realisation-edit.php?id=<?= rawurlencode($r['id']) ?>">Modifier</a>
        <form method="post" style="display:inline" onsubmit="return confirm('Supprimer définitivement « <?= htmlspecialchars(addslashes($r['title'] ?? '')) ?> » ?');">
          <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
          <input type="hidden" name="action" value="delete">
          <input type="hidden" name="id" value="<?= htmlspecialchars($r['id']) ?>">
          <button type="submit" class="btn btn-danger" style="padding:6px 12px">Supprimer</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
  </table>
  <?php endif; ?>
  <div class="btn-row">
    <a class="btn" href="realisation-edit.php">+ Ajouter une réalisation</a>
  </div>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
