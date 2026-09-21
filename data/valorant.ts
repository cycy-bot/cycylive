// ============================================================
// VALORANT — news, clips, favoris et rank
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Gère tout ça depuis /admin, onglet "Valorant".

export type NewsValorant = {
  id: string;
  titre: string;
  url: string;
};

export type ClipValorant = {
  id: string;
  titre: string;
  url: string;
};

export type ProfilValorant = {
  intro: string; // courte intro sur la place de Valorant dans la chaîne
  rankActuel: string; // utilisé seulement si le Riot ID ci-dessous n'est pas renseigné
  objectifRank: string;
  agents: string; // séparés par des virgules
  maps: string; // séparées par des virgules
  skinsArmes: string;
  statsPerso: string; // optionnel : un chiffre ou une note du moment (laisser vide sinon)
  trackerUrl: string; // lien vers le profil Tracker.gg

  // Renseigne ces 3 champs pour que le rank s'actualise TOUT SEUL
  // (via l'API HenrikDev, voir README). Laisse-les vides pour garder
  // le rank manuel ci-dessus.
  riotName: string; // pseudo avant le #, ex: "Cycy"
  riotTag: string; // après le #, ex: "EUW"
  riotRegion: string; // "eu", "na", "ap" ou "kr"
};

export const newsValorantParDefaut: NewsValorant[] = [
  {
    id: "1",
    titre: "Toutes les actus officielles Valorant",
    url: "https://playvalorant.com/fr-fr/news/",
  },
];

export const clipsValorantParDefaut: ClipValorant[] = [];

export const profilValorantParDefaut: ProfilValorant = {
  intro:
    "Valorant, c'est devenu le cœur de mes lives — ranked, clutchs, fails et beaucoup de cris avec la communauté.",
  rankActuel: "À définir",
  objectifRank: "À définir",
  agents: "À définir",
  maps: "À définir",
  skinsArmes: "À définir",
  statsPerso: "",
  trackerUrl: "",
  riotName: "",
  riotTag: "",
  riotRegion: "eu",
};
