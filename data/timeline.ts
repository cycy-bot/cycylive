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
    date: "2023",
    titre: "Premier live",
    description: "Le tout premier stream, avec une poignée de viewers et beaucoup de trac.",
  },
  {
    id: "2",
    date: "2024",
    titre: "Cap symbolique atteint",
    description: "Une belle communauté commence à se former autour des lives réguliers.",
  },
  {
    id: "3",
    date: "2026",
    titre: "Lancement de cycylive.fr",
    description: "Le site officiel voit le jour, avec planning, réseaux et communauté réunis au même endroit.",
  },
];
