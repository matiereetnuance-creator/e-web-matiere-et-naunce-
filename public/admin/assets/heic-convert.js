/*
 * Conversion HEIC -> JPEG entièrement côté navigateur, invisible pour
 * l'utilisateur : dès qu'une photo HEIC/HEIF est sélectionnée dans un
 * champ d'envoi, elle est remplacée par un JPEG (qualité 92%) avant même
 * l'enregistrement — le serveur ne voit jamais le fichier HEIC d'origine.
 * JPG/PNG/WebP passent sans y toucher. Nécessite heic2any (vendor/).
 *
 * Pourquoi côté client : l'hébergement peut ne pas avoir Imagick (voir
 * /admin/diagnostic.php) — cette conversion fonctionne alors quel que
 * soit le serveur, sans dépendre de son support HEIC.
 */
(function () {
  'use strict';

  function isHeicFile(file) {
    var name = (file.name || '').toLowerCase();
    var type = (file.type || '').toLowerCase();
    return /\.(heic|heif)$/.test(name)
      || type === 'image/heic' || type === 'image/heif'
      || type === 'image/heic-sequence' || type === 'image/heif-sequence';
  }

  function jpegNameFor(originalName) {
    var base = (originalName || 'photo').replace(/\.(heic|heif)$/i, '');
    return base + '.jpg';
  }

  function setFormBusy(form, busy) {
    if (!form) return;
    var buttons = form.querySelectorAll('button[type="submit"]');
    buttons.forEach(function (btn) {
      btn.disabled = busy;
    });
  }

  function convertOne(file) {
    if (typeof heic2any !== 'function') {
      return Promise.resolve(file);
    }
    return heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
      .then(function (result) {
        var blob = Array.isArray(result) ? result[0] : result;
        return new File([blob], jpegNameFor(file.name), { type: 'image/jpeg' });
      })
      .catch(function (err) {
        // Conversion impossible (fichier HEIC exotique, variante non supportée…) :
        // on renvoie le fichier d'origine tel quel. Le serveur applique alors son
        // propre traitement (conversion via Imagick si disponible, sinon message
        // explicatif clair) — l'utilisateur n'est jamais bloqué par cet échec.
        if (window.console && console.warn) {
          console.warn('[heic-convert] conversion impossible, envoi du fichier original :', err);
        }
        return file;
      });
  }

  function handleChange(input) {
    var files = input.files;
    if (!files || !files.length) return;

    var hasHeic = false;
    for (var i = 0; i < files.length; i++) {
      if (isHeicFile(files[i])) {
        hasHeic = true;
        break;
      }
    }
    if (!hasHeic) return;

    var generation = (input.dataset.heicGeneration = String(Number(input.dataset.heicGeneration || 0) + 1));
    var form = input.closest('form');
    setFormBusy(form, true);

    var tasks = [];
    for (var j = 0; j < files.length; j++) {
      tasks.push(isHeicFile(files[j]) ? convertOne(files[j]) : Promise.resolve(files[j]));
    }

    Promise.all(tasks).then(function (converted) {
      // Si l'utilisateur a resélectionné un fichier entre-temps, cette
      // conversion (désormais obsolète) ne doit pas écraser la nouvelle.
      if (input.dataset.heicGeneration !== generation) return;
      var dt = new DataTransfer();
      converted.forEach(function (f) {
        dt.items.add(f);
      });
      input.files = dt.files;
    }).finally(function () {
      if (input.dataset.heicGeneration === generation) {
        setFormBusy(form, false);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof DataTransfer === 'undefined' || typeof File === 'undefined') {
      return; // navigateur trop ancien : les fichiers HEIC partent tels quels, traités côté serveur
    }
    var inputs = document.querySelectorAll('input[type="file"][accept*="heic"]');
    inputs.forEach(function (input) {
      input.addEventListener('change', function () {
        handleChange(input);
      });
    });
  });
})();
