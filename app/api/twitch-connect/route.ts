import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { urlAutorisationTwitch } from "@/lib/twitchOAuth";

// ⚠️ On ne déduit PAS l'adresse du site depuis request.url : sur
// certains environnements serverless (dont Vercel), cette valeur
// peut refléter une adresse interne ("localhost") plutôt que la
// vraie adresse publique. On reconstruit donc l'origine à partir
// des en-têtes envoyés par le proxy, qui sont fiables.
function obtenirOrigine(request: NextRequest): string {
  const hote = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocole = request.headers.get("x-forwarded-proto") ?? "https";
  return `${protocole}://${hote}`;
}

export async function GET(request: NextRequest) {
  const origin = obtenirOrigine(request);
  const redirectUri = `${origin}/api/twitch-callback`;

  // Jeton anti-falsification : vérifié au retour de Twitch (cookie de 10 min)
  const state = crypto.randomBytes(16).toString("hex");
  const url = urlAutorisationTwitch(redirectUri, state);
  if (!url) {
    return NextResponse.json(
      { erreur: "TWITCH_CLIENT_ID n'est pas configuré." },
      { status: 500 }
    );
  }

  const reponse = NextResponse.redirect(url);
  reponse.cookies.set("cycylive_twitch_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/twitch-callback", maxAge: 600 });
  return reponse;
}
