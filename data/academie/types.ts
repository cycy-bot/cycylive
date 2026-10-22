// ============================================================
// L'ACADÉMIE DES ASTRES — types partagés
// ============================================================
// Toutes les structures de données du jeu sont décrites ici.
// Les fichiers de contenu (maisons, personnages, scènes...) ne
// font que remplir ces structures : aucun texte narratif n'est
// écrit directement dans les composants visuels.

import type { SelectionAvatar } from "./avatar/types";

// ---------- Maisons ----------

export type MaisonId = "lion" | "cygne" | "dragon";

export type Maison = {
  id: MaisonId;
  nom: string; // "Maison du Lion"
  animal: string; // "Lion"
  emoji: string;
  devise: string;
  description: string;
  valeurs: string[];
  couleurs: {
    principale: string;
    claire: string;
    sombre: string;
    secondaire: string;
  };
};

// ---------- Personnalisation ----------

export type Identite = "masculin" | "feminin" | "nonbinaire";
export type PronomsId = "il" | "elle" | "iel";
/** Accord grammatical utilisé dans les textes : masculin, féminin, neutre/inclusif. */
export type Accord = "m" | "f" | "n";

export type FormeVisage = "ovale" | "rond" | "anguleux" | "coeur";
export type Coiffure =
  | "court"
  | "undercut"
  | "boucles"
  | "carre"
  | "milong"
  | "long"
  | "chignon"
  | "ebouriffe"
  | "savant"; // réservée au professeur Bellamy
export type Tenue = "uniforme" | "cape" | "pull" | "redingote" | "tweed";
export type Accessoire = "lunettes" | "taches" | "moustache" | "rides" | "barrette";

export type Apparence = {
  peau: string; // couleur hex
  visage: FormeVisage;
  coiffure: Coiffure;
  cheveux: string; // couleur hex
  yeux: string; // couleur hex
  tenue: Tenue;
  accessoires?: Accessoire[];
  /** Couleur des sourcils (hex). Absente des anciennes sauvegardes. */
  sourcils?: string;
  /**
   * Avatar en calques choisi dans le créateur (identifiants stables du
   * catalogue). Absent des anciennes sauvegardes : des valeurs par
   * défaut sont alors utilisées. Les champs visage / coiffure / tenue
   * ci-dessus restent synchronisés pour le portrait vectoriel des scènes.
   */
  avatar?: SelectionAvatar;
};

export type Expression =
  | "neutre"
  | "sourire"
  | "rire"
  | "surpris"
  | "gene"
  | "pensif"
  | "malicieux";

export type TraitId =
  | "audacieux"
  | "reserve"
  | "espiegle"
  | "curieux"
  | "methodique"
  | "reveur"
  | "bienveillant"
  | "franc"
  | "loyal";

export type Personnage = {
  prenom: string;
  nom: string;
  identite: Identite;
  pronoms: PronomsId;
  apparence: Apparence;
  /** Une réponse par question de caractère : questionId -> trait choisi. */
  traits: Record<string, TraitId>;
};

// ---------- Personnages non joueurs ----------

export type PersoId = "milo" | "iris" | "bellamy";

export type PersonnageNonJoueur = {
  id: PersoId;
  nom: string; // nom affiché dans la boîte de dialogue
  nomComplet: string;
  age: number;
  maison: MaisonId | null;
  role: string;
  description: string;
  apparence: Apparence;
  /** Expressions disponibles pour ce personnage (portraits). */
  expressions: Expression[];
  /** Vrai si sa relation avec le joueur est suivie (Milo, Iris...). */
  relationSuivie: boolean;
};

// ---------- Cérémonie d'affectation ----------

export type Points = Partial<Record<MaisonId, number>>;

export type ReponseCeremonie = {
  id: string;
  texte: string;
  points: Points;
};

export type QuestionCeremonie = {
  id: string;
  titre: string;
  situation: string;
  reponses: ReponseCeremonie[];
};

// ---------- Scènes narratives ----------

export type DecorId = "academie-crepuscule" | "cour-apres-midi" | "salle-astrolabe";

/** Conditions d'affichage d'une ligne ou d'un choix. Toutes doivent être vraies. */
export type Condition = {
  maison?: MaisonId[];
  trait?: TraitId;
  sansTrait?: TraitId;
  drapeau?: string;
  sansDrapeau?: string;
  relationMin?: { perso: PersoId; valeur: number };
  relationMax?: { perso: PersoId; valeur: number };
  choix?: { id: string; option: string };
};

export type Effet =
  | { type: "relation"; perso: PersoId; valeur: number }
  | { type: "drapeau"; id: string; valeur?: boolean };

export type OptionChoix = {
  id: string;
  texte: string;
  effets?: Effet[];
  /** Petit message affiché quand l'option est choisie (conséquence visible). */
  note?: string;
  vers?: string; // étiquette où reprendre la lecture
  si?: Condition;
};

/**
 * Une ligne de script. Les textes acceptent des balises, voir
 * lib/academie/texte.ts : {prenom}, {nom}, {il}, {Il}, {e},
 * {g:masculin|féminin|neutre}, {maison}, {Maison}.
 */
export type Ligne =
  | { type: "narration"; texte: string; si?: Condition }
  | {
      type: "dialogue";
      perso: PersoId | "joueur";
      expression?: Expression;
      texte: string;
      si?: Condition;
    }
  | { type: "choix"; id: string; question: string; options: OptionChoix[] }
  | { type: "etiquette"; id: string }
  | { type: "aller"; vers: string; si?: Condition }
  | { type: "effet"; effets: Effet[]; si?: Condition }
  | { type: "decor"; decor: DecorId }
  | { type: "fin" };

export type Scene = {
  id: string;
  titre: string;
  decor: DecorId;
  lignes: Ligne[];
  /** Libellés lisibles des drapeaux, pour la synthèse de fin. */
  drapeaux?: Record<string, string>;
};

/**
 * Un chapitre regroupe des scènes. Les champs optionnels préparent
 * les futurs chapitres quotidiens et le pourcentage de réussite :
 * ils ne sont pas encore exploités par le prototype.
 */
export type Chapitre = {
  id: string;
  titre: string;
  canonique: boolean; // false = texte de démonstration
  scenes: Scene[];
  /** Date de déblocage (chapitres quotidiens), format AAAA-MM-JJ. */
  disponibleLe?: string;
  /** Objectifs servant plus tard au calcul d'un pourcentage de réussite. */
  objectifs?: { id: string; libelle: string; si: Condition }[];
};
