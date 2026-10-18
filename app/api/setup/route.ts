import { NextRequest, NextResponse } from "next/server";
import { verifierMotDePasse } from "@/lib/adminAuth";
import { lireSetup, ecrireSetup } from "@/lib/setupStore";
import type { DonneesSetup, GroupeSetup, ItemSetup, TypeMateriel } from "@/data/setup";
import { TYPES_MATERIEL } from "@/components/setup/IconesSetup";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ setup: await lireSetup() });
}

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const id = (v: unknown) => (typeof v === "string" && /^[\w-]{1,40}$/.test(v) ? v : Math.random().toString(36).slice(2, 10));

class Invalide extends Error {}

function nettoyer(d: Partial<DonneesSetup>): DonneesSetup {
  if (!Array.isArray(d.groupes) || d.groupes.length > 8) throw new Invalide("Données invalides.");
  const groupes: GroupeSetup[] = d.groupes.map((g) => {
    const titre = texte(g?.titre, 60);
    if (!titre) throw new Invalide("Chaque groupe doit avoir un titre.");
    if (!Array.isArray(g.items) || g.items.length > 40) throw new Invalide(`Trop d'articles dans « ${titre} » (40 au maximum).`);
    const items: ItemSetup[] = g.items
      .map((it) => {
        const nom = texte(it?.nom, 90);
        if (!nom) return null;
        const lien = texte(it.lien, 600);
        if (lien && !/^https:\/\/[^\s"'<>]+$/i.test(lien)) throw new Invalide(`Le lien de « ${nom} » doit commencer par https://.`);
        const type = (it.type in TYPES_MATERIEL ? it.type : "autre") as TypeMateriel;
        return { id: id(it.id), type, nom, detail: texte(it.detail, 60) || undefined, lien: lien || undefined, vedette: it.vedette === true || undefined };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    return { id: id(g.id), titre, sousTitre: texte(g.sousTitre, 90) || undefined, style: g.style === "fiche" ? "fiche" : "grille", items };
  });
  return { groupes, note: texte(d.note, 400), mentionLiens: texte(d.mentionLiens, 200) };
}

export async function POST(request: NextRequest) {
  const motDePasseAttendu = process.env.ADMIN_PASSWORD;
  if (!motDePasseAttendu) return NextResponse.json({ ok: false, erreur: "ADMIN_PASSWORD n'est pas configuré sur le serveur." }, { status: 500 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.motDePasse !== "string") return NextResponse.json({ ok: false, erreur: "Requête invalide." }, { status: 400 });
  const verif = await verifierMotDePasse(request, body.motDePasse, motDePasseAttendu);
  if (!verif.ok) return NextResponse.json({ ok: false, erreur: verif.erreur }, { status: verif.status });

  let setup: DonneesSetup;
  try {
    setup = nettoyer(body.setup ?? {});
  } catch (e) {
    if (e instanceof Invalide) return NextResponse.json({ ok: false, erreur: e.message }, { status: 400 });
    throw e;
  }
  const r = await ecrireSetup(setup);
  if (!r.ok) return NextResponse.json({ ok: false, erreur: r.erreur }, { status: 500 });
  return NextResponse.json({ ok: true });
}
