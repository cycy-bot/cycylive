"use client";

// Un jeu de la salle d'arcade en pleine largeur, avec l'écran de fin (score, pseudo, record).
import { useCallback, useRef, useState } from "react";
import FinDePartie, { demarrerPartie } from "@/components/arcade/salle/FinDePartie";
import Reflexes from "@/components/arcade/salle/Reflexes";
import Memory from "@/components/arcade/salle/Memory";
import Quiz from "@/components/arcade/salle/Quiz";
import Constellations from "@/components/arcade/salle/Constellations";
import Rythme from "@/components/arcade/salle/Rythme";
import type { JeuSalle as IdJeu } from "@/lib/arcadeRegles";

export default function JeuSalle({ jeu }: { jeu: IdJeu }) {
  const [partie, setPartie] = useState(0);
  const [fin, setFin] = useState<{ score: number; resume: string } | null>(null);
  const jeton = useRef<Promise<string | null> | null>(null);
  const [jetonFin, setJetonFin] = useState<string | null>(null);

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
  return (
    <div className="relative">
      {jeu === "reflexes" ? <Reflexes key={`r${partie}`} {...props} /> : null}
      {jeu === "memory" ? <Memory key={`m${partie}`} {...props} /> : null}
      {jeu === "quiz" ? <Quiz key={`q${partie}`} {...props} /> : null}
      {jeu === "constellations" ? <Constellations key={`c${partie}`} {...props} /> : null}
      {jeu === "rythme" ? <Rythme key={`y${partie}`} {...props} /> : null}
      {fin ? <FinDePartie key={`f${partie}`} jeu={jeu} score={fin.score} resume={fin.resume} jeton={jetonFin} onRejouer={rejouer} /> : null}
    </div>
  );
}
