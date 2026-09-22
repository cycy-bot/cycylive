// ============================================================
// STATISTIQUES DISCORD — via le widget public du serveur
// ============================================================
// Ne nécessite aucun bot ni token : juste que le "Widget du
// serveur" soit activé dans Discord (Paramètres du serveur →
// Widget) et l'ID du serveur en variable d'environnement
// DISCORD_SERVER_ID.
//
// ⚠️ Le widget ne donne que le nombre de membres EN LIGNE, pas le
// nombre total de membres (Discord ne fournit pas ce total sans
// un bot dédié avec des permissions spécifiques).

export type MembreDiscordEnLigne = {
  id: string;
  pseudo: string;
  avatar: string | null;
  statut: "online" | "idle" | "dnd" | string;
  activite: string | null; // ex: "League of Legends"
};

export type WidgetDiscord = {
  enLigne: number;
  membres: MembreDiscordEnLigne[];
  lienInvitation: string | null;
};

export async function obtenirMembresDiscordEnLigne(): Promise<number | null> {
  const widget = await obtenirWidgetDiscord();
  return widget?.enLigne ?? null;
}

export async function obtenirWidgetDiscord(): Promise<WidgetDiscord | null> {
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
      lienInvitation: data.instant_invite ?? null,
    };
  } catch {
    return null;
  }
}
