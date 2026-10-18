import { NextRequest, NextResponse } from "next/server";
import { verifierMotDePasse } from "@/lib/adminAuth";
import { lireTimeline, ecrireTimeline, lireReglagesTimeline, ecrireReglagesTimeline } from "@/lib/timelineStore";
import { EtapeTimeline, ReglagesTimeline, reglagesTimelineParDefaut } from "@/data/timeline";
import { CATEGORIES, ICONES_TIMELINE } from "@/lib/timelineDesign";
import { liensEtape } from "@/lib/videoMoment";

export const dynamic = "force-dynamic";

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function nettoyerReglages(r: Partial<ReglagesTimeline> | undefined): ReglagesTimeline {
  const d = reglagesTimelineParDefaut;
  const n = Math.round(Number(r?.apercuAccueil));
  return {
    titre: texte(r?.titre, 120) || d.titre,
    intro: texte(r?.intro, 600),
    ordre: r?.ordre === "recent" ? "recent" : "chronologique",
    filtres: r?.filtres !== false,
    apercuAccueil: Number.isFinite(n) ? Math.max(0, Math.min(6, n)) : d.apercuAccueil,
    fin: texte(r?.fin ?? d.fin, 120),
  };
}

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
  const [timeline, reglages] = await Promise.all([lireTimeline(), lireReglagesTimeline()]);
  return NextResponse.json({ timeline, reglages });
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
    // Champs de mise en forme : valeurs connues uniquement
    if (e.categorie && !(e.categorie in CATEGORIES)) delete e.categorie;
    if (e.icone && !ICONES_TIMELINE.includes(e.icone as (typeof ICONES_TIMELINE)[number])) delete e.icone;
    e.chiffre = texte(e.chiffre, 40) || undefined;
    e.marquant = e.marquant === true || undefined;
    e.masque = e.masque === true || undefined;
    const image = texte(e.image, 500);
    if (image && !/^https:\/\//i.test(image)) {
      return NextResponse.json({ ok: false, erreur: `L'image de « ${e.titre} » doit être un lien qui commence par https://.` }, { status: 400 });
    }
    e.image = image || undefined;
    const liens = liensEtape(e);
    delete e.lien;
    if (!liens.length) {
      delete e.liens;
      continue;
    }
    for (const lien of liens) {
      if (!/^https?:\/\//i.test(lien) || lien.length > 500) {
        return NextResponse.json({ ok: false, erreur: `Un lien de « ${e.titre} » n'est pas valide (il doit commencer par https://).` }, { status: 400 });
      }
    }
    e.liens = await Promise.all(liens.map(lienComplet));
  }

  const resultat = await ecrireTimeline(timeline);
  if (resultat.ok && body.reglages && typeof body.reglages === "object") {
    const r = await ecrireReglagesTimeline(nettoyerReglages(body.reglages));
    if (!r.ok) return NextResponse.json({ ok: false, erreur: r.erreur }, { status: 500 });
  }
  if (!resultat.ok) {
    return NextResponse.json({ ok: false, erreur: resultat.erreur }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
