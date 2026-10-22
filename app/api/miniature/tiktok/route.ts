// Miniature d'une vidéo TikTok, servie par cycylive.fr.
// Les images de TikTok (tiktokcdn) expirent au bout de quelques heures et refusent
// souvent d'être affichées depuis un autre site : on récupère la miniature à jour
// via l'oEmbed public de TikTok, côté serveur, et on la renvoie depuis notre domaine
// (mise en cache 6 h). Si TikTok ne répond pas, une jolie image de secours est renvoyée
// pour que la carte ne soit jamais cassée.
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAVIGATEUR = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const CACHE_OK = "public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400";

function secoursSvg(): NextResponse {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280"><defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a0b2e"/><stop offset="1" stop-color="#0b0817"/></linearGradient></defs><rect width="720" height="1280" fill="url(#f)"/><g transform="translate(360 600)"><circle r="120" fill="#7b38ff" opacity=".18"/><path d="M-30 -60 L50 0 L-30 60 Z" fill="#f5f1ff"/></g><text x="360" y="820" text-anchor="middle" font-family="system-ui,sans-serif" font-size="54" font-weight="700" fill="#e0b3ff">TikTok</text></svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=600, s-maxage=1800" } });
}

async function urlCanonique(url: string): Promise<string> {
  // Liens courts (vm.tiktok.com, tiktok.com/t/…) : on suit la redirection vers l'adresse complète
  if (!/vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/t\//i.test(url)) return url;
  try {
    const r = await fetch(url, { redirect: "follow", headers: { "User-Agent": NAVIGATEUR }, signal: AbortSignal.timeout(6000) });
    return r.url || url;
  } catch {
    return url;
  }
}

export async function GET(request: NextRequest) {
  const brut = request.nextUrl.searchParams.get("url") || "";
  // strict=1 : erreur 404 au lieu de l'image de secours (la page affiche alors le lecteur TikTok)
  const strict = request.nextUrl.searchParams.get("strict") === "1";
  const secours = () => (strict ? new NextResponse("", { status: 404, headers: { "Cache-Control": "public, max-age=300, s-maxage=600" } }) : secoursSvg());
  let video: URL;
  try {
    video = new URL(brut);
  } catch {
    return secours();
  }
  if (!/(^|\.)tiktok\.com$/i.test(video.hostname)) return secours();
  try {
    const url = await urlCanonique(video.toString());
    const o = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, { headers: { "User-Agent": NAVIGATEUR, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(7000) });
    if (!o.ok) return secours();
    const data = await o.json().catch(() => null);
    const vignette = data?.thumbnail_url;
    if (!vignette || !/^https:\/\//.test(vignette)) return secours();
    const img = await fetch(vignette, { headers: { "User-Agent": NAVIGATEUR, Referer: "https://www.tiktok.com/" }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    const type = img.headers.get("content-type") || "";
    if (!img.ok || !type.startsWith("image/")) return secours();
    return new NextResponse(await img.arrayBuffer(), { headers: { "Content-Type": type, "Cache-Control": CACHE_OK } });
  } catch {
    return secours();
  }
}
