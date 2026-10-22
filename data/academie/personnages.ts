// ============================================================
// L'ACADÉMIE DES ASTRES — personnages non joueurs
// ============================================================
// L'apparence de chaque personnage est fixe : c'est elle qui
// garantit que son portrait reste identique d'une scène à l'autre.
// Seule l'expression change.

import type { PersoId, PersonnageNonJoueur } from "./types";

export const personnages: Record<PersoId, PersonnageNonJoueur> = {
  milo: {
    id: "milo",
    nom: "Milo",
    nomComplet: "Milo",
    age: 21,
    maison: "cygne",
    role: "Élève",
    description: "Drôle, bavard, parfois maladroit. Toujours le premier à te parler.",
    apparence: {
      peau: "#E4B793",
      visage: "rond",
      coiffure: "boucles",
      cheveux: "#8A3E22",
      yeux: "#4F7E52",
      tenue: "pull",
      accessoires: ["taches"],
    },
    expressions: ["neutre", "sourire", "rire", "surpris", "gene", "pensif"],
    relationSuivie: true,
  },
  iris: {
    id: "iris",
    nom: "Iris",
    nomComplet: "Iris",
    age: 22,
    maison: "cygne",
    role: "Élève",
    description: "Curieuse, brillante, un brin moqueuse.",
    apparence: {
      peau: "#9C6747",
      visage: "coeur",
      coiffure: "carre",
      cheveux: "#1C1828",
      yeux: "#C38A2C",
      tenue: "uniforme",
      accessoires: ["barrette"],
    },
    expressions: ["neutre", "sourire", "rire", "surpris", "pensif", "malicieux"],
    relationSuivie: true,
  },
  bellamy: {
    id: "bellamy",
    nom: "Pr Bellamy",
    nomComplet: "Professeur Auguste Bellamy",
    age: 68,
    maison: null,
    role: "Professeur d'astronomie",
    description: "Excentrique, chaleureux, passionné. Propriétaire d'un hibou mécanique.",
    apparence: {
      peau: "#E8C3A6",
      visage: "anguleux",
      coiffure: "savant",
      cheveux: "#E6E3DE",
      yeux: "#4877B6",
      tenue: "tweed",
      accessoires: ["lunettes", "moustache", "rides"],
    },
    expressions: ["neutre", "sourire", "rire", "surpris", "pensif"],
    relationSuivie: false,
  },
};
