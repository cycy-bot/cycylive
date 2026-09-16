// ============================================================
// STOCKAGE DES TEXTES — lecture/écriture persistante
// ============================================================
// Même principe que lib/planningStore.ts et lib/contenusStore.ts.

import { Redis } from "@upstash/redis";
import { Textes, textesParDefaut } from "@/data/textes";

const CLE_TEXTES = "cycylive:textes";

function upstashEstConfigure(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function obtenirClient(): Redis | null {
  if (!upstashEstConfigure()) return null;
  return Redis.fromEnv();
}

// Fusionne les valeurs enregistrées avec les valeurs par défaut,
// section par section : si un nouveau champ est ajouté plus tard
// dans data/textes.ts, il garde sa valeur par défaut tant qu'il
// n'a pas été modifié via /admin, au lieu de disparaître.
function fusionner(defaut: Textes, enregistre: Partial<Textes>): Textes {
  const resultat = { ...defaut };
  for (const cle of Object.keys(defaut) as (keyof Textes)[]) {
    resultat[cle] = { ...defaut[cle], ...(enregistre?.[cle] ?? {}) } as any;
  }
  return resultat;
}

export async function lireTextes(): Promise<Textes> {
  const redis = obtenirClient();
  if (!redis) return textesParDefaut;

  try {
    const enregistre = await redis.get<Partial<Textes>>(CLE_TEXTES);
    return enregistre ? fusionner(textesParDefaut, enregistre) : textesParDefaut;
  } catch {
    return textesParDefaut;
  }
}

export async function ecrireTextes(
  nouveauxTextes: Textes
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
    await redis.set(CLE_TEXTES, nouveauxTextes);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
