"use client";

// ============================================================
// TIMELINE INTERACTIVE — page À propos
// ============================================================
// La frise est une traînée d'étoiles : elle se remplit de lumière au fil
// du défilement et l'étoile du moment que tu lis s'allume. Les moments
// forts sont de plus grandes étoiles. Filtres par catégorie, ordre
// (du début / du plus récent), texte dépliable et clips intégrés.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { CategorieTimeline, EtapeTimeline, ReglagesTimeline } from "@/data/timeline";
import { CATEGORIES, ORDRE_CATEGORIES, categorieDe, iconeDe } from "@/lib/timelineDesign";
import { liensEtape } from "@/lib/videoMoment";
import Icone from "@/components/icones/Icone";
import LecteurMoment from "@/components/LecteurMoment";

const LONG = 260; // au-delà, la description se replie

function Etoile({ taille, couleur, allumee }: { taille: number; couleur: string; allumee: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={taille} height={taille} aria-hidden className="block transition-[filter,transform] duration-500" style={{ filter: allumee ? `drop-shadow(0 0 6px ${couleur}) drop-shadow(0 0 14px ${couleur})` : "none", transform: allumee ? "scale(1.12)" : "scale(1)" }}>
      <path d="M12 1.5c.5 4.6 1.9 7.9 4.2 9.3 1.4.8 3.4 1.2 6.3 1.2-2.9 0-4.9.4-6.3 1.2-2.3 1.4-3.7 4.7-4.2 9.3-.5-4.6-1.9-7.9-4.2-9.3C6.4 12.4 4.4 12 1.5 12c2.9 0 4.9-.4 6.3-1.2C10.1 9.4 11.5 6.1 12 1.5Z" fill={allumee ? couleur : "#2a2140"} stroke={couleur} strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  );
}

function Moment({ e, cote, allumee, dernier }: { e: EtapeTimeline; cote: "gauche" | "droite"; allumee: boolean; dernier: boolean }) {
  const cat = CATEGORIES[categorieDe(e)];
  const [deplie, setDeplie] = useState(false);
  const long = (e.description?.length ?? 0) > LONG;
  const liens = liensEtape(e);
  const fort = Boolean(e.marquant);
  const vars = { "--c": cat.couleur, "--d": cat.douce } as CSSProperties;

  const carte = (
    <article
      className={
        "relative rounded-2xl border p-5 md:p-6 transition-colors duration-500 " +
        (fort ? "md:p-7" : "")
      }
      style={{
        ...vars,
        borderColor: allumee ? cat.couleur + (fort ? "99" : "55") : fort ? cat.couleur + "40" : "rgba(181,124,255,.14)",
        background: fort
          ? `radial-gradient(120% 90% at ${cote === "gauche" ? "100%" : "0%"} 0%, ${cat.douce}, transparent 65%), rgba(18,13,32,.88)`
          : "rgba(16,12,29,.72)",
        boxShadow: fort && allumee ? `0 0 0 1px ${cat.couleur}22, 0 18px 50px -20px ${cat.couleur}66` : undefined,
      }}
    >
      <p className="md:hidden mb-2 text-sm font-semibold" style={{ color: cat.couleur, fontFamily: "var(--font-display)" }}>{e.date}</p>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: cat.couleur, background: cat.douce }}>
          <Icone nom={iconeDe(e)} className="w-3.5 h-3.5" /> {cat.label}
        </span>
        {fort && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
            <Icone nom="etoile" className="w-3 h-3" /> Moment fort
          </span>
        )}
        {e.chiffre && <span className="rounded-full bg-white/[.06] px-2.5 py-1 text-xs font-semibold text-ink">{e.chiffre}</span>}
      </div>
      <h3 className={"font-semibold text-ink leading-snug " + (fort ? "text-xl md:text-2xl" : "text-lg")}>{e.titre}</h3>
      {e.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={e.image} alt="" loading="lazy" className="mt-4 w-full aspect-video object-cover rounded-xl border border-white/10" />
      )}
      {e.description && (
        <div className="mt-2.5">
          <p className={"text-ink-soft text-[15px] leading-relaxed whitespace-pre-line " + (long && !deplie ? "line-clamp-4" : "")}>{e.description}</p>
          {long && (
            <button type="button" onClick={() => setDeplie((v) => !v)} aria-expanded={deplie} className="mt-1.5 text-sm font-semibold hover:text-ink transition-colors" style={{ color: cat.couleur }}>
              {deplie ? "Réduire" : "Lire la suite"}
            </button>
          )}
        </div>
      )}
      {liens.length > 0 && <LecteurMoment liens={liens} titre={e.titre} />}
    </article>
  );

  const date = (
    <p className={"hidden md:block pt-1 font-semibold transition-colors duration-500 " + (fort ? "text-3xl" : "text-2xl") + (cote === "gauche" ? " text-left" : " text-right")} style={{ color: allumee ? cat.couleur : "rgba(207,198,232,.45)", fontFamily: "var(--font-display)" }}>
      {e.date}
    </p>
  );

  return (
    <li className={"relative grid grid-cols-[36px_1fr] md:grid-cols-[1fr_72px_1fr] gap-x-3 md:gap-x-0 " + (dernier ? "" : "pb-10 md:pb-14")} data-moment={e.id}>
      {/* Étoile sur la frise */}
      <div className="col-start-1 md:col-start-2 row-start-1 flex items-start justify-center pt-1">
        <a href={"#moment-" + e.id} id={"moment-" + e.id} aria-label={e.date + " : " + e.titre} className="relative z-10 rounded-full p-1 scroll-mt-28 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-light" style={{ background: "#0d0a17" }}>
          <Etoile taille={fort ? 34 : 24} couleur={cat.couleur} allumee={allumee} />
        </a>
      </div>
      {cote === "gauche" ? (
        <>
          <div className="col-start-2 md:col-start-1 row-start-1 md:pr-8">{carte}</div>
          <div className="hidden md:block md:col-start-3 row-start-1 md:pl-8">{date}</div>
        </>
      ) : (
        <>
          <div className="hidden md:block md:col-start-1 row-start-1 md:pr-8">{date}</div>
          <div className="col-start-2 md:col-start-3 row-start-1 md:pl-8">{carte}</div>
        </>
      )}
    </li>
  );
}

export default function TimelineInteractive({ etapes, reglages }: { etapes: EtapeTimeline[]; reglages: ReglagesTimeline }) {
  const [filtre, setFiltre] = useState<CategorieTimeline | null>(null);
  const [ordre, setOrdre] = useState(reglages.ordre);
  const [actif, setActif] = useState<string | null>(null);
  const [remplissage, setRemplissage] = useState(0);
  const liste = useRef<HTMLOListElement | null>(null);

  const presentes = useMemo(() => {
    const n: Partial<Record<CategorieTimeline, number>> = {};
    etapes.forEach((e) => {
      const c = categorieDe(e);
      n[c] = (n[c] ?? 0) + 1;
    });
    return ORDRE_CATEGORIES.filter((c) => n[c]).map((c) => ({ c, n: n[c] as number }));
  }, [etapes]);

  const visibles = useMemo(() => {
    const l = filtre ? etapes.filter((e) => categorieDe(e) === filtre) : etapes;
    return ordre === "recent" ? [...l].reverse() : l;
  }, [etapes, filtre, ordre]);

  const nbVideos = etapes.reduce((s, e) => s + liensEtape(e).length, 0);

  // La frise se remplit de lumière et l'étoile la plus proche du milieu de l'écran s'allume
  useEffect(() => {
    let image = 0;
    const calcul = () => {
      image = 0;
      const ol = liste.current;
      if (!ol) return;
      const r = ol.getBoundingClientRect();
      const milieu = window.innerHeight * 0.55;
      setRemplissage(Math.max(0, Math.min(1, (milieu - r.top) / Math.max(1, r.height))));
      let meilleur: string | null = null;
      let ecart = Infinity;
      ol.querySelectorAll<HTMLElement>("[data-moment]").forEach((li) => {
        const b = li.getBoundingClientRect();
        if (b.top > milieu) return;
        const d = milieu - b.top;
        if (d < ecart) {
          ecart = d;
          meilleur = li.dataset.moment ?? null;
        }
      });
      setActif(meilleur);
    };
    const demande = () => {
      if (!image) image = requestAnimationFrame(calcul);
    };
    calcul();
    window.addEventListener("scroll", demande, { passive: true });
    window.addEventListener("resize", demande);
    return () => {
      window.removeEventListener("scroll", demande);
      window.removeEventListener("resize", demande);
      cancelAnimationFrame(image);
    };
  }, [visibles]);

  if (!etapes.length) return null;
  // Les étoiles déjà passées restent allumées
  const indexActif = visibles.findIndex((e) => e.id === actif);
  const puce = "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-light";

  return (
    <section id="timeline" className="py-8 md:py-12 border-t border-violet/10 scroll-mt-24">
      <div className="max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-semibold text-ink">{reglages.titre}</h2>
        {reglages.intro && <p className="mt-3 text-ink-soft leading-relaxed">{reglages.intro}</p>}
        <p className="mt-3 text-sm text-ink-soft/70">
          {etapes.length} moment{etapes.length > 1 ? "s" : ""} depuis {etapes[0].date}
          {nbVideos > 0 && <>, dont {nbVideos} à revoir en vidéo</>}
        </p>
      </div>

      {(reglages.filtres && presentes.length > 1) || etapes.length > 2 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {reglages.filtres && presentes.length > 1 && (
            <>
              <button type="button" aria-pressed={filtre === null} onClick={() => setFiltre(null)} className={puce + (filtre === null ? " border-violet-light/60 bg-violet/20 text-ink" : " border-violet/20 text-ink-soft hover:text-ink")}>
                Tout
              </button>
              {presentes.map(({ c, n }) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={filtre === c}
                  onClick={() => setFiltre(filtre === c ? null : c)}
                  className={puce + " inline-flex items-center gap-1.5" + (filtre === c ? " text-ink" : " border-violet/20 text-ink-soft hover:text-ink")}
                  style={filtre === c ? { borderColor: CATEGORIES[c].couleur + "99", background: CATEGORIES[c].douce } : undefined}
                >
                  <Icone nom={CATEGORIES[c].icone} className="w-3.5 h-3.5" style={{ color: CATEGORIES[c].couleur }} />
                  {CATEGORIES[c].label}
                  <span className="text-ink-soft/60 tabular-nums">{n}</span>
                </button>
              ))}
            </>
          )}
          {etapes.length > 2 && (
            <div className="ml-auto inline-flex rounded-full border border-violet/20 p-0.5" role="group" aria-label="Ordre des moments">
              {(["chronologique", "recent"] as const).map((o) => (
                <button key={o} type="button" aria-pressed={ordre === o} onClick={() => setOrdre(o)} className={"rounded-full px-3 py-1 text-sm font-medium transition-colors " + (ordre === o ? "bg-violet/25 text-ink" : "text-ink-soft hover:text-ink")}>
                  {o === "chronologique" ? "Depuis le début" : "Les plus récents"}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="relative mt-10">
        {/* La frise : traînée sombre, et la lumière qui la remplit */}
        <div aria-hidden className="absolute top-0 bottom-0 left-[18px] md:left-1/2 w-px -translate-x-1/2 bg-violet/15" />
        <div
          aria-hidden
          className="absolute top-0 left-[18px] md:left-1/2 w-[3px] -translate-x-1/2 rounded-full"
          style={{ height: `${remplissage * 100}%`, background: "linear-gradient(180deg, rgba(181,124,255,0), #B57CFF 18%, #E0B3FF)", boxShadow: "0 0 12px rgba(181,124,255,.7)" }}
        />
        <ol ref={liste} className="relative">
          {visibles.map((e, i) => (
            <Moment key={e.id} e={e} cote={i % 2 === 0 ? "gauche" : "droite"} allumee={indexActif >= 0 && i <= indexActif} dernier={i === visibles.length - 1} />
          ))}
        </ol>
        {reglages.fin && (
          <div className="relative mt-10 grid grid-cols-[36px_1fr] md:grid-cols-[1fr_72px_1fr] items-center gap-x-3 md:gap-x-0">
            <div className="col-start-1 md:col-start-2 flex justify-center">
              <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full border border-violet-light/40 bg-void text-lilac">
                <Icone nom="fusee" className="w-4 h-4" />
              </span>
            </div>
            <p className="col-start-2 md:col-start-1 md:col-span-3 md:row-start-2 md:mt-3 md:text-center text-lilac font-medium">{reglages.fin}</p>
          </div>
        )}
      </div>
    </section>
  );
}
