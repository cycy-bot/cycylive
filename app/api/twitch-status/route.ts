// ============================================================
// API — statut Twitch en direct
// ============================================================
// Cette route interroge l'API officielle de Twitch (Helix) pour
// savoir si la chaîne est actuellement en live. Elle a besoin de
// deux variables d'environnement (voir README) :
//   TWITCH_CLIENT_ID
//   TWITCH_CLIENT_SECRET
// et optionnellement :
//   TWITCH_CHANNEL_LOGIN  (par défaut : "cycylive")
//
// Tant que ces variables ne sont pas configurées, cette route
// répond simplement "hors ligne" sans planter le site.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let tokenEnCache: { token: string; expireLe: number } | null = null;

async function obtenirToken(
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  if (tokenEnCache && tokenEnCache.expireLe > Date.now()) {
    return tokenEnCache.token;
  }

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
  tokenEnCache = {
    token: data.access_token,
    expireLe: Date.now() + (data.expires_in - 60) * 1000,
  };
  return tokenEnCache.token;
}

export async function GET() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const channelLogin = process.env.TWITCH_CHANNEL_LOGIN || "cycylive";

  if (!clientId || !clientSecret) {
    // Clés Twitch pas encore configurées : on répond "hors ligne"
    // proprement, sans erreur, en attendant la configuration.
    return NextResponse.json({ enLigne: false, configure: false });
  }

  try {
    let token = await obtenirToken(clientId, clientSecret);
    if (!token) {
      return NextResponse.json({ enLigne: false, configure: true });
    }

    let reponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(
        channelLogin
      )}`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    // Si le token s'avère invalide/expiré (401), on force un renouvellement
    // et on retente une fois avant de conclure quoi que ce soit.
    if (reponse.status === 401) {
      tokenEnCache = null;
      token = await obtenirToken(clientId, clientSecret);
      if (!token) {
        return NextResponse.json({ enLigne: false, configure: true });
      }
      reponse = await fetch(
        `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(
          channelLogin
        )}`,
        {
          headers: {
            "Client-Id": clientId,
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );
    }

    const data = await reponse.json();
    const stream = data?.data?.[0];

    if (!stream) {
      return NextResponse.json({ enLigne: false, configure: true });
    }

    return NextResponse.json({
      enLigne: true,
      configure: true,
      titre: stream.title,
      categorie: stream.game_name,
      viewers: stream.viewer_count,
      debutLe: stream.started_at,
      miniature: stream.thumbnail_url
        ?.replace("{width}", "440")
        .replace("{height}", "248"),
    });
  } catch {
    // Toute erreur (réseau, API Twitch indisponible, réponse malformée...)
    // retombe systématiquement sur "hors ligne" : on n'affiche jamais
    // un faux "EN LIVE".
    return NextResponse.json({ enLigne: false, configure: true });
  }
}
