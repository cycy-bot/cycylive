"use client";

// Memory galactique : retrouve les 8 paires le plus vite possible, avec le moins
// d'erreurs. Score = 3 000 + bonus de vitesse (40 points par seconde sous 90 s)
// − 25 points par erreur (minimum 100).
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import Sticker, { type NomSticker } from "@/components/arcade/Stickers";
import { EcranDepart, type PropsJeu } from "./FinDePartie";

const SYMBOLES: NomSticker[] = ["planete", "fusee", "lune", "comete", "soucoupe", "robot", "etoile", "boule"];
type Carte = { id: number; s: NomSticker; trouvee: boolean };

function melanger(): Carte[] {
  const cartes = [...SYMBOLES, ...SYMBOLES].map((s, i) => ({ id: i, s, trouvee: false }));
  for (let i = cartes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cartes[i], cartes[j]] = [cartes[j], cartes[i]];
  }
  return cartes;
}

export const scoreMemory = (secondes: number, erreurs: number) => Math.max(100, Math.round(3000 + Math.max(0, 90 - secondes) * 40 - erreurs * 25));

export default function Memory({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "jeu">("depart");
  const [cartes, setCartes] = useState<Carte[]>(melanger);
  const [retournees, setRetournees] = useState<number[]>([]);
  const [erreurs, setErreurs] = useState(0);
  const [coups, setCoups] = useState(0);
  const [, tic] = useState(0);
  const debut = useRef(0);
  const bloque = useRef(false);

  useEffect(() => {
    if (phase !== "jeu" || !debut.current) return;
    const t = setInterval(() => tic((n) => n + 1), 250);
    return () => clearInterval(t);
  }, [phase, coups]);

  function retourner(i: number) {
    if (phase !== "jeu" || bloque.current || cartes[i].trouvee || retournees.includes(i)) return;
    if (!debut.current) {
      debut.current = performance.now();
      onDebut();
    }
    const suite = [...retournees, i];
    setRetournees(suite);
    if (suite.length < 2) return;
    setCoups((c) => c + 1);
    const [a, b] = suite;
    if (cartes[a].s === cartes[b].s) {
      const maj = cartes.map((c, k) => (k === a || k === b ? { ...c, trouvee: true } : c));
      setCartes(maj);
      setRetournees([]);
      if (maj.every((c) => c.trouvee)) {
        const secondes = (performance.now() - debut.current) / 1000;
        setTimeout(() => onFin(scoreMemory(secondes, erreurs), `${secondes.toFixed(1)} s · ${coups + 1} coups · ${erreurs} erreur${erreurs > 1 ? "s" : ""}`), 450);
      }
    } else {
      setErreurs((n) => n + 1);
      bloque.current = true;
      setTimeout(() => {
        setRetournees([]);
        bloque.current = false;
      }, 750);
    }
  }

  const secondes = debut.current ? (performance.now() - debut.current) / 1000 : 0;

  return (
    <div className="relative min-h-[440px] md:min-h-[500px] overflow-hidden rounded-2xl border border-violet/20 p-4 md:p-6" style={{ background: "radial-gradient(ellipse at 50% 0%, #2b1550 0%, #120b22 60%, #0b0817 100%)" }}>
      {phase === "depart" ? (
        <EcranDepart
          icone="cerveau"
          titre="Memory galactique"
          regles={<>Retourne les cartes deux par deux et retrouve les <strong className="text-ink">8 paires</strong>. Le chrono démarre à la première carte : plus tu es rapide et précis·e, plus ton score grimpe.</>}
          onJouer={() => setPhase("jeu")}
        />
      ) : (
        <>
          <div className="flex justify-between text-sm font-semibold text-ink tabular-nums mb-4">
            <span><Icone nom="chrono" className="w-4 h-4 mr-1" />{secondes.toFixed(1)} s</span>
            <span><Icone nom="rejouer" className="w-4 h-4 mr-1" />{coups} coups · <Icone nom="erreur" className="w-4 h-4 mx-1" />{erreurs}</span>
            <span className="text-lilac">{scoreMemory(secondes, erreurs).toLocaleString("fr-FR")} pts</span>
          </div>
          <div className="mx-auto grid max-w-[520px] grid-cols-4 gap-2 md:gap-3">
            {cartes.map((c, i) => {
              const visible = c.trouvee || retournees.includes(i);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => retourner(i)}
                  aria-label={visible ? c.s : "Carte cachée"}
                  className="aspect-square [perspective:600px]"
                >
                  <span
                    className="relative block h-full w-full transition-transform duration-300 [transform-style:preserve-3d]"
                    style={{ transform: visible ? "rotateY(180deg)" : "none" }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center rounded-xl border border-violet/35 [backface-visibility:hidden]" style={{ background: "linear-gradient(135deg, #3b1d6e, #1b1033)" }}>
                      <Icone nom="eclats" className="w-7 h-7 text-lilac opacity-40" />
                    </span>
                    <span
                      className={`absolute inset-0 flex items-center justify-center rounded-xl border text-3xl md:text-4xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${c.trouvee ? "border-emerald-300/60 bg-emerald-300/10" : "border-lilac/60 bg-violet/25"}`}
                    >
                      <Sticker nom={c.s} taille={52} className={`w-11 h-11 md:w-14 md:h-14 ${c.trouvee ? "opacity-80" : ""}`} />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
