<?php
declare(strict_types=1);
require_once __DIR__ . '/api/lib/content.php';

$realisations = load_content('realisations', []);
$pageKey = 'realisations';
$canonicalPath = 'realisations';
?><!DOCTYPE html>
<html lang="fr">
<head>
<?php
$extraJsonLd = '<script type="application/ld+json">' . json_encode([
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Accueil', 'item' => 'https://www.matiereetnuance.fr/'],
        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Réalisations', 'item' => 'https://www.matiereetnuance.fr/realisations'],
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
require __DIR__ . '/includes/seo-head.php';
?>
</head>
<body>

<?php $activePage = 'realisations'; require __DIR__ . '/includes/nav.php'; ?>

<main>

<header style="padding:110px 64px 70px">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;align-items:center;gap:18px">
      <img data-mn-amp src="/assets/img/esperluette-beige.svg" alt="" style="height:44px" width="44" height="44">
      <span style="font:500 13px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">RÉALISATIONS</span>
    </div>
    <h1 class="mn-h1" data-mn-reveal style="font:400 76px/1.06 'Instrument Serif',serif;color:#2b2926;margin:26px 0 0;max-width:900px;font-weight:400;text-wrap:balance">La preuve par le <em style="font-style:italic;color:#8a7a63">geste.</em></h1>
    <p data-mn-reveal class="mn-body-lg" style="font:400 16px/1.9 'Instrument Sans',sans-serif;color:#6c665c;margin:30px 0 0;max-width:560px">Découvrez une sélection de réalisations qui reflètent notre façon de travailler. Chaque chantier est pensé avec le même soin, des premières préparations jusqu'aux dernières finitions.</p>
  </div>
</header>

<section style="padding:40px 64px 90px">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;justify-content:space-between;align-items:baseline">
      <h2 class="mn-h2--md" style="font:400 40px/1.1 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">La <em style="font-style:italic;color:#8a7a63">métamorphose</em></h2>
      <span style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.2em;color:#a6947c">GLISSEZ POUR COMPARER</span>
    </div>
    <?php
      // Calque de base (toujours visible) = APRÈS. Calque du dessus, découpé
      // par clip-path pour ne montrer que sa partie gauche (voir setP() dans
      // main.js) = AVANT. Résultat : AVANT à gauche, APRÈS à droite — ne pas
      // permuter l'un sans l'autre, ni sans les étiquettes ci-dessous.
    ?>
    <div data-mn-reveal data-ba style="height:600px;margin-top:44px">
      <div style="position:absolute;inset:0">
        <?= render_photo(photo_src('ba-apres'), 'Même pièce après travaux de peinture et plâtrerie', 'width="1200" height="600" loading="lazy"') ?>
      </div>
      <div data-ba-top style="clip-path:inset(0 45% 0 0)">
        <?= render_photo(photo_src('ba-avant'), 'Pièce avant travaux de rénovation', 'width="1200" height="600" loading="lazy"') ?>
      </div>
      <div data-ba-line style="left:55%;width:2px">
        <div class="mn-ba-handle">
          <span class="mn-ba-arrow mn-ba-arrow--l" aria-hidden="true">‹</span>
          <img src="/assets/img/esperluette-beige.svg" alt="" style="height:29px">
          <span class="mn-ba-arrow mn-ba-arrow--r" aria-hidden="true">›</span>
        </div>
      </div>
      <div style="position:absolute;left:24px;bottom:20px;font:500 11px 'Instrument Sans',sans-serif;letter-spacing:.22em;color:#f7f3ec;background:rgba(43,41,38,.55);padding:8px 14px;backdrop-filter:blur(4px)">AVANT</div>
      <div style="position:absolute;right:24px;bottom:20px;font:500 11px 'Instrument Sans',sans-serif;letter-spacing:.22em;color:#f7f3ec;background:rgba(43,41,38,.55);padding:8px 14px;backdrop-filter:blur(4px)">APRÈS</div>
    </div>
  </div>
</section>

<section style="padding:0 64px 90px">
  <div class="container" style="padding:0;max-width:1280px">
    <?php if (!$realisations): ?>
      <p style="color:#6c665c">Les réalisations seront bientôt en ligne.</p>
    <?php else: ?>
    <div class="mn-realisations-grid" style="display:grid;grid-template-columns:1.5fr 1fr;gap:28px">
      <?php $heights = [520, 380, 380, 520, 420, 420]; ?>
      <?php foreach ($realisations as $i => $r): $h = cycle_pattern($heights, $i); $caption = ($r['title'] ?? '') . ' — ' . ($r['ville'] ?? ''); ?>
      <figure class="mn-fig" data-mn-reveal data-fig-title="<?= htmlspecialchars($caption) ?>" data-fig-tag="<?= htmlspecialchars($r['prestations'] ?? '') ?>"<?= ($i === 1) ? ' style="align-self:end"' : '' ?>>
        <a href="/realisations/<?= rawurlencode($r['id']) ?>" style="display:block;color:inherit">
          <div class="mn-fig__img" style="height:<?= (int) $h ?>px">
            <div class="mn-fig__img-inner"><?= render_photo(realisation_main_image_url($r), $r['image_main_alt'] ?: suggest_alt($r['title'] ?? '', $r['ville'] ?? ''), 'width="800" height="' . (int) $h . '" loading="' . ($i === 0 ? 'eager" fetchpriority="high' : 'lazy') . '"') ?></div>
          </div>
          <figcaption class="mn-fig__caption"><span class="mn-fig__caption-title"><?= htmlspecialchars($caption) ?></span><span class="mn-fig__caption-tag"><?= htmlspecialchars($r['prestations'] ?? '') ?></span></figcaption>
        </a>
      </figure>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>
</section>

<section style="padding:0 64px 96px">
  <div data-mn-reveal class="cta-dark">
    <img class="cta-dark__amp" src="/assets/img/esperluette-laiton.svg" alt="">
    <div style="position:relative">
      <div class="cta-dark__title">Votre intérieur mérite la même <em style="font-style:italic;color:#c8b394">attention.</em></div>
      <div class="cta-dark__sub">Parlons de votre pièce, de votre projet.</div>
    </div>
    <a class="btn-outline-gold" style="position:relative" href="/contact">DEMANDER UN ÉCHANGE</a>
  </div>
</section>

</main>

<?php require __DIR__ . '/includes/footer.php'; ?>

<script src="/assets/js/main.js" defer></script>
</body>
</html>
