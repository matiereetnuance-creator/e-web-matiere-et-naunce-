<?php
/** @var string $pageTitle */
/** @var string $activeNav */
$pageTitle = $pageTitle ?? 'Administration';
$activeNav = $activeNav ?? '';
$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);
?><!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= htmlspecialchars($pageTitle) ?> — Administration Matière &amp; Nuance</title>
<style>
:root{
  --ink:#20211f; --ink-soft:#5b5a56; --line:#e6e3dd; --bg:#f7f6f3; --card:#ffffff;
  --accent:#8a7a63; --accent-dark:#5f5342; --accent-soft:#f0ebe1;
  --danger:#b3413a; --danger-soft:#faeae8; --ok:#2f6b4f; --ok-soft:#e9f4ee;
  --warn:#9a6b1f; --warn-soft:#fbf1e0;
  --radius:10px;
}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--ink);font-size:14.5px;line-height:1.5}
a{color:var(--accent-dark)}
.admin-shell{display:flex;min-height:100vh}
.admin-sidebar{width:230px;flex:none;background:var(--ink);color:#f3f1ec;padding:22px 16px;display:flex;flex-direction:column;gap:4px}
.admin-sidebar__brand{font-size:15px;font-weight:600;letter-spacing:.02em;padding:0 10px 20px;color:#fff}
.admin-sidebar__brand span{display:block;font-size:11px;font-weight:400;color:#b7b0a4;margin-top:2px}
.admin-nav a{display:block;padding:10px 12px;border-radius:8px;color:#d8d3c8;text-decoration:none;font-size:13.5px;margin-bottom:2px}
.admin-nav a:hover{background:#2d2e2b;color:#fff}
.admin-nav a.active{background:var(--accent);color:#fff}
.admin-sidebar__foot{margin-top:auto;padding-top:16px;border-top:1px solid #3a3b37}
.admin-sidebar__foot a{color:#b7b0a4;font-size:12.5px}
.admin-main{flex:1;min-width:0;padding:28px 36px 60px}
.admin-topbar{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:22px;flex-wrap:wrap;gap:10px}
.admin-topbar h1{font-size:22px;margin:0;font-weight:600}
.admin-topbar .sub{color:var(--ink-soft);font-size:13px}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:22px 24px;margin-bottom:20px}
.card h2{font-size:15px;margin:0 0 14px;font-weight:600}
.card h2 .muted{font-weight:400;color:var(--ink-soft);font-size:12.5px}
label{display:block;font-size:12.5px;font-weight:600;color:var(--ink-soft);margin-bottom:5px;letter-spacing:.01em}
input[type=text],input[type=email],input[type=tel],input[type=password],input[type=date],textarea,select{
  width:100%;box-sizing:border-box;padding:9px 11px;border:1px solid #d9d5cc;border-radius:7px;font-size:14px;font-family:inherit;background:#fff;color:var(--ink)
}
textarea{resize:vertical;min-height:80px}
input:focus,textarea:focus,select:focus{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent)}
.field{margin-bottom:16px}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.help{font-size:12px;color:var(--ink-soft);margin-top:4px}
.btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--accent);background:var(--accent);color:#fff;padding:10px 18px;border-radius:8px;font-size:13.5px;font-weight:600;cursor:pointer;text-decoration:none}
.btn:hover{background:var(--accent-dark);border-color:var(--accent-dark)}
.btn-ghost{background:#fff;color:var(--ink);border:1px solid #d9d5cc}
.btn-ghost:hover{background:#f2f0eb}
.btn-danger{background:#fff;color:var(--danger);border:1px solid #e3b7b2}
.btn-danger:hover{background:var(--danger-soft)}
.btn-row{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
.flash{padding:12px 16px;border-radius:8px;margin-bottom:18px;font-size:13.5px}
.flash-ok{background:var(--ok-soft);color:var(--ok);border:1px solid #bfe0cd}
.flash-error{background:var(--danger-soft);color:var(--danger);border:1px solid #e3b7b2}
.flash-warn{background:var(--warn-soft);color:var(--warn);border:1px solid #ecd5a3}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{text-align:left;color:var(--ink-soft);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.04em;padding:8px 10px;border-bottom:1px solid var(--line)}
td{padding:10px;border-bottom:1px solid var(--line);vertical-align:middle}
tr:last-child td{border-bottom:none}
.thumb{width:64px;height:44px;object-fit:cover;border-radius:6px;background:var(--accent-soft);display:block}
.pill{display:inline-block;padding:3px 9px;border-radius:99px;background:var(--accent-soft);color:var(--accent-dark);font-size:11.5px;font-weight:600;letter-spacing:.02em}
.pill-ok{background:var(--ok-soft);color:var(--ok)}
.pill-danger{background:var(--danger-soft);color:var(--danger)}
.pill-warn{background:var(--warn-soft);color:var(--warn)}
.toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0}
.switch{position:relative;display:inline-block;width:42px;height:24px;flex:none}
.switch input{opacity:0;width:0;height:0}
.switch .slider{position:absolute;inset:0;background:#d9d5cc;border-radius:99px;transition:.2s;cursor:pointer}
.switch .slider::before{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}
.switch input:checked + .slider{background:var(--ok)}
.switch input:checked + .slider::before{transform:translateX(18px)}
.dropzone{border:2px dashed #d9d5cc;border-radius:10px;padding:22px;text-align:center;color:var(--ink-soft);font-size:13px;background:#fbfaf8;cursor:pointer;transition:.15s}
.dropzone.is-drag{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-dark)}
.dropzone input{display:none}
.gallery-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
.gallery-grid img{width:88px;height:64px;object-fit:cover;border-radius:6px;border:1px solid var(--line)}
.gallery-grid [data-mn-gallery-handle]{cursor:grab;touch-action:none;-webkit-user-drag:none;user-drag:none}
.gallery-grid [data-mn-gallery-item]{transition:opacity .15s}
.gallery-grid [data-mn-gallery-item].is-dragging{opacity:.45;cursor:grabbing}
.gallery-grid [data-mn-gallery-item].is-dragging [data-mn-gallery-handle]{cursor:grabbing}
.empty{color:var(--ink-soft);font-size:13.5px;padding:20px 0;text-align:center}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;margin-top:4px}
.stat-tile{background:var(--bg);border:1px solid var(--line);border-radius:var(--radius);padding:26px 24px}
.stat-tile--wide{grid-column:1 / -1}
.stat-tile__label{font-size:11.5px;font-weight:600;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px}
.stat-tile__value{font-size:30px;font-weight:600;color:var(--ink);line-height:1.15}
.stat-tile__sub{font-size:12.5px;color:var(--ink-soft);margin-top:8px}
.stat-tile__seo-rows{display:flex;flex-wrap:wrap;gap:28px;font-size:13.5px;color:var(--ink)}
.stat-tile__seo-rows > div{display:inline-flex;align-items:center;gap:9px;white-space:nowrap}
@media (max-width:900px){
  .admin-shell{flex-direction:column}
  .admin-sidebar{width:100%;flex-direction:row;align-items:center;overflow-x:auto;padding:12px}
  .admin-sidebar__brand{padding:0 14px 0 4px}
  .admin-nav{display:flex;gap:2px}
  .admin-sidebar__foot{margin-top:0;margin-left:auto;padding-top:0;border-top:none;border-left:1px solid #3a3b37;padding-left:14px}
  .admin-main{padding:20px}
  .field-row{grid-template-columns:1fr}
}
</style>
</head>
<body>
<div class="admin-shell">
  <aside class="admin-sidebar">
    <div class="admin-sidebar__brand">Matière &amp; Nuance<span>Administration</span></div>
    <nav class="admin-nav">
      <a href="index.php" class="<?= $activeNav === 'dashboard' ? 'active' : '' ?>">Tableau de bord</a>
      <a href="realisations.php" class="<?= $activeNav === 'realisations' ? 'active' : '' ?>">Réalisations</a>
      <a href="textes.php" class="<?= $activeNav === 'textes' ? 'active' : '' ?>">Textes</a>
      <a href="photos.php" class="<?= $activeNav === 'photos' ? 'active' : '' ?>">Photos du site</a>
      <a href="avis.php" class="<?= $activeNav === 'avis' ? 'active' : '' ?>">Avis Google</a>
      <a href="seo.php" class="<?= $activeNav === 'seo' ? 'active' : '' ?>">SEO</a>
      <a href="parametres.php" class="<?= $activeNav === 'parametres' ? 'active' : '' ?>">Réglages</a>
      <a href="diagnostic.php" class="<?= $activeNav === 'diagnostic' ? 'active' : '' ?>">Diagnostic serveur</a>
      <a href="password.php" class="<?= $activeNav === 'password' ? 'active' : '' ?>">Mot de passe</a>
    </nav>
    <div class="admin-sidebar__foot">
      <a href="/" target="_blank">Voir le site ↗</a> · <a href="logout.php">Déconnexion</a>
    </div>
  </aside>
  <main class="admin-main">
    <div class="admin-topbar">
      <div>
        <h1><?= htmlspecialchars($pageTitle) ?></h1>
      </div>
    </div>
    <?php if ($flash): ?>
      <?php $flashClass = in_array($flash['type'], ['error', 'warn'], true) ? $flash['type'] : 'ok'; ?>
      <div class="flash flash-<?= $flashClass ?>"><?= htmlspecialchars($flash['message']) ?></div>
    <?php endif; ?>
