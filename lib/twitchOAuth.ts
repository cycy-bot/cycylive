// ============================================================
// AUTHENTIFICATION TWITCH (compte de Cycy) — pour le compteur de followers
// ============================================================
// Depuis septembre 2023, Twitch n'autorise plus de récupérer le
// nombre de followers avec une simple clé d'API (token "app").
// Il faut un token utilisateur, obtenu une seule fois en se
// connectant avec le compte Twitch de la chaîne (voir
// /api/twitch-connect), avec la permission "moderator:read:followers".
//
// Ce token est ensuite stocké dans Upstash et rafraîchi
// automatiquement à chaque fois qu'il approche de son expiration.

import { Redis } from "@upstash/redis";

const CLE_OAUTH = "cycylive:twitch-oauth";

type TwitchOAuth = {
  access_token: string;
  refresh_token: string;
  expire_le: number; // timestamp ms
  broadcaster_id: string;
};

function obtenirClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

export function urlAutorisationTwitch(redirectUri: string): string | null {
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "moderator:read:followers",
  });

  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
}

export async function echangerCodeContreToken(
  code: string,
  redirectUri: string
): Promise<{ ok: boolean; erreur?: string }> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const redis = obtenirClient();
  if (!clientId || !clientSecret) return { ok: false, erreur: "Clés Twitch manquantes." };
  if (!redis) return { ok: false, erreur: "Stockage (Upstash) non configuré." };

  try {
    const reponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    if (!reponse.ok) return { ok: false, erreur: "Échange du code refusé par Twitch." };
    const data = await reponse.json();

    // Récupère l'identifiant de la chaîne (broadcaster_id) associée à ce token
    const reponseUser = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-Id": clientId,
        Authorization: `Bearer ${data.access_token}`,
      },
    });
    const dataUser = await reponseUser.json();
    const broadcasterId = dataUser?.data?.[0]?.id;
    if (!broadcasterId) return { ok: false, erreur: "Impossible de récupérer le compte Twitch." };

    const oauth: TwitchOAuth = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expire_le: Date.now() + (data.expires_in - 120) * 1000,
      broadcaster_id: broadcasterId,
    };
    await redis.set(CLE_OAUTH, oauth);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de la connexion à Twitch." };
  }
}

async function rafraichirToken(oauth: TwitchOAuth): Promise<TwitchOAuth | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const reponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: oauth.refresh_token,
      }),
    });
    if (!reponse.ok) return null;
    const data = await reponse.json();

    const nouveau: TwitchOAuth = {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? oauth.refresh_token,
      expire_le: Date.now() + (data.expires_in - 120) * 1000,
      broadcaster_id: oauth.broadcaster_id,
    };

    const redis = obtenirClient();
    if (redis) await redis.set(CLE_OAUTH, nouveau);
    return nouveau;
  } catch {
    return null;
  }
}

export async function estConnecteeATwitch(): Promise<boolean> {
  const redis = obtenirClient();
  if (!redis) return false;
  const oauth = await redis.get<TwitchOAuth>(CLE_OAUTH);
  return Boolean(oauth);
}

export async function obtenirNombreFollowers(): Promise<number | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const redis = obtenirClient();
  if (!clientId || !redis) return null;

  let oauth = await redis.get<TwitchOAuth>(CLE_OAUTH);
  if (!oauth) return null;

  if (oauth.expire_le < Date.now()) {
    const rafraichi = await rafraichirToken(oauth);
    if (!rafraichi) return null;
    oauth = rafraichi;
  }

  try {
    const reponse = await fetch(
      `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${oauth.broadcaster_id}&first=1`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${oauth.access_token}`,
        },
        cache: "no-store",
      }
    );
    if (!reponse.ok) return null;
    const data = await reponse.json();
    return typeof data.total === "number" ? data.total : null;
  } catch {
    return null;
  }
}
