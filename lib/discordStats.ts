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

export async function obtenirMembresDiscordEnLigne(): Promise<number | null> {
  const serverId = process.env.DISCORD_SERVER_ID;
  if (!serverId) return null;

  try {
    const reponse = await fetch(
      `https://discord.com/api/guilds/${serverId}/widget.json`,
      { cache: "no-store" }
    );
    if (!reponse.ok) return null;
    const data = await reponse.json();
    return typeof data.presence_count === "number" ? data.presence_count : null;
  } catch {
    return null;
  }
}
