"use client";

import { useState } from "react";
import type { ContenuAvecMiniature } from "@/lib/miniatures";
import {
  IconTikTok,
  IconInstagram,
  IconYouTube,
  IconTwitch,
} from "@/components/Icons";

const iconParPlateforme = {
  TikTok: IconTikTok,
  Instagram: IconInstagram,
  YouTube: IconYouTube,
  Twitch: IconTwitch,
};

const FILTRES: { label: string; valeur: ContenuAvecMiniature["plateforme"] | "Tous" }[] = [
  { label: "Tous", valeur: "Tous" },
  { label: "TikTok", valeur: "TikTok" },
  { label: "Instagram", valeur: "Instagram" },
  { label: "YouTube", valeur: "YouTube" },
  { label: "Clips Twitch", valeur: "Twitch" },
];

export default function GalerieContenus({ contenus }: { contenus: ContenuAvecMiniature[] }) {
  const [filtre, setFiltre] = useState<ContenuAvecMiniature["plateforme"] | "Tous">("Tous");

  const plateformesPresentes = new Set(contenus.map((c) => c.plateforme));
  const filtresDisponibles = FILTRES.filter(
    (f) => f.valeur === "Tous" || plateformesPresentes.has(f.valeur)
  );

  const contenusAffiches =
    filtre === "Tous" ? contenus : contenus.filter((c) => c.plateforme === filtre);

  return (
    <>
      {filtresDisponibles.length > 2 && (
        <div className="flex flex-wrap gap-2 px-5 md:px-8 mb-6">
          {filtresDisponibles.map((f) => (
            <button
              key={f.valeur}
              onClick={() => setFiltre(f.valeur)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                filtre === f.valeur
                  ? "bg-violet text-ink"
                  : "border border-violet/20 text-ink-soft hover:border-violet/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto px-5 md:px-8 pb-2 snap-x snap-mandatory scrollbar-hide">
        {contenusAffiches.map((contenu) => {
          const Icon = iconParPlateforme[contenu.plateforme];
          return (
            <a
              key={contenu.id}
              href={contenu.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`snap-start shrink-0 carte-holo rounded-2xl overflow-hidden hover:shadow-glow-sm transition-all ${
                contenu.format === "vertical" ? "w-40 md:w-48" : "w-64 md:w-80"
              }`}
            >
              <div
                className={`relative bg-nebula flex items-center justify-center text-ink-soft/30 text-xs overflow-hidden ${
                  contenu.format === "vertical" ? "aspect-[9/16]" : "aspect-video"
                }`}
              >
                {contenu.miniature ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={contenu.miniature}
                    alt={contenu.titre}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <span>{contenu.plateforme}</span>
                )}
                <span className="absolute top-2 left-2 h-7 w-7 flex items-center justify-center rounded-full bg-void/70 border border-violet/30 text-violet-light">
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="p-3">
                <span className="eyebrow text-[10px] text-violet-light">
                  {contenu.plateforme}
                </span>
                <p className="text-sm text-ink mt-1.5 line-clamp-2">
                  {contenu.titre}
                </p>
              </div>
            </a>
          );
        })}

        {contenusAffiches.length === 0 && (
          <p className="text-ink-soft/60 text-sm py-6">
            Rien à afficher pour ce filtre.
          </p>
        )}
      </div>
    </>
  );
}
