// ============================================================
// API — lecture et sauvegarde du planning
// ============================================================
// GET  : renvoie le planning actuel (public, utilisé par le site
//        et par la page /admin pour afficher les valeurs actuelles).
// POST : enregistre un nouveau planning. Protégé par un mot de
//        passe simple (variable d'environnement ADMIN_PASSWORD).

import { NextRequest, NextResponse } from "next/server";
import { verifierMotDePasse } from "@/lib/adminAuth";
import { lirePlanning, ecrirePlanning } from "@/lib/planningStore";
import { JourPlanning, avecJeux } from "@/data/planning";
import { lireCalendrier } from "@/lib/calendrierStore";

export const dynamic = "force-dynamic";

export async function GET() {
  // « exceptions » : changements date par date (onglet Calendrier), lus aussi par CycyBot
  const [planning, calendrier] = await Promise.all([lirePlanning(), lireCalendrier()]);
  return NextResponse.json({ planning, exceptions: calendrier.exceptions });
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

  const verif = await verifierMotDePasse(request, body.motDePasse, motDePasseAttendu);
  if (!verif.ok) return NextResponse.json({ ok: false, erreur: verif.erreur }, { status: verif.status });

  const planning = body.planning as JourPlanning[] | undefined;
  if (!Array.isArray(planning) || planning.length !== 7) {
    return NextResponse.json(
      { ok: false, erreur: "Planning invalide (7 jours attendus)." },
      { status: 400 }
    );
  }

  // Jusqu'à 3 jeux par soirée ; « jeu » est recalculé pour CycyBot et le compte à rebours
  const propre = planning.map((j) => avecJeux({ jour: String(j?.jour || ""), off: Boolean(j?.off), heure: j?.heure ? String(j.heure).slice(0, 10) : undefined, fin: j?.fin ? String(j.fin).slice(0, 10) : undefined, jeu: j?.jeu ? String(j.jeu).slice(0, 200) : undefined, jeux: Array.isArray(j?.jeux) ? j.jeux.map(String) : undefined, titre: j?.titre ? String(j.titre).slice(0, 80) : undefined, categorie: j?.categorie ? String(j.categorie).slice(0, 20) : undefined }));
  const resultat = await ecrirePlanning(propre);
  if (!resultat.ok) {
    return NextResponse.json(
      { ok: false, erreur: resultat.erreur },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
