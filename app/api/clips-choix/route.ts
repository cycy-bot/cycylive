// Clips Twitch du site : GET public (CycyBot y lit les clips déjà triés), POST depuis l'admin.
import { NextRequest, NextResponse } from "next/server";
import { verifierMotDePasse } from "@/lib/adminAuth";
import { lireChoixClips, ecrireChoixClips, nettoyerChoixClips } from "@/lib/clipsChoixStore";
import { derniersClipsTwitch } from "@/lib/clipsTwitch";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const choix = await lireChoixClips();
  // ?recents=1 : l'admin veut aussi la liste des clips récents à trier
  const recents = new URL(request.url).searchParams.get("recents") === "1" ? await derniersClipsTwitch(40).catch(() => []) : undefined;
  return NextResponse.json({ ...choix, ...(recents ? { recents } : {}) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.motDePasse !== "string") return NextResponse.json({ ok: false, erreur: "Requête invalide." }, { status: 400 });
  const verif = await verifierMotDePasse(request, body.motDePasse, process.env.ADMIN_PASSWORD);
  if (!verif.ok) return NextResponse.json({ ok: false, erreur: verif.erreur }, { status: verif.status });
  const choix = nettoyerChoixClips(body.choix);
  if (!choix) return NextResponse.json({ ok: false, erreur: "Données invalides." }, { status: 400 });
  const r = await ecrireChoixClips(choix);
  if (!r.ok) return NextResponse.json({ ok: false, erreur: r.erreur }, { status: 500 });
  return NextResponse.json({ ok: true });
}
