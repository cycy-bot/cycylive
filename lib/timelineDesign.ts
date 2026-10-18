// ============================================================
// TIMELINE — catégories (couleur, icône) et icônes au choix
// ============================================================
import type { CategorieTimeline, EtapeTimeline } from "@/data/timeline";
import type { NomIcone } from "@/components/icones/Icone";

export type DefCategorie = { label: string; icone: NomIcone; couleur: string; douce: string };

// couleur : point, liseré et texte ; douce : fond translucide
export const CATEGORIES: Record<CategorieTimeline, DefCategorie> = {
  live: { label: "Live", icone: "live", couleur: "#B57CFF", douce: "rgba(181,124,255,.14)" },
  valorant: { label: "Valorant", icone: "cible", couleur: "#FF6B7A", douce: "rgba(255,70,85,.14)" },
  communaute: { label: "Communauté", icone: "membres", couleur: "#5EEAD4", douce: "rgba(94,234,212,.12)" },
  palier: { label: "Palier", icone: "trophee", couleur: "#FCD34D", douce: "rgba(252,211,77,.13)" },
  collab: { label: "Collab", icone: "poignee", couleur: "#7DD3FC", douce: "rgba(125,211,252,.13)" },
  perso: { label: "Perso", icone: "coeur", couleur: "#F9A8D4", douce: "rgba(249,168,212,.13)" },
  autre: { label: "Autre", icone: "etoile", couleur: "#E0B3FF", douce: "rgba(224,179,255,.12)" },
};

export const ORDRE_CATEGORIES = Object.keys(CATEGORIES) as CategorieTimeline[];

export const ICONES_TIMELINE: NomIcone[] = [
  "live", "camera", "micro", "clap", "manette", "cible", "viseur", "trophee", "medaille", "couronne", "diamant",
  "membres", "coeur", "bulle", "poignee", "megaphone", "fete", "cadeau", "fusee", "etoile", "comete", "planete",
  "eclair", "flamme", "drapeau", "calendrier", "lune", "galaxie",
];

/** Catégorie d'une étape (devinée pour les anciennes étapes sans catégorie). */
export function categorieDe(e: EtapeTimeline): CategorieTimeline {
  if (e.categorie && CATEGORIES[e.categorie]) return e.categorie;
  const t = `${e.titre} ${e.description ?? ""}`.toLowerCase();
  if (t.includes("valorant")) return "valorant";
  if (/follow|abonn|palier|affili|partenaire twitch/.test(t)) return "palier";
  if (/live|stream/.test(t)) return "live";
  return "autre";
}

export function iconeDe(e: EtapeTimeline): NomIcone {
  const choisie = e.icone as NomIcone | undefined;
  return choisie && ICONES_TIMELINE.includes(choisie) ? choisie : CATEGORIES[categorieDe(e)].icone;
}
