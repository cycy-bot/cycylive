// ============================================================
// STOCKAGE DES CONTENUS — lecture/écriture persistante
// ============================================================
// Même principe que lib/planningStore.ts : utilise la base Upstash
// déjà connectée pour le planning, avec une clé différente.

import { Redis } from "@upstash/redis";
import { Contenu, contenusParDefaut } from "@/data/contenus";

const CLE_CONTENUS = "cycylive:contenus";

function upstashEstConfigure(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function obtenirClient(): Redis | null {
  if (!upstashEstConfigure()) return null;
  return Redis.fromEnv();
}

export async function lireContenus(): Promise<Contenu[]> {
  const redis = obtenirClient();
  if (!redis) return contenusParDefaut;

  try {
    const enregistre = await redis.get<Contenu[]>(CLE_CONTENUS);
    return enregistre ?? contenusParDefaut;
  } catch {
    return contenusParDefaut;
  }
}

export async function ecrireContenus(
  nouveauxContenus: Contenu[]
): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) {
    return {
      ok: false,
      erreur:
        "Le stockage (Upstash) n'est pas encore connecté à ce projet. Configure-le d'abord (voir README).",
    };
  }

  try {
    await redis.set(CLE_CONTENUS, nouveauxContenus);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
