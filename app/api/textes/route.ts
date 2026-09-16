import { NextRequest, NextResponse } from "next/server";
import { lireTextes, ecrireTextes } from "@/lib/textesStore";
import { Textes } from "@/data/textes";

export const dynamic = "force-dynamic";

export async function GET() {
  const textes = await lireTextes();
  return NextResponse.json({ textes });
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

  const textes = body.textes as Textes | undefined;
  if (!textes || typeof textes !== "object") {
    return NextResponse.json(
      { ok: false, erreur: "Textes invalides." },
      { status: 400 }
    );
  }

  const resultat = await ecrireTextes(textes);
  if (!resultat.ok) {
    return NextResponse.json(
      { ok: false, erreur: resultat.erreur },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
