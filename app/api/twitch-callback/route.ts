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

  const state = url.searchParams.get("state");
  const attendu = request.cookies.get("cycylive_twitch_state")?.value;
  if (!code || !state || !attendu || state !== attendu) {
    return NextResponse.redirect(`${origin}/admin?twitch=erreur`);
  }

  const redirectUri = `${origin}/api/twitch-callback`;
  const resultat = await echangerCodeContreToken(code, redirectUri);

  const reponse = NextResponse.redirect(`${origin}/admin?twitch=${resultat.ok ? "connecte" : "erreur"}`);
  reponse.cookies.set("cycylive_twitch_state", "", { path: "/api/twitch-callback", maxAge: 0 });
  if (!resultat.ok) console.error("Connexion Twitch :", resultat.erreur ?? "erreur inconnue");
  return reponse;
}
