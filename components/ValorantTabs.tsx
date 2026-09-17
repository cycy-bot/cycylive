"use client";

import { useState } from "react";
import type { NewsValorant, ProfilValorant } from "@/data/valorant";
import { IconValorant, IconStar4, IconCrystal, IconOrbit } from "@/components/Icons";

type SousOnglet = "news" | "favoris" | "rank";

export default function ValorantTabs({
  news,
  profil,
}: {
  news: NewsValorant[];
  profil: ProfilValorant;
}) {
  const [onglet, setOnglet] = useState<SousOnglet>("news");
  const mains = profil.mains
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  return (
    <div>
      <div className="flex gap-2 mb-8">
        {(
          [
            { valeur: "news", label: "News" },
            { valeur: "favoris", label: "Mes favoris" },
            { valeur: "rank", label: "Mon rank" },
          ] as const
        ).map((o) => (
          <button
            key={o.valeur}
            onClick={() => setOnglet(o.valeur)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              onglet === o.valeur
                ? "bg-violet text-ink"
                : "border border-violet/20 text-ink-soft hover:border-violet/40"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "news" && (
        <div className="space-y-3">
          {news.map((n) => (
            <a
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="carte-holo rounded-2xl p-4 flex items-center gap-3 border border-violet/12 hover:shadow-glow-sm hover:border-violet/30 transition-all"
            >
              <span className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-violet/10 border border-violet/25 text-violet-light">
                <IconValorant className="w-4 h-4" />
              </span>
              <span className="text-ink text-sm font-medium">{n.titre}</span>
            </a>
          ))}
          {news.length === 0 && (
            <p className="text-ink-soft/60 text-sm">Aucune news pour l'instant.</p>
          )}
        </div>
      )}

      {onglet === "favoris" && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="carte-holo rounded-2xl p-5 border border-violet/12">
            <IconOrbit className="w-5 h-5 text-violet-light mb-3" />
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">
              Map favorite
            </p>
            <p className="text-ink font-medium">{profil.mapFavorite}</p>
          </div>
          <div className="carte-holo rounded-2xl p-5 border border-violet/12">
            <IconStar4 className="w-5 h-5 text-violet-light mb-3" />
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">
              Skin favori
            </p>
            <p className="text-ink font-medium">{profil.skinFavori}</p>
          </div>
          <div className="carte-holo rounded-2xl p-5 border border-violet/12">
            <IconCrystal className="w-5 h-5 text-violet-light mb-3" />
            <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">
              Mes mains
            </p>
            {mains.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {mains.map((agent) => (
                  <span
                    key={agent}
                    className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-ink-soft"
                  >
                    {agent}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-ink font-medium">{profil.mains || "À définir"}</p>
            )}
          </div>
        </div>
      )}

      {onglet === "rank" && (
        <div className="carte-holo rounded-2xl p-6 border border-violet/12">
          <p className="text-xs uppercase tracking-wide text-ink-soft/50 mb-1.5">
            Rank actuel
          </p>
          <p className="text-2xl font-semibold text-ink mb-5">{profil.rankActuel}</p>
          {profil.trackerUrl ? (
            <a
              href={profil.trackerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full px-5 py-2.5 border border-violet/40 bg-violet/10 text-ink text-sm font-medium hover:bg-violet/20 transition-all"
            >
              Voir le profil complet sur Tracker.gg
            </a>
          ) : (
            <p className="text-ink-soft/60 text-sm">
              Lien Tracker.gg à venir.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
