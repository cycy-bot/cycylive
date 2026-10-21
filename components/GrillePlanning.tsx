"use client";

// Grille du planning (page d'accueil) : la semaine en cours, et les suivantes au clic.
// Toutes les cases ont la même taille, qu'il y ait 1, 2 ou 3 jeux dans la soirée.
import { useState } from "react";
import Icone from "@/components/icones/Icone";
import { IconCrystal, IconValorant } from "@/components/Icons";

export type JourGrille = { jour: string; date: string; off: boolean; heure?: string; fin?: string; jeux: string[]; note?: string; modifie?: boolean };
export type SemaineGrille = { du: string; au: string; jours: JourGrille[] };

const NOMS_SEMAINE = ["Cette semaine", "Semaine prochaine", "Dans 2 semaines", "Dans 3 semaines"];

function Jeux({ jeux }: { jeux: string[] }) {
  if (!jeux.length) return <span className="text-lilac text-sm font-medium leading-tight">Stream</span>;
  if (jeux.length === 1) return <span className="text-lilac text-sm font-medium leading-tight line-clamp-2">{jeux[0]}</span>;
  return (
    <ol className="flex md:flex-col flex-wrap items-center gap-x-1.5 gap-y-1 w-full">
      {jeux.map((j, i) => (
        <li key={i} className="flex items-center gap-1.5 md:w-full md:justify-center min-w-0">
          {i > 0 ? <span className="hidden md:inline text-[10px] text-ink-soft/50">puis</span> : <span className="md:hidden" />}
          <span className="truncate rounded-full border border-violet/25 bg-violet/10 px-2 py-0.5 text-[11.5px] font-medium text-lilac max-w-full">{j}</span>
        </li>
      ))}
    </ol>
  );
}

export default function GrillePlanning({ semaines, aujourdhui }: { semaines: SemaineGrille[]; aujourdhui: string }) {
  const [s, setS] = useState(0);
  const semaine = semaines[s] ?? semaines[0];
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {semaines.map((w, i) => (
          <button
            key={w.du}
            type="button"
            aria-pressed={i === s}
            onClick={() => setS(i)}
            className={`rounded-full px-3.5 py-1.5 text-xs md:text-sm border transition-all ${i === s ? "border-violet-light bg-violet/20 text-ink" : "border-violet/15 text-ink-soft hover:text-ink hover:border-violet/35"}`}
          >
            {NOMS_SEMAINE[i] ?? `Semaine du ${w.du}`}
            <span className="ml-1.5 text-ink-soft/70">{w.du} → {w.au}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 md:gap-3 md:auto-rows-fr">
        {semaine.jours.map((jour) => {
          const estAujourdhui = jour.date === aujourdhui;
          const valo = !jour.off && jour.jeux.some((j) => /valorant/i.test(j));
          return (
            <div
              key={jour.date || jour.jour}
              className={`relative carte-holo rounded-2xl px-4 py-3 md:p-4 md:min-h-[168px] flex flex-wrap md:flex-col items-center md:justify-center md:text-center gap-x-3 gap-y-1 md:gap-2 border ${
                estAujourdhui ? "border-violet-light shadow-glow" : jour.off ? "border-violet/10 opacity-80" : "border-violet/35 shadow-glow-sm"
              }`}
            >
              {estAujourdhui && (
                <span className="absolute -top-2.5 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 rounded-full bg-violet px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Aujourd&apos;hui
                </span>
              )}
              <span className="w-24 md:w-auto text-xs tracking-wide text-ink-soft uppercase">
                {jour.jour}
                {jour.date ? <span className="ml-1 text-ink-soft/60">{Number(jour.date.slice(8))}</span> : null}
              </span>
              {jour.off ? (
                <>
                  <Icone nom="dodo" className="w-6 h-6 text-ink-soft/70" />
                  <span className="ml-auto md:ml-0 text-ink-soft text-sm font-medium">OFF</span>
                </>
              ) : (
                <>
                  {valo ? <IconValorant className="w-6 h-6 text-rose-300 shrink-0" /> : <IconCrystal className="w-6 h-6 text-lilac shrink-0" />}
                  <div className="flex-1 md:flex-none md:w-full min-w-0"><Jeux jeux={jour.jeux} /></div>
                  <span className="ml-auto md:ml-0 text-ink text-sm font-semibold whitespace-nowrap">
                    {jour.heure}
                    {jour.fin ? <span className="font-normal text-ink-soft"> → {jour.fin}</span> : null}
                  </span>
                </>
              )}
              {jour.modifie && <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-semibold text-amber-200" title="Horaire ou jeu différent du planning habituel">Modifié</span>}
              {jour.note ? <span className="w-full md:w-auto text-[11px] leading-tight text-ink-soft line-clamp-2">{jour.note}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
