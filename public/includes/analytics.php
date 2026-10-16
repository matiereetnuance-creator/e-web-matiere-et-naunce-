<?php
declare(strict_types=1);
/**
 * Google Analytics 4 — balise unique, incluse par le <head> de chaque page
 * (includes/seo-head.php pour les 6 pages statiques, realisation.php pour
 * les fiches réalisation). L'identifiant se règle dans api/config.php ;
 * laisser 'ga4_measurement_id' vide désactive le suivi sans toucher au code.
 *
 * Consent Mode v2 (mode Basic) : le stockage est refusé par défaut, avant
 * même le chargement de la balise GA4. assets/js/consent.js décide seul,
 * selon le choix déjà enregistré ou le bandeau affiché, s'il charge
 * effectivement gtag.js — en mode Basic, rien n'est envoyé à Google tant
 * que le visiteur n'a pas répondu au bandeau (voir docs/DEPLOIEMENT.md).
 */
$gaConfig = require __DIR__ . '/../api/config.php';
$ga4Id = trim((string) ($gaConfig['ga4_measurement_id'] ?? ''));
if ($ga4Id !== '') :
?>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied'
  });
</script>
<script src="/assets/js/consent.js?v=<?= asset_version('assets/js/consent.js') ?>" data-ga4-id="<?= htmlspecialchars($ga4Id, ENT_QUOTES) ?>" defer></script>
<?php endif; ?>
