// Stockage du calendrier (exceptions au planning + événements) dans Upstash Redis.
import { Redis } from "@upstash/redis";
import { calendrierVide, type DonneesCalendrier } from "@/data/calendrier";

const CLE = "cycylive:calendrier";

function client(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return Redis.fromEnv();
}

export async function lireCalendrier(): Promise<DonneesCalendrier> {
  const redis = client();
  if (!redis) return calendrierVide;
  try {
    const d = await redis.get<DonneesCalendrier>(CLE);
    return { exceptions: d?.exceptions ?? {}, evenements: Array.isArray(d?.evenements) ? d.evenements : [] };
  } catch {
    return calendrierVide;
  }
}

/** Comme lireCalendrier, mais dit si la lecture a vraiment réussi (CycyBot ne supprime rien sinon). */
export async function lireCalendrierSur(): Promise<{ ok: boolean; donnees: DonneesCalendrier }> {
  const redis = client();
  if (!redis) return { ok: false, donnees: calendrierVide };
  try {
    const d = await redis.get<DonneesCalendrier>(CLE);
    return { ok: true, donnees: { exceptions: d?.exceptions ?? {}, evenements: Array.isArray(d?.evenements) ? d.evenements : [] } };
  } catch {
    return { ok: false, donnees: calendrierVide };
  }
}

export async function ecrireCalendrier(d: DonneesCalendrier): Promise<{ ok: boolean; erreur?: string }> {
  const redis = client();
  if (!redis) return { ok: false, erreur: "Le stockage (Upstash) n'est pas connecté à ce projet." };
  try {
    await redis.set(CLE, d);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
