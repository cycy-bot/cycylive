// ============================================================
// API — lecture et sauvegarde du planning
// ============================================================
// GET  : renvoie le planning actuel (public, utilisé par le site
//        et par la page /admin pour afficher les valeurs actuelles).
// POST : enregistre un nouveau planning. Protégé par un mot de
//        passe simple (variable d'environnement ADMIN_PASSWORD).

import { NextRequest, NextResponse } from "next/server";
import { lirePlanning, ecrirePlanning } from "@/lib/planningStore";
import { JourPlanning } from "@/data/planning";

export const dynamic = "force-dynamic";

export async function GET() {
  const planning = await lirePlanning();
  return NextResponse.json({ planning });
}

export async function POST(request: NextRequest) {
  const motDePasseAttendu = process.env.ADMIN_PASSWORD;

  if (!motDePasseAttendu) {
    return NextResponse.json(
      {
        ok: false,
        erreur:
          "ADMIN_PASSWORD n'est pas configuré sur le serveur. Ajoute cette variable d'environnement (voir README) avant d'utiliser /admin.",
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

  const planning = body.planning as JourPlanning[] | undefined;
  if (!Array.isArray(planning) || planning.length !== 7) {
    return NextResponse.json(
      { ok: false, erreur: "Planning invalide (7 jours attendus)." },
      { status: 400 }
    );
  }

  const resultat = await ecrirePlanning(planning);
  if (!resultat.ok) {
    return NextResponse.json(
      { ok: false, erreur: resultat.erreur },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
