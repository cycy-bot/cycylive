"use client";

// 🕹️ La salle d'arcade : cinq mini-jeux, chacun avec son tableau des records.
// Le jeu choisi est gardé dans l'adresse (#reflexes, #memory…) pour pouvoir le partager.
import { useCallback, useEffect, useRef, useState } from "react";
import ClassementArcade from "@/components/arcade/ClassementArcade";
import FinDePartie, { demarrerPartie } from "@/components/arcade/salle/FinDePartie";
import Reflexes from "@/components/arcade/salle/Reflexes";
import Memory from "@/components/arcade/salle/Memory";
import Quiz from "@/components/arcade/salle/Quiz";
import Constellations from "@/components/arcade/salle/Constellations";
import Rythme from "@/components/arcade/salle/Rythme";
import { JEUX_SALLE, type JeuSalle } from "@/lib/arcadeRegles";

const ORDRE: { id: JeuSalle; accroche: string; duree: string }[] = [
  { id: "reflexes", accroche: "Vise, tire, enchaîne", duree: "30 s" },
  { id: "rythme", accroche: "Tape en rythme sur la musique", duree: "1 min" },
  { id: "constellations", accroche: "Retrace les constellations", duree: "illimité" },
  { id: "memory", accroche: "Retrouve les 8 paires", duree: "≈ 1 min" },
  { id: "quiz", accroche: "10 questions, 15 s chacune", duree: "≈ 2 min" },
];

export default function SalleArcade() {
  const [jeu, setJeu] = useState<JeuSalle>("reflexes");
  const [partie, setPartie] = useState(0);
  const [fin, setFin] = useState<{ score: number; resume: string } | null>(null);
  const jeton = useRef<Promise<string | null> | null>(null);
  const [jetonFin, setJetonFin] = useState<string | null>(null);
  const zone = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const h = window.location.hash.replace("#", "") as JeuSalle;
    if (h in JEUX_SALLE) setJeu(h);
  }, []);

  function choisir(j: JeuSalle) {
    setJeu(j);
    setFin(null);
    setPartie((n) => n + 1);
    jeton.current = null;
    try {
      history.replaceState(null, "", `#${j}`);
    } catch {
      /* rien */
    }
    zone.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const onDebut = useCallback(() => {
    jeton.current = demarrerPartie(jeu);
  }, [jeu]);
  const onFin = useCallback(async (score: number, resume: string) => {
    setJetonFin(jeton.current ? await jeton.current : null);
    setFin({ score, resume });
  }, []);
  const rejouer = () => {
    setFin(null);
    jeton.current = null;
    setPartie((n) => n + 1);
  };

  const props = { onDebut, onFin };
  const info = JEUX_SALLE[jeu];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-2 md:gap-3" role="tablist" aria-label="Choisir un jeu">
        {ORDRE.map((o) => {
          const j = JEUX_SALLE[o.id];
          const actif = o.id === jeu;
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => choisir(o.id)}
              className={`carte-holo rounded-2xl border p-2 md:p-4 text-center md:text-left transition-all ${actif ? "border-violet-light shadow-glow-sm bg-violet/15" : "border-violet/15 hover:border-violet/40"}`}
            >
              <span className="text-2xl md:text-3xl" aria-hidden>{j.emoji}</span>
              <span className="mt-1 md:mt-2 block text-[11px] md:text-base font-semibold text-ink leading-tight">{j.nom}</span>
              <span className="mt-1 hidden md:block text-xs text-ink-soft">{o.accroche} · {o.duree}</span>
            </button>
          );
        })}
      </div>

      <div ref={zone} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] scroll-mt-24">
        <div className="relative">
          {jeu === "reflexes" ? <Reflexes key={`r${partie}`} {...props} /> : null}
          {jeu === "memory" ? <Memory key={`m${partie}`} {...props} /> : null}
          {jeu === "quiz" ? <Quiz key={`q${partie}`} {...props} /> : null}
          {jeu === "constellations" ? <Constellations key={`c${partie}`} {...props} /> : null}
          {jeu === "rythme" ? <Rythme key={`y${partie}`} {...props} /> : null}
          {fin ? <FinDePartie key={`f${partie}`} jeu={jeu} score={fin.score} resume={fin.resume} jeton={jetonFin} onRejouer={rejouer} /> : null}
        </div>
        <ClassementArcade key={jeu} jeu={jeu} titre={`🏆 Records · ${info.emoji} ${info.nom}`} />
      </div>
    </div>
  );
}
