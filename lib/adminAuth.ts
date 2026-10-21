// ============================================================
// Vérification du mot de passe de /admin (ADMIN_PASSWORD)
// ============================================================
// • comparaison à temps constant (pas d'indice sur le mot de passe)
// • après 8 erreurs en 15 min depuis une même adresse, ou 40 au total,
//   les essais sont bloqués 15 min (contre les robots qui testent des mots de passe)

import crypto from "crypto";
import { Redis } from "@upstash/redis";

const FENETRE_S = 15 * 60;
const MAX_PAR_IP = 8;
const MAX_TOTAL = 40;

function client(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return Redis.fromEnv();
}

/** Adresse du visiteur (fournie par Vercel). */
export function ipDe(request: Request): string {
  const h = request.headers;
  return h.get("x-real-ip") || (h.get("x-forwarded-for") || "").split(",")[0].trim() || "inconnue";
}

function egal(a: string, b: string): boolean {
  const x = crypto.createHash("sha256").update(a).digest();
  const y = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(x, y);
}

export type ResultatVerif = { ok: true } | { ok: false; erreur: string; status: number };

// Connexion unique depuis l'interface CycyBot (bot.cycylive.fr/admin) : « sso1.<expiration>.<signature> »,
// signé par le bot avec ce même mot de passe (SITE_ADMIN_PASSWORD sur Railway). Le mot de passe ne voyage jamais.
function jetonValide(donne: string, attendu: string): boolean {
  const m = /^sso1\.(\d{13})\.([A-Za-z0-9_-]{20,})$/.exec(donne);
  if (!m) return false;
  const exp = Number(m[1]);
  if (!(exp > Date.now()) || exp > Date.now() + 13 * 3600e3) return false;
  const sig = crypto.createHmac("sha256", attendu).update("cycylive-admin-sso|" + exp).digest("base64url");
  return egal(sig, m[2]);
}

export async function verifierMotDePasse(request: Request, donne: unknown, attendu: string | undefined): Promise<ResultatVerif> {
  if (!attendu) return { ok: false, erreur: "ADMIN_PASSWORD n'est pas configuré sur le serveur.", status: 500 };
  const redis = client();
  const ip = ipDe(request);
  const cleIp = `cycylive:admin:echecs:${ip}`;
  const cleTotal = "cycylive:admin:echecs:total";
  try {
    if (redis) {
      const [parIp, total] = await Promise.all([redis.get<number>(cleIp), redis.get<number>(cleTotal)]);
      if ((Number(parIp) || 0) >= MAX_PAR_IP || (Number(total) || 0) >= MAX_TOTAL) {
        return { ok: false, erreur: "Trop d'essais de mot de passe : réessaie dans 15 minutes.", status: 429 };
      }
    }
  } catch {
    /* stockage indisponible : on vérifie quand même le mot de passe */
  }
  if (typeof donne === "string" && (egal(donne, attendu) || jetonValide(donne, attendu))) return { ok: true };
  try {
    if (redis) {
      const n = await redis.incr(cleIp);
      if (n === 1) await redis.expire(cleIp, FENETRE_S);
      const t = await redis.incr(cleTotal);
      if (t === 1) await redis.expire(cleTotal, FENETRE_S);
    }
  } catch {
    /* rien */
  }
  return { ok: false, erreur: "Mot de passe incorrect.", status: 401 };
}
