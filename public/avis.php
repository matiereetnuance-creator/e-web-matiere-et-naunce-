<?php
declare(strict_types=1);
require_once __DIR__ . '/api/lib/content.php';

$settings = load_content('settings', []);
if (!($settings['avis_section_enabled'] ?? true)) {
    header('Location: /');
    exit;
}
$textes = load_content('textes', []);
$avis = avis_display_snapshot($textes);
$pageKey = 'avis';
$canonicalPath = 'avis';
$extraJsonLd = '<script type="application/ld+json">' . json_encode([
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Accueil', 'item' => 'https://www.matiereetnuance.fr/'],
        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Avis', 'item' => 'https://www.matiereetnuance.fr/avis'],
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
?><!DOCTYPE html>
<html lang="fr">
<head>
<?php require __DIR__ . '/includes/seo-head.php'; ?>
</head>
<body>

<?php $activePage = 'avis'; require __DIR__ . '/includes/nav.php'; ?>

<main id="main-content">

<header style="padding:110px 64px 80px">
  <div class="container" style="padding:0;max-width:1280px;display:flex;justify-content:space-between;align-items:flex-end;gap:40px;flex-wrap:wrap">
    <div>
      <div data-mn-reveal style="display:flex;align-items:center;gap:18px">
        <img data-mn-amp src="/assets/img/esperluette-beige.svg" alt="" style="height:44px" width="44" height="44">
        <span style="font:500 13px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">AVIS</span>
      </div>
      <h1 class="mn-h1" data-mn-reveal style="font:400 76px/1.06 'Instrument Serif',serif;color:#2b2926;margin:26px 0 0;max-width:820px;font-weight:400;text-wrap:balance">Ils nous ont confié leur <em style="font-style:italic;color:#8a7a63">intérieur.</em></h1>
      <p data-mn-reveal class="mn-body-lg" style="font:400 15px/1.85 'Instrument Sans',sans-serif;color:#6c665c;margin:24px 0 0;max-width:540px"><?= t($textes, 'avis_zone_note', "Ces avis proviennent de particuliers et de professionnels qui nous ont confié leurs projets dans l'ensemble de l'Ouest lyonnais et du Beaujolais.") ?></p>
    </div>
    <div data-mn-reveal class="mn-rating" style="align-items:baseline;gap:18px;padding-bottom:10px" data-mn-google-rating>
      <span style="font:400 64px 'Instrument Serif',serif;color:#2b2926" data-mn-rating-score><?= $avis['score'] ?></span>
      <span style="color:#c8b394;font-size:24px;letter-spacing:5px" aria-hidden="true">★★★★★</span>
      <span style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.16em;color:#8a7a63" data-mn-rating-count><?= $avis['count'] ?> AVIS GOOGLE</span>
    </div>
  </div>
</header>

<section style="padding:0 64px 90px">
  <div class="container mn-grid-3" style="padding:0;max-width:1280px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px" data-mn-reviews-grid>
    <?php foreach (fallback_avis() as $item): ?>
      <blockquote data-mn-reveal class="quote-card quote-card--alt">
        <div class="quote-card__stars" aria-hidden="true"><?= avis_star_string((int) ($item['rating'] ?? 5)) ?></div>
        <p class="quote-card__text">« <?= htmlspecialchars($item['text'] ?? '') ?> »</p>
        <footer class="quote-card__meta"><?= htmlspecialchars($item['author_name'] ?? '') ?> — <?= htmlspecialchars($item['commune'] ?? '') ?> <span>· <?= htmlspecialchars($item['relative_time'] ?? '') ?></span></footer>
      </blockquote>
    <?php endforeach; ?>
  </div>
  <div data-mn-reveal style="text-align:center;margin-top:52px">
    <a class="link-underline" data-mn-google-link href="<?= htmlspecialchars($avis['google_url'] ?? 'https://www.google.com/search?q=Mati%C3%A8re+%26+Nuance+avis', ENT_QUOTES, 'UTF-8') ?>" target="_blank" rel="noopener">VOIR TOUS LES AVIS SUR GOOGLE →</a>
  </div>
</section>

<section style="padding:0 64px 96px">
  <div data-mn-reveal class="cta-dark">
    <img class="cta-dark__amp" src="/assets/img/esperluette-laiton.svg" alt="">
    <div style="position:relative">
      <div class="cta-dark__title">Et si le prochain avis était le <em style="font-style:italic;color:#c8b394">vôtre ?</em></div>
      <div class="cta-dark__sub">Décrivez-nous votre projet, nous répondons sous 48 h.</div>
    </div>
    <a class="btn-outline-gold" style="position:relative" href="/contact">DEMANDER UN ÉCHANGE</a>
  </div>
</section>

</main>

<?php require __DIR__ . '/includes/footer.php'; ?>

<script src="/assets/js/main.js?v=<?= asset_version('assets/js/main.js') ?>" defer></script>
<script src="/assets/js/google-reviews.js?v=<?= asset_version('assets/js/google-reviews.js') ?>" defer></script>
</body>
</html>
