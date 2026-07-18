<?php
declare(strict_types=1);
require_once __DIR__ . '/api/lib/content.php';

$textes = load_content('textes', []);
$settings = load_content('settings', []);
$realisations = load_content('realisations', []);
$teaser = array_slice($realisations, 0, 4);
$avisEnabled = $settings['avis_section_enabled'] ?? true;
$instagram = $settings['instagram_url'] ?? 'https://www.instagram.com/matiere_et_nuance';

$pageKey = 'home';
$canonicalPath = '';
$businessId = 'https://www.matiereetnuance.fr/#business';
$services = [
    ['name' => 'Plâtrerie', 'description' => 'Cloisons, plafonds, redressements et enduits : préparation des volumes et des surfaces avant peinture ou béton ciré.'],
    ['name' => 'Peinture intérieure', 'description' => 'Préparation méticuleuse des supports puis finitions mates, satinées ou veloutées, avec conseil couleur sur site.'],
    ['name' => 'Béton ciré', 'description' => "Surfaces minérales continues pour petites pièces et mobilier : salles d'eau, crédences, plans de travail."],
    ['name' => 'Rénovation intérieure', 'description' => "Accompagnement complet d'un projet de rénovation, de la préparation des supports aux finitions, pour particuliers et professionnels."],
];
$extraJsonLd = '<script type="application/ld+json">' . json_encode([
    '@context' => 'https://schema.org',
    '@type' => 'LocalBusiness',
    '@id' => $businessId,
    'name' => 'Matière & Nuance',
    'image' => 'https://www.matiereetnuance.fr/assets/img/og-cover.png',
    'url' => 'https://www.matiereetnuance.fr/',
    'telephone' => '+33760033820',
    'email' => 'matiereetnuance@hotmail.com',
    'priceRange' => '€€',
    'description' => 'Artisan plâtrier-peintre spécialisé en plâtrerie, peinture décorative et béton ciré haut de gamme dans l\'Ouest lyonnais et le Beaujolais.',
    'address' => ['@type' => 'PostalAddress', 'addressLocality' => 'Tassin-la-Demi-Lune', 'addressRegion' => 'Auvergne-Rhône-Alpes', 'postalCode' => '69160', 'addressCountry' => 'FR'],
    'geo' => ['@type' => 'GeoCoordinates', 'latitude' => 45.7683, 'longitude' => 4.7639],
    'areaServed' => array_map(static fn ($c) => ['@type' => 'City', 'name' => $c], ['Tassin-la-Demi-Lune', 'Écully', 'Charbonnières-les-Bains', 'Craponne', 'Francheville', 'Dardilly', 'Limonest', 'Champagne-au-Mont-d\'Or', 'Saint-Didier-au-Mont-d\'Or', 'La Tour-de-Salvagny', 'Marcy-l\'Étoile', 'Sainte-Consorce', 'Grézieu-la-Varenne', 'Brindas', 'Mornant', 'Villefranche-sur-Saône', 'Belleville-en-Beaujolais', 'Beaujeu', 'Lyon']),
    'sameAs' => [$instagram],
    'aggregateRating' => ['@type' => 'AggregateRating', 'ratingValue' => str_replace(',', '.', t_raw($textes, 'avis_score', '4.9')), 'reviewCount' => t_raw($textes, 'avis_count', '47')],
    'hasOfferCatalog' => [
        '@type' => 'OfferCatalog',
        'name' => 'Prestations Matière & Nuance',
        'itemListElement' => array_map(static fn ($s) => [
            '@type' => 'Offer',
            'itemOffered' => [
                '@type' => 'Service',
                'name' => $s['name'],
                'description' => $s['description'],
                'provider' => ['@id' => $businessId],
            ],
        ], $services),
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
?><!DOCTYPE html>
<html lang="fr">
<head>
<?php require __DIR__ . '/includes/seo-head.php'; ?>
</head>
<body>

<?php $activePage = ''; require __DIR__ . '/includes/nav.php'; ?>

<main>

<!-- ======================= HERO ======================= -->
<header id="hero" class="mn-hero" style="position:relative;padding:96px 64px 88px;overflow:hidden">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;align-items:center;gap:18px">
      <img data-mn-amp src="/assets/img/esperluette-beige.svg" alt="" style="height:44px" width="44" height="44">
      <span style="font:500 13px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c"><?= t($textes, 'home_eyebrow', 'PLÂTRERIE · PEINTURE · BÉTON CIRÉ — OUEST LYONNAIS & BEAUJOLAIS') ?></span>
    </div>
    <h1 class="mn-h1" data-mn-title style="font:400 92px/1.04 'Instrument Serif',serif;color:#2b2926;margin:26px 0 0;max-width:820px;font-weight:400;text-wrap:balance"><?= t($textes, 'home_title', 'La matière juste, la nuance') ?> <em style="font-style:italic;color:#8a7a63"><?= t($textes, 'home_title_emphasis', 'exacte.') ?></em></h1>
    <div class="mn-hero-images" style="display:flex;gap:28px;margin-top:60px;align-items:flex-end">
      <div data-mn-reveal style="width:640px;max-width:100%;height:400px;position:relative;overflow:hidden">
        <div style="width:100%;height:100%;animation:mnkb 24s ease-in-out infinite alternate">
          <?= render_photo(photo_src('hero-main'), 'Mur intérieur repeint par Matière & Nuance, finition mate sous lumière rasante', 'width="640" height="400" loading="eager" fetchpriority="high"') ?>
        </div>
      </div>
      <div data-mn-reveal style="width:300px;height:300px;position:relative;margin-bottom:-48px;flex:none">
        <?= render_photo(photo_src('hero-detail'), 'Détail de texture d\'un béton ciré réalisé par Matière & Nuance', 'width="300" height="300" loading="lazy"') ?>
      </div>
      <p data-mn-reveal class="mn-body-lg" style="font:400 15px/1.85 'Instrument Sans',sans-serif;color:#6c665c;max-width:250px;margin:0 0 8px"><?= t($textes, 'home_intro', "Plâtrerie, peinture et béton ciré : des projets de rénovation intérieure dans l'Ouest lyonnais, préparés avec rigueur et finis avec précision.") ?></p>
    </div>
  </div>
</header>

<!-- ======================= SAVOIR-FAIRE ======================= -->
<section id="savoirfaire" style="padding:96px 64px;border-top:1px solid #e8e1d3">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;justify-content:space-between;align-items:baseline">
      <h2 class="mn-h2" style="font:400 46px/1.1 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">Trois savoir-faire</h2>
    </div>
    <div class="mn-grid-3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;margin-top:56px">
      <article data-mn-reveal class="card-sf">
        <div class="card-sf__img" style="height:280px">
          <div class="card-sf__img-inner">
            <?= render_photo(photo_src('sf-platrerie'), 'Travaux de plâtrerie en cours, volume et cloisons', 'width="400" height="280" loading="lazy"') ?>
          </div>
        </div>
        <h3 style="font:400 26px 'Instrument Serif',serif;color:#2b2926;margin:20px 0 0;font-weight:400">Plâtrerie <em style="font-style:italic;color:#a6947c">— le volume</em></h3>
        <p style="font:400 14px/1.75 'Instrument Sans',sans-serif;color:#6c665c;margin:10px 0 0">Cloisons, plafonds, courbes et reprise de support. Des bases solides pour révéler tout le caractère de votre intérieur</p>
      </article>
      <article data-mn-reveal class="card-sf card-sf--offset">
        <div class="card-sf__img" style="height:280px">
          <div class="card-sf__img-inner">
            <?= render_photo(photo_src('sf-peinture'), 'Application de peinture décorative au rouleau sur un mur', 'width="400" height="280" loading="lazy"') ?>
          </div>
        </div>
        <h3 style="font:400 26px 'Instrument Serif',serif;color:#2b2926;margin:20px 0 0;font-weight:400">Peinture <em style="font-style:italic;color:#a6947c">— la nuance</em></h3>
        <p style="font:400 14px/1.75 'Instrument Sans',sans-serif;color:#6c665c;margin:10px 0 0">Teintes profondes, finitions mates, velours, satinées ou laquées. Chaque surface est travaillée avec précision pour révéler toute la beauté de votre intérieur.</p>
      </article>
      <article data-mn-reveal class="card-sf">
        <div class="card-sf__img" style="height:280px">
          <div class="card-sf__img-inner">
            <?= render_photo(photo_src('sf-beton'), 'Vasque en béton ciré réalisée sur mesure', 'width="400" height="280" loading="lazy"') ?>
          </div>
        </div>
        <h3 style="font:400 26px 'Instrument Serif',serif;color:#2b2926;margin:20px 0 0;font-weight:400">Béton ciré <em style="font-style:italic;color:#a6947c">— la matière</em></h3>
        <div style="font:500 11px 'Instrument Sans',sans-serif;letter-spacing:.18em;color:#a6947c;margin-top:8px">PETITE PIÈCE &amp; MOBILIER</div>
        <p style="font:400 14px/1.75 'Instrument Sans',sans-serif;color:#6c665c;margin:10px 0 0">Murs, sols, salles de bains et mobilier. Une matière minérale et intemporelle qui habille vos espaces avec élégance et caractère.</p>
      </article>
    </div>
  </div>
</section>

<!-- ======================= MÉTHODE ======================= -->
<section style="background:#eee8db;padding:96px 64px">
  <div class="container" style="padding:0;max-width:1280px">
    <h2 class="mn-h2" data-mn-reveal style="font:400 46px/1.1 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">Notre <em style="font-style:italic;color:#8a7a63">méthode</em></h2>
    <div class="mn-grid-4" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:32px;margin-top:56px">
      <div data-mn-reveal style="border-top:1px solid #a6947c;padding-top:22px">
        <div style="font:400 20px 'Instrument Serif',serif;font-style:italic;color:#a6947c">01</div>
        <h3 style="font:400 24px 'Instrument Serif',serif;color:#2b2926;margin:8px 0 0;font-weight:400">L'écoute</h3>
        <p style="font:400 14px/1.75 'Instrument Sans',sans-serif;color:#6c665c;margin:10px 0 0">Une visite, vos usages, la lumière de chaque pièce. Nous commençons par comprendre.</p>
      </div>
      <div data-mn-reveal style="border-top:1px solid #a6947c;padding-top:22px">
        <div style="font:400 20px 'Instrument Serif',serif;font-style:italic;color:#a6947c">02</div>
        <h3 style="font:400 24px 'Instrument Serif',serif;color:#2b2926;margin:8px 0 0;font-weight:400">Le conseil</h3>
        <p style="font:400 14px/1.75 'Instrument Sans',sans-serif;color:#6c665c;margin:10px 0 0">Teintes, matières, finitions : des propositions précises, essayées sur vos murs.</p>
      </div>
      <div data-mn-reveal style="border-top:1px solid #a6947c;padding-top:22px">
        <div style="font:400 20px 'Instrument Serif',serif;font-style:italic;color:#a6947c">03</div>
        <h3 style="font:400 24px 'Instrument Serif',serif;color:#2b2926;margin:8px 0 0;font-weight:400">Le geste</h3>
        <p style="font:400 14px/1.75 'Instrument Sans',sans-serif;color:#6c665c;margin:10px 0 0">Préparation méticuleuse, protection totale, exécution soignée. Un chantier propre, chaque soir.</p>
      </div>
      <div data-mn-reveal style="border-top:1px solid #a6947c;padding-top:22px">
        <div style="font:400 20px 'Instrument Serif',serif;font-style:italic;color:#a6947c">04</div>
        <h3 style="font:400 24px 'Instrument Serif',serif;color:#2b2926;margin:8px 0 0;font-weight:400">La livraison</h3>
        <p style="font:400 14px/1.75 'Instrument Sans',sans-serif;color:#6c665c;margin:10px 0 0">Réception à la lumière du jour, retouches immédiates. Vous emménagez dans le résultat.</p>
      </div>
    </div>
  </div>
</section>

<!-- ======================= LE SIGNE — respiration ======================= -->
<div style="padding:110px 64px;display:flex;align-items:center;justify-content:center;gap:52px;max-width:1280px;margin:0 auto">
  <div data-mn-reveal style="flex:1;height:1px;background:#ddd3c0"></div>
  <img data-mn-amp src="/assets/img/esperluette-beige.svg" alt="" style="height:150px" width="150" height="150">
  <div data-mn-reveal style="flex:1;height:1px;background:#ddd3c0"></div>
</div>
<p data-mn-reveal style="font:400 25px/1.5 'Instrument Serif',serif;font-style:italic;color:#8a7a63;margin:-52px auto 0;padding:0 64px 96px;max-width:560px;text-align:center;text-wrap:balance">L'élégance se construit dans les détails.</p>

<!-- ======================= L'ENTREPRISE ======================= -->
<section id="entreprise" style="padding:110px 64px;position:relative;overflow:hidden">
  <div class="mn-entreprise-grid container" style="padding:0;max-width:1280px;display:grid;grid-template-columns:1fr 1.25fr;gap:72px;align-items:center;position:relative">
    <div data-mn-reveal style="height:520px;position:relative">
      <?= render_photo(photo_src('ent-portrait'), 'Portrait du fondateur de Matière & Nuance', 'width="520" height="520" loading="lazy"') ?>
    </div>
    <div>
      <div data-mn-reveal style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">L'ENTREPRISE</div>
      <h2 class="mn-h2" data-mn-reveal style="font:400 52px/1.12 'Instrument Serif',serif;color:#2b2926;margin:22px 0 0;font-weight:400;text-wrap:balance">L'exigence du détail, la passion des beaux <em style="font-style:italic;color:#8a7a63">intérieurs.</em></h2>
      <div data-mn-reveal class="mn-body-lg" style="font:400 15.5px/1.9 'Instrument Sans',sans-serif;color:#6c665c;margin:26px 0 0;max-width:520px"><?= t_raw($textes, 'home_entreprise_intro', "Entreprise de peinture, de plâtrerie et de béton ciré basée dans l'Ouest lyonnais, nous accompagnons les particuliers et les professionnels dans l'ensemble de l'Ouest lyonnais et du Beaujolais.") ?></div>
      <div data-mn-reveal style="display:flex;gap:40px;margin-top:38px;font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.18em;color:#8a7a63">
        <a href="/entreprise#histoire" style="color:#8a7a63">L'HISTOIRE</a><a href="/entreprise#valeurs" style="color:#8a7a63">LES VALEURS</a><a href="/entreprise#garanties" style="color:#8a7a63">LES GARANTIES</a>
      </div>
    </div>
  </div>
</section>

<!-- ======================= RÉALISATIONS ======================= -->
<section id="realisations" style="padding:96px 64px;border-top:1px solid #e8e1d3">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;justify-content:space-between;align-items:baseline">
      <h2 class="mn-h2" style="font:400 46px/1.1 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">Réalisations</h2>
      <a href="/realisations" style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.2em;color:#8a7a63">TOUT VOIR →</a>
    </div>
    <?php if ($teaser): $widths = [640, 480, 480, 480]; ?>
    <div data-mn-reveal class="mn-real-scroller" style="display:flex;gap:28px;overflow-x:auto;scroll-snap-type:x mandatory;margin:56px -64px 0;padding:0 64px 20px">
      <?php foreach ($teaser as $i => $r): $w = cycle_pattern($widths, $i); ?>
      <figure class="mn-fig" data-fig-title="<?= htmlspecialchars(($r['title'] ?? '') . ' — ' . ($r['ville'] ?? '')) ?>" data-fig-tag="<?= htmlspecialchars($r['prestations'] ?? '') ?>" style="flex:0 0 <?= (int) $w ?>px;scroll-snap-align:start">
        <a href="/realisations/<?= rawurlencode($r['id']) ?>" style="display:block;color:inherit">
          <div class="mn-fig__img" style="height:460px">
            <div class="mn-fig__img-inner">
              <?= render_photo(realisation_main_image_url($r), $r['image_main_alt'] ?: suggest_alt($r['title'] ?? '', $r['ville'] ?? ''), 'width="' . (int) $w . '" height="460" loading="lazy"') ?>
            </div>
          </div>
          <figcaption class="mn-fig__caption"><span class="mn-fig__caption-title"><?= htmlspecialchars(($r['title'] ?? '') . ' — ' . ($r['ville'] ?? '')) ?></span><span class="mn-fig__caption-tag"><?= htmlspecialchars($r['prestations'] ?? '') ?></span></figcaption>
        </a>
      </figure>
      <?php endforeach; ?>
    </div>
    <div data-mn-reveal style="display:flex;justify-content:center;margin-top:10px;font:500 11px 'Instrument Sans',sans-serif;letter-spacing:.26em;color:#a6947c">FAITES GLISSER →</div>
    <?php endif; ?>
  </div>
</section>

<?php if ($avisEnabled): ?>
<!-- ======================= AVIS GOOGLE ======================= -->
<section id="avis" style="padding:96px 64px;border-top:1px solid #e8e1d3;background:#fdfbf7">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:20px">
      <h2 class="mn-h2" style="font:400 46px/1.1 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">Ils nous ont confié leurs <em style="font-style:italic;color:#8a7a63">projets .</em></h2>
      <div class="mn-rating" data-mn-google-rating>
        <span class="mn-rating__score" data-mn-rating-score><?= t($textes, 'avis_score', '4,9') ?></span>
        <span class="mn-rating__stars" aria-hidden="true">★★★★★</span>
        <span class="mn-rating__count" data-mn-rating-count><?= t($textes, 'avis_count', '47') ?> AVIS GOOGLE</span>
      </div>
    </div>
    <div class="mn-grid-3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;margin-top:56px" data-mn-reviews-grid>
      <blockquote data-mn-reveal class="quote-card">
        <div class="quote-card__stars" aria-hidden="true">★★★★★</div>
        <p class="quote-card__text">« Un chantier d'une propreté irréprochable et des murs parfaitement tendus. On sent le souci du détail à chaque étape. »</p>
        <footer class="quote-card__meta">Claire M. — Écully <span>· il y a 2 mois</span></footer>
      </blockquote>
      <blockquote data-mn-reveal class="quote-card">
        <div class="quote-card__stars" aria-hidden="true">★★★★★</div>
        <p class="quote-card__text">« Des conseils de teintes remarquables : la pièce a changé d'âme. Délais tenus, équipe discrète et précise. »</p>
        <footer class="quote-card__meta">Bruno T. — Tassin-la-Demi-Lune <span>· il y a 4 mois</span></footer>
      </blockquote>
      <blockquote data-mn-reveal class="quote-card">
        <div class="quote-card__stars" aria-hidden="true">★★★★★</div>
        <p class="quote-card__text">« Le béton ciré de notre salle d'eau est magnifique, la finition est digne d'un hôtel. Nous recommandons sans réserve. »</p>
        <footer class="quote-card__meta">Sophie L. — Villefranche <span>· il y a 6 mois</span></footer>
      </blockquote>
    </div>
    <div data-mn-reveal style="text-align:center;margin-top:48px">
      <a class="link-underline" href="/avis">VOIR TOUS LES AVIS →</a>
    </div>
  </div>
</section>
<?php endif; ?>

<!-- ======================= ZONE + CONTACT ======================= -->
<section id="contact" style="padding:96px 64px 0;border-top:1px solid #e8e1d3">
  <div class="mn-contact-grid container" style="padding:0;max-width:1280px;display:grid;grid-template-columns:4fr 5fr;gap:28px;padding-bottom:96px">
    <div data-mn-reveal>
      <h2 class="mn-h2--md" style="font:400 40px/1.15 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap">Ouest lyonnais <img src="/assets/img/esperluette-beige.svg" alt="&amp;" style="height:30px;align-self:center" width="30" height="30"> Beaujolais</h2>
      <p style="font:400 15px/1.85 'Instrument Sans',sans-serif;color:#6c665c;margin:20px 0 0;max-width:440px"><?= t($textes, 'home_zone_text', "Nous accompagnons nos clients dans l'ensemble de l'Ouest lyonnais et du Beaujolais avec une même exigence : être disponibles, réactifs et présents du premier rendez-vous jusqu'aux dernières finitions.") ?></p>
      <div class="mn-ph-contain mn-ph-contain--home" style="height:300px;margin-top:32px;position:relative">
        <?= render_photo(photo_src('zone-carte'), 'Carte de la zone d\'intervention Matière & Nuance — Ouest lyonnais et Beaujolais', 'width="600" height="300" loading="lazy"') ?>
      </div>
    </div>
    <div data-mn-reveal data-mn-grain style="background:#2b2926;padding:56px 56px 48px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
      <img src="/assets/img/esperluette-laiton.svg" alt="" style="position:absolute;right:-30px;bottom:-60px;height:320px;opacity:.14;pointer-events:none">
      <div style="position:relative">
        <div style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#c8b394">CONTACT</div>
        <div style="font:400 44px/1.15 'Instrument Serif',serif;color:#f7f3ec;margin-top:20px">Parlons de votre <em style="font-style:italic;color:#c8b394">projet.</em></div>
        <p style="font:400 14.5px/1.85 'Instrument Sans',sans-serif;color:#b0a99b;margin:20px 0 0;max-width:380px">Décrivez-nous la pièce, la commune, l'envie. Nous répondons sous 48 h, et la première visite est toujours sans engagement.</p>
      </div>
      <div style="position:relative;margin-top:44px">
        <a class="btn-outline-gold" href="/contact">DEMANDER UN ÉCHANGE</a>
        <div style="font:400 13px 'Instrument Sans',sans-serif;color:#7d766b;margin-top:22px"><a href="tel:<?= htmlspecialchars(preg_replace('/\s+/', '', t_raw($textes, 'contact_phone', '0760033820'))) ?>" style="color:#7d766b"><?= t($textes, 'contact_phone', '07 60 03 38 20') ?></a>&nbsp;&nbsp;<br><a href="mailto:<?= htmlspecialchars(t_raw($textes, 'contact_email', 'matiereetnuance@hotmail.com')) ?>" style="color:#7d766b"><?= t($textes, 'contact_email', 'matiereetnuance@hotmail.com') ?></a></div>
      </div>
    </div>
  </div>

  <?php $showLogoLink = false; require __DIR__ . '/includes/footer.php'; ?>
</section>
</main>

<script src="/assets/js/main.js" defer></script>
<?php if ($avisEnabled): ?><script src="/assets/js/google-reviews.js" defer></script><?php endif; ?>
</body>
</html>
