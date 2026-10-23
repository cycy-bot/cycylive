"use client";

// Quiz de la galaxie : 10 questions tirées au sort dans une grande banque (lib/quizQuestions.ts),
// en évitant celles déjà vues sur l'appareil. 15 secondes par question : 100 points par bonne réponse
// + jusqu'à 50 points de bonus de rapidité.
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import type { NomIcone } from "@/components/icones/banque";
import { EcranDepart, type PropsJeu } from "./FinDePartie";
import { QUESTIONS_QUIZ as QUESTIONS } from "@/lib/quizQuestions";

const ICONE_THEME: Record<string, NomIcone> = { Valorant: "cible", Espace: "planete", "Jeux vidéo": "manette", Stream: "ecran", "Culture G": "globe", "Cinéma & séries": "clap", Musique: "note" };

const NB = 10;
const TEMPS = 15;

// Les questions déjà posées sur cet appareil sont mises de côté : on pioche d'abord dans celles jamais vues,
// et l'historique repart à zéro quand presque toute la banque y est passée.
const CLE_VUES = "cycylive-quiz-vues";
const cle = (x: { q: string }) => x.q.slice(0, 60);
function lireVues(): string[] {
  try { return JSON.parse(localStorage.getItem(CLE_VUES) || "[]"); } catch { return []; }
}
function tirage() {
  const vues = new Set(typeof window === "undefined" ? [] : lireVues());
  let neuves = QUESTIONS.filter((x) => !vues.has(cle(x)));
  if (neuves.length < NB) { vues.clear(); neuves = [...QUESTIONS]; }
  // un bon mélange de thèmes : au plus 3 questions du même thème par partie
  const melange = [...neuves].sort(() => Math.random() - 0.5);
  const parTheme: Record<string, number> = {};
  const q: typeof QUESTIONS = [];
  for (const x of melange) {
    if (q.length >= NB) break;
    if ((parTheme[x.theme] || 0) >= 3) continue;
    parTheme[x.theme] = (parTheme[x.theme] || 0) + 1;
    q.push(x);
  }
  for (const x of melange) if (q.length < NB && !q.includes(x)) q.push(x);
  if (typeof window !== "undefined") {
    try { localStorage.setItem(CLE_VUES, JSON.stringify([...vues, ...q.map(cle)])); } catch { /* stockage indisponible */ }
  }
  return q.map((x) => ({ ...x, ordre: [...x.r].sort(() => Math.random() - 0.5) }));
}

export default function Quiz({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "jeu">("depart");
  const [questions, setQuestions] = useState<ReturnType<typeof tirage>>([]);
  const [i, setI] = useState(0);
  const [choix, setChoix] = useState<string | null>(null);
  const [, tic] = useState(0);
  const debutQ = useRef(0);
  const score = useRef(0);
  const bonnes = useRef(0);

  useEffect(() => {
    if (phase !== "jeu" || choix !== null) return;
    const t = setInterval(() => {
      if ((performance.now() - debutQ.current) / 1000 >= TEMPS) repondre("");
      else tic((n) => n + 1);
    }, 100);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i, choix]);

  function lancer() {
    setQuestions(tirage());
    setI(0);
    setChoix(null);
    score.current = 0;
    bonnes.current = 0;
    debutQ.current = performance.now();
    setPhase("jeu");
    onDebut();
  }

  function repondre(r: string) {
    if (choix !== null) return;
    const q = questions[i];
    const temps = (performance.now() - debutQ.current) / 1000;
    setChoix(r);
    if (r === q.r[0]) {
      bonnes.current += 1;
      score.current += 100 + Math.round(50 * Math.max(0, 1 - temps / TEMPS));
    }
    setTimeout(() => {
      if (i + 1 >= NB) {
        onFin(score.current, `${bonnes.current} bonne${bonnes.current > 1 ? "s" : ""} réponse${bonnes.current > 1 ? "s" : ""} sur ${NB}`);
        return;
      }
      setI(i + 1);
      setChoix(null);
      debutQ.current = performance.now();
    }, 1300);
  }

  const q = questions[i];
  const reste = choix === null ? Math.max(0, TEMPS - (performance.now() - debutQ.current) / 1000) : 0;

  return (
    <div className="relative min-h-[440px] md:min-h-[500px] overflow-hidden rounded-2xl border border-violet/20 p-5 md:p-8" style={{ background: "radial-gradient(ellipse at 80% 0%, #3a1d5c 0%, #140c26 55%, #0b0817 100%)" }}>
      {phase === "depart" ? (
        <EcranDepart
          icone="quiz"
          titre="Quiz de la galaxie"
          regles={<><strong className="text-ink">10 questions</strong> tirées d’une banque de plus de 300 : Valorant, espace, jeux vidéo, stream, culture G, cinéma et musique. 15 secondes par question : réponds juste, et vite, pour le bonus !</>}
          onJouer={lancer}
        />
      ) : (
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-between text-sm font-semibold text-ink tabular-nums mb-2">
            <span>Question {i + 1}/{NB}</span>
            <span className="text-ink-soft inline-flex items-center gap-1.5"><Icone nom={ICONE_THEME[q.theme] || "quiz"} className="w-4 h-4 text-violet-light" />{q.theme}</span>
            <span className="text-lilac">{score.current.toLocaleString("fr-FR")} pts</span>
          </div>
          <div className="h-1.5 rounded-full bg-violet/15 mb-6 overflow-hidden">
            <div className="h-full bg-lilac transition-[width] duration-100" style={{ width: `${(reste / TEMPS) * 100}%` }} />
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-ink mb-6 min-h-[64px]">{q.q}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {q.ordre.map((r) => {
              const bonne = r === q.r[0];
              const style =
                choix === null
                  ? "border-violet/30 hover:bg-violet/15 hover:border-violet-light"
                  : bonne
                    ? "border-emerald-300 bg-emerald-400/15"
                    : r === choix
                      ? "border-red-400 bg-red-500/15"
                      : "border-violet/15 opacity-50";
              return (
                <button key={r} type="button" disabled={choix !== null} onClick={() => repondre(r)} className={`rounded-xl border px-4 py-3.5 text-left text-ink transition-all ${style}`}>
                  {r}
                </button>
              );
            })}
          </div>
          {choix !== null ? (
            <p className={`mt-5 text-center font-semibold ${choix === q.r[0] ? "text-emerald-300" : "text-red-300"}`}>
              <Icone nom={choix === q.r[0] ? "valide" : choix === "" ? "horloge" : "erreur"} className="w-5 h-5 mr-1.5" />
              {choix === q.r[0] ? "Bonne réponse !" : choix === "" ? `Temps écoulé ! C'était « ${q.r[0]} »` : `C'était « ${q.r[0]} »`}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
