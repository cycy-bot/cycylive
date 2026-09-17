// ============================================================
// VALORANT — news, favoris et rank
// ============================================================
// ⚠️ Tu n'as normalement plus besoin de modifier ce fichier.
// Gère tout ça depuis /admin, onglet "Valorant".

export type NewsValorant = {
  id: string;
  titre: string;
  url: string;
};

export type ProfilValorant = {
  mapFavorite: string;
  skinFavori: string;
  mains: string; // agents, séparés par des virgules
  rankActuel: string;
  trackerUrl: string; // lien vers le profil Tracker.gg
};

export const newsValorantParDefaut: NewsValorant[] = [
  {
    id: "1",
    titre: "Toutes les actus officielles Valorant",
    url: "https://playvalorant.com/fr-fr/news/",
  },
];

export const profilValorantParDefaut: ProfilValorant = {
  mapFavorite: "À définir",
  skinFavori: "À définir",
  mains: "À définir",
  rankActuel: "À définir",
  trackerUrl: "",
};
