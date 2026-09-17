import { NextRequest, NextResponse } from "next/server";
import { lireGaming, ecrireGaming, type DonneesGaming } from "@/lib/gamingStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const gaming = await lireGaming();
  return NextResponse.json({ gaming });
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

  const gaming = body.gaming as DonneesGaming | undefined;
  if (!gaming || !Array.isArray(gaming.autresJeux) || !Array.isArray(gaming.jeuxDuMoment)) {
    return NextResponse.json({ ok: false, erreur: "Données invalides." }, { status: 400 });
  }

  const resultat = await ecrireGaming(gaming);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
