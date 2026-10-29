/**
 * Export JSON "anarchy-pj" v2 du classeur FicheSRA2 (feuilles "Fiche" et "Param").
 *
 * Installation : Extensions > Apps Script > coller ce fichier (en remplacement de
 * ExportFiche.gs) > enregistrer > recharger le Google Sheet > menu "Export PJ".
 *
 * Différences avec l'ancien export (format "anarchy-fiche-gsheet") :
 *  - JSON structuré : chaque atout contient un niveau de base et des effets, chaque
 *    effet a son niveau (coût) et, quand il est reconnu, un bonus typé (RR, VD,
 *    armure, case de blessure). Plus aucun texte à analyser côté application.
 *  - Véhicules, drones et cyberdecks sont des atouts typés avec leurs stats.
 *  - Armes : VD, portées, spécialisation et monture sont des champs séparés.
 *  - Chaque élément a un champ "actif" (true à l'export).
 *  - Pas de valeurs calculées (RD, seuils de blessure, coûts) : l'application les recalcule.
 *
 * La logique (buildPj_) ne dépend pas de l'API Google : elle prend la grille de
 * Fiche!A1:AD100 et de Param!A1:S129 et renvoie { pj, warnings } (test sous Node
 * possible, voir module.exports en bas de fichier).
 */

var FORMAT = 'anarchy-pj';
var VERSION = 2;
var ATT = { FOR: 'force', AGI: 'agilite', VOL: 'volonte', LOG: 'logique', CHA: 'charisme' };
var TYPE_ARME = { 'arme': 'arme', 'arme spéc.': 'arme_specialiste', 'forme comp.': 'forme_complexe', 'sort': 'sort' };
var TYPES = {
  'trait': 'Trait', "pouvoir d'adepte": "Pouvoir d'adepte", 'vehicule': 'Véhicule', 'drone': 'Drone',
  'cyberdeck': 'Cyberdeck', 'equipement': 'Équipement', 'contact': 'Contact', 'cyberware': 'Cyberware',
  'bioware': 'Bioware', 'eveil': 'Éveil', 'initiation': 'Initiation (magie)'
};
var STATS = ['Autopilote', 'Structure', 'Maniabilité', 'Vitesse', 'Blindage', 'Firewall', 'Attaque'];
var PLACEHOLDERS = ['(statut soc.)', '(origine/lieu résidence)', '(rôle/occupation)', '(autre mot-clé)'];

// ------------------------------------------------------------------ menu
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Export PJ').addItem('Exporter en JSON', 'exportPj').addToUi();
}

function exportPj() {
  var ss = SpreadsheetApp.getActive();
  var fiche = ss.getSheetByName('Fiche'), param = ss.getSheetByName('Param');
  if (!fiche || !param) { SpreadsheetApp.getUi().alert('Feuilles "Fiche" et "Param" introuvables.'); return; }
  var res = buildPj_(fiche.getRange(1, 1, 100, 30).getValues(), param.getRange(1, 1, 129, 19).getValues());
  var json = JSON.stringify(res.pj, null, 2);
  var pseudo = String(res.pj.identite.pseudo || 'pj').replace(/[^\w\-]+/g, '_');
  var name = pseudo + '_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '.json';
  var driveMsg;
  try { driveMsg = 'Fichier enregistré dans Drive : ' + DriveApp.createFile(name, json, MimeType.PLAIN_TEXT).getName(); }
  catch (e) { driveMsg = 'Enregistrement Drive non effectué (' + e.message + ').'; }
  var tpl = HtmlService.createTemplate(
    '<div style="font-family:Arial,sans-serif;font-size:13px"><p><?= msg ?></p>' +
    '<? if (warns.length) { ?><div style="background:#fff6e5;border-left:4px solid #e0a100;padding:6px 10px;margin-bottom:8px"><b>À vérifier</b><ul>' +
    '<? warns.forEach(function(w){ ?><li><?= w ?></li><? }) ?></ul></div><? } ?>' +
    '<textarea id="t" style="width:100%;height:260px;font-family:monospace;font-size:11px"><?= json ?></textarea>' +
    '<p><button onclick="copy()">Copier</button> <button onclick="dl()">Télécharger</button></p></div>' +
    '<script>function copy(){var t=document.getElementById("t");t.select();document.execCommand("copy");}' +
    'function dl(){var b=new Blob([document.getElementById("t").value],{type:"application/json"});' +
    'var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=<?!= JSON.stringify(name) ?>;' +
    'document.body.appendChild(a);a.click();document.body.removeChild(a);}</script>');
  tpl.msg = driveMsg; tpl.json = json; tpl.name = name; tpl.warns = res.warnings;
  SpreadsheetApp.getUi().showModalDialog(tpl.evaluate().setWidth(680).setHeight(560), 'Export : ' + name);
}

// ------------------------------------------------------- logique d'export
function norm_(s) {
  return String(s).toLowerCase().replace(/’/g, "'").normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}
function sq_(s) { return norm_(s).replace(/ /g, ''); }

function buildPj_(g, p) {
  var warnings = [];
  function cell(ref) {
    var m = /^([A-Z]+)(\d+)$/.exec(ref), col = 0;
    for (var i = 0; i < m[1].length; i++) col = col * 26 + (m[1].charCodeAt(i) - 64);
    var row = g[parseInt(m[2], 10) - 1];
    return row && row[col - 1] !== undefined ? row[col - 1] : '';
  }
  function txt(v) { return String(v === null || v === undefined ? '' : v).trim(); }
  function num(v) { if (v === '' || v === null || v === undefined) return null; var n = Number(v); return isNaN(n) ? null : n; }
  function list(refs) { return refs.map(function (r) { return txt(cell(r)); }).filter(Boolean); }
  function keyword(ref) { var t = txt(cell(ref)); return PLACEHOLDERS.indexOf(t.toLowerCase()) >= 0 ? '' : t; }

  // --- catalogue des compétences (feuille Param, colonnes M et N, lignes 5 à 129)
  var cat = [], cur = null;
  for (var r = 5; r <= 129; r++) {
    var n = txt(p[r - 1][12]), a = ATT[txt(p[r - 1][13])] || null;
    if (!n) continue;
    if (n.charAt(0) === '(') {
      var m = /^\(\s*(.*?)\s*\+2\s*\)\s*$/.exec(n);
      if (cur) cur.specs.push({ nom: m ? m[1] : n, attribut: a });
    } else { cur = { nom: n, attribut: a, specs: [] }; cat.push(cur); }
  }
  function sameComp(name, t) { var x = norm_(name); return x === t || (t.length > 3 && (t.indexOf(x) >= 0 || x.indexOf(t) >= 0)); }

  // --- métatypes et maximums d'attributs (Param D4:J10)
  var metaTable = {};
  for (var c = 5; c <= 9; c++) {
    var mt = txt(p[3][c]); if (!mt) continue;
    metaTable[mt] = {};
    for (var rr = 5; rr <= 9; rr++) { var an = ATT[txt(p[rr][3])]; if (an) metaTable[mt][an] = num(p[rr][c]); }
  }

  // --- identité
  var metatype = txt(cell('A6'));
  var identite = {
    pseudo: txt(cell('A3')), nom: txt(cell('C3')), metatype: metatype,
    mots_cles: [keyword('B6'), keyword('A7'), keyword('A8'), keyword('A9')].filter(Boolean),
    train_de_vie: txt(cell('A10')),
    repliques: list(['I6', 'I7', 'I8', 'I9']), comportements: list(['C6', 'C7', 'C8', 'C9'])
  };

  // --- attributs ; maximums personnalisés seulement s'ils diffèrent du tableau du métatype
  var cols = ['H', 'I', 'J', 'K', 'L'], maxCols = ['Z', 'AA', 'AB', 'AC', 'AD'];
  var attributs = {}, maxSheet = {}, differ = false;
  cols.forEach(function (col, i) {
    var an = ATT[txt(cell(col + '1'))];
    attributs[an] = num(cell(col + '3')) || 0;
    maxSheet[an] = num(cell(maxCols[i] + '5'));
    if (!metaTable[metatype] || metaTable[metatype][an] !== maxSheet[an]) differ = true;
  });

  // --- atouts : blocs repérés par la colonne M (niveau), lignes en H, sous-niveau K, perte d'essence L
  var blocks = [], b = null;
  for (var ra = 13; ra <= 58; ra++) {
    var niv = cell('M' + ra);
    if (niv !== '' && niv !== null) { b = { niveau: num(niv), lignes: [] }; blocks.push(b); }
    var t = txt(cell('H' + ra));
    if (t) {
      if (!b) { b = { niveau: null, lignes: [] }; blocks.push(b); }
      b.lignes.push({ texte: t, niveau: num(cell('K' + ra)) || 0, perte_essence: num(cell('L' + ra)) || 0 });
    }
  }
  function parseBonus(t) {
    var m = /\bRR\s*([123])\b\s*(?:(?:pour|au test de|aux tests de|sur|à|a)\s+)?(.+)$/i.exec(t);
    if (m) {
      var rest = m[2].trim(), pm = /^(.*?)\s*\((.+)\)\s*$/.exec(rest);
      var c1 = norm_(pm ? pm[1] : rest), par = pm ? norm_(pm[2]) : '', hit = null, i, j;
      if (!par) { for (i = 0; i < cat.length; i++) if (norm_(cat[i].nom) === c1) hit = { competence: cat[i].nom, specialisation: null }; }
      for (i = 0; i < cat.length && !hit; i++) for (j = 0; j < cat[i].specs.length; j++) {
        var sn = norm_(cat[i].specs[j].nom);
        if (sn === c1 || (par && sn === par && sameComp(cat[i].nom, c1))) { hit = { competence: cat[i].nom, specialisation: cat[i].specs[j].nom }; break; }
      }
      for (i = 0; i < cat.length && !hit; i++) if (sameComp(cat[i].nom, c1)) {
        hit = { competence: cat[i].nom, specialisation: null };
        if (par) warnings.push('« ' + t + ' » : « ' + pm[2] + ' » n’est pas une spécialisation connue de ' + cat[i].nom + ', RR appliqué à la compétence.');
      }
      if (hit) { hit.type = 'rr'; hit.valeur = +m[1]; return hit; }
      warnings.push('RR non reconnu (laissé en texte libre) : « ' + t + ' »');
      return null;
    }
    m = /^VD\s*\+\s*(\d+)\s*(?:(?:au|aux|à|sur|pour|avec)\s+)?(.*)$/i.exec(t);
    if (m) return { type: 'vd', cible: m[2].replace(/\([^)]*\)/g, '').trim(), valeur: +m[1] };
    m = /\barmure\b(?!\s*:)([^+\d]*)\+\s*(\d+)(.*)$/i.exec(t);
    if (m) { var q = norm_(m[1] + ' ' + m[3]); return { type: 'armure', portee: /mental/.test(q) ? 'mental' : (/tous/.test(q) ? 'tous' : 'physique'), valeur: +m[2] }; }
    var nt = norm_(t), cm = /\bcases?\b/.test(nt) && /(legere|grave|incap)/.exec(nt);
    if (cm) { var vm = /\+\s*(\d+)/.exec(t); return { type: 'case', gravite: cm[1], valeur: vm ? +vm[1] : 1 }; }
    return null;
  }
  function statsOf(t) {
    var s = norm_(t), out = {}, n = 0;
    STATS.forEach(function (k) { var m = new RegExp(norm_(k) + '\\s*(\\d+)').exec(s); if (m) { out[norm_(k)] = +m[1]; n++; } });
    var line = /^(firewall|attaque)\s*\d/.test(s) || n >= 3;
    return line ? out : null;
  }
  var atouts = blocks.filter(function (x) { return x.lignes.length; }).map(function (blk) {
    var title = blk.lignes[0], full = title.texte;
    var pm = /^([^:\n]{2,30}?)\s*:\s*([\s\S]+)$/.exec(full), type = null, nom = full;
    if (pm) { type = TYPES[norm_(pm[1])] || pm[1].trim(); nom = pm[2].trim(); }
    var all = norm_(blk.lignes.map(function (l) { return l.texte; }).join(' | '));
    var nStats = STATS.filter(function (k) { return new RegExp(norm_(k) + '\\s*\\d').test(all); }).length;
    if (!type) {
      var nf = norm_(full);
      if (/cyber ?deck/.test(nf) || (/firewall\s*\d/.test(all) && /attaque\s*\d/.test(all))) type = 'Cyberdeck';
      else if (/\bdrone\b/.test(nf)) type = 'Drone';
      else if (/vehicule/.test(nf) || nStats >= 3) type = 'Véhicule';
      else if (nf === 'eveil') type = 'Éveil';
    }
    var atout = { type: type, nom: nom, actif: true, niveau_base: title.niveau, effets: [] };
    if (title.perte_essence) atout.perte_essence = title.perte_essence;
    var stats = {}, hasStats = false;
    blk.lignes.slice(1).forEach(function (l) {
      var e = { texte: l.texte, niveau: l.niveau };
      if (l.perte_essence) e.perte_essence = l.perte_essence;
      var bn = parseBonus(l.texte); if (bn) e.bonus = bn;
      if (/Cyberdeck|Drone|Véhicule/.test(type || '')) {
        var st = statsOf(l.texte);
        if (st) { e.stat = true; for (var k in st) stats[k] = st[k]; hasStats = true; }
      }
      if (!bn && /\barmure\b/i.test(l.texte) && !/^\s*armure\s*:/i.test(l.texte) && !e.stat) warnings.push('Ligne d’armure sans valeur chiffrée (laissée en texte libre) : « ' + l.texte + ' »');
      atout.effets.push(e);
    });
    if (hasStats) atout.stats = stats;
    var total = atout.niveau_base, bad = false;
    atout.effets.forEach(function (e) { total += e.niveau; });
    if (blk.niveau !== null && Math.abs(total - blk.niveau) > 1e-9) warnings.push('Atout « ' + nom + ' » : niveau de la feuille ' + blk.niveau + ', somme des lignes ' + total + '.');
    return atout;
  });

  // --- compétences (lignes 13 à 58) ; spécialisation = nom contenant "+2", rattachée à la précédente
  var comps = [], last = null;
  function inCat(compNom, specNom) {
    for (var i = 0; i < cat.length; i++) if (norm_(cat[i].nom) === norm_(compNom)) {
      if (specNom === undefined) return true;
      for (var j = 0; j < cat[i].specs.length; j++) if (norm_(cat[i].specs[j].nom) === norm_(specNom)) return true;
    }
    return false;
  }
  var rrSaisi = [];
  for (var rc = 13; rc <= 58; rc++) {
    var nm = txt(cell('A' + rc)); if (!nm) continue;
    var at = ATT[txt(cell('D' + rc))] || null, f = num(cell('F' + rc)) || 0;
    if (nm.indexOf('+2') !== -1 && last) {
      var sm = /^\(\s*(.*?)\s*\+2\s*\)$/.exec(nm), sname = sm ? sm[1] : nm;
      var spec = { nom: sname, actif: true, attribut: at };
      if (!inCat(last.nom, sname)) spec.perso = true;
      last.specialites.push(spec);
      if (f) rrSaisi.push(sname + ' (' + f + ')');
    } else {
      last = { nom: nm, actif: true, attribut: at, indice: num(cell('C' + rc)) || 0, specialites: [] };
      if (!inCat(nm)) last.perso = true;
      comps.push(last);
      if (f) rrSaisi.push(nm + ' (' + f + ')');
    }
  }
  if (rrSaisi.length) warnings.push('Colonne RR de la feuille renseignée pour : ' + rrSaisi.join(', ') + '. Elle n’est pas exportée : les RR viennent des effets d’atouts. Vérifie que chaque RR a une ligne « RRn … » dans un atout.');

  // --- armes (lignes 68 à 80) ; la ligne 67 « Mains nues » est automatique
  var armes = [];
  function parseW(nom) {
    var n = nom, expr = null, ports = null, specialisation = null;
    n = n.replace(/\(\s*VD\s*([^,)]*?)\s*(?:,\s*([^)]*))?\)/i, function (m, e, pp) { expr = e.trim(); ports = pp ? pp.trim() : null; return ''; });
    if (!ports) n = n.replace(/\(\s*((?:OK|Dés|-)(?:\/(?:OK|Dés|-)){3})\s*\)/i, function (m, pp) { ports = pp; return ''; });
    n = n.replace(/\(([^)]*)\)/g, function (m, x) {
      if (!specialisation) for (var i = 0; i < cat.length; i++) for (var j = 0; j < cat[i].specs.length; j++)
        if (norm_(cat[i].specs[j].nom) === norm_(x)) { specialisation = cat[i].specs[j].nom; return ''; }
      return m;
    });
    var vd = null;
    if (expr !== null && expr !== '') vd = /^\d+$/.test(expr) ? +expr : expr.toUpperCase().replace(/\s+/g, '');
    return { nom: n.replace(/\s+/g, ' ').trim(), vd: vd, portees: ports ? ports.split('/').map(function (x) { return x.trim(); }) : null, specialisation: specialisation };
  }
  for (var rw = 68; rw <= 80; rw++) {
    var wn = txt(cell('H' + rw)); if (!wn) continue;
    var wt = txt(cell('M' + rw)).toLowerCase();
    var pw = parseW(wn);
    var arme = { nom: pw.nom, actif: true, categorie: TYPE_ARME[wt] || 'arme' };
    if (pw.specialisation) arme.specialisation = pw.specialisation;
    if (pw.vd !== null) arme.vd = pw.vd;
    if (pw.portees) arme.portees = pw.portees;
    armes.push(arme);
  }
  // monture : "(sur X)" retiré du nom et remplacé par monte_sur = nom de l'atout véhicule/drone/cyberdeck
  armes.forEach(function (w) {
    var mm = /\(\s*sur ([^)]+)\)/i.exec(w.nom); if (!mm) return;
    var t = sq_(mm[1]), host = atouts.filter(function (a) { return /Véhicule|Drone|Cyberdeck/.test(a.type || '') && sq_(a.nom).indexOf(t) >= 0; })[0];
    if (host) { w.monte_sur = host.nom; w.nom = w.nom.replace(mm[0], '').replace(/\s+/g, ' ').trim(); }
    else warnings.push('Arme « ' + w.nom + ' » : monture « ' + mm[1] + ' » introuvable parmi les véhicules, drones et cyberdecks.');
  });

  // --- équipement : colonnes H et K, lignes 82 à 88 (ligne 82 offerte)
  var equipement = [];
  for (var re = 82; re <= 88; re++) ['H', 'K'].forEach(function (col) {
    var e = txt(cell(col + re)); if (e) equipement.push({ nom: e, actif: true, offert: re === 82 });
  });

  // le karma n'existe plus dans le format : karma × 500 est ajouté aux gains (même total de nuyens que la feuille)
  var karma = num(cell('Q21')) || 0, gains = karma * 500 + (num(cell('Q22')) || 0);
  if (karma) warnings.push('Karma ' + karma + ' converti en ' + (karma * 500) + ' nuyens et ajouté aux gains (gains exportés : ' + gains + ').');

  var pj = {
    format: FORMAT, version: VERSION,
    identite: identite,
    niveau_de_jeu: { nom: 'Choix', nuyens: num(cell('V5')), nb_attributs_max: num(cell('V6')), indice_max_competence: num(cell('V7')),
      rr_max_competence: num(cell('V8')), rr_max_specialisation: num(cell('V9')) },
    gains: gains,
    attributs: attributs,
    attributs_max: differ ? maxSheet : null,
    competences: comps,
    connaissances: list(['A60', 'A61', 'A62', 'A63', 'A64']).map(function (x) { return { nom: x, actif: true }; }),
    atouts: atouts,
    armes: armes,
    armure: { nom: txt(cell('K81')).replace(/^Armure\s*:\s*/i, ''), valeur: num(cell('M81')) || 0, actif: true },
    equipement: equipement
  };
  if (differ) warnings.push('Maximums d’attributs différents du tableau du métatype « ' + metatype + ' » : exportés dans attributs_max.');
  return { pj: pj, warnings: warnings };
}

// Test hors Google (Node) : ignoré dans Apps Script.
if (typeof module !== 'undefined') { module.exports = { buildPj_: buildPj_ }; }
