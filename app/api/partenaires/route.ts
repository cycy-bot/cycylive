import { NextRequest, NextResponse } from "next/server";
import { lirePartenaires, ecrirePartenaires } from "@/lib/partnersStore";
import { Partenaire } from "@/data/partners";

export const dynamic = "force-dynamic";

export async function GET() {
  const partenaires = await lirePartenaires();
  return NextResponse.json({ partenaires });
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

  const partenaires = body.partenaires as Partenaire[] | undefined;
  if (!Array.isArray(partenaires)) {
    return NextResponse.json({ ok: false, erreur: "Données invalides." }, { status: 400 });
  }
  for (const p of partenaires) {
    if (!p.nom || !p.url) {
      return NextResponse.json(
        { ok: false, erreur: "Chaque partenaire doit avoir un nom et un lien." },
        { status: 400 }
      );
    }
  }

  const resultat = await ecrirePartenaires(partenaires);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
