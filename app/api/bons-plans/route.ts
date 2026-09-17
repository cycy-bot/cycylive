import { NextRequest, NextResponse } from "next/server";
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
  if (body.motDePasse !== motDePasseAttendu) {
    return NextResponse.json({ ok: false, erreur: "Mot de passe incorrect." }, { status: 401 });
  }

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
  }

  const resultat = await ecrireBonsPlans(bonsPlans);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
