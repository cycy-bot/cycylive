import { NextRequest, NextResponse } from "next/server";
import { verifierMotDePasse } from "@/lib/adminAuth";
import { lireTimeline, ecrireTimeline } from "@/lib/timelineStore";
import { EtapeTimeline } from "@/data/timeline";

export const dynamic = "force-dynamic";

// Les liens TikTok courts (vm.tiktok.com/…) ne contiennent pas le numéro de
// la vidéo : on suit la redirection pour garder le lien complet (lisible sur le site).
async function lienComplet(lien: string): Promise<string> {
  try {
    const u = new URL(lien);
    const court = /^(vm|vt)\.tiktok\.com$/i.test(u.hostname) || (/^(www\.)?tiktok\.com$/i.test(u.hostname) && u.pathname.startsWith("/t/"));
    if (!court) return lien;
    const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(5000), headers: { "User-Agent": "Mozilla/5.0" } });
    const fin = new URL(r.url);
    if (/(^|\.)tiktok\.com$/.test(fin.hostname) && /\/video\/\d+/.test(fin.pathname)) return fin.origin + fin.pathname;
  } catch {
    /* lien gardé tel quel */
  }
  return lien;
}

export async function GET() {
  const timeline = await lireTimeline();
  return NextResponse.json({ timeline });
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

  const timeline = body.timeline as EtapeTimeline[] | undefined;
  if (!Array.isArray(timeline)) {
    return NextResponse.json({ ok: false, erreur: "Timeline invalide." }, { status: 400 });
  }

  for (const e of timeline) {
    if (!e.date || !e.titre) {
      return NextResponse.json(
        { ok: false, erreur: "Chaque étape doit avoir au moins une date et un titre." },
        { status: 400 }
      );
    }
  }

  for (const e of timeline) {
    const lien = typeof e.lien === "string" ? e.lien.trim() : "";
    if (!lien) {
      delete e.lien;
      continue;
    }
    if (!/^https?:\/\//i.test(lien) || lien.length > 500) {
      return NextResponse.json({ ok: false, erreur: `Le lien de « ${e.titre} » n'est pas valide (il doit commencer par https://).` }, { status: 400 });
    }
    e.lien = await lienComplet(lien);
  }

  const resultat = await ecrireTimeline(timeline);
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
