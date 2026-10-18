import Link from "next/link";
import { lireTimeline, lireReglagesTimeline } from "@/lib/timelineStore";
import { CATEGORIES, categorieDe, iconeDe } from "@/lib/timelineDesign";
import { liensEtape } from "@/lib/videoMoment";
import Icone from "@/components/icones/Icone";
import LecteurMoment from "@/components/LecteurMoment";

// Accueil : les derniers moments du parcours, posés sur une frise étoilée
export default async function TimelineApercu() {
  const [timeline, reglages] = await Promise.all([lireTimeline(), lireReglagesTimeline()]);
  const n = reglages.apercuAccueil;
  const etapes = n > 0 ? timeline.filter((e) => !e.masque).slice(-n) : [];
  if (etapes.length === 0) return null;

  const colonnes = etapes.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : etapes.length === 2 ? "sm:grid-cols-2" : "";

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-6 md:py-10">
      <div className="flex items-end justify-between gap-4 mb-7">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-ink">Mon parcours</h2>
          <p className="mt-1 text-ink-soft">Les derniers moments marquants de l&apos;aventure.</p>
        </div>
        <Link href="/a-propos#timeline" className="text-sm font-semibold text-violet-light hover:text-lilac transition-colors hidden md:inline">
          Voir toute la frise
        </Link>
      </div>

      <div className="relative">
        {/* Frise horizontale (grands écrans) */}
        <div aria-hidden className="hidden lg:block absolute left-0 right-0 top-[15px] h-px bg-gradient-to-r from-transparent via-violet-light/40 to-violet-light/70" />
        <ol className={"grid gap-5 " + colonnes}>
          {etapes.map((e) => {
            const cat = CATEGORIES[categorieDe(e)];
            const liens = liensEtape(e);
            return (
              <li key={e.id} className="relative">
                <div className="hidden lg:flex items-center gap-3 mb-4">
                  <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full border bg-void" style={{ borderColor: cat.couleur + "80", color: cat.couleur, boxShadow: `0 0 14px ${cat.couleur}44` }}>
                    <Icone nom={iconeDe(e)} className="w-4 h-4" />
                  </span>
                  <span className="relative z-10 bg-void/80 pr-2 text-sm font-semibold" style={{ color: cat.couleur }}>{e.date}</span>
                </div>
                <article className="h-full rounded-2xl border p-5" style={{ borderColor: e.marquant ? cat.couleur + "55" : "rgba(181,124,255,.14)", background: `radial-gradient(110% 80% at 0% 0%, ${cat.douce}, transparent 60%), rgba(16,12,29,.78)` }}>
                  <div className="lg:hidden flex items-center gap-2 mb-2 text-sm font-semibold" style={{ color: cat.couleur }}>
                    <Icone nom={iconeDe(e)} className="w-4 h-4" /> {e.date}
                  </div>
                  <h3 className="text-ink font-semibold leading-snug">{e.titre}</h3>
                  {e.chiffre && <p className="mt-2 inline-block rounded-full bg-white/[.06] px-2.5 py-0.5 text-xs font-semibold text-ink">{e.chiffre}</p>}
                  {e.description && <p className="mt-2 text-ink-soft text-sm leading-relaxed line-clamp-3">{e.description}</p>}
                  {liens.length > 0 && <LecteurMoment liens={liens} titre={e.titre} compact />}
                </article>
              </li>
            );
          })}
        </ol>
      </div>

      <Link href="/a-propos#timeline" className="mt-5 inline-flex text-sm font-semibold text-violet-light hover:text-lilac transition-colors md:hidden">
        Voir toute la frise
      </Link>
    </section>
  );
}
