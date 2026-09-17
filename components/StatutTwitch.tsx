"use client";

import { useEffect, useState } from "react";
import { liens } from "@/data/liens";
import { useTwitchStatus } from "@/components/useTwitchStatus";
import { IconTwitch, IconMoonCrescent, IconStar4 } from "@/components/Icons";
import type { ProchainLive } from "@/data/planning";

function formaterCompteARebours(msRestant: number): string {
  if (msRestant <= 0) return "c'est maintenant !";

  const secondes = Math.floor(msRestant / 1000);
  const jours = Math.floor(secondes / 86400);
  const heures = Math.floor((secondes % 86400) / 3600);
  const minutes = Math.floor((secondes % 3600) / 60);
  const sec = secondes % 60;

  if (jours > 0) return `dans ${jours}j ${heures}h`;
  if (heures > 0) return `dans ${heures}h ${minutes}min`;
  if (minutes > 0) return `dans ${minutes}min`;
  return `dans ${sec}s`;
}

function formaterDateProchainLive(timestamp: string): string {
  const date = new Date(timestamp);
  const formatte = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  // Majuscule en début de phrase ("jeudi 17 septembre" -> "Jeudi 17 septembre")
  return formatte.charAt(0).toUpperCase() + formatte.slice(1);
}

export default function StatutTwitch() {
  const { enLigne, titre, categorie, viewers, miniature } = useTwitchStatus();
  const [prochainLive, setProchainLive] = useState<ProchainLive | null>(null);
  const [chargementProchainLive, setChargementProchainLive] = useState(true);
  const [compteARebours, setCompteARebours] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prochain-live")
      .then((r) => r.json())
      .then((data) => setProchainLive(data.prochainLive))
      .catch(() => {})
      .finally(() => setChargementProchainLive(false));
  }, []);

  useEffect(() => {
    if (!prochainLive) return;
    const cible = new Date(prochainLive.timestamp).getTime();

    function tick() {
      setCompteARebours(formaterCompteARebours(cible - Date.now()));
    }

    tick();
    const intervalle = setInterval(tick, 1000);
    return () => clearInterval(intervalle);
  }, [prochainLive]);

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8 py-10">
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
                <IconTwitch className="w-5 h-5" />
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
              <>
                <p className="text-ink-soft mb-1">
                  {prochainLive.estAujourdhui
                    ? "Ce soir"
                    : formaterDateProchainLive(prochainLive.timestamp)}{" "}
                  · {prochainLive.heure} ·{" "}
                  <span className="text-lilac">{prochainLive.jeu}</span>
                </p>
                {compteARebours && (
                  <p className="text-violet-light text-sm mb-6">{compteARebours}</p>
                )}
              </>
            ) : chargementProchainLive ? (
              <p className="text-ink-soft/40 mb-6">Chargement...</p>
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
              <IconTwitch className="w-5 h-5" />
              Voir la chaîne Twitch
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
