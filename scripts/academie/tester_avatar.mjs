// Tests de la logique de l'avatar (cadrage, zoom, aléatoire...).
// Utilisation, depuis la racine du projet :
//   node scripts/academie/tester_avatar.mjs
// Le script compile les modules concernés dans un dossier temporaire
// (TypeScript du projet), puis vérifie leurs propriétés.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const racine = resolve(import.meta.dirname, "../..");
const sortie = mkdtempSync(join(tmpdir(), "ada-avatar-"));
const tsc = join(racine, "node_modules", "typescript", "bin", "tsc");
execFileSync(process.execPath, [
  tsc,
  "--outDir", sortie,
  "--module", "commonjs",
  "--target", "es2020",
  "--moduleResolution", "node",
  "--skipLibCheck",
  "--strict",
  "--rootDir", racine,
  join(racine, "lib/academie/avatar/composition.ts"),
  join(racine, "lib/academie/avatar/selection.ts"),
], { stdio: "inherit" });
writeFileSync(join(sortie, "package.json"), '{"type":"commonjs"}');

const require = createRequire(join(sortie, "index.js"));
const C = require(join(sortie, "lib/academie/avatar/composition.js"));
const S = require(join(sortie, "lib/academie/avatar/selection.js"));
const K = require(join(sortie, "data/academie/avatar/catalogue.js"));
const { manifeste } = require(join(sortie, "data/academie/avatar/manifeste.genere.js"));

let reussis = 0;
const echecs = [];
function verifier(nom, condition, detail = "") {
  if (condition) reussis++;
  else echecs.push(`${nom}${detail ? " — " + detail : ""}`);
}
const contient = (ext, int, tol = 0.5) =>
  ext[0] <= int[0] + tol && ext[1] <= int[1] + tol && ext[2] >= int[2] - tol && ext[3] >= int[3] - tol;
const r = (b) => b.map((v) => Math.round(v)).join(",");

// 1. Catalogue ↔ manifeste ↔ fichiers
for (const [cat, options] of Object.entries(K.optionsParCalque)) {
  const ids = new Set();
  for (const o of options) {
    verifier(`id unique ${cat}/${o.id}`, !ids.has(o.id));
    ids.add(o.id);
    verifier(`mesuré ${o.fichier}`, !!manifeste[o.fichier]);
    verifier(`fichier présent ${o.fichier}`, existsSync(join(racine, "public", K.racineAssets, o.fichier)));
    const v = manifeste[o.fichier]?.vignette;
    verifier(`vignette présente ${o.fichier}`, !!v && existsSync(join(racine, "public", K.racineAssets, v)));
  }
}

// 2. Sélection normalisée
const defF = C.normaliserSelection(undefined, "feminin");
verifier("défaut féminin", defF.visage === "f-ovale" && defF.cheveux === "longs-ondules");
verifier("défaut masculin", C.normaliserSelection(undefined, "masculin").visage === "m-ovale");
verifier("défaut non binaire", C.normaliserSelection(undefined, "nonbinaire").visage === "f-ovale");
verifier("id inconnu remplacé", C.normaliserSelection({ cheveux: "n-existe-pas", nez: "retrousse" }, "masculin").cheveux === "court-classique");
verifier("id valide conservé", C.normaliserSelection({ nez: "retrousse" }, "masculin").nez === "retrousse");

// 3. Portrait : rien de la tête n'est coupé, visage centré
for (const v of K.optionsParCalque.visage) {
  for (const h of K.optionsParCalque.cheveux) {
    const sel = { ...defF, visage: v.id, cheveux: h.id };
    const calques = C.composer(sel, "portrait");
    const zone = C.zoneCadrage(calques, "portrait");
    // La tenue sous le portrait est un fond (horsCadrage) : elle déborde volontairement du cadre.
    for (const c of calques.filter((x) => !x.horsCadrage)) verifier(`portrait ${v.id}+${h.id} contient ${c.cle}`, contient(zone, c.limites), `${r(zone)} ⊅ ${r(c.limites)}`);
    const visage = calques.find((c) => c.cle === "visage");
    const cx = (visage.limites[0] + visage.limites[2]) / 2;
    verifier(`portrait ${v.id}+${h.id} centré`, Math.abs((zone[0] + zone[2]) / 2 - cx) < 0.5);
    const hauteur = zone[3] - zone[1];
    const haut = Math.min(...calques.map((c) => c.limites[1]));
    verifier(`portrait ${v.id}+${h.id} marge au-dessus des cheveux`, haut - zone[1] >= hauteur * 0.05);
    const coiffure = calques.find((c) => c.cle === "cheveux");
    verifier(`coiffure ${h.id} couvre le crâne de ${v.id}`, coiffure.limites[1] <= C.sommetCrane(v) - K.MARGE_COIFFURE + 0.5);
  }
}

// 4. Éléments du visage posés à l'intérieur du visage
for (const v of K.optionsParCalque.visage) {
  for (const cat of ["yeux", "sourcils", "nez", "bouche"]) {
    for (const o of K.optionsParCalque[cat]) {
      const calques = C.composer({ ...defF, visage: v.id, [cat]: o.id }, "portrait");
      const visage = calques.find((c) => c.cle === "visage").limites;
      const el = calques.find((c) => c.cle === cat).limites;
      verifier(`${cat} ${o.id} dans ${v.id}`, el[0] >= visage[0] && el[2] <= visage[2] && el[1] >= visage[1] && el[3] <= visage[3], `${r(el)} / ${r(visage)}`);
    }
  }
}

// 5. Plein pied : personnage entier visible, tête posée sur la tenue
for (const t of K.optionsParCalque.tenue) {
  for (const h of K.optionsParCalque.cheveux) {
    const calques = C.composer({ ...defF, tenue: t.id, cheveux: h.id }, "pleinPied");
    const zone = C.zoneCadrage(calques, "pleinPied");
    for (const c of calques.filter((x) => !x.horsCadrage)) verifier(`plein pied ${t.id}+${h.id} contient ${c.cle}`, contient(zone, c.limites));
  }
  const calques = C.composer({ ...defF, tenue: t.id }, "pleinPied");
  const visage = calques.find((c) => c.cle === "visage").limites;
  const tenue = calques.find((c) => c.cle === "tenue").limites;
  verifier(`tête au sommet de ${t.id}`, Math.abs(visage[1] - tenue[1]) < 6, `${visage[1].toFixed(1)} vs ${tenue[1]}`);
  verifier(`visage masqué en bas (${t.id})`, /linear-gradient/.test(calques.find((c) => c.cle === "visage").masque ?? ""));
}

// 6. Ajustement à l'écran : la zone tient dans l'espace utile, proportions conservées
const tailles = [[320, 230], [375, 280], [390, 360], [568, 280], [844, 360], [1024, 700], [1440, 860], [2560, 1300]];
const reserve = { haut: 12, bas: 64, gauche: 12, droite: 12 };
for (const vue of ["portrait", "pleinPied"]) {
  const zone = C.zoneCadrage(C.composer(defF, vue), vue);
  for (const [l, h] of tailles) {
    const cadre = { largeur: l, hauteur: h, reserve };
    const t = C.transformation(zone, cadre, C.ZOOM_NEUTRE);
    const ecran = [zone[0] * t.s + t.x, zone[1] * t.s + t.y, zone[2] * t.s + t.x, zone[3] * t.s + t.y];
    const utile = [reserve.gauche, reserve.haut, l - reserve.droite, h - reserve.bas];
    verifier(`${vue} ${l}×${h} tient dans l'aperçu`, contient(utile, ecran, 0.6), `${r(ecran)} / ${r(utile)}`);
    const remplit = Math.abs(ecran[2] - ecran[0] - (utile[2] - utile[0])) < 1 || Math.abs(ecran[3] - ecran[1] - (utile[3] - utile[1])) < 1;
    verifier(`${vue} ${l}×${h} occupe l'espace disponible`, remplit);
  }
}

// 7. Zoom et recentrage
{
  const zone = C.zoneCadrage(C.composer(defF, "portrait"), "portrait");
  const cadre = { largeur: 600, hauteur: 500, reserve };
  const b = C.borner({ zoom: 1, px: 300, py: -200 }, zone, cadre);
  verifier("zoom 1 : pas de déplacement possible", b.px === 0 && b.py === 0);
  verifier("zoom borné", C.borner({ zoom: 99, px: 0, py: 0 }, zone, cadre).zoom === C.ZOOM_MAX && C.borner({ zoom: 0.1, px: 0, py: 0 }, zone, cadre).zoom === C.ZOOM_MIN);
  const point = { x: 250, y: 180 };
  const avant = C.transformation(zone, cadre, C.ZOOM_NEUTRE);
  const z2 = C.zoomerAutour(C.ZOOM_NEUTRE, 2, point, zone, cadre);
  const apres = C.transformation(zone, cadre, z2);
  const c = { x: (point.x - avant.x) / avant.s, y: (point.y - avant.y) / avant.s };
  verifier("le point sous le curseur reste fixe", Math.abs(c.x * apres.s + apres.x - point.x) < 0.01 && Math.abs(c.y * apres.s + apres.y - point.y) < 0.01);
  const loin = C.borner({ zoom: 3, px: 1e6, py: -1e6 }, zone, cadre);
  const t = C.transformation(zone, cadre, loin);
  const ecran = [zone[0] * t.s + t.x, zone[1] * t.s + t.y, zone[2] * t.s + t.x, zone[3] * t.s + t.y];
  verifier("déplacement maximal : l'aperçu reste couvert par le personnage", ecran[0] <= 12.01 && ecran[1] <= 12.01 && ecran[2] >= 587.99 && ecran[3] >= 435.99, r(ecran));
  const retour = C.zoomerAutour(loin, 1, { x: 10, y: 10 }, zone, cadre);
  verifier("dézoom complet = cadrage automatique", retour.zoom === 1 && retour.px === 0 && retour.py === 0);
}

// 8. Aléatoire
{
  let graine = 42;
  const hasard = () => ((graine = (graine * 16807) % 2147483647) - 1) / 2147483646;
  const base = S.apparenceInitiale("feminin");
  let coherents = 0;
  for (let i = 0; i < 500; i++) {
    const a = S.apparenceAleatoire(base, "feminin", hasard);
    const sel = a.avatar;
    const valide = K.ordreCalques.every((cat) => C.trouverOption(cat, sel[cat]));
    verifier(`aléatoire ${i} valide`, valide);
    const morphos = ["visage", "yeux", "bouche", "cheveux", "tenue"].map((cat) => C.trouverOption(cat, sel[cat]).morphologie);
    if (morphos.every((m) => m === morphos[0])) coherents++;
    verifier(`aléatoire ${i} couleurs de palette`, K.palettes.peau.some((c) => c.valeur === a.peau) && K.palettes.cheveux.some((c) => c.valeur === a.cheveux));
  }
  verifier("aléatoire : morphologies cohérentes", coherents === 500, `${coherents}/500`);
  verifier("aléatoire : synchronise le portrait vectoriel", (() => {
    const a = S.apparenceAleatoire(base, "feminin", hasard);
    return a.coiffure === C.trouverOption("cheveux", a.avatar.cheveux).svg.coiffure;
  })());
}

// 9. Personnalisation avancée et réinitialisation
{
  const init = S.apparenceInitiale("masculin");
  verifier("apparence initiale : 0 personnalisation", S.nombrePersonnalisations(init, "masculin") === 0);
  const modif = S.avecSelection({ ...init, peau: K.palettes.peau[5].valeur }, "masculin", { nez: "retrousse", cheveux: "afro" });
  verifier("3 personnalisations comptées", S.nombrePersonnalisations(modif, "masculin") === 3);
  verifier("ancienne sauvegarde sans avatar acceptée", S.nombrePersonnalisations({ ...init, avatar: undefined }, "masculin") === 0);
}

// 10. Asset absent ou non mesuré
{
  const e = C.entreeManifeste("n-existe/pas.png");
  verifier("asset non mesuré : canevas entier", !e.mesure && e.limites.join() === "0,0,1024,1024");
  const calques = C.composer(defF, "portrait");
  const sansCheveux = C.zoneCadrage(calques, "portrait", new Set(["cheveux"]));
  const avec = C.zoneCadrage(calques, "portrait");
  verifier("coiffure en erreur : cadrage recalculé sans elle", sansCheveux[1] > avec[1]);
  verifier("aucun calque : cadrage par défaut", C.zoneCadrage([], "portrait").join() === "0,0,1024,1024");
}

rmSync(sortie, { recursive: true, force: true });
console.log(`\n${reussis} vérifications réussies, ${echecs.length} échec(s).`);
for (const e of echecs.slice(0, 40)) console.log("  ✗ " + e);
if (echecs.length > 40) console.log(`  … et ${echecs.length - 40} autres`);
process.exit(echecs.length ? 1 : 0);
