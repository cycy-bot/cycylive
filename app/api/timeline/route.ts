import { NextRequest, NextResponse } from "next/server";
import { lireTimeline, ecrireTimeline } from "@/lib/timelineStore";
import { EtapeTimeline } from "@/data/timeline";

export const dynamic = "force-dynamic";

export async function GET() {
  const timeline = await lireTimeline();
  return NextResponse.json({ timeline });
}

export async function POST(request: NextRequest) {
  const motDePasseAttendu = process.env.ADMIN_PASSWORD;

  if (!motDePasseAttendu) {
    return NextResponse.json(
      { ok: false, erreur: "ADMIN_PASSWORD n'est pas configuré sur le serveur." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.motDePasse !== "string") {
    return NextResponse.json({ ok: false, erreur: "Requête invalide." }, { status: 400 });
  }

  if (body.motDePasse !== motDePasseAttendu) {
    return NextResponse.json({ ok: false, erreur: "Mot de passe incorrect." }, { status: 401 });
  }

  const timeline = body.timeline as EtapeTimeline[] | undefined;
  if (!Array.isArray(timeline)) {
    return NextResponse.json({ ok: false, erreur: "Timeline invalide." }, { status: 400 });
  }

  for (const e of timeline) {
    if (!e.date || !e.titre) {
      return NextResponse.json(
        { ok: false, erreur: "Chaque étape doit avoir au moins une date et un titre." },
        { status: 400 }
      );
    }
  }

  const resultat = await ecrireTimeline(timeline);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
