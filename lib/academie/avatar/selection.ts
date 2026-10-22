// Modifications de l'apparence depuis le créateur : choix d'une
// option, avatar aléatoire, réinitialisation. Chaque changement de
// calque met aussi à jour les champs du portrait vectoriel utilisé
// pendant les scènes, pour que le personnage reste cohérent.

import { morphologieParDefaut, optionsParCalque, ordreCalques, palettes, selectionsParDefaut } from "../../../data/academie/avatar/catalogue";
import type { CategorieCalque, OptionCalque } from "../../../data/academie/avatar/types";
import { apparenceParDefaut } from "../../../data/academie/personnalisation";
import type { Apparence } from "../../../data/academie/types";
import { normaliserSelection, trouverOption, type SelectionComplete } from "./composition";

/** Champs du portrait vectoriel déduits de la sélection. */
function equivalentsVectoriels(sel: SelectionComplete): Partial<Apparence> {
  const resultat: Partial<Apparence> = {};
  for (const cat of ordreCalques) {
    const svg = trouverOption(cat, sel[cat])?.svg;
    if (svg?.visage) resultat.visage = svg.visage;
    if (svg?.coiffure) resultat.coiffure = svg.coiffure;
    if (svg?.tenue) resultat.tenue = svg.tenue;
  }
  return resultat;
}

export function avecSelection(apparence: Apparence, identite: string, partiel: Partial<SelectionComplete>): Apparence {
  const avatar = { ...normaliserSelection(apparence.avatar, identite), ...partiel };
  return { ...apparence, ...equivalentsVectoriels(avatar), avatar };
}

export function apparenceInitiale(identite: string): Apparence {
  return avecSelection({ ...apparenceParDefaut, sourcils: undefined, avatar: undefined }, identite, selectionsParDefaut[morphologieParDefaut(identite)]);
}

/** Couleur des sourcils : celle choisie, sinon celle des cheveux. */
export function couleurSourcils(apparence: Apparence): string {
  return apparence.sourcils ?? apparence.cheveux;
}

// ---------- Aléatoire ----------

export type Aleatoire = () => number;

function tirer<T>(liste: T[], hasard: Aleatoire): T {
  return liste[Math.floor(hasard() * liste.length) % liste.length];
}

function compatible(option: OptionCalque, choisies: OptionCalque[]): boolean {
  return choisies.every((c) => !c.incompatibles?.includes(option.id) && !option.incompatibles?.includes(c.id));
}

/**
 * Avatar aléatoire parmi les options disponibles : une morphologie est
 * tirée, puis chaque calque parmi les options de cette morphologie (ou
 * neutres) et compatibles avec celles déjà choisies.
 */
export function apparenceAleatoire(apparence: Apparence, identite: string, hasard: Aleatoire = Math.random): Apparence {
  const morpho = hasard() < 0.5 ? "feminin" : "masculin";
  const choisies: OptionCalque[] = [];
  const sel = { ...normaliserSelection(apparence.avatar, identite) };
  for (const cat of ordreCalques) {
    const toutes: OptionCalque[] = optionsParCalque[cat];
    const memeMorpho = toutes.filter((o) => !o.morphologie || o.morphologie === morpho || o.morphologie === "neutre");
    const candidates = (memeMorpho.length ? memeMorpho : toutes).filter((o) => compatible(o, choisies));
    const option = tirer(candidates.length ? candidates : toutes, hasard);
    choisies.push(option);
    sel[cat] = option.id;
  }
  const cheveux = tirer(palettes.cheveux, hasard).valeur;
  return avecSelection(
    {
      ...apparence,
      peau: tirer(palettes.peau, hasard).valeur,
      yeux: tirer(palettes.yeux, hasard).valeur,
      cheveux,
      // Les sourcils suivent la couleur des cheveux dans 3 cas sur 4.
      sourcils: hasard() < 0.75 ? undefined : tirer(palettes.sourcils, hasard).valeur,
    },
    identite,
    sel
  );
}

/** Nombre d'éléments qui diffèrent de l'apparence de départ. */
export function nombrePersonnalisations(apparence: Apparence, identite: string): number {
  const initiale = apparenceInitiale(identite);
  const sel = normaliserSelection(apparence.avatar, identite);
  const ref = normaliserSelection(initiale.avatar, identite);
  let n = (Object.keys(sel) as CategorieCalque[]).filter((c) => sel[c] !== ref[c]).length;
  for (const champ of ["peau", "yeux", "cheveux", "sourcils"] as const) if (apparence[champ] !== initiale[champ]) n++;
  return n;
}

/** Au-delà de ce nombre de choix, l'aléatoire et la réinitialisation demandent confirmation. */
export const SEUIL_PERSONNALISATION_AVANCEE = 3;
