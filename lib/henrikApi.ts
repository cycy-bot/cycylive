// ============================================================
// RANK VALORANT EN DIRECT — via l'API communautaire HenrikDev
// ============================================================
// Tracker.gg n'a pas d'API publique officielle. HenrikDev
// (api.henrikdev.xyz) est l'API communautaire de référence pour
// récupérer le rank Valorant à partir d'un Riot ID, gratuitement.
//
// Une clé API n'est pas strictement obligatoire (quota limité sans
// clé), mais une clé gratuite (voir README) augmente la limite et
// évite les erreurs de quota.

export type RankValorantLive = {
  rank: string; // ex: "Immortal 2"
  rr: number; // Rank Rating dans le tier actuel
  elo: number;
};

export async function obtenirRankValorant(
  name: string,
  tag: string,
  region: string
): Promise<RankValorantLive | null> {
  if (!name || !tag || !region) return null;

  const headers: Record<string, string> = {};
  if (process.env.HENRIK_API_KEY) {
    headers["Authorization"] = process.env.HENRIK_API_KEY;
  }

  try {
    const reponse = await fetch(
      `https://api.henrikdev.xyz/valorant/v3/mmr/${encodeURIComponent(
        region
      )}/pc/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
      {
        headers,
        next: { revalidate: 300 }, // 5 minutes de cache pour ménager le quota
      }
    );

    if (!reponse.ok) return null;
    const data = await reponse.json();
    const actuel = data?.data?.current_data;
    if (!actuel) return null;

    return {
      rank: actuel.currenttierpatched ?? "Non classé",
      rr: actuel.ranking_in_tier ?? 0,
      elo: actuel.elo ?? 0,
    };
  } catch {
    return null;
  }
}
