"use client";

import { getProchainLive } from "@/data/planning";
import { liens } from "@/data/liens";
import { useTwitchStatus } from "@/components/useTwitchStatus";
import { IconTwitch, IconMoonCrescent, IconStar4 } from "@/components/Icons";

export default function StatutTwitch() {
  const { enLigne, titre, categorie, viewers, miniature } = useTwitchStatus();
  const prochainLive = getProchainLive();

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-14">
      <div className="relative carte-holo liseret-glow rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
        <IconStar4 className="hidden md:block absolute top-6 right-8 w-5 h-5 text-violet-light/40" aria-hidden />

        {enLigne ? (
          <>
            <div className="flex-1">
              <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-red-500/15 border border-red-400/30 px-3 py-1.5 text-red-300 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                En live
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-2">
                {titre ?? "Live en cours"}
              </h2>
              <p className="text-ink-soft mb-1">{categorie}</p>
              {viewers !== undefined && (
                <p className="text-ink-soft text-sm mb-6">{viewers} viewers</p>
              )}
              <a
                href={liens.twitch}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-violet text-ink font-medium hover:bg-violet-light hover:shadow-glow transition-all"
              >
                <IconTwitch className="w-4 h-4" />
                Regarder maintenant
              </a>
            </div>
            {miniature && (
              <a
                href={liens.twitch}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-72 aspect-video rounded-2xl overflow-hidden border border-violet/25 shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={miniature} alt="Aperçu du live" className="w-full h-full object-cover" />
              </a>
            )}
          </>
        ) : (
          <div className="flex-1">
            <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-violet/10 border border-violet/25 px-3 py-1.5 text-ink-soft mb-4">
              <IconMoonCrescent className="w-3.5 h-3.5 text-violet-light" />
              Hors ligne
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-3">
              Prochain live
            </h2>
            {prochainLive ? (
              <p className="text-ink-soft mb-6">
                {prochainLive.estAujourdhui ? "Ce soir" : prochainLive.jour} ·{" "}
                {prochainLive.heure} ·{" "}
                <span className="text-lilac">{prochainLive.jeu}</span>
              </p>
            ) : (
              <p className="text-ink-soft mb-6">
                Planning à venir, reste connecté·e !
              </p>
            )}
            <a
              href={liens.twitch}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-violet/40 bg-violet/10 text-ink font-medium hover:bg-violet/20 hover:shadow-glow-sm transition-all"
            >
              <IconTwitch className="w-4 h-4" />
              Voir la chaîne Twitch
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
