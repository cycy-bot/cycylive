"use client";

// ============================================================
// BOUTON « VOIR LE CLIP » D'UN MOMENT DE LA TIMELINE
// ============================================================
// Clip Twitch, TikTok ou YouTube : s'ouvre dans une fenêtre par-dessus
// la page (le lecteur ne se charge qu'au clic, la page reste légère).
// Autre lien : s'ouvre dans un nouvel onglet.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icone from "@/components/icones/Icone";
import { analyserLien, urlLecteur, NOM_PLATEFORME } from "@/lib/videoMoment";

export default function LecteurMoment({ lien, titre, compact = false }: { lien?: string; titre: string; compact?: boolean }) {
  const video = analyserLien(lien);
  const [ouvert, setOuvert] = useState(false);
  const [site, setSite] = useState("");
  const fermer = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setSite(window.location.hostname), []);
  useEffect(() => {
    if (!ouvert) return;
    const echap = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    document.addEventListener("keydown", echap);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fermer.current?.focus();
    return () => {
      document.removeEventListener("keydown", echap);
      document.body.style.overflow = avant;
    };
  }, [ouvert]);

  if (!video) return null;
  const libelle = "Voir " + NOM_PLATEFORME[video.type];
  const style = compact
    ? "mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-lilac hover:text-ink transition-colors"
    : "mt-2.5 inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3.5 py-1.5 text-xs font-semibold text-lilac hover:bg-violet/20 hover:text-ink transition-all";

  if (video.type === "lien") {
    return (
      <a href={video.url} target="_blank" rel="noopener noreferrer" className={style}>
        <Icone nom="lecture" className="w-3.5 h-3.5" /> {libelle}
        <Icone nom="externe" className="w-3 h-3 opacity-70" />
      </a>
    );
  }

  const src = site ? urlLecteur(video, site) : null;
  const vertical = video.format === "vertical";

  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className={style}>
        <Icone nom="lecture" className="w-3.5 h-3.5" /> {libelle}
      </button>
      {ouvert && site && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={titre}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setOuvert(false)}
        >
          <div className={"relative w-full " + (vertical ? "" : "max-w-4xl")} style={vertical ? { maxWidth: "min(380px, calc((100svh - 7rem) * 9 / 16))" } : undefined}>
            <div className="mb-2 flex items-center gap-3">
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{titre}</p>
              <button
                ref={fermer}
                type="button"
                onClick={() => setOuvert(false)}
                className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-ink hover:bg-white/20"
              >
                Fermer ✕
              </button>
            </div>
            <div className={"overflow-hidden rounded-2xl border border-violet/30 bg-void shadow-glow " + (vertical ? "aspect-[9/16]" : "aspect-video")}>
              {src && (
                <iframe
                  src={src}
                  title={titre}
                  className="h-full w-full"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            {lien && (
              <a href={lien} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink">
                Ouvrir sur {video.type === "twitch" ? "Twitch" : video.type === "tiktok" ? "TikTok" : "YouTube"} <Icone nom="externe" className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
