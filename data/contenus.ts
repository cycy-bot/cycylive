// ============================================================
// DERNIERS CONTENUS — types et valeur par défaut
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Pour ajouter/retirer une vidéo au quotidien, utilise l'interface
// web sur /admin (voir le README, section "Interface
// d'administration").
//
// Le tableau ci-dessous ne sert que de valeur PAR DÉFAUT, utilisée
// si /admin n'a encore jamais rien enregistré (ou si le stockage
// n'est pas configuré).

export type Contenu = {
  id: string;
  plateforme: "TikTok" | "Instagram" | "YouTube" | "Twitch";
  titre: string;
  url: string;
  format: "vertical" | "horizontal";
};

export const contenusParDefaut: Contenu[] = [
  {
    id: "1",
    plateforme: "TikTok",
    titre: "Clip Valorant qui part en vrille",
    url: "https://tiktok.com/@cycylive_",
    format: "vertical",
  },
  {
    id: "2",
    plateforme: "Instagram",
    titre: "Coulisses de la soirée horreur",
    url: "https://instagram.com/cycylive",
    format: "vertical",
  },
  {
    id: "3",
    plateforme: "YouTube",
    titre: "Best-of du mois — moments cultes",
    url: "https://youtube.com/@cycylive",
    format: "horizontal",
  },
];
