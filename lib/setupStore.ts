// ============================================================
// STOCKAGE DU SETUP — lecture/écriture persistante
// ============================================================
import { Redis } from "@upstash/redis";
import { setupParDefaut, type DonneesSetup } from "@/data/setup";

const CLE_SETUP = "cycylive:setup";

function obtenirClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return Redis.fromEnv();
}

export async function lireSetup(): Promise<DonneesSetup> {
  const redis = obtenirClient();
  if (!redis) return setupParDefaut;
  try {
    const d = await redis.get<DonneesSetup>(CLE_SETUP);
    return d && Array.isArray(d.groupes) ? { ...setupParDefaut, ...d } : setupParDefaut;
  } catch {
    return setupParDefaut;
  }
}

export async function ecrireSetup(d: DonneesSetup): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) return { ok: false, erreur: "Le stockage (Upstash) n'est pas encore connecté à ce projet." };
  try {
    await redis.set(CLE_SETUP, d);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
