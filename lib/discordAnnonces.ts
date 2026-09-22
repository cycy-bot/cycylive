// ============================================================
// ANNONCES DISCORD — via un bot Discord (lecture seule)
// ============================================================
// Contrairement aux stats (membres), lire le contenu d'un salon
// nécessite un vrai bot Discord avec la permission de voir ce
// salon. Voir le README, section "Annonces Discord sur le site",
// pour la mise en place complète (compte développeur, bot,
// permissions, variables d'environnement).
//
// Variables nécessaires :
//   DISCORD_BOT_TOKEN
//   DISCORD_ANNOUNCE_CHANNEL_ID
// (DISCORD_SERVER_ID, déjà utilisée pour les stats, sert aussi à
// construire le lien direct vers chaque message.)

export type AnnonceDiscord = {
  id: string;
  auteur: string;
  avatar: string | null;
  contenuHtml: string; // déjà échappé/formaté, prêt à afficher
  image: string | null;
  dateISO: string;
  lien: string; // lien direct vers le message sur Discord
  sondage: {
    question: string;
    options: { texte: string; votes: number | null }[];
  } | null;
};

function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Transformation très légère du markdown Discord (gras/italique)
// vers du HTML, en toute sécurité (le texte est échappé d'abord).
function formaterContenu(texte: string): string {
  let html = echapperHtml(texte);
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/\n/g, "<br>");
  return html;
}

export async function obtenirAnnoncesDiscord(limite = 5): Promise<AnnonceDiscord[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_ANNOUNCE_CHANNEL_ID;
  const serverId = process.env.DISCORD_SERVER_ID;
  if (!token || !channelId) return [];

  try {
    const reponse = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limite}`,
      {
        headers: { Authorization: `Bot ${token}` },
        cache: "no-store",
      }
    );
    if (!reponse.ok) return [];
    const messages = await reponse.json();
    if (!Array.isArray(messages)) return [];

    return messages
      .filter((m: any) => m.content || m.poll || m.attachments?.length)
      .map((m: any): AnnonceDiscord => {
        const image =
          m.attachments?.find((a: any) => a.content_type?.startsWith("image/"))
            ?.url ?? null;

        let sondage: AnnonceDiscord["sondage"] = null;
        if (m.poll) {
          const comptes: Record<number, number> = {};
          for (const c of m.poll.results?.answer_counts ?? []) {
            comptes[c.id] = c.count;
          }
          sondage = {
            question: m.poll.question?.text ?? "",
            options: (m.poll.answers ?? []).map((a: any) => ({
              texte: a.poll_media?.text ?? "",
              votes: m.poll.results ? comptes[a.answer_id] ?? 0 : null,
            })),
          };
        }

        return {
          id: m.id,
          auteur: m.author?.username ?? "Cycy",
          avatar: m.author?.avatar
            ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
            : null,
          contenuHtml: formaterContenu(m.content ?? ""),
          image,
          dateISO: m.timestamp,
          lien: serverId
            ? `https://discord.com/channels/${serverId}/${channelId}/${m.id}`
            : liensSecours(channelId, m.id),
          sondage,
        };
      });
  } catch {
    return [];
  }
}

function liensSecours(channelId: string, messageId: string): string {
  return `https://discord.com/channels/@me/${channelId}/${messageId}`;
}
