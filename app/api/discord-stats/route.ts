import { NextResponse } from "next/server";
import { obtenirMembresDiscordEnLigne } from "@/lib/discordStats";

export const dynamic = "force-dynamic";

export async function GET() {
  const enLigne = await obtenirMembresDiscordEnLigne();
  return NextResponse.json({ enLigne });
}
