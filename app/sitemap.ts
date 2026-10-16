import type { MetadataRoute } from "next";

const SITE_URL = "https://cycylive.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/a-propos",
    "/reseaux",
    "/gaming",
    "/partenariats",
    "/contact",
    "/statistiques",
    "/calendrier",
    "/cycybot",
    "/cycybot/commandes",
    "/cycybot/leaderboard",
    "/jeux",
    "/jeux/runner",
    "/jeux/arcade/reflexes",
    "/jeux/arcade/rythme",
    "/jeux/arcade/constellations",
    "/jeux/arcade/memory",
    "/jeux/arcade/quiz",
    "/jeux/gratter",
    "/jeux/compagnon",
    "/soutenir",
    "/mentions-legales",
    "/confidentialite",
  ];

  return pages.map((chemin) => ({
    url: `${SITE_URL}${chemin}`,
    lastModified: new Date(),
    changeFrequency: chemin === "" ? "daily" : "weekly",
    priority: chemin === "" ? 1 : 0.7,
  }));
}
