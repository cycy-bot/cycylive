// Carte d'un clip Twitch (page Clips, carrousel Valorant) : miniature, durée, vues, jeu.
import ImageMiniature from "@/components/ImageMiniature";
import Icone from "@/components/icones/Icone";
import type { ClipTwitch } from "@/lib/clipsTwitch";

export function ilYa(iso: string): string {
  const j = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (!Number.isFinite(j)) return "";
  if (j <= 0) return "aujourd'hui";
  if (j === 1) return "hier";
  if (j < 30) return `il y a ${j} jours`;
  const m = Math.floor(j / 30);
  return m < 12 ? `il y a ${m} mois` : new Date(iso).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}
export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function CarteClip({ c, grande = false, className = "" }: { c: ClipTwitch; grande?: boolean; className?: string }) {
  return (
    <a href={c.url} target="_blank" rel="noopener noreferrer" className={`group block overflow-hidden rounded-2xl border border-violet/15 bg-card/80 transition-all hover:-translate-y-1 hover:border-violet/50 hover:shadow-glow-sm ${className}`}>
      <div className="relative aspect-video overflow-hidden bg-nebula">
        <ImageMiniature src={c.miniature} video={c.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" aria-hidden />
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className={`flex items-center justify-center rounded-full bg-violet/90 text-white shadow-glow transition-all group-hover:scale-110 ${grande ? "h-16 w-16 opacity-90" : "h-12 w-12 opacity-0 group-hover:opacity-100"}`}><Icone nom="lecture" className={grande ? "w-8 h-8" : "w-6 h-6"} /></span>
        </span>
        <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular-nums">{mmss(c.duree)}</span>
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white inline-flex items-center gap-1"><Icone nom="oeil" className="w-3.5 h-3.5" /> {c.vues.toLocaleString("fr-FR")}</span>
        {c.jeu ? <span className="absolute bottom-2 left-2 max-w-[60%] truncate rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] text-white">{c.jeu}</span> : null}
      </div>
      <div className={grande ? "p-5" : "p-3.5"}>
        <p className={`line-clamp-2 font-medium text-ink ${grande ? "text-lg md:text-xl" : "text-sm"}`} title={c.titre}>{c.titre}</p>
        <p className="mt-1 truncate text-xs text-ink-soft/70">{[ilYa(c.date), c.auteur ? `clippé par ${c.auteur}` : ""].filter(Boolean).join(" · ")}</p>
      </div>
    </a>
  );
}
