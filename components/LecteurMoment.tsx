"use client";

// ============================================================
// BOUTONS « VOIR LE CLIP » D'UN MOMENT DE LA TIMELINE
// ============================================================
// Un ou plusieurs liens (clip Twitch, TikTok, YouTube) : chacun a son
// bouton et s'ouvre dans une fenêtre par-dessus la page (le lecteur ne
// se charge qu'au clic). Avec plusieurs vidéos, on passe de l'une à
// l'autre sans fermer. Autre lien : nouvel onglet.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icone from "@/components/icones/Icone";
import { analyserLien, urlLecteur, NOM_PLATEFORME, NOM_SITE, type VideoMoment } from "@/lib/videoMoment";

type Entree = { lien: string; video: VideoMoment; libelle: string };

function preparer(liens: string[]): Entree[] {
  const ok = liens.map((lien) => ({ lien, video: analyserLien(lien) })).filter((x): x is { lien: string; video: VideoMoment } => x.video !== null);
  const total: Record<string, number> = {};
  ok.forEach((x) => (total[x.video.type] = (total[x.video.type] ?? 0) + 1));
  const vus: Record<string, number> = {};
  return ok.map((x) => {
    const n = (vus[x.video.type] = (vus[x.video.type] ?? 0) + 1);
    return { ...x, libelle: "Voir " + NOM_PLATEFORME[x.video.type] + (total[x.video.type] > 1 ? " " + n : "") };
  });
}

export default function LecteurMoment({ liens, titre, compact = false }: { liens: string[]; titre: string; compact?: boolean }) {
  const entrees = preparer(liens);
  const jouables = entrees.filter((e) => e.video.type !== "lien");
  const [ouvert, setOuvert] = useState<number | null>(null); // index dans « jouables »
  const [site, setSite] = useState("");
  const fermer = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setSite(window.location.hostname), []);
  useEffect(() => {
    if (ouvert === null) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(null);
      if (e.key === "ArrowRight" && jouables.length > 1) setOuvert((i) => (i === null ? i : (i + 1) % jouables.length));
      if (e.key === "ArrowLeft" && jouables.length > 1) setOuvert((i) => (i === null ? i : (i - 1 + jouables.length) % jouables.length));
    };
    document.addEventListener("keydown", touche);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fermer.current?.focus();
    return () => {
      document.removeEventListener("keydown", touche);
      document.body.style.overflow = avant;
    };
  }, [ouvert, jouables.length]);

  if (!entrees.length) return null;
  const style = compact
    ? "inline-flex items-center gap-1.5 text-xs font-semibold text-lilac hover:text-ink transition-colors"
    : "inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3.5 py-1.5 text-xs font-semibold text-lilac hover:bg-violet/20 hover:text-ink transition-all";

  const actuel = ouvert !== null ? jouables[ouvert] : null;
  const src = actuel && site ? urlLecteur(actuel.video, site) : null;
  const vertical = actuel ? "format" in actuel.video && actuel.video.format === "vertical" : false;
  const nav = "shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-ink hover:bg-white/20";

  return (
    <>
      <div className={"flex flex-wrap " + (compact ? "mt-1.5 gap-x-3 gap-y-1" : "mt-2.5 gap-2")}>
        {entrees.map((e, i) =>
          e.video.type === "lien" ? (
            <a key={i} href={e.lien} target="_blank" rel="noopener noreferrer" className={style}>
              <Icone nom="lecture" className="w-3.5 h-3.5" /> {e.libelle}
              <Icone nom="externe" className="w-3 h-3 opacity-70" />
            </a>
          ) : (
            <button key={i} type="button" onClick={() => setOuvert(jouables.indexOf(e))} className={style}>
              <Icone nom="lecture" className="w-3.5 h-3.5" /> {e.libelle}
            </button>
          )
        )}
      </div>
      {actuel && site &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={titre}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setOuvert(null)}
          >
            <div className={"relative w-full " + (vertical ? "" : "max-w-4xl")} style={vertical ? { maxWidth: "min(380px, calc((100svh - 7rem) * 9 / 16))" } : undefined}>
              <div className="mb-2 flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                  {titre}
                  {jouables.length > 1 && <span className="ml-2 font-normal text-ink-soft">{(ouvert ?? 0) + 1} / {jouables.length}</span>}
                </p>
                {jouables.length > 1 && (
                  <>
                    <button type="button" aria-label="Vidéo précédente" onClick={() => setOuvert(((ouvert ?? 0) - 1 + jouables.length) % jouables.length)} className={nav}>‹</button>
                    <button type="button" aria-label="Vidéo suivante" onClick={() => setOuvert(((ouvert ?? 0) + 1) % jouables.length)} className={nav}>›</button>
                  </>
                )}
                <button ref={fermer} type="button" onClick={() => setOuvert(null)} className={nav}>
                  Fermer <Icone nom="fermer" className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className={"overflow-hidden rounded-2xl border border-violet/30 bg-void shadow-glow " + (vertical ? "aspect-[9/16]" : "aspect-video")}>
                {src && (
                  <iframe
                    key={src}
                    src={src}
                    title={titre}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              <a href={actuel.lien} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink">
                Ouvrir sur {NOM_SITE[actuel.video.type]} <Icone nom="externe" className="w-3 h-3" />
              </a>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
