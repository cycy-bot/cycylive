// ============================================================
// DERNIERS CONTENUS — à modifier pour mettre en avant tes vidéos
// ============================================================
// "format: 'vertical'" -> carte style téléphone (TikTok/Reels/Shorts)
// "format: 'horizontal'" -> carte large (YouTube, clips Twitch)

export type Contenu = {
  id: string;
  plateforme: "TikTok" | "Instagram" | "YouTube" | "Twitch";
  titre: string;
  url: string;
  format: "vertical" | "horizontal";
  // Chemin d'une miniature dans /public/images, ou laisse vide pour le placeholder par défaut
  miniature?: string;
};

export const contenus: Contenu[] = [
  {
    id: "1",
    plateforme: "TikTok",
    titre: "Clip Valorant qui part en vrille",
    url: "https://tiktok.com/@cycylive",
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
  {
    id: "4",
    plateforme: "Twitch",
    titre: "Clutch de fin de round",
    url: "https://twitch.tv/cycylive/clips",
    format: "vertical",
  },
  {
    id: "5",
    plateforme: "TikTok",
    titre: "Réaction en direct",
    url: "https://tiktok.com/@cycylive",
    format: "vertical",
  },
];
