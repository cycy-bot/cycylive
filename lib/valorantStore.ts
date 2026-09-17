// ============================================================
// STOCKAGE VALORANT — lecture/écriture persistante
// ============================================================
// Même principe que les autres stores.

import { Redis } from "@upstash/redis";
import {
  NewsValorant,
  ProfilValorant,
  newsValorantParDefaut,
  profilValorantParDefaut,
} from "@/data/valorant";

const CLE_NEWS = "cycylive:valorant-news";
const CLE_PROFIL = "cycylive:valorant-profil";

function obtenirClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

export async function lireNewsValorant(): Promise<NewsValorant[]> {
  const redis = obtenirClient();
  if (!redis) return newsValorantParDefaut;
  try {
    const enregistre = await redis.get<NewsValorant[]>(CLE_NEWS);
    return enregistre ?? newsValorantParDefaut;
  } catch {
    return newsValorantParDefaut;
  }
}

export async function ecrireNewsValorant(
  news: NewsValorant[]
): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) return { ok: false, erreur: "Le stockage (Upstash) n'est pas encore connecté." };
  try {
    await redis.set(CLE_NEWS, news);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}

export async function lireProfilValorant(): Promise<ProfilValorant> {
  const redis = obtenirClient();
  if (!redis) return profilValorantParDefaut;
  try {
    const enregistre = await redis.get<ProfilValorant>(CLE_PROFIL);
    return enregistre ?? profilValorantParDefaut;
  } catch {
    return profilValorantParDefaut;
  }
}

export async function ecrireProfilValorant(
  profil: ProfilValorant
): Promise<{ ok: boolean; erreur?: string }> {
  const redis = obtenirClient();
  if (!redis) return { ok: false, erreur: "Le stockage (Upstash) n'est pas encore connecté." };
  try {
    await redis.set(CLE_PROFIL, profil);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}
