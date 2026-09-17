import { NextRequest, NextResponse } from "next/server";
import { lireSectionsAPropos, ecrireSectionsAPropos } from "@/lib/aproposSectionsStore";
import { SectionAPropos } from "@/data/aproposSections";

export const dynamic = "force-dynamic";

export async function GET() {
  const sections = await lireSectionsAPropos();
  return NextResponse.json({ sections });
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

  const sections = body.sections as SectionAPropos[] | undefined;
  if (!Array.isArray(sections)) {
    return NextResponse.json({ ok: false, erreur: "Sections invalides." }, { status: 400 });
  }

  for (const s of sections) {
    if (!s.titre) {
      return NextResponse.json(
        { ok: false, erreur: "Chaque section doit avoir un titre." },
        { status: 400 }
      );
    }
  }

  const resultat = await ecrireSectionsAPropos(sections);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
