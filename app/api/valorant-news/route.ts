import { NextRequest, NextResponse } from "next/server";
import { lireNewsValorant, ecrireNewsValorant } from "@/lib/valorantStore";
import { NewsValorant } from "@/data/valorant";

export const dynamic = "force-dynamic";

export async function GET() {
  const news = await lireNewsValorant();
  return NextResponse.json({ news });
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

  const news = body.news as NewsValorant[] | undefined;
  if (!Array.isArray(news)) {
    return NextResponse.json({ ok: false, erreur: "News invalides." }, { status: 400 });
  }
  for (const n of news) {
    if (!n.titre || !n.url) {
      return NextResponse.json(
        { ok: false, erreur: "Chaque news doit avoir un titre et un lien." },
        { status: 400 }
      );
    }
  }

  const resultat = await ecrireNewsValorant(news);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
