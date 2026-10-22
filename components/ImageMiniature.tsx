"use client";

// Miniature d'une vidéo (cartes TikTok, YouTube, clips…).
// Pour TikTok, l'image passe par cycylive.fr (/api/miniature/tiktok). Si TikTok refuse de la
// donner à notre serveur, on affiche à la place le lecteur officiel de TikTok (dans le navigateur
// du visiteur, jamais bloqué) : il montre l'image de couverture de la vidéo, sans son ni lecture.
import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

const idTiktok = (url: string) => url.match(/tiktok\.com\/.*\/video\/(\d{8,})/i)?.[1] || url.match(/\/video\/(\d{8,})/)?.[1] || null;
const PARAMS = "controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0&autoplay=0&loop=0";

export default function ImageMiniature({ src, video = "", alt = "", className = "", ...reste }: ImgHTMLAttributes<HTMLImageElement> & { src?: string; video?: string }) {
  const [rate, setRate] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);
  // L'image a pu échouer avant que la page soit interactive : on vérifie au montage
  useEffect(() => {
    const i = ref.current;
    if (i && i.complete && i.naturalWidth === 0) setRate(true);
  }, []);
  const tiktok = String(src || "").startsWith("/api/miniature/tiktok");
  if (rate && tiktok) {
    if (reste["aria-hidden"]) return null; // copie floutée en fond : inutile avec le lecteur
    const lien = video || decodeURIComponent(String(src).split("url=")[1]?.split("&")[0] || "");
    const id = idTiktok(lien);
    if (!id) return <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#25f4ee33] via-transparent to-[#fe2c5533] text-sm font-semibold text-ink">TikTok</span>;
    return (
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
        <iframe
          src={`https://www.tiktok.com/player/v1/${id}?${PARAMS}`}
          title={alt || "Vidéo TikTok"}
          loading="lazy"
          tabIndex={-1}
          allow="encrypted-media"
          className="h-full aspect-[9/16] max-w-none border-0"
          style={{ minWidth: "100%", minHeight: "100%", width: "auto" }}
        />
      </span>
    );
  }
  if (rate) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} className={className} onError={() => setRate(true)} {...reste} />;
}
