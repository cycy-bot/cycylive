import { NextRequest, NextResponse } from "next/server";
import { echangerCodeContreToken } from "@/lib/twitchOAuth";

// Voir la note dans app/api/twitch-connect/route.ts : on reconstruit
// l'origine depuis les en-têtes du proxy, pas depuis request.url.
function obtenirOrigine(request: NextRequest): string {
  const hote = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocole = request.headers.get("x-forwarded-proto") ?? "https";
  return `${protocole}://${hote}`;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = obtenirOrigine(request);

  if (!code) {
    return NextResponse.redirect(`${origin}/admin?twitch=erreur`);
  }

  const redirectUri = `${origin}/api/twitch-callback`;
  const resultat = await echangerCodeContreToken(code, redirectUri);

  if (resultat.ok) {
    return NextResponse.redirect(`${origin}/admin?twitch=connecte`);
  }

  // Détail temporaire dans l'URL pour diagnostiquer facilement (à retirer une fois résolu).
  const detail = encodeURIComponent(resultat.erreur ?? "erreur inconnue");
  return NextResponse.redirect(`${origin}/admin?twitch=erreur&detail=${detail}`);
}
