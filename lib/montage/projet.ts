// Studio montage : le contenu d'un projet (ce qui est enregistré et ce que « annuler / rétablir » parcourt).
//
// La piste vidéo est une liste ordonnée de MORCEAUX du clip source (comme dans CapCut) : on peut couper un
// morceau en deux, en supprimer (il disparaît, tout se resserre), le dupliquer, le déplacer ou rogner ses bords.
// Les éléments posés dessus (titre, sous-titres, barre, encart, flashs, textes) sont en temps « monté ».
// Médias : la vidéo du projet (« principal ») + ce qu'on importe (photos, vidéos, sons). Un morceau de la piste
// vidéo peut venir de n'importe quelle vidéo ou photo ; les incrustations et les sons ont leurs propres pistes.
// Vitesse : un morceau joué à ×2 dure deux fois moins longtemps à l'écran (a / b restent en temps du média).

import type { Calque, Modele, SousTitre } from "@/lib/habillageTikTok";
import { MODELE_DEFAUT } from "@/lib/habillageTikTok";
import { nettoyerCoupe, segmentsGardes } from "@/lib/coupesMontage";

export type Disposition = "vertical" | "recadre" | "floute" | "facecam";
export type TypeMedia = "video" | "image" | "son";
export type Media = { id: string; type: TypeMedia; nom: string; duree: number; w: number; h: number; ajoute: number };
export const PRINCIPAL = "principal";
export const DUREE_PHOTO = 3; // durée d'une photo posée sur la piste (s)
export const MAX_PHOTO = 600;
export type Cadre = "projet" | "ajuster" | "remplir";
/** Recadrage : la partie gardée du média (fractions de sa largeur / hauteur) et le format choisi. */
export type Crop = { x: number; y: number; w: number; h: number; ratio?: string };
export type TypeTransition = "fondu" | "noir" | "flash" | "zoom" | "glisse";
export type Transition = { type: TypeTransition; d: number };
export type Morceau = {
  id: string; a: number; b: number; // temps du média
  media?: string; // absent = la vidéo du projet
  v?: number; // vitesse (1 = normale)
  vol?: number; muet?: boolean; fE?: number; fS?: number; // son : volume (1 = 100 %), fondus d'entrée / de sortie (s)
  cadre?: Cadre; // projet = disposition du projet ; ajuster = en entier sur fond flouté ; remplir = plein écran
  lum?: number; con?: number; sat?: number; // réglages de l'image (1 = d'origine)
  kb?: boolean; // photo : zoom lent (effet « Ken Burns »)
  crop?: Crop;
  tr?: Transition; // transition à l'entrée de ce morceau (depuis le précédent)
};
export type FormeIncrust = "rect" | "arrondi" | "rond";
export type Incrust = {
  id: string; media: string; debut: number; a: number; b: number; v?: number; // debut : temps monté
  x: number; y: number; w: number; // centre (fraction de l'écran) et largeur (fraction de la largeur)
  forme: FormeIncrust; contour: boolean; opacite: number; vol: number; muet?: boolean; anim: "aucune" | "fondu" | "pop";
  crop?: Crop;
};
export type PisteSon = { id: string; media: string; debut: number; a: number; b: number; vol: number; fE: number; fS: number; v?: number };
export type ClipTwitch = { id: string; titre: string; url: string; miniature: string; vues: number; duree: number; date: string; jeu: string };

export type DocMontage = {
  morceaux: Morceau[];
  calques: Calque[];
  sousTitres: SousTitre[];
  transcription: string;
  titre: string;
  jeu: string;
  dispo: Disposition;
  focusX: number;
  zoom: number;
  cam: { x: number; y: number; taille: number };
  ending: boolean;
  medias: Media[];
  incrustations: Incrust[];
  sons: PisteSon[];
};

export const DOC_VIDE: DocMontage = {
  morceaux: [], calques: [], sousTitres: [], transcription: "", titre: "", jeu: "", medias: [], incrustations: [], sons: [],
  dispo: "vertical", focusX: 0.5, zoom: 1, cam: { x: 0.02, y: 0.02, taille: 0.3 }, ending: true,
};

export const nouvelIdMorceau = () => "m" + Math.random().toString(36).slice(2, 9);
const MIN = 0.08; // morceau le plus court (s)

export const vitesse = (x: { v?: number }) => (x.v && x.v > 0 ? x.v : 1);
/** Durée à l'écran d'un morceau / d'une incrustation / d'un son. */
export const duree = (x: { a: number; b: number; v?: number }) => Math.max(0, x.b - x.a) / vitesse(x);
export const mediaDe = (x: Morceau) => x.media || PRINCIPAL;
export const dureeTotale = (m: Morceau[]) => m.reduce((n, x) => n + duree(x), 0);
/** Début (temps monté) de chaque morceau. */
export function debuts(m: Morceau[]): number[] {
  const out: number[] = []; let t = 0;
  for (const x of m) { out.push(t); t += duree(x); }
  return out;
}
/** Le morceau sous un temps monté, et le temps source correspondant. */
export function aTempsMonte(m: Morceau[], r: number): { k: number; src: number } {
  if (!m.length) return { k: -1, src: 0 };
  let t = 0;
  for (let k = 0; k < m.length; k++) {
    const d = duree(m[k]);
    if (r < t + d - 1e-6 || k === m.length - 1) return { k, src: Math.min(m[k].b, m[k].a + Math.max(0, r - t) * vitesse(m[k])) };
    t += d;
  }
  return { k: m.length - 1, src: m[m.length - 1].b };
}
/** Temps monté d'un instant source dans le morceau k. */
export const tempsMonte = (m: Morceau[], k: number, src: number) => (k < 0 ? 0 : debuts(m)[k] + Math.max(0, Math.min(m[k].b, src) - m[k].a) / vitesse(m[k]));

/** Ce qui est à l'écran à l'instant monté r : morceau, incrustations et sons actifs (avec leur temps de média). */
export function etatA(d: Pick<DocMontage, "morceaux" | "incrustations" | "sons">, r: number) {
  const { k, src } = aTempsMonte(d.morceaux, r);
  const actif = <T extends { debut: number; a: number; b: number; v?: number }>(x: T) => r >= x.debut - 1e-6 && r < x.debut + duree(x);
  return {
    k, src, morceau: k >= 0 ? d.morceaux[k] : null,
    incrust: d.incrustations.filter(actif).map((c) => ({ c, src: c.a + (r - c.debut) * vitesse(c) })),
    sons: d.sons.filter(actif).map((s) => ({ s, src: s.a + (r - s.debut) * vitesse(s) })),
  };
}
/** Durée maximale d'un média (une photo peut durer autant qu'on veut). */
export const dureeMedia = (medias: Media[], id: string | undefined, principal: number) => {
  if (!id || id === PRINCIPAL) return principal;
  const x = medias.find((y) => y.id === id); if (!x) return principal;
  return x.type === "image" ? MAX_PHOTO : x.duree;
};
/** Taille utile d'un média une fois recadré. */
export const cropValide = (c?: Crop) => (c && c.w > 0.01 && c.h > 0.01 && (c.w < 0.999 || c.h < 0.999 || c.x > 0.001 || c.y > 0.001) ? c : undefined);
export const nouvelIdMedia = () => "x" + Math.random().toString(36).slice(2, 10);

// ── Opérations sur la piste vidéo ──
export function couper(m: Morceau[], r: number): { morceaux: Morceau[]; droite?: string } {
  const { k, src } = aTempsMonte(m, r);
  if (k < 0) return { morceaux: m };
  const x = m[k];
  if (src - x.a < MIN || x.b - src < MIN) return { morceaux: m };
  const g = { ...x, b: src, fS: 0 }, d: Morceau = { ...x, id: nouvelIdMorceau(), a: src, b: x.b, fE: 0, tr: undefined };
  return { morceaux: [...m.slice(0, k), g, d, ...m.slice(k + 1)], droite: d.id };
}
export const supprimerMorceau = (m: Morceau[], id: string) => (m.length <= 1 ? m : m.filter((x) => x.id !== id));
export function dupliquerMorceau(m: Morceau[], id: string, apres = true): { morceaux: Morceau[]; id?: string } {
  const k = m.findIndex((x) => x.id === id); if (k < 0) return { morceaux: m };
  const c = { ...m[k], id: nouvelIdMorceau() };
  const out = [...m]; out.splice(apres ? k + 1 : k, 0, c);
  return { morceaux: out, id: c.id };
}
export function deplacerMorceau(m: Morceau[], id: string, vers: number): Morceau[] {
  const k = m.findIndex((x) => x.id === id); if (k < 0) return m;
  const out = [...m]; const [x] = out.splice(k, 1);
  out.splice(Math.max(0, Math.min(out.length, vers)), 0, x);
  return out;
}
export function rognerMorceau(m: Morceau[], id: string, cote: "a" | "b", src: number, duree: number): Morceau[] {
  return m.map((x) => {
    if (x.id !== id) return x;
    if (cote === "a") return { ...x, a: Math.max(0, Math.min(x.b - MIN, src)) };
    return { ...x, b: Math.min(duree, Math.max(x.a + MIN, src)) };
  });
}

/** Les éléments suivent la nouvelle durée : barre / encart / sous-titres sur toute la vidéo, étiquette collée à la fin. */
export function ajusterCalques(c: Calque[], total: number): Calque[] {
  return c.map((x) => {
    if (x.type === "barre" || x.type === "encart" || x.type === "soustitres") return x.debut === 0 && Math.abs(x.fin - total) < 1e-6 ? x : { ...x, debut: 0, fin: total };
    if (x.type === "etiquette") { const len = Math.min(total, Math.max(0.5, x.fin - x.debut)); return { ...x, debut: total - len, fin: total }; }
    const fin = Math.min(x.fin, total), debut = Math.min(x.debut, Math.max(0, total - 0.2));
    return fin === x.fin && debut === x.debut ? x : { ...x, debut, fin: Math.max(debut + 0.1, fin) };
  });
}

/** Lit un projet enregistré (y compris les brouillons de l'ancien générateur : début / fin / coupes). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function docDepuisEtat(r: Record<string, any> | null | undefined, duree: number): DocMontage {
  const num = (x: unknown, def: number) => (typeof x === "number" && Number.isFinite(x) ? x : def);
  const e = r || {};
  const medias: Media[] = Array.isArray(e.medias) ? e.medias.filter((x: Media) => x && typeof x.id === "string" && ["video", "image", "son"].includes(x.type)) : [];
  const maxi = (id?: string) => (id && id !== PRINCIPAL ? (medias.find((y) => y.id === id)?.type === "image" ? MAX_PHOTO : medias.find((y) => y.id === id)?.duree || 1e6) : duree || 1e6);
  let morceaux: Morceau[] = Array.isArray(e.morceaux) ? e.morceaux.filter((x: Morceau) => x && Number.isFinite(x.a) && Number.isFinite(x.b) && x.b > x.a && (!x.media || x.media === PRINCIPAL || medias.some((y) => y.id === x.media))).map((x: Morceau) => ({ ...x, id: String(x.id || nouvelIdMorceau()), a: Math.max(0, +x.a), b: Math.min(maxi(x.media), +x.b) })) : [];
  if (!morceaux.length) {
    const debut = Math.max(0, Math.min(Number(e.debut) || 0, duree)), fin = Number(e.fin) > debut && Number(e.fin) <= duree ? Number(e.fin) : duree;
    morceaux = segmentsGardes(nettoyerCoupe(e.coupe), debut, fin).map((s) => ({ id: nouvelIdMorceau(), a: s.a, b: s.b }));
    if (!morceaux.length && duree > 0) morceaux = [{ id: nouvelIdMorceau(), a: 0, b: duree }];
  }
  const modele: Modele | undefined = e.modele;
  return {
    morceaux,
    calques: Array.isArray(e.calques) ? e.calques : [],
    sousTitres: Array.isArray(e.sousTitres) ? e.sousTitres : [],
    transcription: String(e.transcription || ""),
    titre: String(e.titre || ""), jeu: String(e.jeu || ""),
    dispo: (["vertical", "recadre", "floute", "facecam"].includes(e.dispo) ? e.dispo : "vertical") as Disposition,
    focusX: typeof e.focusX === "number" ? e.focusX : 0.5,
    zoom: typeof e.zoom === "number" ? e.zoom : 1,
    cam: e.cam && typeof e.cam === "object" ? e.cam : { x: 0.02, y: 0.02, taille: 0.3 },
    ending: typeof e.ending === "boolean" ? e.ending : (modele?.ending ?? MODELE_DEFAUT.ending),
    medias,
    incrustations: Array.isArray(e.incrustations) ? e.incrustations.filter((x: Incrust) => x && medias.some((y) => y.id === x.media)).map((x: Incrust) => ({ ...x, debut: num(x.debut, 0), x: num(x.x, 0.5), y: num(x.y, 0.3), w: num(x.w, 0.45), opacite: num(x.opacite, 1), vol: num(x.vol, 1) })) : [],
    sons: Array.isArray(e.sons) ? e.sons.filter((x: PisteSon) => x && medias.some((y) => y.id === x.media)).map((x: PisteSon) => ({ ...x, debut: num(x.debut, 0), vol: num(x.vol, 1), fE: num(x.fE, 0), fS: num(x.fS, 0) })) : [],
  };
}
