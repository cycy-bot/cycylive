"use client";

import { useEffect, useState } from "react";

export type StatutTwitchLive = {
  enLigne: boolean;
  configure?: boolean;
  titre?: string;
  categorie?: string;
  viewers?: number;
  debutLe?: string;
  miniature?: string;
};

// Interroge /api/twitch-status au chargement, puis toutes les
// `intervalleMs` millisecondes, pour refléter le vrai statut Twitch
// sans jamais avoir besoin d'y toucher à la main.
export function useTwitchStatus(intervalleMs = 30000): StatutTwitchLive {
  const [statut, setStatut] = useState<StatutTwitchLive>({ enLigne: false });

  useEffect(() => {
    let annule = false;

    async function charger() {
      try {
        const reponse = await fetch("/api/twitch-status", { cache: "no-store" });
        const data = await reponse.json();
        if (!annule) setStatut(data);
      } catch {
        // En cas d'erreur réseau, on garde le dernier statut connu
        // plutôt que de casser l'affichage.
      }
    }

    charger();
    const intervalle = setInterval(charger, intervalleMs);
    return () => {
      annule = true;
      clearInterval(intervalle);
    };
  }, [intervalleMs]);

  return statut;
}
