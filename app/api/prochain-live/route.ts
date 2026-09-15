import { NextResponse } from "next/server";
import { lirePlanning } from "@/lib/planningStore";
import { calculerProchainLive } from "@/data/planning";

export const dynamic = "force-dynamic";

export async function GET() {
  const planning = await lirePlanning();
  const prochainLive = calculerProchainLive(planning);
  return NextResponse.json({ prochainLive });
}
