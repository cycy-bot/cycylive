import { NextRequest, NextResponse } from "next/server";
import { lireContenus, ecrireContenus } from "@/lib/contenusStore";
import { Contenu } from "@/data/contenus";

export const dynamic = "force-dynamic";

export async function GET() {
  const contenus = await lireContenus();
  return NextResponse.json({ contenus });
}

export async function POST(request: NextRequest) {
  const motDePasseAttendu = process.env.ADMIN_PASSWORD;

  if (!motDePasseAttendu) {
    return NextResponse.json(
      {
        ok: false,
        erreur:
          "ADMIN_PASSWORD n'est pas configuré sur le serveur. Voir README.",
      },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.motDePasse !== "string") {
    return NextResponse.json(
      { ok: false, erreur: "Requête invalide." },
      { status: 400 }
    );
  }

  if (body.motDePasse !== motDePasseAttendu) {
    return NextResponse.json(
      { ok: false, erreur: "Mot de passe incorrect." },
      { status: 401 }
    );
  }

  const contenus = body.contenus as Contenu[] | undefined;
  if (!Array.isArray(contenus)) {
    return NextResponse.json(
      { ok: false, erreur: "Contenus invalides." },
      { status: 400 }
    );
  }

  for (const c of contenus) {
    if (!c.titre || !c.url) {
      return NextResponse.json(
        { ok: false, erreur: "Chaque vidéo doit avoir au moins un titre et un lien." },
        { status: 400 }
      );
    }
  }

  const resultat = await ecrireContenus(contenus);
  if (!resultat.ok) {
    return NextResponse.json(
      { ok: false, erreur: resultat.erreur },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
