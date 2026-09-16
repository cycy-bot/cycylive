import { NextRequest, NextResponse } from "next/server";
import { urlAutorisationTwitch } from "@/lib/twitchOAuth";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/twitch-callback`;

  const url = urlAutorisationTwitch(redirectUri);
  if (!url) {
    return NextResponse.json(
      { erreur: "TWITCH_CLIENT_ID n'est pas configuré." },
      { status: 500 }
    );
  }

  return NextResponse.redirect(url);
}
