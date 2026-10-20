/*
 * Synchronisation des avis Google côté client.
 * Si l'API n'est pas encore configurée (clé/Place ID absents), le
 * script ne touche à rien : les avis statiques du design restent affichés.
 */
(function () {
  'use strict';

  function starString(rating) {
    var r = Math.round(rating || 5);
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
  }

  function formatScore(rating) {
    if (!rating) return '';
    return String(rating).replace('.', ',');
  }

  function buildCard(review) {
    var card = document.createElement('blockquote');
    card.className = 'quote-card quote-card--alt';
    card.setAttribute('data-mn-reveal', '');
    card.innerHTML =
      '<div class="quote-card__stars" aria-hidden="true">' + starString(review.rating) + '</div>' +
      '<p class="quote-card__text">« ' + escapeHtml(review.text || '').slice(0, 320) + ' »</p>' +
      '<footer class="quote-card__meta">' + escapeHtml(review.author_name) +
      ' <span>· ' + escapeHtml(review.relative_time_description || '') + '</span></footer>';
    return card;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/google-reviews.php', { headers: { Accept: 'application/json' } })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.configured) return;

        var scoreEl = document.querySelector('[data-mn-rating-score]');
        var countEl = document.querySelector('[data-mn-rating-count]');
        if (scoreEl && data.rating) scoreEl.textContent = formatScore(data.rating);
        if (countEl && data.total) countEl.textContent = data.total + ' AVIS GOOGLE';

        var link = document.querySelector('[data-mn-google-link]');
        if (link && data.google_url) link.href = data.google_url;

        var grid = document.querySelector('[data-mn-reviews-grid]');
        if (grid && Array.isArray(data.reviews) && data.reviews.length >= 3) {
          grid.innerHTML = '';
          data.reviews.slice(0, 6).forEach(function (review) {
            var card = buildCard(review);
            grid.appendChild(card);
            card.style.opacity = '1';
            card.style.transform = 'none';
          });
        }
      })
      .catch(function () {
        /* silencieux : les avis statiques de secours restent affichés */
      });
  });
})();
