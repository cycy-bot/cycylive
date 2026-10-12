import { NextRequest, NextResponse } from "next/server";
import { enregistrerImage } from "@/lib/imagesStore";

export const dynamic = "force-dynamic";

// Envoi d'une image depuis /admin (protégé par le mot de passe admin)
export async function POST(request: NextRequest) {
  const motDePasseAttendu = process.env.ADMIN_PASSWORD;
  if (!motDePasseAttendu) {
    return NextResponse.json({ ok: false, erreur: "ADMIN_PASSWORD n'est pas configuré sur le serveur." }, { status: 500 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.motDePasse !== "string" || typeof body.image !== "string") {
    return NextResponse.json({ ok: false, erreur: "Requête invalide." }, { status: 400 });
  }
  if (body.motDePasse !== motDePasseAttendu) {
    return NextResponse.json({ ok: false, erreur: "Mot de passe incorrect." }, { status: 401 });
  }
  const resultat = await enregistrerImage(body.image);
  return NextResponse.json(resultat, { status: resultat.ok ? 200 : 400 });
}
