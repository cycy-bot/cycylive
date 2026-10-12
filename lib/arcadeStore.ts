// ============================================================
// BORNE D'ARCADE — classement (Upstash Redis)
// ============================================================
// Pas de compte : chaque pseudo garde son meilleur score.
// Chaque partie reçoit un jeton signé au démarrage ; le score
// envoyé doit être possible vu le temps écoulé depuis ce jeton,
// et un jeton ne sert qu'une fois.

import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { ARCADE, scoreMaxPour } from "@/lib/arcadeRegles";

const CLE_SCORES = "cycylive:arcade:scores"; // classement : cle du pseudo → meilleur score
const CLE_NOMS = "cycylive:arcade:noms"; // cle du pseudo → "Pseudo affiché|date"
const PREFIXE_JETON = "cycylive:arcade:jeton:";
const PREFIXE_IP = "cycylive:arcade:ip:";
const JETON_DUREE_MS = 3 * 60 * 60 * 1000;

export type LigneClassement = { rang: number; nom: string; score: number; date: number };

function client(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return Redis.fromEnv();
}

function secret(): string {
  return process.env.ARCADE_SECRET || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.ADMIN_PASSWORD || "cycylive-arcade";
}

function signer(donnees: string): string {
  return crypto.createHmac("sha256", secret()).update(donnees).digest("base64url");
}

/** Jeton d'une nouvelle partie (signé, avec l'heure de départ). */
export function creerJeton(): string {
  const corps = Buffer.from(JSON.stringify({ id: crypto.randomBytes(9).toString("base64url"), t: Date.now() })).toString("base64url");
  return `${corps}.${signer(corps)}`;
}

function lireJeton(jeton: unknown): { id: string; t: number } | null {
  const [corps, signature] = String(jeton ?? "").split(".");
  if (!corps || !signature) return null;
  const attendu = signer(corps);
  if (attendu.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(attendu), Buffer.from(signature))) return null;
  try {
    const d = JSON.parse(Buffer.from(corps, "base64url").toString("utf8"));
    return typeof d.id === "string" && typeof d.t === "number" ? d : null;
  } catch {
    return null;
  }
}

/** Limite simple par adresse IP (fenêtre d'une heure). */
export async function limiteIp(ip: string, action: string, max: number): Promise<boolean> {
  const redis = client();
  if (!redis) return true;
  const cle = `${PREFIXE_IP}${action}:${ip}`;
  try {
    const n = await redis.incr(cle);
    if (n === 1) await redis.expire(cle, 3600);
    return n <= max;
  } catch {
    return true;
  }
}

function decoderNom(valeur: unknown, cle: string): { nom: string; date: number } {
  const brut = typeof valeur === "string" ? valeur : valeur == null ? "" : String(valeur);
  const i = brut.lastIndexOf("|");
  if (i < 0) return { nom: brut || cle, date: 0 };
  return { nom: brut.slice(0, i) || cle, date: Number(brut.slice(i + 1)) || 0 };
}

export async function lireClassement(limite: number = ARCADE.tailleClassement): Promise<LigneClassement[] | null> {
  const redis = client();
  if (!redis) return null;
  const brut = await redis.zrange<(string | number)[]>(CLE_SCORES, 0, limite - 1, { rev: true, withScores: true });
  const lignes: { cle: string; score: number }[] = [];
  for (let i = 0; i < brut.length; i += 2) lignes.push({ cle: String(brut[i]), score: Number(brut[i + 1]) });
  if (!lignes.length) return [];
  const noms = (await redis.hmget<Record<string, string>>(CLE_NOMS, ...lignes.map((l) => l.cle))) || {};
  return lignes.map((l, i) => ({ rang: i + 1, score: l.score, ...decoderNom(noms[l.cle], l.cle) }));
}

export type ResultatEnvoi =
  | { ok: true; score: number; meilleur: number; nouveauRecord: boolean; rang: number | null }
  | { ok: false; erreur: string; status: number };

export async function enregistrerScore(jeton: unknown, scoreBrut: unknown, pseudo: string, cle: string): Promise<ResultatEnvoi> {
  const redis = client();
  if (!redis) return { ok: false, erreur: "Le classement n'est pas encore activé sur le site.", status: 503 };

  const partie = lireJeton(jeton);
  if (!partie) return { ok: false, erreur: "Partie introuvable : rejoue une partie pour enregistrer ton score.", status: 400 };
  const ecoule = Date.now() - partie.t;
  if (ecoule > JETON_DUREE_MS) return { ok: false, erreur: "Cette partie est trop ancienne : rejoue pour enregistrer un score.", status: 400 };

  const score = Math.floor(Number(scoreBrut));
  if (!Number.isFinite(score) || score < 1) return { ok: false, erreur: "Score invalide.", status: 400 };
  // Marge pour les petits écarts d'horloge et de réseau
  if (score > scoreMaxPour(ecoule / 1000) * 1.08 + 25) return { ok: false, erreur: "Ce score n'est pas possible pour la durée de la partie.", status: 400 };

  // Un jeton = un seul enregistrement
  const libre = await redis.set(PREFIXE_JETON + partie.id, 1, { nx: true, ex: Math.ceil(JETON_DUREE_MS / 1000) });
  if (libre !== "OK") return { ok: false, erreur: "Le score de cette partie est déjà enregistré.", status: 409 };

  const avant = await redis.zscore(CLE_SCORES, cle);
  const ancien = avant == null ? 0 : Number(avant);
  const nouveauRecord = score > ancien;
  if (nouveauRecord) {
    await redis.zadd(CLE_SCORES, { score, member: cle });
    await redis.hset(CLE_NOMS, { [cle]: `${pseudo}|${Date.now()}` });
  }
  const r = await redis.zrevrank(CLE_SCORES, cle);
  return { ok: true, score, meilleur: Math.max(score, ancien), nouveauRecord, rang: r == null ? null : r + 1 };
}

// ── Administration ──────────────────────────────────────────

export async function supprimerPseudo(cle: string): Promise<boolean> {
  const redis = client();
  if (!redis) return false;
  await redis.zrem(CLE_SCORES, cle);
  await redis.hdel(CLE_NOMS, cle);
  return true;
}

export async function reinitialiserClassement(): Promise<boolean> {
  const redis = client();
  if (!redis) return false;
  await redis.del(CLE_SCORES, CLE_NOMS);
  return true;
}

export async function classementAdmin(): Promise<(LigneClassement & { cle: string })[] | null> {
  const redis = client();
  if (!redis) return null;
  const brut = await redis.zrange<(string | number)[]>(CLE_SCORES, 0, 199, { rev: true, withScores: true });
  const lignes: { cle: string; score: number }[] = [];
  for (let i = 0; i < brut.length; i += 2) lignes.push({ cle: String(brut[i]), score: Number(brut[i + 1]) });
  if (!lignes.length) return [];
  const noms = (await redis.hmget<Record<string, string>>(CLE_NOMS, ...lignes.map((l) => l.cle))) || {};
  return lignes.map((l, i) => ({ rang: i + 1, cle: l.cle, score: l.score, ...decoderNom(noms[l.cle], l.cle) }));
}
