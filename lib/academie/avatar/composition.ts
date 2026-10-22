// Composition de l'avatar en calques et calcul du cadrage.
// Fonctions pures, sans React : le portrait et le plein pied sont
// deux projections de la même sélection, jamais deux personnages.
//
// Les imports sont relatifs pour que ce module puisse être testé
// hors de Next (voir scripts/academie/tester_avatar.mjs).

import {
  TAILLE_ESPACE,
  MARGE_COIFFURE,
  ancresDuVisage,
  fonduCouPleinPied,
  morphologieParDefaut,
  optionsParCalque,
  ordreCalques,
  racineAssets,
  selectionsParDefaut,
} from "../../../data/academie/avatar/catalogue";
import { manifeste } from "../../../data/academie/avatar/manifeste.genere";
import type {
  Boite,
  CategorieCalque,
  EntreeManifeste,
  OptionCalque,
  OptionTenue,
  OptionVisage,
  SelectionAvatar,
  VueAvatar,
} from "../../../data/academie/avatar/types";

export type Calque = {
  cle: CategorieCalque;
  optionId: string;
  label: string;
  src: string;
  /** Position et taille du canevas de l'image dans l'espace de la vue. */
  x: number;
  y: number;
  l: number;
  h: number;
  /** Zone réellement dessinée, dans l'espace de la vue. */
  limites: Boite;
  /** Masque CSS (dégradé) appliqué à l'image, si besoin. */
  masque?: string;
  /** Vrai si les limites viennent du manifeste (sinon : canevas entier, par prudence). */
  mesure: boolean;
};

export type SelectionComplete = Required<SelectionAvatar>;

// ---------- Options et sélection ----------

export function optionsDe(cat: CategorieCalque): OptionCalque[] {
  return optionsParCalque[cat];
}

export function trouverOption(cat: CategorieCalque, id: string | undefined): OptionCalque | undefined {
  return id ? optionsParCalque[cat].find((o) => o.id === id) : undefined;
}

/** Complète une sélection (ancienne sauvegarde, identifiant disparu...) avec des valeurs valides. */
export function normaliserSelection(selection: SelectionAvatar | undefined, identite: string): SelectionComplete {
  const defaut = selectionsParDefaut[morphologieParDefaut(identite)];
  const resultat = { ...defaut };
  for (const cat of ordreCalques) {
    const id = selection?.[cat];
    if (id && trouverOption(cat, id)) resultat[cat] = id;
  }
  return resultat;
}

// ---------- Manifeste ----------

export function entreeManifeste(fichier: string): EntreeManifeste & { mesure: boolean } {
  const e = manifeste[fichier];
  if (e) return { ...e, mesure: true };
  // Asset non mesuré : on considère tout le canevas comme dessiné,
  // ce qui élargit le cadrage au lieu de risquer de couper.
  return { l: TAILLE_ESPACE, h: TAILLE_ESPACE, limites: [0, 0, TAILLE_ESPACE, TAILLE_ESPACE], mesure: false };
}

export function cheminAsset(fichier: string): string {
  return racineAssets + fichier;
}

export function cheminVignette(fichier: string): string {
  const e = manifeste[fichier];
  return racineAssets + (e?.vignette ?? fichier);
}

// ---------- Placement ----------

function calqueDepuis(cle: CategorieCalque, option: OptionCalque, x: number, y: number, echelle: number): Calque {
  const e = entreeManifeste(option.fichier);
  const [x0, y0, x1, y1] = e.limites;
  return {
    cle,
    optionId: option.id,
    label: option.label,
    src: cheminAsset(option.fichier),
    x,
    y,
    l: e.l * echelle,
    h: e.h * echelle,
    limites: [x + x0 * echelle, y + y0 * echelle, x + x1 * echelle, y + y1 * echelle],
    mesure: e.mesure,
  };
}

/** Sommet du crâne du visage choisi, dans l'espace "tete". */
export function sommetCrane(visage: OptionVisage): number {
  if (visage.sommet !== undefined) return visage.sommet;
  const e = entreeManifeste(visage.fichier);
  return e.limites[1] * (TAILLE_ESPACE / e.l);
}

/**
 * Les variantes d'un même jeu (même dossier) sont dessinées à la même
 * échelle : un nez large doit rester plus large qu'un nez fin. On applique
 * donc une échelle commune au jeu, calculée sur la taille médiane de ses
 * variantes, au lieu de ramener chaque asset à la même taille.
 */
const cacheReference = new Map<string, number>();
function dimensionDeReference(cle: CategorieCalque, option: OptionCalque, mesure: "largeur" | "hauteur"): number {
  const jeu = option.fichier.slice(0, option.fichier.lastIndexOf("/"));
  const k = `${cle}|${jeu}|${mesure}`;
  const connue = cacheReference.get(k);
  if (connue) return connue;
  const tailles = optionsParCalque[cle]
    .filter((o) => o.fichier.startsWith(jeu + "/"))
    .map((o) => {
      const e = entreeManifeste(o.fichier);
      // Rapportée à un canevas de 1024 pour comparer des jeux de résolutions différentes.
      return ((mesure === "largeur" ? e.limites[2] - e.limites[0] : e.limites[3] - e.limites[1]) * TAILLE_ESPACE) / e.l;
    })
    .sort((a, b) => a - b);
  const mediane = tailles.length ? tailles[Math.floor(tailles.length / 2)] : TAILLE_ESPACE;
  const e = entreeManifeste(option.fichier);
  const valeur = Math.max(1, (mediane * e.l) / TAILLE_ESPACE);
  cacheReference.set(k, valeur);
  return valeur;
}

/** Calques de la tête, dans l'espace "tete" (1024 × 1024). */
function calquesTete(sel: SelectionComplete): Calque[] {
  const visage = trouverOption("visage", sel.visage) as OptionVisage;
  const ancres = ancresDuVisage(visage);
  const calques: Calque[] = [];

  // Visage : canevas natif ramené à 1024.
  const eVisage = entreeManifeste(visage.fichier);
  calques.push(calqueDepuis("visage", visage, 0, 0, TAILLE_ESPACE / eVisage.l));

  // Yeux, sourcils, nez, bouche : centre de la zone utile posé sur l'ancre,
  // mise à l'échelle uniforme pour atteindre la taille cible.
  for (const cle of ["yeux", "nez", "bouche", "sourcils"] as const) {
    const option = trouverOption(cle, sel[cle]);
    if (!option) continue;
    const a = ancres[cle];
    const e = entreeManifeste(option.fichier);
    const [x0, y0, x1, y1] = e.limites;
    const s = (a.taille / dimensionDeReference(cle, option, a.mesure)) * (option.reglage?.echelle ?? 1);
    const x = a.cx - ((x0 + x1) / 2) * s + (option.reglage?.dx ?? 0);
    const y = a.cy - ((y0 + y1) / 2) * s + (option.reglage?.dy ?? 0);
    calques.push(calqueDepuis(cle, option, x, y, s));
  }

  // Coiffure : canevas commun aux visages ; on la remonte si son
  // sommet est plus bas que le crâne (sinon le crâne apparaîtrait).
  const coiffure = trouverOption("cheveux", sel.cheveux);
  if (coiffure) {
    const e = entreeManifeste(coiffure.fichier);
    const s = (TAILLE_ESPACE / e.l) * (coiffure.reglage?.echelle ?? 1);
    const haut = e.limites[1] * s;
    const x = (TAILLE_ESPACE - e.l * s) / 2 + (coiffure.reglage?.dx ?? 0);
    const y = Math.min(0, sommetCrane(visage) - MARGE_COIFFURE - haut) + (coiffure.reglage?.dy ?? 0);
    calques.push(calqueDepuis("cheveux", coiffure, x, y, s));
  }
  return calques;
}

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;

/** Liste ordonnée des calques à afficher pour une vue. */
export function composer(selection: SelectionComplete, vue: VueAvatar): Calque[] {
  const tete = calquesTete(selection);
  if (vue === "portrait") return trier(tete);

  const tenue = trouverOption("tenue", selection.tenue) as OptionTenue;
  const eTenue = entreeManifeste(tenue.fichier);
  const calqueTenue = calqueDepuis("tenue", tenue, 0, 0, TAILLE_ESPACE / eTenue.l);
  calqueTenue.masque = `linear-gradient(to bottom, transparent ${pct(tenue.masqueHaut[0])}, #000 ${pct(tenue.masqueHaut[1])})`;

  // Tête -> corps : le sommet du crâne vient se poser sur celui de la tenue.
  const visage = trouverOption("visage", selection.visage) as OptionVisage;
  const ox = TAILLE_ESPACE / 2;
  const oy = sommetCrane(visage);
  const k = tenue.tete.echelle;
  const tx = (v: number) => (v - ox) * k + tenue.tete.x;
  const ty = (v: number) => (v - oy) * k + tenue.tete.y;
  const teteSurCorps = tete.map<Calque>((c) => ({
    ...c,
    x: tx(c.x),
    y: ty(c.y),
    l: c.l * k,
    h: c.h * k,
    limites: [tx(c.limites[0]), ty(c.limites[1]), tx(c.limites[2]), ty(c.limites[3])],
    masque: c.cle === "visage" ? `linear-gradient(to bottom, #000 ${pct(fonduCouPleinPied[0])}, transparent ${pct(fonduCouPleinPied[1])})` : c.masque,
  }));
  return trier([calqueTenue, ...teteSurCorps]);
}

function trier(calques: Calque[]): Calque[] {
  return [...calques].sort((a, b) => ordreCalques.indexOf(a.cle) - ordreCalques.indexOf(b.cle));
}

// ---------- Cadrage automatique ----------

export function union(boites: Boite[]): Boite | null {
  if (!boites.length) return null;
  return boites.reduce<Boite>(
    (u, b) => [Math.min(u[0], b[0]), Math.min(u[1], b[1]), Math.max(u[2], b[2]), Math.max(u[3], b[3])],
    [...boites[0]] as Boite
  );
}

/** Marges de sécurité autour du personnage, en fraction de la hauteur cadrée. */
export const MARGES_CADRAGE = {
  portrait: { haut: 0.07, cotes: 0.07, bas: 0.02 },
  pleinPied: { haut: 0.035, cotes: 0.05, bas: 0.025 },
};

/**
 * Zone à montrer, dans l'espace de la vue. Elle englobe toutes les
 * limites réelles des calques visibles (coiffures volumineuses comprises)
 * et reste centrée horizontalement sur le visage (ou le corps).
 * `ignorer` : calques absents ou en erreur, exclus du calcul.
 */
export function zoneCadrage(calques: Calque[], vue: VueAvatar, ignorer: ReadonlySet<CategorieCalque> = new Set()): Boite {
  const visibles = calques.filter((c) => !ignorer.has(c.cle));
  const u = union(visibles.map((c) => c.limites));
  if (!u) return [0, 0, TAILLE_ESPACE, TAILLE_ESPACE];
  const pivot = visibles.find((c) => c.cle === (vue === "portrait" ? "visage" : "tenue")) ?? visibles[0];
  const cx = (pivot.limites[0] + pivot.limites[2]) / 2;
  const demiLargeur = Math.max(cx - u[0], u[2] - cx);
  const hauteur = u[3] - u[1];
  const m = MARGES_CADRAGE[vue];
  return [cx - demiLargeur - hauteur * m.cotes, u[1] - hauteur * m.haut, cx + demiLargeur + hauteur * m.cotes, u[3] + hauteur * m.bas];
}

// ---------- Ajustement à l'écran, zoom et déplacement ----------

export type Cadre = {
  /** Taille de la zone d'aperçu en pixels CSS. */
  largeur: number;
  hauteur: number;
  /** Espace réservé aux commandes (le personnage n'y est jamais placé). */
  reserve: { haut: number; bas: number; gauche: number; droite: number };
};

export type EtatZoom = { zoom: number; px: number; py: number };

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;
export const ZOOM_NEUTRE: EtatZoom = { zoom: 1, px: 0, py: 0 };

function zoneUtile(cadre: Cadre) {
  const l = Math.max(1, cadre.largeur - cadre.reserve.gauche - cadre.reserve.droite);
  const h = Math.max(1, cadre.hauteur - cadre.reserve.haut - cadre.reserve.bas);
  return { l, h, cx: cadre.reserve.gauche + l / 2, cy: cadre.reserve.haut + h / 2 };
}

/** Échelle du cadrage automatique : la zone entière tient dans l'espace disponible, proportions conservées. */
export function echelleAuto(zone: Boite, cadre: Cadre): number {
  const u = zoneUtile(cadre);
  return Math.min(u.l / (zone[2] - zone[0]), u.h / (zone[3] - zone[1]));
}

/** Empêche de perdre le personnage : on ne peut pas faire sortir les bords de la zone plus loin que nécessaire. */
export function borner(etat: EtatZoom, zone: Boite, cadre: Cadre): EtatZoom {
  const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, etat.zoom));
  const s = echelleAuto(zone, cadre) * zoom;
  const u = zoneUtile(cadre);
  const limX = Math.max(0, ((zone[2] - zone[0]) * s - u.l) / 2);
  const limY = Math.max(0, ((zone[3] - zone[1]) * s - u.h) / 2);
  return { zoom, px: Math.min(limX, Math.max(-limX, etat.px)), py: Math.min(limY, Math.max(-limY, etat.py)) };
}

/** Transformation CSS (translate puis scale, origine 0 0) à appliquer à l'ensemble des calques. */
export function transformation(zone: Boite, cadre: Cadre, etat: EtatZoom): { x: number; y: number; s: number } {
  const u = zoneUtile(cadre);
  const s = echelleAuto(zone, cadre) * etat.zoom;
  const zcx = (zone[0] + zone[2]) / 2;
  const zcy = (zone[1] + zone[3]) / 2;
  return { x: u.cx + etat.px - zcx * s, y: u.cy + etat.py - zcy * s, s };
}

/** Zoom en gardant fixe le point de l'écran (px CSS relatifs à l'aperçu) situé sous le curseur ou les doigts. */
export function zoomerAutour(etat: EtatZoom, zoomCible: number, point: { x: number; y: number }, zone: Boite, cadre: Cadre): EtatZoom {
  const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoomCible));
  const u = zoneUtile(cadre);
  const r = zoom / etat.zoom;
  const px = point.x - u.cx - (point.x - u.cx - etat.px) * r;
  const py = point.y - u.cy - (point.y - u.cy - etat.py) * r;
  return borner({ zoom, px, py }, zone, cadre);
}

export function centreCadre(cadre: Cadre): { x: number; y: number } {
  const u = zoneUtile(cadre);
  return { x: u.cx, y: u.cy };
}
