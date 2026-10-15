// Classement de la borne d'arcade : lecture (GET) et enregistrement d'un record (POST).
import { NextRequest, NextResponse } from "next/server";
import { lireClassement, enregistrerScore, limiteIp } from "@/lib/arcadeStore";
import { verifierPseudo, estJeuArcade, ARCADE } from "@/lib/arcadeRegles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function ipDe(request: NextRequest): string {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "inconnue";
}

export async function GET(request: NextRequest) {
  try {
    const j = request.nextUrl.searchParams.get("jeu");
    const scores = await lireClassement(ARCADE.tailleClassement, estJeuArcade(j) ? j : "runner");
    return NextResponse.json({ ok: true, actif: scores !== null, scores: scores ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, actif: true, scores: [], erreur: "Classement indisponible pour le moment." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, erreur: "Requête invalide." }, { status: 400 });
  if (body.site) return NextResponse.json({ ok: true, score: 0, meilleur: 0, nouveauRecord: false, rang: null }); // champ piège anti-robots

  const pseudo = verifierPseudo(body.pseudo);
  if (!pseudo.ok) return NextResponse.json({ ok: false, erreur: pseudo.erreur }, { status: 400 });

  if (!(await limiteIp(ipDe(request), "score", 60))) {
    return NextResponse.json({ ok: false, erreur: "Trop d'enregistrements d'un coup : réessaie dans un moment." }, { status: 429 });
  }

  try {
    const r = await enregistrerScore(body.jeton, body.score, pseudo.pseudo, pseudo.cle, estJeuArcade(body.jeu) ? body.jeu : "runner");
    if (!r.ok) return NextResponse.json({ ok: false, erreur: r.erreur }, { status: r.status });
    return NextResponse.json(r);
  } catch {
    return NextResponse.json({ ok: false, erreur: "Enregistrement impossible pour le moment, réessaie." }, { status: 500 });
  }
}
