import { NextRequest, NextResponse } from "next/server";
import { echangerCodeContreToken } from "@/lib/twitchOAuth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/admin?twitch=erreur`);
  }

  const redirectUri = `${origin}/api/twitch-callback`;
  const resultat = await echangerCodeContreToken(code, redirectUri);

  return NextResponse.redirect(
    `${origin}/admin?twitch=${resultat.ok ? "connecte" : "erreur"}`
  );
}
