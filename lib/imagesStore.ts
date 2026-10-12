// ============================================================
// IMAGES ENVOYÉES DEPUIS /admin (logos, bannières de partenaires…)
// ============================================================
// Chaque image est rangée dans sa propre clé Upstash (déjà redimensionnée
// et compressée par le navigateur avant l'envoi), puis servie par
// /api/images/<id>. Pas besoin d'un autre service de stockage.

import { Redis } from "@upstash/redis";

const PREFIXE = "cycylive:image:";
export const TAILLE_MAX = 900 * 1024; // ~900 Ko une fois encodée
const TYPES = ["image/webp", "image/jpeg", "image/png", "image/gif"];

type ImageStockee = { type: string; data: string; creeLe: number };

function obtenirClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return Redis.fromEnv();
}

/** dataUrl = "data:image/webp;base64,…" → renvoie l'adresse publique de l'image. */
export async function enregistrerImage(dataUrl: string): Promise<{ ok: boolean; url?: string; erreur?: string }> {
  const m = /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m || !TYPES.includes(m[1])) return { ok: false, erreur: "Format d'image non pris en charge (WebP, JPEG, PNG ou GIF)." };
  if (m[2].length > TAILLE_MAX) return { ok: false, erreur: "Image trop lourde, même après compression. Essaie une image plus petite." };
  const redis = obtenirClient();
  if (!redis) return { ok: false, erreur: "Le stockage (Upstash) n'est pas encore connecté." };
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  try {
    await redis.set(PREFIXE + id, { type: m[1], data: m[2], creeLe: Date.now() } satisfies ImageStockee);
    return { ok: true, url: `/api/images/${id}` };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement de l'image." };
  }
}

export async function lireImage(id: string): Promise<{ type: string; octets: Uint8Array } | null> {
  if (!/^[a-z0-9]{6,24}$/.test(id)) return null;
  const redis = obtenirClient();
  if (!redis) return null;
  try {
    const img = await redis.get<ImageStockee>(PREFIXE + id);
    if (!img?.data) return null;
    return { type: img.type, octets: Uint8Array.from(atob(img.data), (c) => c.charCodeAt(0)) };
  } catch {
    return null;
  }
}

/** Lien acceptable dans une carte : https://… (ou http://), ou une image envoyée depuis /admin. */
export function lienValide(url: string | undefined, { image = false }: { image?: boolean } = {}): boolean {
  if (!url) return true;
  if (image && /^\/api\/images\/[a-z0-9]{6,24}$/.test(url)) return true;
  return /^https?:\/\/[^\s]+$/i.test(url);
}
