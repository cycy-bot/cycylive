// Derniers clips Twitch de la chaîne (page Gaming), via le compte Twitch déjà connecté au site.
import { obtenirAccesTwitch } from "@/lib/twitchOAuth";

export type ClipTwitch = {
  id: string;
  titre: string;
  url: string;
  miniature: string;
  vues: number;
  duree: number; // secondes
  date: string; // ISO
  jeu: string;
  auteur: string;
};

type ClipHelix = { id: string; url: string; title: string; view_count: number; created_at: string; thumbnail_url: string; duration: number; game_id: string; creator_name: string };

async function helix<T>(chemin: string, acces: { clientId: string; token: string }): Promise<T | null> {
  try {
    const r = await fetch(`https://api.twitch.tv/helix/${chemin}`, {
      headers: { "Client-Id": acces.clientId, Authorization: `Bearer ${acces.token}` },
      next: { revalidate: 1800 },
    });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

/** Les clips les plus récents (des 2 derniers mois, sinon de l'année), du plus récent au plus ancien. */
export async function derniersClipsTwitch(limite = 12): Promise<ClipTwitch[]> {
  const acces = await obtenirAccesTwitch().catch(() => null);
  if (!acces) return [];
  let clips: ClipHelix[] = [];
  for (const jours of [60, 365]) {
    const depuis = new Date(Date.now() - jours * 86400000).toISOString();
    const d = await helix<{ data: ClipHelix[] }>(`clips?broadcaster_id=${acces.broadcasterId}&first=100&started_at=${encodeURIComponent(depuis)}`, acces);
    clips = d?.data || [];
    if (clips.length >= 6) break;
  }
  clips.sort((a, b) => b.created_at.localeCompare(a.created_at));
  clips = clips.slice(0, limite);
  const ids = [...new Set(clips.map((c) => c.game_id).filter(Boolean))];
  const jeux = ids.length ? await helix<{ data: { id: string; name: string }[] }>(`games?${ids.map((i) => `id=${i}`).join("&")}`, acces) : null;
  const nomJeu = new Map((jeux?.data || []).map((g) => [g.id, g.name]));
  return clips.map((c) => ({
    id: c.id,
    titre: c.title,
    url: c.url,
    miniature: c.thumbnail_url,
    vues: c.view_count,
    duree: Math.round(c.duration),
    date: c.created_at,
    jeu: nomJeu.get(c.game_id) || "",
    auteur: c.creator_name,
  }));
}
