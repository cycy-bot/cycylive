// Moteur de lecture des scènes : fonctions pures, sans React.
// L'état produit est entièrement sérialisable (sauvegarde locale).

import type {
  Condition,
  DecorId,
  Effet,
  Expression,
  Ligne,
  MaisonId,
  OptionChoix,
  Personnage,
  PersoId,
  Scene,
} from "@/data/academie/types";
import { interpoler } from "./texte";

export type EntreeHistorique = {
  perso: PersoId | "joueur" | null; // null = narration
  expression?: Expression;
  texte: string;
  choix?: boolean;
};

export type DecisionPrise = {
  choixId: string;
  question: string;
  optionId: string;
  texte: string;
  note?: string;
};

export type EtatScene = {
  sceneId: string;
  index: number;
  decor: DecorId;
  relations: Record<PersoId, number>;
  drapeaux: Record<string, boolean>;
  decisions: DecisionPrise[];
  historique: EntreeHistorique[];
  termine: boolean;
};

export type ContexteJeu = {
  personnage: Personnage;
  maison: MaisonId | null;
};

export function etatInitial(scene: Scene): EtatScene {
  return {
    sceneId: scene.id,
    index: 0,
    decor: scene.decor,
    relations: { milo: 0, iris: 0, bellamy: 0 },
    drapeaux: {},
    decisions: [],
    historique: [],
    termine: false,
  };
}

export function conditionRemplie(si: Condition | undefined, etat: EtatScene, ctx: ContexteJeu): boolean {
  if (!si) return true;
  const traits = Object.values(ctx.personnage.traits);
  if (si.maison && (!ctx.maison || !si.maison.includes(ctx.maison))) return false;
  if (si.trait && !traits.includes(si.trait)) return false;
  if (si.sansTrait && traits.includes(si.sansTrait)) return false;
  if (si.drapeau && !etat.drapeaux[si.drapeau]) return false;
  if (si.sansDrapeau && etat.drapeaux[si.sansDrapeau]) return false;
  if (si.relationMin && etat.relations[si.relationMin.perso] < si.relationMin.valeur) return false;
  if (si.relationMax && etat.relations[si.relationMax.perso] > si.relationMax.valeur) return false;
  if (si.choix && !etat.decisions.some((d) => d.choixId === si.choix!.id && d.optionId === si.choix!.option))
    return false;
  return true;
}

function appliquerEffets(etat: EtatScene, effets: Effet[] = []): EtatScene {
  const relations = { ...etat.relations };
  const drapeaux = { ...etat.drapeaux };
  for (const e of effets) {
    if (e.type === "relation") relations[e.perso] += e.valeur;
    else drapeaux[e.id] = e.valeur ?? true;
  }
  return { ...etat, relations, drapeaux };
}

function indexEtiquette(scene: Scene, id: string): number {
  const i = scene.lignes.findIndex((l) => l.type === "etiquette" && l.id === id);
  if (i < 0) throw new Error(`Étiquette introuvable dans la scène ${scene.id} : ${id}`);
  return i;
}

/**
 * Avance depuis `index` jusqu'à la prochaine ligne à afficher
 * (narration, dialogue, choix ou fin), en exécutant au passage les
 * sauts, effets et changements de décor.
 */
export function resoudre(scene: Scene, etat: EtatScene, ctx: ContexteJeu, index: number): EtatScene {
  let e = { ...etat };
  let i = index;
  for (let garde = 0; garde < 1000; garde++) {
    const ligne = scene.lignes[i];
    if (!ligne || ligne.type === "fin") return { ...e, index: i, termine: true };
    switch (ligne.type) {
      case "etiquette":
        i++;
        continue;
      case "aller":
        i = conditionRemplie(ligne.si, e, ctx) ? indexEtiquette(scene, ligne.vers) : i + 1;
        continue;
      case "effet":
        if (conditionRemplie(ligne.si, e, ctx)) e = appliquerEffets(e, ligne.effets);
        i++;
        continue;
      case "decor":
        e = { ...e, decor: ligne.decor };
        i++;
        continue;
      case "choix":
        return { ...e, index: i };
      default:
        if (!conditionRemplie(ligne.si, e, ctx)) {
          i++;
          continue;
        }
        return ajouterHistorique({ ...e, index: i }, ligne, ctx);
    }
  }
  throw new Error("Boucle infinie détectée dans la scène " + scene.id);
}

function ajouterHistorique(etat: EtatScene, ligne: Ligne, ctx: ContexteJeu): EtatScene {
  if (ligne.type !== "narration" && ligne.type !== "dialogue") return etat;
  const entree: EntreeHistorique = {
    perso: ligne.type === "dialogue" ? ligne.perso : null,
    expression: ligne.type === "dialogue" ? ligne.expression : undefined,
    texte: interpoler(ligne.texte, ctx),
  };
  return { ...etat, historique: [...etat.historique, entree] };
}

export function demarrer(scene: Scene, ctx: ContexteJeu): EtatScene {
  return resoudre(scene, etatInitial(scene), ctx, 0);
}

export function suivant(scene: Scene, etat: EtatScene, ctx: ContexteJeu): EtatScene {
  const ligne = scene.lignes[etat.index];
  if (etat.termine || ligne?.type === "choix") return etat;
  return resoudre(scene, etat, ctx, etat.index + 1);
}

export function optionsVisibles(ligne: Ligne, etat: EtatScene, ctx: ContexteJeu): OptionChoix[] {
  if (ligne.type !== "choix") return [];
  return ligne.options.filter((o) => conditionRemplie(o.si, etat, ctx));
}

export function choisir(scene: Scene, etat: EtatScene, ctx: ContexteJeu, optionId: string): EtatScene {
  const ligne = scene.lignes[etat.index];
  if (ligne?.type !== "choix") return etat;
  const option = ligne.options.find((o) => o.id === optionId);
  if (!option) return etat;

  const texte = interpoler(option.texte, ctx);
  let e = appliquerEffets(etat, option.effets);
  e = {
    ...e,
    decisions: [
      ...e.decisions,
      { choixId: ligne.id, question: interpoler(ligne.question, ctx), optionId, texte, note: option.note },
    ],
    historique: [...e.historique, { perso: "joueur", texte, choix: true }],
  };
  const reprise = option.vers ? indexEtiquette(scene, option.vers) : etat.index + 1;
  return resoudre(scene, e, ctx, reprise);
}

/** Variation des relations entre deux états (pour les notifications). */
export function differenceRelations(avant: EtatScene, apres: EtatScene) {
  return (Object.keys(apres.relations) as PersoId[])
    .map((perso) => ({ perso, delta: apres.relations[perso] - avant.relations[perso] }))
    .filter((d) => d.delta !== 0);
}
