<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$fields = [
    'home_eyebrow', 'home_title', 'home_title_emphasis', 'home_intro', 'home_entreprise_intro',
    'ent_histoire_lead', 'ent_histoire_p1', 'ent_histoire_p2', 'ent_histoire_conclusion',
    'stat_years', 'stat_rating', 'stat_clients',
    'avis_score', 'avis_count',
    'contact_phone', 'contact_email', 'contact_zone',
];

$textes = load_content('textes', []);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();
    foreach ($fields as $f) {
        $textes[$f] = clean_text((string) ($_POST[$f] ?? ''), 3000);
    }
    save_content('textes', $textes);
    $_SESSION['flash'] = ['type' => 'ok', 'message' => 'Textes mis à jour.'];
    header('Location: textes.php');
    exit;
}

$csrf = admin_csrf_token();
$pageTitle = 'Textes du site';
$activeNav = 'textes';
require __DIR__ . '/includes/header.php';

function field($name, $label, $textes, $multiline = false, $help = '')
{
    $val = htmlspecialchars($textes[$name] ?? '');
    echo '<div class="field"><label for="' . $name . '">' . htmlspecialchars($label) . '</label>';
    if ($multiline) {
        echo '<textarea id="' . $name . '" name="' . $name . '" rows="3">' . $val . '</textarea>';
    } else {
        echo '<input type="text" id="' . $name . '" name="' . $name . '" value="' . $val . '">';
    }
    if ($help) {
        echo '<div class="help">' . htmlspecialchars($help) . '</div>';
    }
    echo '</div>';
}
?>
<form method="post">
  <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">

  <div class="card">
    <h2>Page d'accueil</h2>
    <?php field('home_eyebrow', 'Ligne d\'introduction (au-dessus du titre)', $textes); ?>
    <div class="field-row">
      <?php field('home_title', 'Titre principal', $textes); ?>
      <?php field('home_title_emphasis', 'Fin du titre (en italique doré)', $textes); ?>
    </div>
    <?php field('home_intro', 'Texte à côté des photos d\'accueil', $textes, true); ?>
    <?php field('home_entreprise_intro', 'Paragraphe « L\'entreprise » (accueil)', $textes, true); ?>
  </div>

  <div class="card">
    <h2>Histoire de l'entreprise</h2>
    <?php field('ent_histoire_lead', 'Phrase d\'ouverture', $textes, true); ?>
    <?php field('ent_histoire_p1', 'Premier paragraphe', $textes, true); ?>
    <?php field('ent_histoire_p2', 'Second paragraphe', $textes, true); ?>
    <?php field('ent_histoire_conclusion', 'Phrase de conclusion (italique)', $textes, true); ?>
  </div>

  <div class="card">
    <h2>Chiffres clés <span class="muted">(page L'entreprise)</span></h2>
    <div class="field-row">
      <?php field('stat_years', 'Années d\'expérience', $textes); ?>
      <?php field('stat_rating', 'Note Google', $textes); ?>
    </div>
    <?php field('stat_clients', 'Clients accompagnés', $textes); ?>
  </div>

  <div class="card">
    <h2>Note Avis <span class="muted">(affichée tant que la synchronisation Google n'est pas active)</span></h2>
    <div class="field-row">
      <?php field('avis_score', 'Note moyenne (ex. 4,9)', $textes); ?>
      <?php field('avis_count', 'Nombre d\'avis', $textes); ?>
    </div>
  </div>

  <div class="card">
    <h2>Coordonnées affichées sur le site</h2>
    <div class="field-row">
      <?php field('contact_phone', 'Téléphone', $textes); ?>
      <?php field('contact_email', 'E-mail affiché', $textes); ?>
    </div>
    <?php field('contact_zone', 'Description de la zone d\'intervention', $textes, true); ?>
    <div class="help">L'adresse e-mail qui <strong>reçoit</strong> les demandes du formulaire se règle dans « Réglages ».</div>
  </div>

  <div class="btn-row">
    <button type="submit" class="btn">Enregistrer</button>
    <a href="index.php" class="btn btn-ghost">Annuler</a>
  </div>
</form>
<?php require __DIR__ . '/includes/footer.php'; ?>
