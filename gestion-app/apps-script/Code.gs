/**
 * Point d'entrée unique du Web App — API REST pour gestion-app.
 *
 * Aucun calcul métier ici : uniquement lecture/écriture de lignes
 * Google Sheets. Toute la logique (marges, TVA, KPI, Dashboard) reste
 * dans Next.js (services/chantiers.ts, services/charges.ts,
 * services/dashboard.ts) — voir README-APPS-SCRIPT.md.
 *
 * Un Web App Apps Script n'expose que deux verbes HTTP : GET (doGet)
 * et POST (doPost). Toutes les écritures (create/update/delete)
 * passent donc par POST, l'opération étant précisée dans le corps
 * JSON via le champ "action".
 */

var API_VERSION = '1.0.0';

function doGet(e) {
  var params = (e && e.parameter) || {};
  var resource = params.resource;

  if (resource === 'health') {
    return jsonResponse_({ ok: true, version: API_VERSION, timestamp: new Date().toISOString() });
  }

  try {
    if (!checkToken_(params.token)) {
      return jsonResponse_({ ok: false, error: 'unauthorized' });
    }

    if (resource === 'chantiers') {
      return jsonResponse_({ ok: true, data: params.id ? getChantier_(params.id) : listChantiers_() });
    }
    if (resource === 'charges') {
      return jsonResponse_({ ok: true, data: params.id ? getCharge_(params.id) : listCharges_() });
    }
    if (resource === 'settings') {
      return jsonResponse_({ ok: true, data: getSettings_() });
    }

    return jsonResponse_({ ok: false, error: 'unknown_resource' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var params = (e && e.parameter) || {};
    var resource = params.resource;

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse_({ ok: false, error: 'invalid_json_body' });
    }

    if (!checkToken_(body.token)) {
      return jsonResponse_({ ok: false, error: 'unauthorized' });
    }

    var action = body.action;

    if (resource === 'chantiers') return jsonResponse_(handleChantiersWrite_(action, body));
    if (resource === 'charges') return jsonResponse_(handleChargesWrite_(action, body));
    if (resource === 'settings') return jsonResponse_(handleSettingsWrite_(action, body));

    return jsonResponse_({ ok: false, error: 'unknown_resource' });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}
