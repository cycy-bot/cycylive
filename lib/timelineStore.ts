// ============================================================
// STOCKAGE DE LA TIMELINE — lecture/écriture persistante
// ============================================================
// Même principe que les autres stores (planning, contenus, textes).

import { Redis } from "@upstash/redis";
import { EtapeTimeline, timelineParDefaut } from "@/data/timeline";

const CLE_TIMELINE = "cycylive:timeline";

function obtenirClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

export async function lireTimeline(): Promise<EtapeTimeline[]> {
  const redis = obtenirClient();
  if (!redis) return timelineParDefaut;

  try {
    const enregistre = await redis.get<EtapeTimeline[]>(CLE_TIMELINE);
    return enregistre ?? timelineParDefaut;
  } catch {
    return timelineParDefaut;
  }
}

export async function ecrireTimeline(
  nouvelleTimeline: EtapeTimeline[]
): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) {
    return {
      ok: false,
      erreur: "Le stockage (Upstash) n'est pas encore connecté à ce projet.",
    };
  }

  try {
    await redis.set(CLE_TIMELINE, nouvelleTimeline);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
