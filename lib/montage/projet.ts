// Studio montage : le contenu d'un projet (ce qui est enregistré et ce que « annuler / rétablir » parcourt).
//
// La piste vidéo est une liste ordonnée de MORCEAUX du clip source (comme dans CapCut) : on peut couper un
// morceau en deux, en supprimer (il disparaît, tout se resserre), le dupliquer, le déplacer ou rogner ses bords.
// Les éléments posés dessus (titre, sous-titres, barre, encart, flashs, textes) sont en temps « monté ».

import type { Calque, Modele, SousTitre } from "@/lib/habillageTikTok";
import { MODELE_DEFAUT } from "@/lib/habillageTikTok";
import { nettoyerCoupe, segmentsGardes } from "@/lib/coupesMontage";

export type Disposition = "vertical" | "recadre" | "floute" | "facecam";
export type Morceau = { id: string; a: number; b: number }; // temps de la vidéo source
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
};

export const DOC_VIDE: DocMontage = {
  morceaux: [], calques: [], sousTitres: [], transcription: "", titre: "", jeu: "",
  dispo: "vertical", focusX: 0.5, zoom: 1, cam: { x: 0.02, y: 0.02, taille: 0.3 }, ending: true,
};

export const nouvelIdMorceau = () => "m" + Math.random().toString(36).slice(2, 9);
const MIN = 0.08; // morceau le plus court (s)

export const dureeTotale = (m: Morceau[]) => m.reduce((n, x) => n + Math.max(0, x.b - x.a), 0);
/** Début (temps monté) de chaque morceau. */
export function debuts(m: Morceau[]): number[] {
  const out: number[] = []; let t = 0;
  for (const x of m) { out.push(t); t += x.b - x.a; }
  return out;
}
/** Le morceau sous un temps monté, et le temps source correspondant. */
export function aTempsMonte(m: Morceau[], r: number): { k: number; src: number } {
  if (!m.length) return { k: -1, src: 0 };
  let t = 0;
  for (let k = 0; k < m.length; k++) {
    const d = m[k].b - m[k].a;
    if (r < t + d - 1e-6 || k === m.length - 1) return { k, src: Math.min(m[k].b, m[k].a + Math.max(0, r - t)) };
    t += d;
  }
  return { k: m.length - 1, src: m[m.length - 1].b };
}
/** Temps monté d'un instant source dans le morceau k. */
export const tempsMonte = (m: Morceau[], k: number, src: number) => (k < 0 ? 0 : debuts(m)[k] + Math.max(0, Math.min(m[k].b, src) - m[k].a));

// ── Opérations sur la piste vidéo ──
export function couper(m: Morceau[], r: number): { morceaux: Morceau[]; droite?: string } {
  const { k, src } = aTempsMonte(m, r);
  if (k < 0) return { morceaux: m };
  const x = m[k];
  if (src - x.a < MIN || x.b - src < MIN) return { morceaux: m };
  const g = { ...x, b: src }, d = { id: nouvelIdMorceau(), a: src, b: x.b };
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
  const e = r || {};
  let morceaux: Morceau[] = Array.isArray(e.morceaux) ? e.morceaux.filter((x: Morceau) => x && Number.isFinite(x.a) && Number.isFinite(x.b) && x.b > x.a).map((x: Morceau) => ({ id: String(x.id || nouvelIdMorceau()), a: Math.max(0, +x.a), b: Math.min(duree || +x.b, +x.b) })) : [];
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
  };
}
