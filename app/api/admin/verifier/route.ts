// Vérifie le mot de passe de /admin à la connexion (mêmes limites anti-robots que les enregistrements).
import { NextRequest, NextResponse } from "next/server";
import { verifierMotDePasse } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const verif = await verifierMotDePasse(request, body?.motDePasse, process.env.ADMIN_PASSWORD);
  if (!verif.ok) return NextResponse.json({ ok: false, erreur: verif.erreur }, { status: verif.status });
  return NextResponse.json({ ok: true });
}
