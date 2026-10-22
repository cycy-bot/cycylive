// ============================================================
// L'ACADÉMIE DES ASTRES — catalogue de l'avatar en calques
// ============================================================
// Pour ajouter une variante :
//  1. dépose le PNG dans la bibliothèque source et relance
//     scripts/academie/preparer_avatar.py (copie + mesures) ;
//  2. ajoute une ligne dans la liste de la catégorie ci-dessous,
//     avec un identifiant stable (il est sauvegardé chez les joueurs).
// Aucun nombre d'éléments n'est fixé ailleurs dans le code.

import { couleursCheveux, couleursPeau, couleursYeux } from "../personnalisation";
import type {
  Ancre,
  CategorieCalque,
  CategorieCreateur,
  Couleur,
  ElementVisage,
  Morphologie,
  OptionCalque,
  OptionTenue,
  OptionVisage,
  SelectionAvatar,
  Teinte,
} from "./types";

/** Dossier public des calques (modifiable si les assets changent d'emplacement). */
export const racineAssets = "/academie-des-astres/avatar/";

export const TAILLE_ESPACE = 1024;

// ---------- Navigation du créateur ----------

export const categoriesCreateur: CategorieCreateur[] = [
  { id: "identite", label: "Identité", icone: "identite", vue: "portrait" },
  { id: "visage", label: "Visage", icone: "visage", vue: "portrait", calque: "visage", couleur: { champ: "peau", label: "Carnation" } },
  { id: "yeux", label: "Yeux", icone: "yeux", vue: "portrait", calque: "yeux", couleur: { champ: "yeux", label: "Iris" } },
  { id: "sourcils", label: "Sourcils", icone: "sourcils", vue: "portrait", calque: "sourcils", couleur: { champ: "sourcils", label: "Couleur" } },
  { id: "nez", label: "Nez", icone: "nez", vue: "portrait", calque: "nez" },
  { id: "bouche", label: "Bouche", icone: "bouche", vue: "portrait", calque: "bouche" },
  { id: "cheveux", label: "Cheveux", icone: "cheveux", vue: "portrait", calque: "cheveux", couleur: { champ: "cheveux", label: "Couleur" } },
  { id: "tenue", label: "Tenues", icone: "tenue", vue: "pleinPied", calque: "tenue" },
  { id: "caractere", label: "Caractère", icone: "caractere", vue: "portrait" },
  { id: "recapitulatif", label: "Récapitulatif", icone: "recapitulatif", vue: "pleinPied" },
];

// ---------- Ancres des éléments du visage (espace "tete") ----------
// Mesurées sur les visages actuels : ligne des yeux, des sourcils,
// pointe du nez et bouche. Un visage peut les surcharger.

const ancresParMorphologie: Record<"feminin" | "masculin", Record<ElementVisage, Ancre>> = {
  feminin: {
    yeux: { cx: 512, cy: 478, taille: 372, mesure: "largeur" },
    sourcils: { cx: 512, cy: 405, taille: 405, mesure: "largeur" },
    nez: { cx: 512, cy: 548, taille: 120, mesure: "hauteur" },
    bouche: { cx: 512, cy: 655, taille: 118, mesure: "largeur" },
  },
  masculin: {
    yeux: { cx: 512, cy: 462, taille: 372, mesure: "largeur" },
    sourcils: { cx: 512, cy: 392, taille: 415, mesure: "largeur" },
    nez: { cx: 512, cy: 530, taille: 125, mesure: "hauteur" },
    bouche: { cx: 512, cy: 648, taille: 120, mesure: "largeur" },
  },
};

export function ancresDuVisage(v: OptionVisage | undefined): Record<ElementVisage, Ancre> {
  const base = ancresParMorphologie[v?.morphologie === "masculin" ? "masculin" : "feminin"];
  return { ...base, ...(v?.ancres ?? {}) };
}

/** Espace laissé entre le sommet du crâne et le haut d'une coiffure. */
export const MARGE_COIFFURE = 24;

// ---------- Options ----------

const visages: OptionVisage[] = [
  { id: "f-ovale", label: "Ovale", fichier: "visages/01_feminin_ovale.png", morphologie: "feminin", svg: { visage: "ovale" } },
  { id: "f-rond", label: "Rond", fichier: "visages/02_feminin_rond.png", morphologie: "feminin", svg: { visage: "rond" } },
  { id: "f-coeur", label: "Cœur", fichier: "visages/03_feminin_coeur.png", morphologie: "feminin", svg: { visage: "coeur" } },
  { id: "f-allonge", label: "Allongé", fichier: "visages/04_feminin_allonge.png", morphologie: "feminin", svg: { visage: "ovale" } },
  { id: "m-ovale", label: "Ovale", fichier: "visages/05_masculin_ovale.png", morphologie: "masculin", svg: { visage: "ovale" } },
  { id: "m-carre", label: "Carré", fichier: "visages/06_masculin_carre.png", morphologie: "masculin", svg: { visage: "anguleux" } },
  { id: "m-rectangulaire", label: "Rectangulaire", fichier: "visages/07_masculin_rectangulaire.png", morphologie: "masculin", svg: { visage: "anguleux" } },
  { id: "m-anguleux", label: "Mâchoire anguleuse", fichier: "visages/08_masculin_machoire_anguleuse.png", morphologie: "masculin", svg: { visage: "anguleux" } },
];

const yeux: OptionCalque[] = [
  { id: "f-ronds-doux", label: "Ronds et doux", fichier: "yeux/01_feminin_ronds_doux.png", morphologie: "feminin" },
  { id: "f-amande", label: "En amande", fichier: "yeux/02_feminin_amande.png", morphologie: "feminin" },
  { id: "f-etires", label: "Étirés", fichier: "yeux/03_feminin_etires.png", morphologie: "feminin" },
  { id: "f-tombants", label: "Tombants", fichier: "yeux/04_feminin_tombants.png", morphologie: "feminin" },
  { id: "f-mysterieux", label: "Fins, mystérieux", fichier: "yeux/05_feminin_fins_mysterieux.png", morphologie: "feminin" },
  { id: "m-classiques", label: "Classiques", fichier: "yeux/06_masculin_classiques.png", morphologie: "masculin" },
  { id: "m-allonges", label: "Fins, allongés", fichier: "yeux/07_masculin_fins_allonges.png", morphologie: "masculin" },
  { id: "m-tombants", label: "Tombants", fichier: "yeux/08_masculin_tombants.png", morphologie: "masculin" },
  { id: "m-ouverts", label: "Ouverts", fichier: "yeux/09_masculin_ouverts.png", morphologie: "masculin" },
  { id: "m-percants", label: "Perçants", fichier: "yeux/10_masculin_percants.png", morphologie: "masculin" },
];

const sourcils: OptionCalque[] = [
  { id: "droits-fins", label: "Droits et fins", fichier: "sourcils/01_droits_fins.png" },
  { id: "droits-epais", label: "Droits et épais", fichier: "sourcils/02_droits_epais.png" },
  { id: "arques", label: "Légèrement arqués", fichier: "sourcils/03_legerement_arques.png" },
  { id: "tres-arques", label: "Très arqués", fichier: "sourcils/04_fortement_arques.png" },
  { id: "arrondis", label: "Doux, arrondis", fichier: "sourcils/05_doux_arrondis.png" },
  { id: "anguleux", label: "Anguleux", fichier: "sourcils/06_anguleux.png" },
  { id: "courts-epais", label: "Courts et épais", fichier: "sourcils/07_courts_epais.png" },
  { id: "tombants", label: "Légèrement tombants", fichier: "sourcils/08_legerement_tombants.png" },
];

const nez: OptionCalque[] = [
  { id: "fin-droit", label: "Fin et droit", fichier: "nez/01_nez_fin_et_droit.png" },
  { id: "court-arrondi", label: "Court, arrondi", fichier: "nez/02_nez_court_et_arrondi.png" },
  { id: "droit-classique", label: "Droit classique", fichier: "nez/03_nez_droit_classique.png" },
  { id: "retrousse", label: "Retroussé", fichier: "nez/04_nez_legerement_retrousse.png" },
  { id: "large-arrondi", label: "Large, arrondi", fichier: "nez/05_nez_large_et_arrondi.png" },
  { id: "long-fin", label: "Long et fin", fichier: "nez/06_nez_long_et_fin.png" },
  { id: "pointe-marquee", label: "Pointe marquée", fichier: "nez/07_nez_pointe_marquee.png" },
  { id: "epate-doux", label: "Épaté, doux", fichier: "nez/08_nez_epate_doux.png" },
];

const bouches: OptionCalque[] = [
  { id: "neutre", label: "Neutre", fichier: "bouches/existantes/01_neutre_fermee.png", morphologie: "feminin" },
  { id: "petit-sourire", label: "Petit sourire", fichier: "bouches/existantes/02_petit_sourire.png", morphologie: "feminin" },
  { id: "sourire-chaleureux", label: "Sourire chaleureux", fichier: "bouches/existantes/03_sourire_chaleureux.png", morphologie: "feminin" },
  { id: "grand-sourire", label: "Grand sourire", fichier: "bouches/existantes/04_grand_sourire_dents.png", morphologie: "feminin" },
  { id: "malicieux", label: "Malicieux", fichier: "bouches/existantes/05_sourire_malicieux.png", morphologie: "feminin" },
  { id: "surprise", label: "Surprise", fichier: "bouches/existantes/06_bouche_surprise.png", morphologie: "feminin" },
  { id: "contrariee", label: "Contrariée", fichier: "bouches/existantes/07_expression_contrariee.png", morphologie: "feminin" },
  { id: "boudeuse", label: "Moue boudeuse", fichier: "bouches/existantes/08_moue_boudeuse.png", morphologie: "feminin" },
  { id: "m-neutre", label: "Neutre", fichier: "bouches/masculines/01_neutre_fermee.png", morphologie: "masculin" },
  { id: "m-petit-sourire", label: "Petit sourire", fichier: "bouches/masculines/02_petit_sourire.png", morphologie: "masculin" },
  { id: "m-sourire-chaleureux", label: "Sourire chaleureux", fichier: "bouches/masculines/03_sourire_chaleureux.png", morphologie: "masculin" },
  { id: "m-grand-sourire", label: "Grand sourire", fichier: "bouches/masculines/04_grand_sourire_dents.png", morphologie: "masculin" },
  { id: "m-malicieux", label: "Malicieux", fichier: "bouches/masculines/05_sourire_malicieux.png", morphologie: "masculin" },
  { id: "m-surprise", label: "Surprise", fichier: "bouches/masculines/06_surprise_entrouverte.png", morphologie: "masculin" },
  { id: "m-contrariee", label: "Contrariée", fichier: "bouches/masculines/07_contrariee.png", morphologie: "masculin" },
  { id: "m-boudeuse", label: "Moue boudeuse", fichier: "bouches/masculines/08_moue_boudeuse.png", morphologie: "masculin" },
];

const cheveux: OptionCalque[] = [
  { id: "court-classique", label: "Court classique", fichier: "cheveux/01_court_classique_raie_cote.png", morphologie: "masculin", svg: { coiffure: "court" } },
  { id: "court-ebouriffe", label: "Ébouriffé", fichier: "cheveux/02_court_ebouriffe_texture.png", morphologie: "masculin", svg: { coiffure: "ebouriffe" } },
  { id: "rideau", label: "Coupe rideau", fichier: "cheveux/03_coupe_rideau_raie_centrale.png", morphologie: "masculin", svg: { coiffure: "court" } },
  { id: "degrade-volume", label: "Dégradé volume", fichier: "cheveux/04_degrade_court_volume.png", morphologie: "masculin", svg: { coiffure: "undercut" } },
  { id: "mi-long-ondule", label: "Mi-long ondulé", fichier: "cheveux/05_mi_long_legerement_ondule.png", morphologie: "masculin", svg: { coiffure: "milong" } },
  { id: "court-boucle", label: "Court bouclé", fichier: "cheveux/06_court_boucle.png", morphologie: "masculin", svg: { coiffure: "boucles" } },
  { id: "meches-tombantes", label: "Mèches tombantes", fichier: "cheveux/07_mi_long_meches_tombantes.png", morphologie: "masculin", svg: { coiffure: "milong" } },
  { id: "afro", label: "Afro très frisé", fichier: "cheveux/08_court_afro_tres_frise.png", morphologie: "masculin", svg: { coiffure: "boucles" } },
  { id: "carre-frange", label: "Carré à frange", fichier: "cheveux/09_carre_court_frange.png", morphologie: "feminin", svg: { coiffure: "carre" } },
  { id: "carre-ondule", label: "Carré ondulé", fichier: "cheveux/10_carre_mi_long_ondule.png", morphologie: "feminin", svg: { coiffure: "carre" } },
  { id: "longs-lisses", label: "Longs et lisses", fichier: "cheveux/11_longs_lisses_raie_centrale.png", morphologie: "feminin", svg: { coiffure: "long" } },
  { id: "longs-ondules", label: "Longs ondulés", fichier: "cheveux/12_longs_ondules.png", morphologie: "feminin", svg: { coiffure: "long" } },
  { id: "queue-de-cheval", label: "Queue de cheval", fichier: "cheveux/13_queue_de_cheval_haute.png", morphologie: "feminin", svg: { coiffure: "long" } },
  { id: "chignon", label: "Chignon", fichier: "cheveux/14_chignon_decontracte.png", morphologie: "feminin", svg: { coiffure: "chignon" } },
  { id: "tresse", label: "Tresse sur le côté", fichier: "cheveux/15_tresse_sur_le_cote.png", morphologie: "feminin", svg: { coiffure: "long" } },
  { id: "boucles-longues", label: "Longues boucles", fichier: "cheveux/16_longs_boucles_frises.png", morphologie: "feminin", svg: { coiffure: "boucles" } },
];

// Point de pose de la tête mesuré sur chaque tenue (tête chauve dessinée
// en haut du canevas : sommet vers y = 14, menton vers y = 122).
const poseTete = { x: 511.5, y: 15, echelle: 0.162 };
const masqueTete: [number, number] = [0.105, 0.122];

const tenues: OptionTenue[] = [
  { id: "f-classique", label: "Classique", fichier: "tenues/01_feminin_classique.png", morphologie: "feminin", tete: poseTete, masqueHaut: masqueTete, svg: { tenue: "uniforme" } },
  { id: "f-elegant", label: "Élégant", fichier: "tenues/02_feminin_elegant.png", morphologie: "feminin", tete: poseTete, masqueHaut: masqueTete, svg: { tenue: "redingote" } },
  { id: "f-alternatif", label: "Alternatif chic", fichier: "tenues/03_feminin_alternatif_chic.png", morphologie: "feminin", tete: poseTete, masqueHaut: masqueTete, svg: { tenue: "pull" } },
  { id: "m-classique", label: "Classique", fichier: "tenues/04_masculin_classique.png", morphologie: "masculin", tete: poseTete, masqueHaut: masqueTete, svg: { tenue: "uniforme" } },
  { id: "m-soigne", label: "Soigné", fichier: "tenues/05_masculin_soigne.png", morphologie: "masculin", tete: poseTete, masqueHaut: masqueTete, svg: { tenue: "redingote" } },
  { id: "m-decontracte", label: "Décontracté chic", fichier: "tenues/06_masculin_decontracte_chic.png", morphologie: "masculin", tete: poseTete, masqueHaut: masqueTete, svg: { tenue: "pull" } },
];

export const optionsParCalque: {
  visage: OptionVisage[];
  tenue: OptionTenue[];
} & Record<Exclude<CategorieCalque, "visage" | "tenue">, OptionCalque[]> = {
  visage: visages,
  yeux,
  sourcils,
  nez,
  bouche: bouches,
  cheveux,
  tenue: tenues,
};

/** Ordre de superposition dans chaque vue (du fond vers l'avant). */
export const ordreCalques: CategorieCalque[] = ["tenue", "visage", "yeux", "nez", "bouche", "sourcils", "cheveux"];

/** En plein pied, le bas du cou du visage s'efface pour laisser voir le col de la tenue (fractions du canevas). */
export const fonduCouPleinPied: [number, number] = [0.8, 0.88];

// ---------- Couleurs ----------

export const couleursSourcils: Couleur[] = couleursCheveux;

export const palettes: Record<"peau" | "yeux" | "cheveux" | "sourcils", Couleur[]> = {
  peau: couleursPeau,
  yeux: couleursYeux,
  cheveux: couleursCheveux,
  sourcils: couleursSourcils,
};

/**
 * Recoloration de l'aperçu : désactivée tant que les assets ne sont
 * pas fournis en niveaux de gris ou avec des masques de teinte.
 */
export const teintes: Record<"peau" | "yeux" | "cheveux" | "sourcils", Teinte> = {
  peau: { appliquee: false, mode: "multiply" },
  yeux: { appliquee: false, mode: "color" },
  cheveux: { appliquee: false, mode: "color" },
  sourcils: { appliquee: false, mode: "color" },
};

// ---------- Sélections par défaut ----------

export const selectionsParDefaut: Record<"feminin" | "masculin", Required<SelectionAvatar>> = {
  feminin: { visage: "f-ovale", yeux: "f-amande", sourcils: "arques", nez: "fin-droit", bouche: "petit-sourire", cheveux: "longs-ondules", tenue: "f-classique" },
  masculin: { visage: "m-ovale", yeux: "m-classiques", sourcils: "droits-epais", nez: "droit-classique", bouche: "m-petit-sourire", cheveux: "court-classique", tenue: "m-classique" },
};

export function morphologieParDefaut(identite: string): "feminin" | "masculin" {
  return identite === "masculin" ? "masculin" : "feminin";
}

export const libellesMorphologie: Record<Morphologie, string> = {
  feminin: "Féminin",
  masculin: "Masculin",
  neutre: "Neutre",
};
