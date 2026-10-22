// ============================================================
// L'ACADÉMIE DES ASTRES — options du créateur de personnage
// ============================================================
// Options du portrait VECTORIEL des scènes. Les variantes de l'avatar
// en calques du créateur sont dans data/academie/avatar/catalogue.ts.
// Pour ajouter une couleur, une coiffure ou une tenue : ajoute une
// entrée dans la liste correspondante. Les coiffures et tenues
// doivent aussi exister dans components/academie/art/Portrait.tsx.

import type {
  Accord,
  Apparence,
  Coiffure,
  FormeVisage,
  Identite,
  Personnage,
  PronomsId,
  Tenue,
  TraitId,
} from "./types";

type Option<T extends string> = { id: T; label: string };
type Couleur = { id: string; label: string; valeur: string };

export const identites: (Option<Identite> & { pronomsParDefaut: PronomsId })[] = [
  { id: "masculin", label: "Masculine", pronomsParDefaut: "il" },
  { id: "feminin", label: "Féminine", pronomsParDefaut: "elle" },
  { id: "nonbinaire", label: "Non binaire", pronomsParDefaut: "iel" },
];

export const pronoms: Record<PronomsId, { id: PronomsId; label: string; exemple: string; accord: Accord }> = {
  il: { id: "il", label: "Il / lui", exemple: "Il est arrivé à l'Académie.", accord: "m" },
  elle: { id: "elle", label: "Elle", exemple: "Elle est arrivée à l'Académie.", accord: "f" },
  iel: { id: "iel", label: "Iel (inclusif)", exemple: "Iel est arrivé·e à l'Académie.", accord: "n" },
};

export const couleursPeau: Couleur[] = [
  { id: "porcelaine", label: "Porcelaine", valeur: "#F4D9CA" },
  { id: "clair", label: "Clair", valeur: "#EBC4AD" },
  { id: "beige-dore", label: "Beige doré", valeur: "#D6A083" },
  { id: "mat", label: "Mat", valeur: "#BA8467" },
  { id: "caramel", label: "Caramel", valeur: "#A96D50" },
  { id: "brun", label: "Brun", valeur: "#89563F" },
  { id: "brun-fonce", label: "Brun foncé", valeur: "#6D4335" },
  { id: "tres-fonce", label: "Très foncé", valeur: "#492C26" },
];

export const formesVisage: Option<FormeVisage>[] = [
  { id: "ovale", label: "Ovale" },
  { id: "rond", label: "Doux" },
  { id: "anguleux", label: "Anguleux" },
  { id: "coeur", label: "Cœur" },
];

export const coiffures: Option<Coiffure>[] = [
  { id: "court", label: "Court" },
  { id: "undercut", label: "Dégradé" },
  { id: "boucles", label: "Boucles" },
  { id: "ebouriffe", label: "Ébouriffé" },
  { id: "carre", label: "Carré" },
  { id: "milong", label: "Mi-long" },
  { id: "long", label: "Long" },
  { id: "chignon", label: "Chignon" },
];

export const couleursCheveux: Couleur[] = [
  { id: "noir", label: "Noir", valeur: "#242126" },
  { id: "brun-fonce", label: "Brun foncé", valeur: "#48372F" },
  { id: "chatain", label: "Châtain", valeur: "#80634F" },
  { id: "blond", label: "Blond", valeur: "#D7B782" },
  { id: "blond-clair", label: "Blond clair", valeur: "#E9D5AC" },
  { id: "roux", label: "Roux", valeur: "#B96843" },
  { id: "cuivre", label: "Cuivré", valeur: "#C5835C" },
  { id: "blanc", label: "Blanc", valeur: "#E9E7E6" },
  { id: "gris", label: "Gris", valeur: "#A5A3AC" },
  { id: "rose", label: "Rose pastel", valeur: "#D9A0B8" },
  { id: "violet", label: "Violet", valeur: "#987DAD" },
  { id: "bleu", label: "Bleu", valeur: "#728FB6" },
];

export const couleursYeux: Couleur[] = [
  { id: "marron", label: "Marron", valeur: "#75513C" },
  { id: "noisette", label: "Noisette", valeur: "#9A784C" },
  { id: "vert", label: "Vert", valeur: "#63816B" },
  { id: "bleu", label: "Bleu", valeur: "#668BAF" },
  { id: "gris", label: "Gris", valeur: "#89959C" },
  { id: "violet", label: "Violet", valeur: "#8976AD" },
];

export const tenues: (Option<Tenue> & { description: string })[] = [
  { id: "uniforme", label: "Uniforme", description: "Blazer bleu nuit et cravate aux couleurs de la maison." },
  { id: "pull", label: "Pull d'étude", description: "Maille épaisse, col de chemise, confort des longues nuits." },
  { id: "redingote", label: "Redingote", description: "Coupe ajustée, boutons dorés et lavallière." },
  { id: "cape", label: "Cape d'observatoire", description: "Cape sombre et fermoir en étoile pour les nuits froides." },
];

// ---------- Traits de caractère ----------

/** Libellés accordés : [masculin, féminin, neutre]. */
export const traits: Record<TraitId, { id: TraitId; libelle: [string, string, string] }> = {
  audacieux: { id: "audacieux", libelle: ["Audacieux", "Audacieuse", "Audacieux·se"] },
  reserve: { id: "reserve", libelle: ["Réservé", "Réservée", "Réservé·e"] },
  espiegle: { id: "espiegle", libelle: ["Espiègle", "Espiègle", "Espiègle"] },
  curieux: { id: "curieux", libelle: ["Curieux", "Curieuse", "Curieux·se"] },
  methodique: { id: "methodique", libelle: ["Méthodique", "Méthodique", "Méthodique"] },
  reveur: { id: "reveur", libelle: ["Rêveur", "Rêveuse", "Rêveur·se"] },
  bienveillant: { id: "bienveillant", libelle: ["Bienveillant", "Bienveillante", "Bienveillant·e"] },
  franc: { id: "franc", libelle: ["Franc", "Franche", "Franc·he"] },
  loyal: { id: "loyal", libelle: ["Loyal", "Loyale", "Loyal·e"] },
};

export const questionsTraits: { id: string; question: string; reponses: { trait: TraitId; texte: string }[] }[] = [
  {
    id: "t1-inconnus",
    question: "Dans une pièce pleine d'inconnus, tu…",
    reponses: [
      { trait: "audacieux", texte: "vas parler à la première personne qui croise ton regard." },
      { trait: "reserve", texte: "observes d'abord, et choisis ensuite avec qui parler." },
      { trait: "espiegle", texte: "lances une blague pour briser la glace." },
    ],
  },
  {
    id: "t2-mystere",
    question: "Face à un mystère, tu…",
    reponses: [
      { trait: "curieux", texte: "fouilles jusqu'à trouver le fin mot de l'histoire." },
      { trait: "methodique", texte: "notes chaque indice dans un carnet." },
      { trait: "reveur", texte: "imagines mille explications plus belles les unes que les autres." },
    ],
  },
  {
    id: "t3-amis",
    question: "Tes proches disent de toi que tu es…",
    reponses: [
      { trait: "bienveillant", texte: "toujours là pour écouter." },
      { trait: "franc", texte: "honnête, parfois un peu trop." },
      { trait: "loyal", texte: "d'une fidélité à toute épreuve." },
    ],
  },
];

// ---------- Valeurs par défaut ----------

export const apparenceParDefaut: Apparence = {
  peau: couleursPeau[2].valeur,
  visage: "ovale",
  coiffure: "milong",
  cheveux: couleursCheveux[2].valeur,
  yeux: couleursYeux[1].valeur,
  tenue: "uniforme",
};

export const personnageParDefaut: Personnage = {
  prenom: "",
  nom: "",
  identite: "nonbinaire",
  pronoms: "iel",
  apparence: apparenceParDefaut,
  traits: {},
};

export const LONGUEUR_MAX_NOM = 18;
