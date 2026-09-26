import type { MetadataRoute } from "next";

const SITE_URL = "https://cycylive.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/a-propos",
    "/reseaux",
    "/valorant",
    "/communaute",
    "/partenariats",
    "/contact",
    "/statistiques",
    "/cycybot",
    "/cycybot/commandes",
    "/cycybot/leaderboard",
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
