// Aperçu d'un lien (image, titre, résumé, site) : lit les balises Open Graph de la page,
// comme Discord ou les réseaux sociaux quand on colle un lien. Gardé 24 h en cache.
// Si la page ne répond pas, renvoie null : l'actu s'affiche quand même, sans image.

export type ApercuLien = { image: string | null; titre: string | null; resume: string | null; site: string | null };

const youtubeId = (u: URL) => {
  if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0] || null;
  if (u.hostname.includes("youtube.com")) return u.searchParams.get("v") || u.pathname.match(/\/(?:shorts|embed)\/([\w-]{6,})/)?.[1] || null;
  return null;
};

const decoder = (t: string) =>
  t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

function meta(html: string, noms: string[]): string | null {
  for (const nom of noms) {
    const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${nom}["'][^>]*content=["']([^"']+)["']`, "i");
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${nom}["']`, "i");
    const m = html.match(re1) || html.match(re2);
    if (m?.[1]) return decoder(m[1].trim());
  }
  return null;
}

export async function apercuLien(lien: string): Promise<ApercuLien | null> {
  let u: URL;
  try {
    u = new URL(lien);
    if (!/^https?:$/.test(u.protocol)) return null;
  } catch {
    return null;
  }
  const yt = youtubeId(u);
  try {
    const r = await fetch(u.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CycyliveBot/1.0; +https://www.cycylive.fr)", "Accept-Language": "fr-FR,fr;q=0.9" },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(4000),
    });
    const html = r.ok ? (await r.text()).slice(0, 300_000) : "";
    let image = meta(html, ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"]);
    if (image) image = new URL(image, u).toString();
    if (!image && yt) image = `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
    const titre = meta(html, ["og:title", "twitter:title"]) || (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ? decoder(html.match(/<title[^>]*>([^<]+)<\/title>/i)![1].trim()) : null);
    const resume = meta(html, ["og:description", "twitter:description", "description"]);
    const site = meta(html, ["og:site_name"]) || u.hostname.replace(/^www\./, "");
    return { image, titre, resume: resume && resume.length > 160 ? resume.slice(0, 157).trimEnd() + "…" : resume, site };
  } catch {
    return yt ? { image: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`, titre: null, resume: null, site: "YouTube" } : { image: null, titre: null, resume: null, site: u.hostname.replace(/^www\./, "") };
  }
}

/** Les aperçus de plusieurs liens en parallèle (5 s au plus en tout). */
export async function apercusLiens(liens: string[]): Promise<Record<string, ApercuLien | null>> {
  const res = await Promise.all(
    liens.map((l) => Promise.race([apercuLien(l), new Promise<null>((r) => setTimeout(() => r(null), 5000))]).catch(() => null))
  );
  return Object.fromEntries(liens.map((l, i) => [l, res[i]]));
}
