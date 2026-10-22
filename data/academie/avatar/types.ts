// ============================================================
// L'ACADÉMIE DES ASTRES — types de l'avatar en calques
// ============================================================
// L'avatar est composé de calques PNG superposés. Deux repères
// (« espaces ») existent :
//  - "tete"  : canevas 1024 × 1024 des visages et des coiffures ;
//  - "corps" : canevas 1024 × 1024 des tenues en pied.
// Les yeux, sourcils, nez et bouches sont placés sur le visage par
// des points d'ancrage, à partir de leurs limites réelles mesurées
// (voir manifeste.genere.ts). Rien n'est étiré : seule une mise à
// l'échelle uniforme est appliquée.

import type { Coiffure, FormeVisage, Tenue } from "../types";

/** Rectangle [x0, y0, x1, y1] en pixels. */
export type Boite = [number, number, number, number];

export type EntreeManifeste = {
  /** Dimensions du canevas du fichier. */
  l: number;
  h: number;
  /** Zone réellement dessinée (alpha > seuil). */
  limites: Boite;
  /** Chemin de la vignette WebP, relatif à la racine des assets. */
  vignette?: string;
};

export type ManifesteAvatar = Record<string, EntreeManifeste>;

export type CategorieCalque = "visage" | "yeux" | "sourcils" | "nez" | "bouche" | "cheveux" | "tenue";

/** Choix du joueur : identifiant d'option par calque. */
export type SelectionAvatar = Partial<Record<CategorieCalque, string>>;

/** Morphologie indicative d'un asset, utilisée pour filtrer et pour l'aléatoire. */
export type Morphologie = "feminin" | "masculin" | "neutre";

/** Point d'ancrage d'un élément du visage, dans l'espace "tete". */
export type Ancre = {
  cx: number;
  cy: number;
  /** Taille cible de la zone utile d'une variante de taille médiane du jeu (échelle commune au jeu). */
  taille: number;
  /** Dimension de l'asset comparée à `taille`. */
  mesure: "largeur" | "hauteur";
};

export type ElementVisage = "yeux" | "sourcils" | "nez" | "bouche";

/** Ajustement fin, propre à une option (décalage en px de l'espace cible, échelle relative). */
export type Reglage = { dx?: number; dy?: number; echelle?: number };

export type OptionCalque = {
  /** Identifiant stable : c'est lui qui est sauvegardé. */
  id: string;
  label: string;
  /** Chemin relatif à `racineAssets`, et clé dans le manifeste. */
  fichier: string;
  morphologie?: Morphologie;
  reglage?: Reglage;
  /** Équivalent dans le portrait vectoriel utilisé pendant les scènes. */
  svg?: { visage?: FormeVisage; coiffure?: Coiffure; tenue?: Tenue };
  /** Options d'autres catégories avec lesquelles celle-ci ne doit pas être tirée au hasard. */
  incompatibles?: string[];
};

/** Paramètres propres à un visage (espace "tete"). */
export type OptionVisage = OptionCalque & {
  /** Ordonnée du sommet du crâne, pour poser les coiffures (par défaut : haut des limites mesurées). */
  sommet?: number;
  /** Ancres spécifiques ; sinon celles de la morphologie. */
  ancres?: Partial<Record<ElementVisage, Ancre>>;
};

/** Paramètres propres à une tenue (espace "corps"). */
export type OptionTenue = OptionCalque & {
  /** Où poser la tête : point du sommet du crâne et échelle tête -> corps. */
  tete: { x: number; y: number; echelle: number };
  /** Part du haut du canevas masquée (tête chauve dessinée sur la tenue), en fraction 0–1. */
  masqueHaut: [number, number];
};

export type Couleur = { id: string; label: string; valeur: string };

export type Teinte = {
  /**
   * Faux tant que les assets ne sont pas préparés pour la recoloration :
   * la couleur est enregistrée (et utilisée par le portrait des scènes)
   * mais l'aperçu PNG n'est pas teinté.
   */
  appliquee: boolean;
  /** Mode de fusion prévu pour la recoloration CSS. */
  mode?: "color" | "multiply" | "hue";
};

export type CategorieCreateur = {
  id: string;
  label: string;
  /** Nom d'icône (voir components/academie/avatar/Icones.tsx). */
  icone: string;
  /** Vue mise en avant quand on ouvre la catégorie. */
  vue: VueAvatar;
  /** Calque piloté par la catégorie, s'il y en a un. */
  calque?: CategorieCalque;
  /** Couleur associée (champ d'Apparence). */
  couleur?: { champ: "peau" | "yeux" | "cheveux" | "sourcils"; label: string };
  /** Catégorie prévue mais pas encore livrée. */
  bientot?: boolean;
};

export type VueAvatar = "portrait" | "pleinPied";
