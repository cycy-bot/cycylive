// Démarre une partie de la borne d'arcade : renvoie un jeton signé (heure de départ).
import { NextRequest, NextResponse } from "next/server";
import { creerJeton, limiteIp } from "@/lib/arcadeStore";
import { estJeuArcade } from "@/lib/arcadeRegles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function ipDe(request: NextRequest): string {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "inconnue";
}

export async function POST(request: NextRequest) {
  if (!(await limiteIp(ipDe(request), "partie", 400))) {
    return NextResponse.json({ ok: false, erreur: "Beaucoup de parties d'un coup ! Réessaie dans un moment." }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const jeu = estJeuArcade(body?.jeu) ? body.jeu : "runner";
  return NextResponse.json({ ok: true, jeton: creerJeton(jeu) }, { headers: { "Cache-Control": "no-store" } });
}
