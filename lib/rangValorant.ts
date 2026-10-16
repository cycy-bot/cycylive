// Rank Valorant de Cycy, affiché sur /gaming.
// Sources, dans l'ordre : l'API HenrikDev (si elle répond), puis la commande !rank
// de Cycy_Bot (même rank que dans le chat Twitch), puis le rank saisi dans l'admin.
import { obtenirRankValorant } from "@/lib/henrikApi";
import { lireCycyBot } from "@/lib/cycybot";

export type Palier = { cle: string; fr: string; couleur: string; clair: string };

export const PALIERS: Palier[] = [
  { cle: "Iron", fr: "Fer", couleur: "#6b6b75", clair: "#b9b9c4" },
  { cle: "Bronze", fr: "Bronze", couleur: "#a2652f", clair: "#f2b77c" },
  { cle: "Silver", fr: "Argent", couleur: "#8a97a8", clair: "#e6edf5" },
  { cle: "Gold", fr: "Or", couleur: "#c99a2e", clair: "#ffe08a" },
  { cle: "Platinum", fr: "Platine", couleur: "#2b9aa8", clair: "#8ff0f5" },
  { cle: "Diamond", fr: "Diamant", couleur: "#8a5bd6", clair: "#e2c7ff" },
  { cle: "Ascendant", fr: "Ascendant", couleur: "#1f9d5c", clair: "#8dffbe" },
  { cle: "Immortal", fr: "Immortel", couleur: "#b8314a", clair: "#ff9aa9" },
  { cle: "Radiant", fr: "Radiant", couleur: "#d9a520", clair: "#fff3b0" },
];

export type Rang = {
  palier: Palier;
  division: number | null; // 1 à 3 (null pour Radiant)
  rr: number | null;
  libelle: string; // « Ascendant 2 »
  source: "henrik" | "bot" | "manuel";
};

const NOMS = PALIERS.flatMap((p, i) => [[p.cle, i], [p.fr, i]] as [string, number][]).concat([["Immortel", 7], ["Immortal", 7], ["Plat", 4], ["Diam", 5], ["Asc", 6], ["Immo", 7]]);

/** « Ascendant 2 », « Immortel 1 - 45RR », « Diamant » → Rang (sans source). */
export function lireRang(texte: string | null | undefined): Omit<Rang, "source"> | null {
  const t = String(texte || "");
  for (const [nom, i] of NOMS.sort((a, b) => b[0].length - a[0].length)) {
    const m = t.match(new RegExp(`\\b${nom}\\b\\s*(\\d)?`, "i"));
    if (!m) continue;
    const palier = PALIERS[i];
    const division = palier.cle === "Radiant" ? null : m[1] ? Number(m[1]) : null;
    const rr = t.match(/(\d{1,4})\s*RR\b/i);
    return { palier, division, rr: rr ? Number(rr[1]) : null, libelle: [palier.fr, division].filter(Boolean).join(" ") };
  }
  return null;
}

/** Position sur l'échelle (Fer 1 = 0 … Radiant = 24), pour mesurer l'écart avec l'objectif. */
export function positionRang(r: Pick<Rang, "palier" | "division">): number {
  const i = PALIERS.indexOf(r.palier);
  if (r.palier.cle === "Radiant") return 24;
  return i * 3 + ((r.division || 1) - 1);
}

export async function rangActuel(riotName: string, riotTag: string, riotRegion: string, rankManuel: string): Promise<Rang | null> {
  const henrik = await obtenirRankValorant(riotName, riotTag, riotRegion).catch(() => null);
  if (henrik) {
    const r = lireRang(henrik.rank);
    if (r) return { ...r, rr: henrik.rr ?? r.rr, source: "henrik" };
  }
  const bot = await lireCycyBot().catch(() => null);
  const rb = bot?.valorant?.rank;
  if (rb?.label) {
    const r = lireRang(`${rb.label}${rb.rr != null ? ` ${rb.rr}RR` : ""}`);
    if (r) return { ...r, source: "bot" };
  }
  const m = lireRang(rankManuel);
  return m ? { ...m, source: "manuel" } : null;
}
