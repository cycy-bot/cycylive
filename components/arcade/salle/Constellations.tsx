"use client";

// ✨ Puzzle des constellations : une vraie constellation s'affiche quelques secondes,
// puis ses traits disparaissent. Retrace-la en cliquant ses étoiles dans l'ordre,
// en partant de l'étoile qui clignote. Des étoiles pièges se cachent autour !
// 3 vies. Par niveau : 50 points par étoile + bonus de rapidité (jusqu'à 100).
import { useEffect, useRef, useState } from "react";
import { EcranDepart, type PropsJeu } from "./FinDePartie";

type Etoile = { x: number; y: number };
type Modele = { nom: string; etoiles: Etoile[]; chemin: number[] };

// Coordonnées simplifiées (0 → 1) et ordre de tracé
const MODELES: Modele[] = [
  { nom: "Cassiopée", etoiles: [{ x: 0.1, y: 0.35 }, { x: 0.3, y: 0.68 }, { x: 0.5, y: 0.4 }, { x: 0.7, y: 0.7 }, { x: 0.9, y: 0.3 }], chemin: [0, 1, 2, 3, 4] },
  { nom: "La Couronne boréale", etoiles: [{ x: 0.12, y: 0.35 }, { x: 0.25, y: 0.6 }, { x: 0.43, y: 0.74 }, { x: 0.62, y: 0.72 }, { x: 0.78, y: 0.56 }, { x: 0.87, y: 0.34 }], chemin: [0, 1, 2, 3, 4, 5] },
  { nom: "La Lyre", etoiles: [{ x: 0.5, y: 0.1 }, { x: 0.42, y: 0.36 }, { x: 0.36, y: 0.72 }, { x: 0.58, y: 0.82 }, { x: 0.64, y: 0.45 }], chemin: [0, 1, 2, 3, 4, 1] },
  { nom: "La Grande Ourse", etoiles: [{ x: 0.05, y: 0.28 }, { x: 0.2, y: 0.22 }, { x: 0.33, y: 0.3 }, { x: 0.46, y: 0.38 }, { x: 0.5, y: 0.62 }, { x: 0.76, y: 0.68 }, { x: 0.8, y: 0.4 }], chemin: [0, 1, 2, 3, 4, 5, 6, 3] },
  { nom: "Orion", etoiles: [{ x: 0.3, y: 0.12 }, { x: 0.7, y: 0.18 }, { x: 0.57, y: 0.46 }, { x: 0.43, y: 0.52 }, { x: 0.74, y: 0.86 }, { x: 0.3, y: 0.88 }], chemin: [0, 1, 2, 4, 5, 3, 0] },
  { nom: "La Petite Ourse", etoiles: [{ x: 0.08, y: 0.2 }, { x: 0.25, y: 0.28 }, { x: 0.4, y: 0.38 }, { x: 0.54, y: 0.5 }, { x: 0.58, y: 0.78 }, { x: 0.86, y: 0.72 }, { x: 0.82, y: 0.45 }], chemin: [0, 1, 2, 3, 4, 5, 6, 3] },
  { nom: "Le Scorpion", etoiles: [{ x: 0.12, y: 0.12 }, { x: 0.24, y: 0.2 }, { x: 0.34, y: 0.32 }, { x: 0.43, y: 0.46 }, { x: 0.48, y: 0.62 }, { x: 0.56, y: 0.78 }, { x: 0.7, y: 0.88 }, { x: 0.83, y: 0.8 }, { x: 0.87, y: 0.64 }, { x: 0.78, y: 0.56 }], chemin: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { nom: "Le Lion", etoiles: [{ x: 0.6, y: 0.22 }, { x: 0.5, y: 0.12 }, { x: 0.4, y: 0.18 }, { x: 0.35, y: 0.36 }, { x: 0.27, y: 0.52 }, { x: 0.22, y: 0.74 }, { x: 0.62, y: 0.62 }, { x: 0.9, y: 0.56 }, { x: 0.68, y: 0.38 }], chemin: [0, 1, 2, 3, 4, 5, 6, 7, 8, 3] },
];

const L = 100, H = 66; // repère du dessin (SVG)

type Niveau = { nom: string; etoiles: Etoile[]; chemin: number[]; pieges: Etoile[]; memo: number };

function creerNiveau(n: number): Niveau {
  const m = MODELES[n % MODELES.length];
  const tour = Math.floor(n / MODELES.length);
  // À partir du 2ᵉ tour : rotation et miroir au hasard, pour ne pas apprendre par cœur
  const angle = tour ? (Math.random() - 0.5) * Math.PI * 0.9 : 0;
  const miroir = tour && Math.random() < 0.5 ? -1 : 1;
  const pts = m.etoiles.map((e) => {
    const x = (e.x - 0.5) * miroir, y = e.y - 0.5;
    return { x: x * Math.cos(angle) - y * Math.sin(angle), y: x * Math.sin(angle) + y * Math.cos(angle) };
  });
  const minX = Math.min(...pts.map((p) => p.x)), maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y)), maxY = Math.max(...pts.map((p) => p.y));
  const k = Math.min((L - 16) / (maxX - minX || 1), (H - 14) / (maxY - minY || 1));
  const etoiles = pts.map((p) => ({ x: L / 2 + (p.x - (minX + maxX) / 2) * k, y: H / 2 + (p.y - (minY + maxY) / 2) * k }));
  const nbPieges = Math.min(16, 3 + n * 2);
  const pieges: Etoile[] = [];
  for (let essai = 0; pieges.length < nbPieges && essai < 600; essai++) {
    const p = { x: 4 + Math.random() * (L - 8), y: 4 + Math.random() * (H - 8) };
    if ([...etoiles, ...pieges].every((e) => Math.hypot(e.x - p.x, e.y - p.y) > 7)) pieges.push(p);
  }
  return { nom: m.nom, etoiles, chemin: m.chemin, pieges, memo: Math.max(1500, 3600 - n * 220) };
}

export default function Constellations({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "memo" | "trace" | "bravo">("depart");
  const [niveau, setNiveau] = useState(0);
  const [n, setN] = useState<Niveau | null>(null);
  const [pas, setPas] = useState(1); // nombre d'étoiles du chemin déjà reliées
  const [vies, setVies] = useState(3);
  const [erreur, setErreur] = useState<number | null>(null);
  const score = useRef(0);
  const debutTrace = useRef(0);
  const reussis = useRef(0);

  function demarrerNiveau(k: number) {
    const nv = creerNiveau(k);
    setN(nv);
    setNiveau(k);
    setPas(1);
    setPhase("memo");
    setTimeout(() => {
      setPhase("trace");
      debutTrace.current = performance.now();
    }, nv.memo);
  }

  function lancer() {
    score.current = 0;
    reussis.current = 0;
    setVies(3);
    onDebut();
    demarrerNiveau(0);
  }

  function clic(idx: number, piege: boolean) {
    if (phase !== "trace" || !n) return;
    const attendu = n.chemin[pas];
    if (!piege && idx === attendu) {
      const suivant = pas + 1;
      setPas(suivant);
      if (suivant >= n.chemin.length) {
        const sec = (performance.now() - debutTrace.current) / 1000;
        score.current += n.etoiles.length * 50 + Math.max(0, Math.round(100 - sec * 10));
        reussis.current += 1;
        setPhase("bravo");
        setTimeout(() => demarrerNiveau(niveau + 1), 1100);
      }
      return;
    }
    setErreur(piege ? -1 - idx : idx);
    setTimeout(() => setErreur(null), 350);
    const restantes = vies - 1;
    setVies(restantes);
    if (restantes <= 0) {
      setPhase("bravo");
      setTimeout(() => onFin(score.current, `${reussis.current} constellation${reussis.current > 1 ? "s" : ""} retracée${reussis.current > 1 ? "s" : ""}`), 700);
    }
  }

  const traits = n ? (phase === "memo" || phase === "bravo" ? n.chemin.length - 1 : pas - 1) : 0;

  return (
    <div className="relative min-h-[440px] md:min-h-[500px] overflow-hidden rounded-2xl border border-violet/20" style={{ background: "radial-gradient(ellipse at 30% 20%, #241a4d 0%, #0e0a20 60%, #07050f 100%)" }}>
      {phase === "depart" ? (
        <EcranDepart
          emoji="✨"
          titre="Puzzle des constellations"
          regles={<>Une constellation s’affiche quelques secondes, puis ses traits s’effacent. <strong className="text-ink">Retrace-la</strong> en cliquant ses étoiles dans l’ordre, depuis l’étoile qui clignote. Attention aux étoiles pièges ! 3 vies.</>}
          onJouer={lancer}
        />
      ) : n ? (
        <>
          <div className="absolute left-4 right-4 top-3 z-10 flex justify-between text-sm font-semibold text-ink tabular-nums">
            <span>Niveau {niveau + 1} · {n.nom}</span>
            <span>{"💜".repeat(Math.max(0, vies))}{"🖤".repeat(Math.max(0, 3 - vies))}</span>
            <span className="text-lilac">{score.current.toLocaleString("fr-FR")} pts</span>
          </div>
          <p className="absolute inset-x-0 bottom-3 z-10 text-center text-sm text-ink-soft">
            {phase === "memo" ? "👀 Mémorise la forme…" : phase === "trace" ? `Relie les étoiles : ${pas - 1}/${n.chemin.length - 1}` : vies > 0 ? "✨ Bravo !" : "💫 Plus de vies !"}
          </p>
          <svg viewBox={`0 0 ${L} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
            {/* poussière d'étoiles décorative */}
            {Array.from({ length: 40 }, (_, i) => (
              <circle key={`d${i}`} cx={(i * 37.3) % L} cy={(i * 23.7) % H} r={0.18} fill="#fff" opacity={0.35} />
            ))}
            {n.chemin.slice(0, traits + 1).map((idx, k, arr) =>
              k === 0 ? null : (
                <line
                  key={`t${k}`}
                  x1={n.etoiles[arr[k - 1]].x}
                  y1={n.etoiles[arr[k - 1]].y}
                  x2={n.etoiles[idx].x}
                  y2={n.etoiles[idx].y}
                  stroke={phase === "memo" ? "#c084fc" : "#f0abfc"}
                  strokeWidth={0.55}
                  strokeLinecap="round"
                  opacity={0.9}
                />
              )
            )}
            {n.pieges.map((p, i) => (
              <g key={`p${i}`} onClick={() => clic(i, true)} className="cursor-pointer">
                <circle cx={p.x} cy={p.y} r={3.2} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={erreur === -1 - i ? 1.6 : 1.05} fill={erreur === -1 - i ? "#f87171" : "#f5f1ff"} />
              </g>
            ))}
            {n.etoiles.map((e, i) => {
              const depart = i === n.chemin[0];
              const actuelle = phase === "trace" && i === n.chemin[pas - 1];
              return (
                <g key={`e${i}`} onClick={() => clic(i, false)} className="cursor-pointer">
                  <circle cx={e.x} cy={e.y} r={3.4} fill="transparent" />
                  {(depart && (phase === "memo" || pas === 1)) || actuelle ? (
                    <circle cx={e.x} cy={e.y} r={2.6} fill="none" stroke="#f0abfc" strokeWidth={0.35}>
                      <animate attributeName="r" values="1.8;3.2;1.8" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  ) : null}
                  <circle cx={e.x} cy={e.y} r={erreur === i ? 1.6 : 1.05} fill={erreur === i ? "#f87171" : "#f5f1ff"} />
                </g>
              );
            })}
          </svg>
        </>
      ) : null}
    </div>
  );
}
