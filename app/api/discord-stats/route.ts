import { NextResponse } from "next/server";
import { obtenirStatsDiscord } from "@/lib/discordStats";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await obtenirStatsDiscord();
  return NextResponse.json(stats);
}
