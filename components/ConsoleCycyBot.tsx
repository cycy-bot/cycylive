"use client";

import { useEffect, useRef, useState } from "react";
import type { LigneConsole } from "@/lib/cycybot";

type LigneAffichee = LigneConsole & { id: number; visible: string };

const MAX_LIGNES = 7;
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Rejoue en boucle de vraies réponses de Cycy_Bot, comme dans le chat Twitch. */
export default function ConsoleCycyBot({ lignes }: { lignes: LigneConsole[] }) {
  const [affichees, setAffichees] = useState<LigneAffichee[]>([]);
  const [ecrit, setEcrit] = useState(false);
  const compteur = useRef(0);

  useEffect(() => {
    if (!lignes.length) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduit) {
      setAffichees(
        lignes.slice(-MAX_LIGNES).map((l, i) => ({ ...l, id: i, visible: l.text }))
      );
      return;
    }

    let actif = true;
    (async () => {
      let i = 0;
      while (actif) {
        const ligne = lignes[i % lignes.length];
        const id = compteur.current++;
        i++;
        setAffichees((prev) => [...prev, { ...ligne, id, visible: ligne.bot ? "" : ligne.text }].slice(-MAX_LIGNES));

        if (ligne.bot) {
          setEcrit(true);
          for (let c = 2; c <= ligne.text.length + 1 && actif; c += 2) {
            const texte = ligne.text.slice(0, c);
            setAffichees((prev) => prev.map((l) => (l.id === id ? { ...l, visible: texte } : l)));
            await attendre(18);
          }
          setEcrit(false);
          await attendre(2200);
        } else {
          await attendre(900);
        }
      }
    })();
    return () => {
      actif = false;
    };
  }, [lignes]);

  return (
    <div
      className="carte-holo liseret-glow rounded-2xl overflow-hidden"
      aria-label="Exemples de réponses de Cycy_Bot dans le chat"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-violet/15 text-sm">
        <span className="text-ink-soft">
          <strong className="text-ink font-semibold">Chat de Cycylive</strong>, en direct du vaisseau
        </span>
        <span className="flex items-end gap-[3px] h-3" aria-hidden>
          <i className="w-[3px] h-1 rounded-sm bg-lilac" />
          <i className="w-[3px] h-[7px] rounded-sm bg-lilac" />
          <i className="w-[3px] h-2.5 rounded-sm bg-lilac" />
          <i className="w-[3px] h-3 rounded-sm bg-lilac/35" />
        </span>
      </div>
      <ul className="flex flex-col justify-end gap-3 px-5 pt-4 pb-5 h-[360px] overflow-hidden text-sm leading-relaxed">
        {affichees.map((l, index) => (
          <li
            key={l.id}
            className={`animate-[apparition_.35s_ease-out_both] ${
              l.bot ? "bg-violet/10 border-l-2 border-violet rounded-r-lg px-3 py-2" : ""
            }`}
          >
            <span className={`font-semibold mr-1.5 ${l.bot ? "text-lilac" : "text-sky-300"}`}>{l.user}</span>
            <span className="text-ink-soft">{l.visible}</span>
            {l.bot && ecrit && index === affichees.length - 1 && (
              <span className="inline-block w-[7px] h-[1em] bg-lilac align-[-2px] ml-0.5 animate-pulse" aria-hidden />
            )}
          </li>
        ))}
      </ul>
      <style>{`@keyframes apparition { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }`}</style>
    </div>
  );
}
