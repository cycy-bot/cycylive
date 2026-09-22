// ============================================================
// STATISTIQUES DISCORD — via les API publiques (aucun bot requis)
// ============================================================
// Deux sources publiques, gratuites, sans bot :
// 1. Le widget du serveur (Paramètres → Widget → à activer,
//    DISCORD_SERVER_ID en variable d'environnement) → membres EN
//    LIGNE + leurs avatars/pseudos.
// 2. L'API des invitations Discord (à partir de ton lien
//    d'invitation, data/liens.ts → discord) → nombre TOTAL de
//    membres du serveur.

import { liens } from "@/data/liens";

export type MembreDiscordEnLigne = {
  id: string;
  pseudo: string;
  avatar: string | null;
  statut: "online" | "idle" | "dnd" | string;
  activite: string | null;
};

export type StatsDiscord = {
  totalMembres: number | null;
  enLigne: number | null;
  membres: MembreDiscordEnLigne[];
};

function extraireCodeInvitation(url: string): string | null {
  const correspondance = url.match(/discord(?:\.gg|\.com\/invite)\/([^/?]+)/);
  return correspondance ? correspondance[1] : null;
}

export async function obtenirStatsDiscord(): Promise<StatsDiscord> {
  const [total, widget] = await Promise.all([
    obtenirTotalMembres(),
    obtenirWidgetDiscord(),
  ]);

  return {
    totalMembres: total,
    enLigne: widget?.enLigne ?? null,
    membres: widget?.membres ?? [],
  };
}

async function obtenirTotalMembres(): Promise<number | null> {
  const code = extraireCodeInvitation(liens.discord);
  if (!code) return null;

  try {
    const reponse = await fetch(
      `https://discord.com/api/v10/invites/${code}?with_counts=true`,
      { cache: "no-store" }
    );
    if (!reponse.ok) return null;
    const data = await reponse.json();
    return typeof data.approximate_member_count === "number"
      ? data.approximate_member_count
      : null;
  } catch {
    return null;
  }
}

async function obtenirWidgetDiscord(): Promise<{
  enLigne: number;
  membres: MembreDiscordEnLigne[];
} | null> {
  const serverId = process.env.DISCORD_SERVER_ID;
  if (!serverId) return null;

  try {
    const reponse = await fetch(
      `https://discord.com/api/guilds/${serverId}/widget.json`,
      { cache: "no-store" }
    );
    if (!reponse.ok) return null;
    const data = await reponse.json();

    const membres: MembreDiscordEnLigne[] = Array.isArray(data.members)
      ? data.members.map((m: any) => ({
          id: String(m.id),
          pseudo: m.username ?? "Membre",
          avatar: m.avatar_url ?? null,
          statut: m.status ?? "online",
          activite: m.game?.name ?? null,
        }))
      : [];

    return {
      enLigne: typeof data.presence_count === "number" ? data.presence_count : 0,
      membres,
    };
  } catch {
    return null;
  }
}
