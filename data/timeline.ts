// ============================================================
// TIMELINE DU PARCOURS — types et valeur par défaut
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Pour ajouter/modifier une étape, utilise l'interface web sur
// /admin, onglet "Timeline".
//
// Le tableau ci-dessous ne sert que de valeur PAR DÉFAUT.

export type CategorieTimeline = "live" | "valorant" | "communaute" | "palier" | "collab" | "perso" | "autre";

export type EtapeTimeline = {
  id: string;
  date: string; // libre : "2023", "Juin 2024", etc.
  titre: string;
  description?: string;
  liens?: string[]; // clips Twitch, TikTok ou vidéos YouTube à regarder (optionnel)
  lien?: string; // ancien format (un seul lien), lu encore pour compatibilité
  categorie?: CategorieTimeline; // couleur + icône par défaut
  icone?: string; // icône choisie (sinon celle de la catégorie)
  chiffre?: string; // petit badge, ex. « 100 followers », « 1er ace »
  image?: string; // lien d'une image (capture, photo…) affichée dans la carte
  marquant?: boolean; // « Moment fort » : carte mise en avant
  masque?: boolean; // caché sur le site (gardé dans l'admin)
};

export type ReglagesTimeline = {
  titre: string;
  intro: string;
  ordre: "chronologique" | "recent"; // ordre d'affichage sur le site
  filtres: boolean; // boutons de filtre par catégorie
  apercuAccueil: number; // nombre d'étapes dans l'aperçu de l'accueil (0 = masqué)
  fin: string; // texte au bout de la frise
};

export const reglagesTimelineParDefaut: ReglagesTimeline = {
  titre: "Les moments qui ont marqué l'aventure",
  intro: "",
  ordre: "chronologique",
  filtres: true,
  apercuAccueil: 3,
  fin: "Et la suite s'écrit en live ✦",
};

export const timelineParDefaut: EtapeTimeline[] = [
  {
    id: "1",
    date: "30 mars 2026",
    titre: "Premier live",
    description:
      "Le tout premier. Quelques viewers, beaucoup de trac, énormément de choses à découvrir… et absolument aucune idée de jusqu'où cette aventure allait m'emmener. Il fallait bien commencer quelque part.",
  },
  {
    id: "2",
    date: "5 avril 2026",
    titre: "Premier live Valorant",
    description:
      "Je lançais simplement un live sur Valorant. Je ne savais pas encore que ce jeu allait devenir le cœur de ma chaîne, rythmer une grande partie de mes lives et surtout rassembler autour de moi une communauté entière. Depuis, il y a eu des ranked, des clutchs, des fails, des rencontres, beaucoup trop de cris… et énormément de souvenirs. Valorant a complètement changé mon aventure sur Twitch.",
  },
];
