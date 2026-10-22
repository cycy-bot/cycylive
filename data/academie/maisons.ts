// ============================================================
// L'ACADÉMIE DES ASTRES — maisons et cérémonie d'affectation
// ============================================================
// GRILLE DE SCORING (explicite et équilibrée)
//
// - Questions 1 à 3 : 4 réponses chacune.
//     3 réponses "franches" → 2 points pour une seule maison
//     1 réponse "mixte"     → 1 point pour deux maisons
//   Les paires mixtes tournent : Q1 Lion+Cygne, Q2 Cygne+Dragon,
//   Q3 Dragon+Lion. Aucune maison n'est avantagée.
// - Question 4 ("Le Cœur") : 3 réponses, 2 points pour une maison.
//
// Chaque maison peut donc obtenir au maximum 8 points.
//
// DÉPARTAGE DES ÉGALITÉS (déterministe), dans l'ordre :
//   1. le total de points ;
//   2. les points obtenus à la question "Le Cœur" ;
//   3. le nombre de réponses franches obtenues ;
//   4. la question la plus récente qui distingue les maisons ;
//   5. ordre fixe Lion > Cygne > Dragon (filet de sécurité,
//      jamais atteint avec la grille actuelle).
// Le calcul lui-même se trouve dans lib/academie/ceremonie.ts.

import type { Maison, MaisonId, QuestionCeremonie } from "./types";

export const ordreMaisons: MaisonId[] = ["lion", "cygne", "dragon"];

export const maisons: Record<MaisonId, Maison> = {
  lion: {
    id: "lion",
    nom: "Maison du Lion",
    animal: "Lion",
    emoji: "🦁",
    devise: "Par l'audace, jusqu'aux astres.",
    description:
      "Les élèves du Lion avancent les premiers, même quand le chemin n'est pas encore éclairé. On les reconnaît à leur voix qui porte, à leur goût du défi et à cette façon d'entraîner les autres dans leur sillage.",
    valeurs: ["Audace", "Ambition", "Courage", "Leadership"],
    couleurs: {
      principale: "#D9A63E",
      claire: "#F3D489",
      sombre: "#6B4A12",
      secondaire: "#7A1F2B",
    },
  },
  cygne: {
    id: "cygne",
    nom: "Maison du Cygne",
    animal: "Cygne",
    emoji: "🦢",
    devise: "Ce que le cœur devine, l'esprit l'éclaire.",
    description:
      "Les élèves du Cygne perçoivent ce qui échappe aux autres : un silence, un regard, une étoile qui scintille un peu trop. Créatifs et attentifs, ils transforment l'intuition en lumière.",
    valeurs: ["Empathie", "Intuition", "Créativité", "Sensibilité"],
    couleurs: {
      principale: "#A9C7E6",
      claire: "#E4EEF8",
      sombre: "#2E4566",
      secondaire: "#C9CED8",
    },
  },
  dragon: {
    id: "dragon",
    nom: "Maison du Dragon",
    animal: "Dragon",
    emoji: "🐉",
    devise: "Pas à pas, jusqu'au firmament.",
    description:
      "Les élèves du Dragon ne lâchent jamais rien. Patients, rigoureux et fidèles, ils bâtissent leurs réussites nuit après nuit, et n'abandonnent jamais ceux qui marchent à leurs côtés.",
    valeurs: ["Persévérance", "Discipline", "Détermination", "Loyauté"],
    couleurs: {
      principale: "#9A6BE0",
      claire: "#D2B8FA",
      sombre: "#3A1E6B",
      secondaire: "#5B5F73",
    },
  },
};

/** Identifiant de la question décisive utilisée pour départager. */
export const questionCoeurId = "q4-coeur";

export const introCeremonie = {
  titre: "La Cérémonie de l'Astrolabe",
  texte:
    "Sous la voûte de la Grande Salle, l'Astrolabe s'éveille. Ses anneaux de cuivre tournent lentement autour de toi. Il va te montrer quatre visions. Réponds sans réfléchir trop longtemps : il lit ce que tu es, pas ce que tu voudrais être.",
};

export const questionsCeremonie: QuestionCeremonie[] = [
  {
    id: "q1-porte",
    titre: "Première vision — La porte close",
    situation:
      "La nuit tombe sur l'Académie. La grande porte de l'internat est verrouillée. Au premier étage, une fenêtre est entrouverte. Sur les marches, un élève égaré tremble de froid. Et au fond des jardins, une lanterne bleue clignote comme un signal.",
    reponses: [
      { id: "a", texte: "Je grimpe le long du lierre jusqu'à la fenêtre entrouverte.", points: { lion: 2 } },
      { id: "b", texte: "Je m'assois près de l'élève égaré et je l'aide à retrouver son calme.", points: { cygne: 2 } },
      { id: "c", texte: "Je fais le tour du bâtiment, méthodiquement, jusqu'à trouver une entrée de service.", points: { dragon: 2 } },
      { id: "d", texte: "Je suis la lanterne bleue. Quelque chose m'appelle là-bas.", points: { lion: 1, cygne: 1 } },
    ],
  },
  {
    id: "q2-constellation",
    titre: "Deuxième vision — La carte du ciel",
    situation:
      "Ton groupe doit cartographier une constellation avant l'aube. Les nuages s'accumulent, la moitié des élèves veut abandonner et rentrer se coucher.",
    reponses: [
      { id: "a", texte: "Je prends la tête du groupe et je répartis les rôles.", points: { lion: 2 } },
      { id: "b", texte: "J'écoute chacun et je trouve ce qui pourra le remotiver.", points: { cygne: 2 } },
      { id: "c", texte: "Je reste au télescope toute la nuit s'il le faut, jusqu'à la prochaine éclaircie.", points: { dragon: 2 } },
      { id: "d", texte: "Je recompose la carte grâce aux vieux registres de la bibliothèque… et à mon intuition.", points: { cygne: 1, dragon: 1 } },
    ],
  },
  {
    id: "q3-secret",
    titre: "Troisième vision — Le toit de l'observatoire",
    situation:
      "Après le couvre-feu, tu surprends une personne de ton dortoir en train de se faufiler vers le toit de l'observatoire. Elle te supplie de ne rien dire.",
    reponses: [
      { id: "a", texte: "Je l'accompagne : un ciel pareil, ça ne se refuse pas.", points: { lion: 2 } },
      { id: "b", texte: "Je lui demande doucement ce qui l'attire là-haut, toute seule.", points: { cygne: 2 } },
      { id: "c", texte: "Je garde son secret et je fais le guet pour qu'on ne la surprenne pas.", points: { dragon: 2 } },
      { id: "d", texte: "Je monte avec elle, à une condition : retour avant la ronde de minuit.", points: { dragon: 1, lion: 1 } },
    ],
  },
  {
    id: questionCoeurId,
    titre: "Dernière vision — Le Cœur",
    situation:
      "Les anneaux s'immobilisent. Une voix grave résonne, venue de partout à la fois : « Lorsque les étoiles parleront de toi, que veux-tu qu'elles disent ? »",
    reponses: [
      { id: "a", texte: "« Que j'ai osé là où d'autres ont hésité. »", points: { lion: 2 } },
      { id: "b", texte: "« Que j'ai compris ce que les autres taisaient. »", points: { cygne: 2 } },
      { id: "c", texte: "« Que je n'ai jamais renoncé. »", points: { dragon: 2 } },
    ],
  },
];
