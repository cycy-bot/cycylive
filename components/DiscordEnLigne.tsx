"use client";

import { useEffect, useState } from "react";
import type { MembreDiscordEnLigne } from "@/lib/discordStats";

const COULEUR_STATUT: Record<string, string> = {
  online: "bg-emerald-400",
  idle: "bg-amber-400",
  dnd: "bg-red-400",
};

const NOMBRE_AFFICHE = 18;

export default function DiscordEnLigne() {
  const [enLigne, setEnLigne] = useState<number | null>(null);
  const [membres, setMembres] = useState<MembreDiscordEnLigne[]>([]);

  useEffect(() => {
    fetch("/api/discord-stats")
      .then((r) => r.json())
      .then((d) => {
        setEnLigne(d.enLigne);
        setMembres(d.membres ?? []);
      })
      .catch(() => {});
  }, []);

  if (enLigne === null) return null;

  const visibles = membres.slice(0, NOMBRE_AFFICHE);
  const restants = membres.length - visibles.length;

  return (
    <div className="carte-holo rounded-2xl p-5 border border-violet/12">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-sm text-ink font-medium">
          {enLigne} {enLigne === 1 ? "membre en ligne" : "membres en ligne"}
        </p>
      </div>

      {visibles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibles.map((m) => (
            <div
              key={m.id}
              title={m.activite ? `${m.pseudo} · ${m.activite}` : m.pseudo}
              className="flex items-center gap-1.5 rounded-full bg-white/[0.04] pl-1 pr-3 py-1"
            >
              <span className="relative shrink-0">
                {m.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.avatar}
                    alt={m.pseudo}
                    loading="lazy"
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <span className="h-6 w-6 rounded-full bg-violet/20 flex items-center justify-center text-[10px] text-violet-light">
                    {m.pseudo.charAt(0).toUpperCase()}
                  </span>
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-nebula ${
                    COULEUR_STATUT[m.statut] ?? "bg-ink-soft/40"
                  }`}
                />
              </span>
              <span className="text-xs text-ink-soft">{m.pseudo}</span>
            </div>
          ))}
          {restants > 0 && (
            <span className="flex items-center px-3 py-1 rounded-full bg-white/[0.02] text-xs text-ink-soft/50">
              +{restants} autres
            </span>
          )}
        </div>
      )}
    </div>
  );
}
