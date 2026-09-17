// ============================================================
// STOCKAGE GAMING — lecture/écriture persistante
// ============================================================
// Même principe que les autres stores. Tout regroupé dans une
// seule clé (intro + autres jeux + jeux du moment) pour rester
// simple : un seul enregistrement depuis /admin.

import { Redis } from "@upstash/redis";
import {
  AutreJeu,
  JeuDuMoment,
  introGamingParDefaut,
  autresJeuxParDefaut,
  jeuxDuMomentParDefaut,
} from "@/data/gaming";

const CLE_GAMING = "cycylive:gaming";

export type DonneesGaming = {
  intro: string;
  autresJeux: AutreJeu[];
  jeuxDuMoment: JeuDuMoment[];
};

const donneesParDefaut: DonneesGaming = {
  intro: introGamingParDefaut,
  autresJeux: autresJeuxParDefaut,
  jeuxDuMoment: jeuxDuMomentParDefaut,
};

function obtenirClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

export async function lireGaming(): Promise<DonneesGaming> {
  const redis = obtenirClient();
  if (!redis) return donneesParDefaut;
  try {
    const enregistre = await redis.get<DonneesGaming>(CLE_GAMING);
    return enregistre ?? donneesParDefaut;
  } catch {
    return donneesParDefaut;
  }
}

export async function ecrireGaming(
  donnees: DonneesGaming
): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) return { ok: false, erreur: "Le stockage (Upstash) n'est pas encore connecté." };
  try {
    await redis.set(CLE_GAMING, donnees);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
