import { NextRequest, NextResponse } from "next/server";
import { lireClipsValorant, ecrireClipsValorant } from "@/lib/valorantStore";
import { ClipValorant } from "@/data/valorant";

export const dynamic = "force-dynamic";

export async function GET() {
  const clips = await lireClipsValorant();
  return NextResponse.json({ clips });
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

  const clips = body.clips as ClipValorant[] | undefined;
  if (!Array.isArray(clips)) {
    return NextResponse.json({ ok: false, erreur: "Clips invalides." }, { status: 400 });
  }
  for (const c of clips) {
    if (!c.titre || !c.url) {
      return NextResponse.json(
        { ok: false, erreur: "Chaque clip doit avoir un titre et un lien." },
        { status: 400 }
      );
    }
  }

  const resultat = await ecrireClipsValorant(clips);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
