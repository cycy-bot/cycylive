// Clips Twitch affichés sur le site : choisis dans l'admin (« Clips Twitch »).
// Mode « auto » : les plus récents, sauf ceux masqués. Mode « choix » : seulement ceux publiés, dans l'ordre.
// « vus » : les clips déjà triés (CycyBot prévient seulement pour les nouveaux).
import { Redis } from "@upstash/redis";
import type { ClipTwitch } from "@/lib/clipsTwitch";

const CLE = "cycylive:clips-choix";
export type ChoixClips = { mode: "auto" | "choix"; publies: ClipTwitch[]; masques: string[]; vus: string[] };
export const choixVide: ChoixClips = { mode: "auto", publies: [], masques: [], vus: [] };

function client(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return Redis.fromEnv();
}

export async function lireChoixClips(): Promise<ChoixClips> {
  const redis = client();
  if (!redis) return choixVide;
  try {
    const d = await redis.get<ChoixClips>(CLE);
    return { ...choixVide, ...(d || {}) };
  } catch {
    return choixVide;
  }
}

export async function ecrireChoixClips(d: ChoixClips): Promise<{ ok: boolean; erreur?: string }> {
  const redis = client();
  if (!redis) return { ok: false, erreur: "Le stockage (Upstash) n'est pas connecté à ce projet." };
  try {
    await redis.set(CLE, d);
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur inattendue lors de l'enregistrement." };
  }
}

const id = (v: unknown) => (typeof v === "string" && /^[\w-]{3,120}$/.test(v) ? v : "");
const txt = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

/** Nettoie ce qui arrive de l'admin. */
export function nettoyerChoixClips(brut: unknown): ChoixClips | null {
  if (!brut || typeof brut !== "object") return null;
  const b = brut as Record<string, unknown>;
  const publies: ClipTwitch[] = Array.isArray(b.publies)
    ? b.publies.slice(0, 60).flatMap((x) => {
        const c = (x || {}) as Record<string, unknown>;
        const url = txt(c.url, 300);
        if (!id(c.id) || !/^https:\/\/(clips\.twitch\.tv|www\.twitch\.tv)\//.test(url)) return [];
        const mini = txt(c.miniature, 400);
        return [{ id: id(c.id), titre: txt(c.titre, 140), url, miniature: /^https:\/\//.test(mini) ? mini : "", vues: Math.max(0, Math.round(Number(c.vues) || 0)), duree: Math.max(0, Math.round(Number(c.duree) || 0)), date: txt(c.date, 40), jeu: txt(c.jeu, 80), auteur: txt(c.auteur, 60) }];
      })
    : [];
  const liste = (v: unknown, n: number) => (Array.isArray(v) ? [...new Set(v.map(id).filter(Boolean))].slice(-n) : []);
  return { mode: b.mode === "choix" ? "choix" : "auto", publies, masques: liste(b.masques, 500), vus: liste(b.vus, 1000) };
}

/** Les clips à afficher sur la page Gaming. */
export function clipsAffiches(choix: ChoixClips, recents: ClipTwitch[], limite = 12): ClipTwitch[] {
  if (choix.mode === "choix") return choix.publies.slice(0, limite);
  const masques = new Set(choix.masques);
  // Les clips publiés à la main passent en premier, puis les plus récents
  const deja = new Set<string>();
  const out: ClipTwitch[] = [];
  for (const c of [...choix.publies, ...recents]) {
    if (masques.has(c.id) || deja.has(c.id)) continue;
    deja.add(c.id);
    out.push(c);
    if (out.length >= limite) break;
  }
  return out;
}
