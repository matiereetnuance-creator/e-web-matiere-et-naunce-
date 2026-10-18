/*
 * Matière & Nuance — bandeau de consentement cookies (Google Consent Mode v2,
 * mode Basic). Chargé uniquement si un identifiant GA4 est configuré (voir
 * includes/analytics.php, qui a déjà posé un consentement par défaut refusé
 * via gtag('consent','default', ...) avant ce script).
 *
 * Mode Basic : la balise GA4 (gtag.js + gtag('config', ...)) n'est chargée
 * qu'après un choix explicite ET uniquement si ce choix est "Accepter" —
 * aucune requête (pas même un ping anonyme) n'est envoyée à Google avant
 * ou en l'absence de consentement.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mn_consent_v1';
  var scriptTag = document.currentScript || document.querySelector('script[data-ga4-id]');
  var ga4Id = scriptTag ? scriptTag.getAttribute('data-ga4-id') : '';
  var gaLoaded = false;
  var banner = null;

  function readChoice() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return typeof parsed.analytics === 'boolean' ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function writeChoice(granted) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: granted, ts: new Date().toISOString() }));
    } catch (e) {
      /* stockage indisponible (navigation privée, etc.) : le choix de cette visite s'applique quand même */
    }
  }

  function loadGa4() {
    if (gaLoaded || !ga4Id) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4Id);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', ga4Id);
  }

  function applyChoice(granted) {
    gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
    if (granted) loadGa4();
  }

  function removeBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
    document.body.classList.remove('mn-consent-open');
  }

  function showBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'mn-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Préférences de cookies');
    banner.innerHTML =
      '<div class="mn-consent__box">' +
      '<div class="mn-consent__copy">' +
      '<p class="mn-consent__title">Votre confidentialité</p>' +
      '<p class="mn-consent__text">Nous utilisons des cookies pour mesurer la fréquentation du site et améliorer votre expérience. <a href="/confidentialite">En savoir plus</a>.</p>' +
      '</div>' +
      '<div class="mn-consent__actions">' +
      '<button type="button" class="mn-consent__btn mn-consent__btn--ghost" data-mn-consent-refuse>Refuser</button>' +
      '<button type="button" class="mn-consent__btn mn-consent__btn--accent" data-mn-consent-accept>Accepter</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(banner);
    document.body.classList.add('mn-consent-open');

    banner.querySelector('[data-mn-consent-accept]').addEventListener('click', function () {
      writeChoice(true);
      applyChoice(true);
      removeBanner();
    });
    banner.querySelector('[data-mn-consent-refuse]').addEventListener('click', function () {
      writeChoice(false);
      applyChoice(false);
      removeBanner();
    });
  }

  var existing = readChoice();
  if (existing) {
    applyChoice(existing.analytics);
  } else {
    showBanner();
  }

  // Lien "Gérer les cookies" du pied de page (ajouté sans changer le design
  // existant : simple ligne de texte, cohérente avec les autres liens du
  // footer) — permet de rouvrir le bandeau pour changer d'avis à tout moment.
  window.mnOpenConsentManager = function () {
    showBanner();
  };
})();
