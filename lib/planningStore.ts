// ============================================================
// STOCKAGE DU PLANNING — lecture/écriture persistante
// ============================================================
// Utilise Upstash Redis (une petite base de données gratuite) pour
// que le planning modifié via /admin soit vraiment sauvegardé et
// visible par tous les visiteurs du site, pas seulement sur ton
// propre ordinateur.
//
// Tant qu'Upstash n'est pas configuré, ces fonctions se contentent
// d'utiliser le planning par défaut (aucune erreur, mais aucune
// sauvegarde possible non plus) — voir le README, section
// "Interface d'administration du planning".

import { Redis } from "@upstash/redis";
import { JourPlanning, planningParDefaut } from "@/data/planning";

const CLE_PLANNING = "cycylive:planning";

function upstashEstConfigure(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function obtenirClient(): Redis | null {
  if (!upstashEstConfigure()) return null;
  return Redis.fromEnv();
}

export async function lirePlanning(): Promise<JourPlanning[]> {
  const redis = obtenirClient();
  if (!redis) return planningParDefaut;

  try {
    const enregistre = await redis.get<JourPlanning[]>(CLE_PLANNING);
    return enregistre ?? planningParDefaut;
  } catch {
    return planningParDefaut;
  }
}

export async function ecrirePlanning(
  nouveauPlanning: JourPlanning[]
): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) {
    return {
      ok: false,
      erreur:
        "Le stockage (Upstash) n'est pas encore connecté à ce projet. Suis les étapes du README avant de pouvoir sauvegarder.",
    };
  }

  try {
    await redis.set(CLE_PLANNING, nouveauPlanning);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
