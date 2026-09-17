// ============================================================
// STOCKAGE DES SECTIONS "À PROPOS" — lecture/écriture persistante
// ============================================================
// Même principe que les autres stores.

import { Redis } from "@upstash/redis";
import { SectionAPropos, sectionsAProposParDefaut } from "@/data/aproposSections";

const CLE_SECTIONS = "cycylive:apropos-sections";

function obtenirClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

export async function lireSectionsAPropos(): Promise<SectionAPropos[]> {
  const redis = obtenirClient();
  if (!redis) return sectionsAProposParDefaut;

  try {
    const enregistre = await redis.get<SectionAPropos[]>(CLE_SECTIONS);
    return enregistre ?? sectionsAProposParDefaut;
  } catch {
    return sectionsAProposParDefaut;
  }
}

export async function ecrireSectionsAPropos(
  nouvellesSections: SectionAPropos[]
): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) {
    return {
      ok: false,
      erreur: "Le stockage (Upstash) n'est pas encore connecté à ce projet.",
    };
  }

  try {
    await redis.set(CLE_SECTIONS, nouvellesSections);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
