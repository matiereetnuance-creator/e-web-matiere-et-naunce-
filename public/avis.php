<?php
declare(strict_types=1);
require_once __DIR__ . '/api/lib/content.php';

$settings = load_content('settings', []);
if (!($settings['avis_section_enabled'] ?? true)) {
    header('Location: /');
    exit;
}
$textes = load_content('textes', []);
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

<header style="padding:110px 64px 80px">
  <div class="container" style="padding:0;max-width:1280px;display:flex;justify-content:space-between;align-items:flex-end;gap:40px;flex-wrap:wrap">
    <div>
      <div data-mn-reveal style="display:flex;align-items:center;gap:18px">
        <img data-mn-amp src="/assets/img/esperluette-beige.svg" alt="" style="height:44px" width="44" height="44">
        <span style="font:500 13px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">AVIS</span>
      </div>
      <h1 class="mn-h1" data-mn-reveal style="font:400 76px/1.06 'Instrument Serif',serif;color:#2b2926;margin:26px 0 0;max-width:820px;font-weight:400;text-wrap:balance">Ils nous ont confié leur <em style="font-style:italic;color:#8a7a63">intérieur.</em></h1>
    </div>
    <div data-mn-reveal class="mn-rating" style="align-items:baseline;gap:18px;padding-bottom:10px" data-mn-google-rating>
      <span style="font:400 64px 'Instrument Serif',serif;color:#2b2926" data-mn-rating-score><?= t($textes, 'avis_score', '4,9') ?></span>
      <span style="color:#c8b394;font-size:24px;letter-spacing:5px" aria-hidden="true">★★★★★</span>
      <span style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.16em;color:#8a7a63" data-mn-rating-count><?= t($textes, 'avis_count', '47') ?> AVIS GOOGLE</span>
    </div>
  </div>
</header>

<section style="padding:0 64px 90px">
  <div class="container mn-grid-3" style="padding:0;max-width:1280px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px" data-mn-reviews-grid>
    <blockquote data-mn-reveal class="quote-card quote-card--alt">
      <div class="quote-card__stars" aria-hidden="true">★★★★★</div>
      <p class="quote-card__text">« Un chantier d'une propreté irréprochable et des murs parfaitement tendus. On sent le souci du détail à chaque étape. »</p>
      <footer class="quote-card__meta">Claire M. — Écully <span>· il y a 2 mois</span></footer>
    </blockquote>
    <blockquote data-mn-reveal class="quote-card quote-card--alt">
      <div class="quote-card__stars" aria-hidden="true">★★★★★</div>
      <p class="quote-card__text">« Des conseils de teintes remarquables : la pièce a changé d'âme. Délais tenus, équipe discrète et précise. »</p>
      <footer class="quote-card__meta">Bruno T. — Tassin-la-Demi-Lune <span>· il y a 4 mois</span></footer>
    </blockquote>
    <blockquote data-mn-reveal class="quote-card quote-card--alt">
      <div class="quote-card__stars" aria-hidden="true">★★★★★</div>
      <p class="quote-card__text">« Le béton ciré de notre salle d'eau est magnifique, la finition est digne d'un hôtel. Nous recommandons sans réserve. »</p>
      <footer class="quote-card__meta">Sophie L. — Villefranche <span>· il y a 6 mois</span></footer>
    </blockquote>
    <blockquote data-mn-reveal class="quote-card quote-card--alt">
      <div class="quote-card__stars" aria-hidden="true">★★★★★</div>
      <p class="quote-card__text">« Rénovation complète de notre séjour : ponctuels, soigneux, de très bon conseil. Le rendu dépasse ce que nous imaginions. »</p>
      <footer class="quote-card__meta">Hélène &amp; Marc D. — Charbonnières <span>· il y a 7 mois</span></footer>
    </blockquote>
    <blockquote data-mn-reveal class="quote-card quote-card--alt">
      <div class="quote-card__stars" aria-hidden="true">★★★★★</div>
      <p class="quote-card__text">« Devis clair, chantier protégé du sol au plafond, et un blanc absolument parfait. Une vraie maison de confiance. »</p>
      <footer class="quote-card__meta">Julien R. — Craponne <span>· il y a 9 mois</span></footer>
    </blockquote>
    <blockquote data-mn-reveal class="quote-card quote-card--alt">
      <div class="quote-card__stars" aria-hidden="true">★★★★★</div>
      <p class="quote-card__text">« Le meuble vasque en béton ciré est une pièce unique. Un travail d'artisan, au sens le plus noble du terme. »</p>
      <footer class="quote-card__meta">Anne S. — Sainte-Foy-lès-Lyon <span>· il y a 11 mois</span></footer>
    </blockquote>
  </div>
  <div data-mn-reveal style="text-align:center;margin-top:52px">
    <a class="link-underline" data-mn-google-link href="https://search.google.com/local/writereview?placeid=" target="_blank" rel="noopener">VOIR TOUS LES AVIS SUR GOOGLE →</a>
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

<?php require __DIR__ . '/includes/footer.php'; ?>

<script src="/assets/js/main.js" defer></script>
<script src="/assets/js/google-reviews.js" defer></script>
</body>
</html>
