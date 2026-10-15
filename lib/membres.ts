// ============================================================
// PROFILS CYCYLIEN·NE — données servies par Cycy_Bot (bot.cycylive.fr)
// ============================================================
import { CYCYBOT_URL } from "@/lib/cycybot";

export type CompagnonPublic = { espece: "chat" | "alien" | "dragon" | "poulpe" | "robot"; nom: string; stade: 0 | 1 | 2; age: number; tenue: Record<string, string> } | null;

export type ProfilPublic = {
  slug: string;
  name: string;
  avatar: string;
  joinedAt: number | null;
  number: number | null;
  bio: string;
  title: string;
  role: string;
  theme: { key: string; label: string; a: string; b: string; glow: string; bg: string[] };
  orbite?: { orbit: number; points: number; position: number | null; total: number; progress: number; needed: number };
  passeport?: { key: string; label: string; emoji: string; value: string }[];
  succes?: { id: string; emoji: string; label: string; desc: string; level: number; tiered: boolean }[];
  tampons?: { emoji: string; label: string; title: string; date: string; color: string }[];
  cartes?: {
    unique: number; total: number; holos: number;
    per: { key: string; label: string; emoji: string; color: string; owned: number; total: number }[];
    vitrine: { id: string; name: string; rarity: string; rarityLabel: string; holo: boolean; count: number }[];
  };
  compagnon?: CompagnonPublic;
  twitch?: string;
};

export type MembreAnnuaire = { slug: string; name: string; avatar: string; orbit: number | null; role: string; color: string; badges: number };

export async function lireAnnuaire(): Promise<MembreAnnuaire[] | null> {
  try {
    const r = await fetch(`${CYCYBOT_URL}/api/membres`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    return ((await r.json()) as { membres: MembreAnnuaire[] }).membres;
  } catch {
    return null;
  }
}

export async function lireProfil(slug: string): Promise<ProfilPublic | null> {
  if (!/^[a-z0-9._-]{1,32}$/.test(slug)) return null;
  try {
    const r = await fetch(`${CYCYBOT_URL}/api/membres/${encodeURIComponent(slug)}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    return ((await r.json()) as { profil: ProfilPublic }).profil;
  } catch {
    return null;
  }
}
