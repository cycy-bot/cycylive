// ============================================================
// API — calendrier (exceptions au planning + événements)
// ============================================================
// GET  : public (lu par CycyBot toutes les 2 minutes et par /admin).
// POST : enregistre tout le calendrier. Protégé par ADMIN_PASSWORD.

import { NextRequest, NextResponse } from "next/server";
import { verifierMotDePasse } from "@/lib/adminAuth";
import { lireCalendrierSur, ecrireCalendrier } from "@/lib/calendrierStore";
import { lirePlanning } from "@/lib/planningStore";
import { nettoyerCalendrier } from "@/data/calendrier";

export const dynamic = "force-dynamic";

export async function GET() {
  const [lecture, planning] = await Promise.all([lireCalendrierSur(), lirePlanning()]);
  return NextResponse.json({ ok: lecture.ok, ...lecture.donnees, planning }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.motDePasse !== "string") return NextResponse.json({ ok: false, erreur: "Requête invalide." }, { status: 400 });
  const verif = await verifierMotDePasse(request, body.motDePasse, process.env.ADMIN_PASSWORD);
  if (!verif.ok) return NextResponse.json({ ok: false, erreur: verif.erreur }, { status: verif.status });
  const propre = nettoyerCalendrier(body.calendrier);
  if (!propre) return NextResponse.json({ ok: false, erreur: "Calendrier invalide." }, { status: 400 });
  const r = await ecrireCalendrier(propre);
  if (!r.ok) return NextResponse.json({ ok: false, erreur: r.erreur }, { status: 500 });
  return NextResponse.json({ ok: true, calendrier: propre });
}
