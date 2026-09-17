import { NextRequest, NextResponse } from "next/server";
import { lireProfilValorant, ecrireProfilValorant } from "@/lib/valorantStore";
import { ProfilValorant } from "@/data/valorant";

export const dynamic = "force-dynamic";

export async function GET() {
  const profil = await lireProfilValorant();
  return NextResponse.json({ profil });
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

  const profil = body.profil as ProfilValorant | undefined;
  if (!profil || typeof profil !== "object") {
    return NextResponse.json({ ok: false, erreur: "Profil invalide." }, { status: 400 });
  }

  const resultat = await ecrireProfilValorant(profil);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
