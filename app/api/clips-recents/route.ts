// Clips Twitch récents de la chaîne (données publiques) : sert au générateur de contenus de l'admin.
import { NextResponse } from "next/server";
import { derniersClipsTwitch } from "@/lib/clipsTwitch";

export const revalidate = 600;

export async function GET() {
  const clips = await derniersClipsTwitch(24).catch(() => []);
  return NextResponse.json({ clips });
}
