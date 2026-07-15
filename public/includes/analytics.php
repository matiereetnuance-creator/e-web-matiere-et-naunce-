<?php
declare(strict_types=1);
/**
 * Google Analytics 4 — balise unique, incluse par le <head> de chaque page
 * (includes/seo-head.php pour les 6 pages statiques, realisation.php pour
 * les fiches réalisation). L'identifiant se règle dans api/config.php ;
 * laisser 'ga4_measurement_id' vide désactive le suivi sans toucher au code.
 */
$gaConfig = require __DIR__ . '/../api/config.php';
$ga4Id = trim((string) ($gaConfig['ga4_measurement_id'] ?? ''));
if ($ga4Id !== '') :
?>
<script async src="https://www.googletagmanager.com/gtag/js?id=<?= htmlspecialchars($ga4Id) ?>"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '<?= htmlspecialchars($ga4Id, ENT_QUOTES) ?>');
</script>
<?php endif; ?>
