import { NextRequest, NextResponse } from "next/server";
import { verifierMotDePasse } from "@/lib/adminAuth";
import { lienValide } from "@/lib/imagesStore";
import { lireBonsPlans, ecrireBonsPlans } from "@/lib/partnersStore";
import { BonPlan } from "@/data/deals";

export const dynamic = "force-dynamic";

export async function GET() {
  const bonsPlans = await lireBonsPlans();
  return NextResponse.json({ bonsPlans });
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
  const verif = await verifierMotDePasse(request, body.motDePasse, motDePasseAttendu);
  if (!verif.ok) return NextResponse.json({ ok: false, erreur: verif.erreur }, { status: verif.status });

  const bonsPlans = body.bonsPlans as BonPlan[] | undefined;
  if (!Array.isArray(bonsPlans)) {
    return NextResponse.json({ ok: false, erreur: "Données invalides." }, { status: 400 });
  }
  for (const b of bonsPlans) {
    if (!b.marque || !b.offre) {
      return NextResponse.json(
        { ok: false, erreur: "Chaque bon plan doit avoir une marque et une offre." },
        { status: 400 }
      );
    }
    if (!lienValide(b.url) || !lienValide(b.image, { image: true })) {
      return NextResponse.json({ ok: false, erreur: `${b.marque} : le lien doit commencer par https:// (et l'image aussi, ou être envoyée en fichier).` }, { status: 400 });
    }
  }

  const resultat = await ecrireBonsPlans(bonsPlans);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
