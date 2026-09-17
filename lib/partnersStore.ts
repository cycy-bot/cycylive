// ============================================================
// STOCKAGE PARTENAIRES & BONS PLANS — lecture/écriture persistante
// ============================================================
// Même principe que les autres stores.

import { Redis } from "@upstash/redis";
import { Partenaire, partenairesParDefaut } from "@/data/partners";
import { BonPlan, bonsPlansParDefaut } from "@/data/deals";

const CLE_PARTENAIRES = "cycylive:partenaires";
const CLE_BONS_PLANS = "cycylive:bons-plans";

function obtenirClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

export async function lirePartenaires(): Promise<Partenaire[]> {
  const redis = obtenirClient();
  if (!redis) return partenairesParDefaut;
  try {
    const enregistre = await redis.get<Partenaire[]>(CLE_PARTENAIRES);
    return enregistre ?? partenairesParDefaut;
  } catch {
    return partenairesParDefaut;
  }
}

export async function ecrirePartenaires(
  partenaires: Partenaire[]
): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) return { ok: false, erreur: "Le stockage (Upstash) n'est pas encore connecté." };
  try {
    await redis.set(CLE_PARTENAIRES, partenaires);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}

export async function lireBonsPlans(): Promise<BonPlan[]> {
  const redis = obtenirClient();
  if (!redis) return bonsPlansParDefaut;
  try {
    const enregistre = await redis.get<BonPlan[]>(CLE_BONS_PLANS);
    return enregistre ?? bonsPlansParDefaut;
  } catch {
    return bonsPlansParDefaut;
  }
}

export async function ecrireBonsPlans(
  bonsPlans: BonPlan[]
): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) return { ok: false, erreur: "Le stockage (Upstash) n'est pas encore connecté." };
  try {
    await redis.set(CLE_BONS_PLANS, bonsPlans);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
