// Données publiques de Cycy_Bot, servies par bot.cycylive.fr/api/public.
// Récupérées côté serveur (bon pour le référencement) et gardées 60 s en cache.

import secours from "@/data/cycybotSecours.json";

export const CYCYBOT_URL = process.env.CYCYBOT_URL || "https://bot.cycylive.fr";

export type CommandeCycyBot = {
  name: string;
  aliases: string[];
  usage: string;
  description: string;
  permission: string;
  permissionLabel: string;
  group?: string;
};

export type GroupeCommandesTwitch = { key: string; label: string; emoji: string };

export type DonneesCycyBot = {
  bot: { name: string; avatar: string | null; bio: string; url: string };
  live: { isLive: boolean; category: string | null };
  commands: { everyone: CommandeCycyBot[]; mods: CommandeCycyBot[]; groups?: GroupeCommandesTwitch[] };
  transmission?: LigneConsole[];
  discord?: DiscordCycyBot | null;
  /** Rank Valorant (même source que la commande !rank du chat). */
  valorant?: { rank: { tier: string; division: number | null; rr: number | null; label: string; text: string; updatedAt: string } | null };
  updatedAt: string;
};

// ── Univers Discord (passeport, cartes, Galaxie…) ───────────

export type CommandeDiscord = {
  name: string;
  description: string;
  sub: { name: string; description: string }[];
  options: { name: string; description: string; required: boolean }[];
};

export type GroupeCommandesDiscord = { key: string; label: string; emoji: string; items: CommandeDiscord[] };

export type ObjetMarche = { emoji: string; name: string; price: number; currency: "eclats" | "fragments" };

export type DiscordCycyBot = {
  commands: GroupeCommandesDiscord[];
  /** Éditions de cartes ouvertes (la 2e apparaît à son lancement : le nom seulement). */
  editions?: { nom: string; nouvelle?: boolean }[];
  stats: {
    cards: number;
    collectors: number;
    boostersOpened: number;
    wildCaught: number;
    mythicsFound: number;
    eclatsCirculation: number;
    expeditions: number;
    chapters: number;
    badges: number;
    themes: number;
    figurines?: number;
    capsules?: number;
    figurinesJoueurs?: number;
  };
  figurines?: CollectionFigurines[];
  question: { q: string; options: string[]; votes: number } | null;
  lastQuestion: { q: string; options: { label: string; pct: number }[]; total: number } | null;
  chapters: { num: number; title: string; emoji: string; date: string; stamp: string; count: number }[];
  anomaly: { emoji: string; label: string; endsAt: number } | null;
  market: { daily: ObjetMarche[]; weekly: ObjetMarche[]; hasSecret: boolean } | null;
  destinations: { name: string; emoji: string; hours: number; difficulty: number }[];
};

export type LigneConsole = { user: string; text: string; bot: boolean };

export type CollectionFigurines = { id: string; nom: string; emoji: string; description: string; total: number; mystere?: boolean; apercu: { nom: string; image: string; rarete: string }[] };

// ── Leaderboard ─────────────────────────────────────────────

export type TypeClassement = "messages" | "watch" | "streak" | "bits" | "gifts";
export type PeriodeClassement = "global" | "week" | "month" | "session";

export type LigneClassement = {
  rank: number;
  login: string;
  name: string;
  value: number;
  best: number;
  avatar: string | null;
};

export type Classement = {
  type: TypeClassement;
  period: PeriodeClassement;
  live: boolean;
  entries: LigneClassement[];
  updatedAt: string;
};

// Adresse utilisable côté navigateur (le classement se recharge quand on change d'onglet)
export const CYCYBOT_URL_PUBLIC = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";

export async function lireClassement(
  type: TypeClassement = "messages",
  period: PeriodeClassement = "global"
): Promise<Classement | null> {
  try {
    const reponse = await fetch(`${CYCYBOT_URL}/api/leaderboard?type=${type}&period=${period}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!reponse.ok) return null;
    return (await reponse.json()) as Classement;
  } catch {
    return null;
  }
}

export async function lireCycyBot(): Promise<DonneesCycyBot | null> {
  let donnees: DonneesCycyBot | null = null;
  try {
    const reponse = await fetch(`${CYCYBOT_URL}/api/public`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(9000),
    });
    if (reponse.ok) donnees = (await reponse.json()) as DonneesCycyBot;
  } catch {
    donnees = null;
  }
  if (donnees?.discord) return donnees;
  // Bot injoignable ou réponse incomplète (redémarrage, déploiement…) : pendant la construction du site, la page
  // s'affiche quand même (avec les listes de secours). Ensuite, on garde la dernière version complète de la page
  // plutôt que d'effacer les chiffres, le Marché noir et les expéditions : la mise à jour réessaie une minute plus tard.
  if (process.env.NEXT_PHASE === "phase-production-build") return donnees;
  throw new Error("CycyBot ne répond pas : dernière version de la page gardée.");
}

// ── Secours ────────────────────────────────────────────────
// Si le bot ne répond pas (redémarrage, panne de l'hébergeur), les pages gardent une liste de commandes
// (copie de data/cycybotSecours.json, à régénérer depuis CycyBot quand des commandes changent).

export const commandesSecours = secours as unknown as {
  everyone: CommandeCycyBot[];
  groups: GroupeCommandesTwitch[];
  discord: GroupeCommandesDiscord[];
};

// Petite conversation d'exemple pour la console de la page (quand le bot n'en envoie pas)
export const transmissionSecours: LigneConsole[] = [
  { user: "Cycy_Bot", text: "Bienvenue à bord, Nova ! Merci pour le follow 💜", bot: true },
  { user: "Luna", text: "!eclats", bot: false },
  { user: "Cycy_Bot", text: "Luna, tu as 142 Éclats Stellaires ✦ Continue de regarder le live pour en gagner !", bot: true },
  { user: "Orion", text: "!8ball Est-ce que Cycy va clutch ce round ?", bot: false },
  { user: "Cycy_Bot", text: "Orion, les étoiles disent : c'est écrit dans la galaxie 🔮", bot: true },
  { user: "Cycy_Bot", text: "Une carte sauvage apparaît ! Tape !attraper pour tenter ta chance 🃏", bot: true },
  { user: "Vega", text: "!attraper", bot: false },
  { user: "Cycy_Bot", text: "Vega attrape la carte et l'ajoute à sa collection Discord ✨", bot: true },
];
