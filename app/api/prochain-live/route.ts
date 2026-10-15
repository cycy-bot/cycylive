import { NextResponse } from "next/server";
import { lirePlanning } from "@/lib/planningStore";
import { calculerProchainLive } from "@/data/planning";
import { lireCalendrier } from "@/lib/calendrierStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const [planning, calendrier] = await Promise.all([lirePlanning(), lireCalendrier()]);
  const prochainLive = calculerProchainLive(planning, calendrier.exceptions);
  return NextResponse.json({ prochainLive });
}
