/* Glisser-déposer minimal pour les champs d'envoi de photo de l'admin. */
(function () {
  'use strict';
  function initZone(zone) {
    var input = zone.querySelector('input[type=file]');
    if (!input) return;
    var label = zone.querySelector('[data-dz-label]');
    var defaultText = label ? label.textContent : '';

    function showNames() {
      if (!label) return;
      if (input.files && input.files.length) {
        var names = Array.prototype.map.call(input.files, function (f) { return f.name; });
        label.textContent = names.length > 2
          ? names.length + ' fichiers sélectionnés'
          : names.join(', ');
      } else {
        label.textContent = defaultText;
      }
    }

    zone.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', showNames);

    ['dragenter', 'dragover'].forEach(function (evt) {
      zone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('is-drag');
      });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      zone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('is-drag');
      });
    });
    zone.addEventListener('drop', function (e) {
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length) {
        input.files = files;
        showNames();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-dropzone]').forEach(initZone);
  });
})();
