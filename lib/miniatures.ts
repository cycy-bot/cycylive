// ============================================================
// MINIATURES — récupération automatique des aperçus vidéo
// ============================================================
// - YouTube : miniature publique, aucune clé nécessaire.
// - TikTok : via l'oEmbed public de TikTok, aucune clé nécessaire.
// - Twitch (clips) : via l'API Twitch déjà connectée (voir
//   app/api/twitch-status/route.ts) — fonctionne seulement si les
//   clés TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET sont configurées.
// - Instagram : Meta n'offre plus d'accès public simple aux
//   miniatures depuis 2020 (ça nécessite une validation d'app par
//   Meta). Pas de miniature automatique possible pour l'instant :
//   on affiche une belle carte de secours à la place.

import type { Contenu } from "@/data/contenus";

function miniatureYoutube(url: string): string | null {
  const correspondance = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/
  );
  return correspondance
    ? `https://img.youtube.com/vi/${correspondance[1]}/hqdefault.jpg`
    : null;
}

async function miniatureTiktok(url: string): Promise<string | null> {
  try {
    const reponse = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { cache: "no-store" }
    );
    if (!reponse.ok) return null;
    const data = await reponse.json();
    return data.thumbnail_url ?? null;
  } catch {
    return null;
  }
}

let tokenTwitchEnCache: { token: string; expireLe: number } | null = null;

async function obtenirTokenTwitch(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (tokenTwitchEnCache && tokenTwitchEnCache.expireLe > Date.now()) {
    return tokenTwitchEnCache.token;
  }

  try {
    const reponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });
    if (!reponse.ok) return null;
    const data = await reponse.json();
    tokenTwitchEnCache = {
      token: data.access_token,
      expireLe: Date.now() + (data.expires_in - 60) * 1000,
    };
    return tokenTwitchEnCache.token;
  } catch {
    return null;
  }
}

async function miniatureTwitchClip(url: string): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) return null;

  const correspondance = url.match(
    /clips\.twitch\.tv\/([\w-]+)|twitch\.tv\/\w+\/clip\/([\w-]+)/
  );
  const slug = correspondance ? correspondance[1] || correspondance[2] : null;
  if (!slug) return null;

  const token = await obtenirTokenTwitch();
  if (!token) return null;

  try {
    const reponse = await fetch(
      `https://api.twitch.tv/helix/clips?id=${encodeURIComponent(slug)}`,
      {
        headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const data = await reponse.json();
    return data?.data?.[0]?.thumbnail_url ?? null;
  } catch {
    return null;
  }
}

export type ContenuAvecMiniature = Contenu & { miniature?: string };

// Enrichit une liste de contenus avec leur vraie miniature quand
// c'est possible. Ne fait jamais planter l'affichage : si une
// miniature ne peut pas être récupérée, le contenu est renvoyé
// tel quel (sans miniature), et l'interface affiche alors un
// visuel de secours.
export async function ajouterMiniatures(
  contenus: Contenu[]
): Promise<ContenuAvecMiniature[]> {
  return Promise.all(
    contenus.map(async (c) => {
      let miniature: string | null = null;
      if (c.plateforme === "YouTube") miniature = miniatureYoutube(c.url);
      else if (c.plateforme === "TikTok") miniature = await miniatureTiktok(c.url);
      else if (c.plateforme === "Twitch") miniature = await miniatureTwitchClip(c.url);

      return { ...c, miniature: miniature ?? undefined };
    })
  );
}
