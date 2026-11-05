// ============================================================
// STOCKAGE PARTENAIRES & BONS PLANS — lecture/écriture persistante
// ============================================================
// Même principe que les autres stores.

import { Redis } from "@upstash/redis";
import { Partenaire, partenairesParDefaut } from "@/data/partners";
import { BonPlan, bonsPlansParDefaut } from "@/data/deals";

const CLE_PARTENAIRES = "cycylive:partenaires";
const CLE_BONS_PLANS = "cycylive:bons-plans";
const CLE_MIGRATION_HORUS = "cycylive:migration:horus-13-v2";

// Horus X passe de -11 % à -13 % (code CYCYLIVE) : textes et visuel mis à jour une seule fois, puis enregistrés
const VISUEL_HORUS = "/images/partenaires/horus-x-13.jpg";
const en13 = (t?: string) => (typeof t === "string" ? t.replace(/(^|[^\d])11\s?%/g, "$113%") : t);
const estHorus = (nom?: string) => /horus/i.test(String(nom || ""));
async function migrerHorus(redis: Redis) {
  if (await redis.get(CLE_MIGRATION_HORUS)) return;
  const [p, b] = await Promise.all([redis.get<Partenaire[]>(CLE_PARTENAIRES), redis.get<BonPlan[]>(CLE_BONS_PLANS)]);
  if (Array.isArray(p)) {
    await redis.set(CLE_PARTENAIRES, p.map((x) => (estHorus(x.nom) ? { ...x, description: en13(x.description) || "", reduction: en13(x.reduction), ctaLabel: en13(x.ctaLabel) || x.ctaLabel, image: VISUEL_HORUS, affichage: x.affichage === "image" ? "image" : "banniere" } : x)));
  }
  if (Array.isArray(b)) {
    await redis.set(CLE_BONS_PLANS, b.map((x) => (estHorus(x.marque) ? { ...x, offre: en13(x.offre) || x.offre, reduction: en13(x.reduction), conditions: en13(x.conditions) } : x)));
  }
  await redis.set(CLE_MIGRATION_HORUS, Date.now());
}

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
    await migrerHorus(redis).catch(() => {});
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
    await migrerHorus(redis).catch(() => {});
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
