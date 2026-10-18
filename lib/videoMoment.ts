// ============================================================
// VIDÉO D'UN MOMENT DE LA TIMELINE — lien → lecteur intégré
// ============================================================
// Reconnaît les liens de clips Twitch, de TikTok et de YouTube (Shorts
// compris) pour les lire directement sur le site. Les autres liens
// s'ouvrent simplement dans un nouvel onglet.

export type VideoMoment =
  | { type: "twitch"; id: string; format: "paysage" }
  | { type: "tiktok"; id: string; format: "vertical" }
  | { type: "youtube"; id: string; format: "paysage" | "vertical" }
  | { type: "lien"; url: string };

export function analyserLien(brut: string | undefined | null): VideoMoment | null {
  const texte = (brut ?? "").trim();
  if (!texte) return null;
  let u: URL;
  try {
    u = new URL(texte);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const hote = u.hostname.replace(/^www\.|^m\./, "");
  const segments = u.pathname.split("/").filter(Boolean);

  // Twitch : clips.twitch.tv/<slug> ou twitch.tv/<chaine>/clip/<slug>
  if (hote === "clips.twitch.tv" && segments[0] && segments[0] !== "embed") return { type: "twitch", id: segments[0], format: "paysage" };
  if (hote === "twitch.tv") {
    const i = segments.indexOf("clip");
    if (i >= 0 && segments[i + 1]) return { type: "twitch", id: segments[i + 1], format: "paysage" };
  }

  // TikTok : tiktok.com/@pseudo/video/<id>
  if (hote === "tiktok.com") {
    const i = segments.indexOf("video");
    if (i >= 0 && /^\d+$/.test(segments[i + 1] ?? "")) return { type: "tiktok", id: segments[i + 1], format: "vertical" };
  }

  // YouTube : watch?v=, youtu.be/, /shorts/
  if (hote === "youtube.com" || hote === "music.youtube.com") {
    if (segments[0] === "shorts" && segments[1]) return { type: "youtube", id: segments[1], format: "vertical" };
    const v = u.searchParams.get("v");
    if (v) return { type: "youtube", id: v, format: "paysage" };
  }
  if (hote === "youtu.be" && segments[0]) return { type: "youtube", id: segments[0], format: "paysage" };

  return { type: "lien", url: u.toString() };
}

/** Adresse du lecteur intégré (Twitch exige le nom du site qui l'affiche). */
export function urlLecteur(v: VideoMoment, site: string): string | null {
  const id = "id" in v ? encodeURIComponent(v.id) : "";
  switch (v.type) {
    case "twitch":
      return `https://clips.twitch.tv/embed?clip=${id}&parent=${encodeURIComponent(site)}&autoplay=true`;
    case "tiktok":
      return `https://www.tiktok.com/player/v1/${id}?autoplay=1&rel=0&description=1`;
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    default:
      return null;
  }
}

export const NOM_PLATEFORME: Record<VideoMoment["type"], string> = {
  twitch: "le clip",
  tiktok: "le TikTok",
  youtube: "la vidéo",
  lien: "la vidéo",
};

export const NOM_SITE: Record<VideoMoment["type"], string> = {
  twitch: "Twitch",
  tiktok: "TikTok",
  youtube: "YouTube",
  lien: "le site d'origine",
};

export const MAX_LIENS = 6;

/** Tous les liens d'une étape (ancien champ « lien » unique compris). */
export function liensEtape(e: { lien?: string; liens?: string[] }): string[] {
  const tous = [...(Array.isArray(e.liens) ? e.liens : []), ...(e.lien ? [e.lien] : [])].map((l) => String(l ?? "").trim());
  return tous.filter((l, i) => l && tous.indexOf(l) === i).slice(0, MAX_LIENS);
}
