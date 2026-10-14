// Administration de la borne d'arcade (protégée par ADMIN_PASSWORD).
import { NextRequest, NextResponse } from "next/server";
import { verifierMotDePasse } from "@/lib/adminAuth";
import { classementAdmin, supprimerPseudo, reinitialiserClassement } from "@/lib/arcadeStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const attendu = process.env.ADMIN_PASSWORD;
  if (!attendu) return NextResponse.json({ ok: false, erreur: "ADMIN_PASSWORD n'est pas configuré sur le serveur." }, { status: 500 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.motDePasse !== "string") return NextResponse.json({ ok: false, erreur: "Requête invalide." }, { status: 400 });
  const verif = await verifierMotDePasse(request, body.motDePasse, attendu);
  if (!verif.ok) return NextResponse.json({ ok: false, erreur: verif.erreur }, { status: verif.status });

  try {
    if (body.action === "supprimer") {
      if (typeof body.cle !== "string" || !body.cle) return NextResponse.json({ ok: false, erreur: "Pseudo manquant." }, { status: 400 });
      await supprimerPseudo(body.cle);
    } else if (body.action === "reinitialiser") {
      await reinitialiserClassement();
    } else if (body.action !== "lister") {
      return NextResponse.json({ ok: false, erreur: "Action inconnue." }, { status: 400 });
    }
    const scores = await classementAdmin();
    if (scores === null) return NextResponse.json({ ok: false, erreur: "Le stockage (Upstash) n'est pas connecté." }, { status: 503 });
    return NextResponse.json({ ok: true, scores });
  } catch {
    return NextResponse.json({ ok: false, erreur: "Erreur inattendue." }, { status: 500 });
  }
}
