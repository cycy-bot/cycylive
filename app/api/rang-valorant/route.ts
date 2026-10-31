// Rank Valorant actuel de Cycy, en lecture publique (utilisé par la commande !rank de Cycy_Bot sur Twitch).
// Mêmes sources que la page /gaming : HenrikDev, puis Cycy_Bot, puis le rank saisi dans l'admin.
import { NextResponse } from "next/server";
import { lireProfilValorant } from "@/lib/valorantStore";
import { rangActuel } from "@/lib/rangValorant";

export const revalidate = 120;

export async function GET() {
  const p = await lireProfilValorant().catch(() => null);
  const rang = p ? await rangActuel(p.riotName, p.riotTag, p.riotRegion, p.rankActuel).catch(() => null) : null;
  if (!rang) return NextResponse.json({ ok: false, rang: null });
  return NextResponse.json({
    ok: true,
    rang: { libelle: rang.libelle, palier: rang.palier.cle, palierFr: rang.palier.fr, division: rang.division, rr: rang.rr, source: rang.source },
    objectif: p?.objectifRank && p.objectifRank !== "À définir" ? p.objectifRank : "",
  });
}
