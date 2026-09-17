// ============================================================
// TIMELINE DU PARCOURS — types et valeur par défaut
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Pour ajouter/modifier une étape, utilise l'interface web sur
// /admin, onglet "Timeline".
//
// Le tableau ci-dessous ne sert que de valeur PAR DÉFAUT.

export type EtapeTimeline = {
  id: string;
  date: string; // libre : "2023", "Juin 2024", etc.
  titre: string;
  description?: string;
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
