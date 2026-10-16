// Statistiques de la chaîne d'après TwitchTracker (30 derniers jours).
// • API publique : https://twitchtracker.com/api/channels/summary/<chaîne>
// • Classement francophone : lu sur la page publique de la chaîne (s'il est trouvé).
// Tout est gardé 3 h en cache ; si TwitchTracker ne répond pas, la page s'affiche sans ces chiffres.

export type StatsTwitchTracker = {
  rangMondial: number | null;
  rangFr: number | null;
  moyenneViewers: number | null;
  picViewers: number | null;
  heuresStreamees: number | null;
  heuresRegardees: number | null;
  nouveauxFollowers: number | null;
  followersTotal: number | null;
};

const UA = { "User-Agent": "Mozilla/5.0 (compatible; cycylive.fr)", Accept: "application/json, text/html" };
const nombre = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v.replace(/[^\d.]/g, "")) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
};

async function resume(chaine: string): Promise<Record<string, unknown> | null> {
  try {
    const r = await fetch(`https://twitchtracker.com/api/channels/summary/${encodeURIComponent(chaine)}`, { headers: UA, next: { revalidate: 10800 }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const d = await r.json();
    return d && typeof d === "object" ? d : null;
  } catch {
    return null;
  }
}

async function rangFrancophone(chaine: string): Promise<number | null> {
  try {
    const r = await fetch(`https://twitchtracker.com/${encodeURIComponent(chaine)}`, { headers: UA, next: { revalidate: 10800 }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return null;
    const html = (await r.text()).replace(/<[^>]+>/g, " ").replace(/&nbsp;|\s+/g, " ");
    const m =
      html.match(/#\s?([\d,. ]{1,9})\s+(?:in|among)\s+French/i) ||
      html.match(/French\s+(?:rank|channels?)\s*:?\s*#?\s?([\d,. ]{1,9})/i) ||
      html.match(/([\d,. ]{1,9})(?:st|nd|rd|th)?\s+(?:in|among)\s+French/i);
    return m ? nombre(m[1]) : null;
  } catch {
    return null;
  }
}

export async function statsTwitchTracker(chaine: string): Promise<StatsTwitchTracker | null> {
  const [d, fr] = await Promise.all([resume(chaine), rangFrancophone(chaine)]);
  if (!d && !fr) return null;
  const minutes = nombre(d?.minutes_streamed);
  return {
    rangMondial: nombre(d?.rank),
    rangFr: fr,
    moyenneViewers: nombre(d?.avg_viewers),
    picViewers: nombre(d?.max_viewers),
    heuresStreamees: minutes ? Math.round(minutes / 60) : null,
    heuresRegardees: nombre(d?.hours_watched),
    nouveauxFollowers: nombre(d?.followers),
    followersTotal: nombre(d?.followers_total),
  };
}
