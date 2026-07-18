<?php
declare(strict_types=1);
require_once __DIR__ . '/api/lib/content.php';

$pageKey = 'savoir-faire';
$canonicalPath = 'savoir-faire';
$faqItems = [
    ['q' => 'Combien de temps dure un chantier de plâtrerie ou de peinture ?', 'a' => "Cela dépend de l'ampleur du projet : quelques jours pour une pièce, plusieurs semaines pour une rénovation complète. Un délai précis vous est toujours communiqué après la première visite, avant le début des travaux."],
    ['q' => 'Quelle est la différence entre béton ciré et carrelage ?', 'a' => "Le béton ciré offre une surface continue, sans joint, pour un rendu minéral et épuré. Le carrelage reste plus résistant à grande échelle — c'est pourquoi nous réservons le béton ciré aux petites pièces et au mobilier, là où il exprime le mieux ses qualités."],
    ['q' => 'Faut-il refaire les enduits avant de repeindre ?', 'a' => "Pas systématiquement. Un support sain et bien préparé suffit souvent : nous évaluons son état lors de la première visite et ne proposons des travaux de plâtrerie que s'ils sont réellement nécessaires."],
    ['q' => "Le béton ciré résiste-t-il à l'eau et au quotidien ?", 'a' => "Correctement appliqué et protégé, oui : c'est un excellent choix pour une salle d'eau ou une crédence de cuisine. Sa résistance dépend surtout de la qualité de la pose et du traitement de finition."],
    ['q' => "Intervenez-vous dans toute l'Ouest lyonnais et le Beaujolais ?", 'a' => "Oui. Nous intervenons notamment à Tassin-la-Demi-Lune, Écully, Charbonnières-les-Bains, Craponne, Francheville, Dardilly et dans les communes environnantes de l'Ouest lyonnais et du Beaujolais."],
    ['q' => 'Proposez-vous un devis gratuit ?', 'a' => "Oui, sans engagement. La première visite permet d'évaluer précisément votre projet et de vous transmettre un devis détaillé sous 48h."],
];
$breadcrumbLd = [
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Accueil', 'item' => 'https://www.matiereetnuance.fr/'],
        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Savoir-faire', 'item' => 'https://www.matiereetnuance.fr/savoir-faire'],
    ],
];
$faqLd = [
    '@context' => 'https://schema.org',
    '@type' => 'FAQPage',
    'mainEntity' => array_map(static fn ($f) => [
        '@type' => 'Question',
        'name' => $f['q'],
        'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['a']],
    ], $faqItems),
];
$extraJsonLd = '<script type="application/ld+json">' . json_encode($breadcrumbLd, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>'
    . '<script type="application/ld+json">' . json_encode($faqLd, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
?><!DOCTYPE html>
<html lang="fr">
<head>
<?php require __DIR__ . '/includes/seo-head.php'; ?>
</head>
<body>

<?php $activePage = 'savoir-faire'; require __DIR__ . '/includes/nav.php'; ?>

<main>

<header style="padding:110px 64px 90px">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;align-items:center;gap:18px">
      <img data-mn-amp src="/assets/img/esperluette-beige.svg" alt="" style="height:44px" width="44" height="44">
      <span style="font:500 13px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">SAVOIR-FAIRE</span>
    </div>
    <h1 class="mn-h1" data-mn-reveal style="font:400 76px/1.06 'Instrument Serif',serif;color:#2b2926;margin:26px 0 0;max-width:900px;font-weight:400;text-wrap:balance">Trois métiers, une même <em style="font-style:italic;color:#8a7a63">exigence.</em></h1>
    <p data-mn-reveal class="mn-body-lg" style="font:400 16px/1.9 'Instrument Sans',sans-serif;color:#6c665c;margin:30px 0 0;max-width:560px">Trois savoir-faire, une même exigence : donner vie à des intérieurs soignés, durables et réalisés avec le plus grand soin. Nous intervenons auprès des particuliers comme des professionnels, dans l'ensemble de l'Ouest lyonnais et du Beaujolais — retrouvez ces savoir-faire à l'œuvre dans nos <a href="/realisations" style="text-decoration:underline">réalisations</a>.</p>
  </div>
</header>

<section id="platrerie" style="padding:90px 64px;border-top:1px solid #e8e1d3">
  <div class="mn-entreprise-grid container" style="padding:0;max-width:1280px;display:grid;grid-template-columns:1.2fr 1fr;gap:72px;align-items:center">
    <div data-mn-reveal style="height:560px;overflow:hidden">
      <div style="height:100%;transition:transform 1.8s cubic-bezier(.22,1,.36,1)" class="mn-fig__img-inner">
        <?= render_photo(photo_src('sf-page-platrerie'), 'Chantier de plâtrerie — volume, plafond, courbe', 'width="700" height="560" loading="eager" fetchpriority="high"') ?>
      </div>
    </div>
    <div>
      <div data-mn-reveal style="font:400 18px 'Instrument Serif',serif;font-style:italic;color:#a6947c">01</div>
      <h2 class="mn-h2" data-mn-reveal style="font:400 46px/1.12 'Instrument Serif',serif;color:#2b2926;margin:14px 0 0;font-weight:400">Plâtrerie <em style="font-style:italic;color:#8a7a63">— le volume</em></h2>
      <p data-mn-reveal class="mn-body-lg" style="font:400 15.5px/1.9 'Instrument Sans',sans-serif;color:#6c665c;margin:24px 0 0">Avant la couleur, il y a la forme. Comme plâtrier dans l'Ouest lyonnais, nous préparons cloisons, plafonds, redressements et courbes : des volumes justes, des angles francs et des surfaces planes, prêtes à recevoir peinture ou béton ciré dans les règles de l'art.</p>
      <div data-mn-reveal style="margin-top:34px;display:grid;gap:14px;font:400 14px 'Instrument Sans',sans-serif;color:#4c463d">
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Cloisons &amp; doublages</div>
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Faux plafonds</div>
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Enduits de redressement, bandes</div>
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Reprises après ouverture ou rénovation</div>
      </div>
    </div>
  </div>
</section>

<section id="peinture" style="padding:90px 64px;background:#eee8db">
  <div class="mn-entreprise-grid container" style="padding:0;max-width:1280px;display:grid;grid-template-columns:1fr 1.2fr;gap:72px;align-items:center">
    <div>
      <div data-mn-reveal style="font:400 18px 'Instrument Serif',serif;font-style:italic;color:#a6947c">02</div>
      <h2 class="mn-h2" data-mn-reveal style="font:400 46px/1.12 'Instrument Serif',serif;color:#2b2926;margin:14px 0 0;font-weight:400">Peinture <em style="font-style:italic;color:#8a7a63">— la nuance</em></h2>
      <p data-mn-reveal class="mn-body-lg" style="font:400 15.5px/1.9 'Instrument Sans',sans-serif;color:#6c665c;margin:24px 0 0">Notre cœur de métier de peintre dans l'Ouest lyonnais. Une préparation méticuleuse — ponçage, ratissage, impression — puis des finitions tendues, mates ou satinées, dans des teintes essayées sur vos murs, pour un rendu impeccable et durable.</p>
      <div data-mn-reveal style="margin-top:34px;display:grid;gap:14px;font:400 14px 'Instrument Sans',sans-serif;color:#4c463d">
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Peinture intérieure, murs &amp; plafonds</div>
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Finitions mates profondes, velours, satinées</div>
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Conseil couleur &amp; essais sur site</div>
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Boiseries, portes, radiateurs, escaliers</div>
      </div>
    </div>
    <div data-mn-reveal style="height:560px;overflow:hidden">
      <div style="height:100%">
        <?= render_photo(photo_src('sf-page-peinture'), 'Mur peint tendu sous une lumière rasante', 'width="700" height="560" loading="lazy"') ?>
      </div>
    </div>
  </div>
</section>

<section id="beton" style="padding:90px 64px">
  <div class="mn-entreprise-grid container" style="padding:0;max-width:1280px;display:grid;grid-template-columns:1.2fr 1fr;gap:72px;align-items:center">
    <div data-mn-reveal style="height:560px;overflow:hidden">
      <div style="height:100%">
        <?= render_photo(photo_src('sf-page-beton'), "Salle d'eau en béton ciré réalisée par Matière & Nuance", 'width="700" height="560" loading="lazy"') ?>
      </div>
    </div>
    <div>
      <div data-mn-reveal style="font:400 18px 'Instrument Serif',serif;font-style:italic;color:#a6947c">03</div>
      <h2 class="mn-h2" data-mn-reveal style="font:400 46px/1.12 'Instrument Serif',serif;color:#2b2926;margin:14px 0 0;font-weight:400">Béton ciré <em style="font-style:italic;color:#8a7a63">— la matière</em></h2>
      <div data-mn-reveal style="font:500 11.5px 'Instrument Sans',sans-serif;letter-spacing:.2em;color:#a6947c;margin-top:14px">UNIQUEMENT PETITES PIÈCES &amp; MOBILIER</div>
      <p data-mn-reveal class="mn-body-lg" style="font:400 15.5px/1.9 'Instrument Sans',sans-serif;color:#6c665c;margin:20px 0 0">Dans l'Ouest lyonnais, nous réservons le béton ciré à ce qu'il fait de mieux : les petites pièces et le mobilier — des surfaces minérales continues, appliquées à l'échelle du détail, pour un résultat lisse, minéral et intemporel.</p>
      <div data-mn-reveal style="margin-top:34px;display:grid;gap:14px;font:400 14px 'Instrument Sans',sans-serif;color:#4c463d">
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Petites pièces</div>
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Crédences &amp; plans de travail</div>
        <div style="display:flex;gap:14px;align-items:baseline"><span style="color:#a6947c">—</span>Vasques, tablettes, mobilier sur mesure</div>
      </div>
    </div>
  </div>
</section>

<section id="faq" style="padding:90px 64px;border-top:1px solid #e8e1d3">
  <div class="container" style="padding:0;max-width:760px">
    <h2 class="mn-h2" data-mn-reveal style="font:400 40px/1.12 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">Questions <em style="font-style:italic;color:#8a7a63">fréquentes</em></h2>
    <div style="margin-top:44px;display:grid;gap:36px">
      <?php foreach ($faqItems as $f): ?>
      <div data-mn-reveal>
        <h3 style="font:400 19px 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400"><?= htmlspecialchars($f['q']) ?></h3>
        <p style="font:400 15px/1.8 'Instrument Sans',sans-serif;color:#6c665c;margin:10px 0 0"><?= htmlspecialchars($f['a']) ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section style="padding:0 64px 96px">
  <div data-mn-reveal class="cta-dark">
    <img class="cta-dark__amp" src="/assets/img/esperluette-laiton.svg" alt="">
    <div style="position:relative">
      <div class="cta-dark__title">Un projet, une pièce, une <em style="font-style:italic;color:#c8b394">envie ?</em></div>
      <div class="cta-dark__sub">La première visite est toujours sans engagement.</div>
    </div>
    <a class="btn-outline-gold" style="position:relative" href="/contact">DEMANDER UN ÉCHANGE</a>
  </div>
</section>

</main>

<?php require __DIR__ . '/includes/footer.php'; ?>

<script src="/assets/js/main.js" defer></script>
</body>
</html>
