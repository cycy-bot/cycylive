"use client";

// ❓ Quiz de la galaxie : 10 questions tirées au sort (Valorant, espace, jeux vidéo,
// culture stream). 15 secondes par question : 100 points par bonne réponse
// + jusqu'à 50 points de bonus de rapidité.
import { useEffect, useRef, useState } from "react";
import { EcranDepart, type PropsJeu } from "./FinDePartie";

type Question = { q: string; r: string[]; theme: string }; // r[0] = bonne réponse

const QUESTIONS: Question[] = [
  { theme: "🎯 Valorant", q: "Quel agent peut ressusciter un allié ?", r: ["Sage", "Skye", "Killjoy", "Omen"] },
  { theme: "🎯 Valorant", q: "Combien de rounds faut-il gagner pour remporter une partie classée (sans prolongation) ?", r: ["13", "12", "15", "16"] },
  { theme: "🎯 Valorant", q: "Combien coûte le Vandal ?", r: ["2 900 crédits", "2 500 crédits", "3 200 crédits", "1 600 crédits"] },
  { theme: "🎯 Valorant", q: "Laquelle de ces cartes a trois sites de spike ?", r: ["Haven", "Bind", "Ascent", "Split"] },
  { theme: "🎯 Valorant", q: "Sur quelle carte trouve-t-on des téléporteurs ?", r: ["Bind", "Haven", "Icebox", "Breeze"] },
  { theme: "🎯 Valorant", q: "De quel pays vient Phoenix ?", r: ["Royaume-Uni", "France", "Irlande", "Canada"] },
  { theme: "🎯 Valorant", q: "Quel agent est français ?", r: ["Chamber", "Fade", "Gekko", "Harbor"] },
  { theme: "🎯 Valorant", q: "Quel agent a un lance-roquettes comme capacité ultime ?", r: ["Raze", "Phoenix", "Breach", "KAY/O"] },
  { theme: "🎯 Valorant", q: "Quel contrôleur peut se téléporter n'importe où sur la carte avec son ultime ?", r: ["Omen", "Brimstone", "Viper", "Astra"] },
  { theme: "🎯 Valorant", q: "Quel studio a créé Valorant ?", r: ["Riot Games", "Blizzard", "Valve", "Epic Games"] },
  { theme: "🎯 Valorant", q: "En quelle année Valorant est-il sorti ?", r: ["2020", "2018", "2019", "2021"] },
  { theme: "🎯 Valorant", q: "Quel est le rang le plus élevé en partie classée ?", r: ["Radiant", "Immortel", "Ascendant", "Diamant"] },
  { theme: "🎯 Valorant", q: "Quel agent est un robot ?", r: ["KAY/O", "Cypher", "Sova", "Deadlock"] },
  { theme: "🎯 Valorant", q: "Quel agent utilise un arc pour révéler les ennemis ?", r: ["Sova", "Fade", "Skye", "Cypher"] },
  { theme: "🎯 Valorant", q: "Quel est le pistolet que tout le monde a au début d'une partie ?", r: ["Classic", "Ghost", "Sheriff", "Shorty"] },
  { theme: "🎯 Valorant", q: "Que veut dire faire un « ace » ?", r: ["Éliminer toute l'équipe adverse seul·e", "Gagner sans perdre un round", "Planter le spike en premier", "Désamorcer à la dernière seconde"] },
  { theme: "🎯 Valorant", q: "Que veut dire « clutch » un round ?", r: ["Le gagner seul·e contre plusieurs", "Le perdre à la dernière seconde", "Acheter toutes ses armes", "Jouer sans capacités"] },
  { theme: "🎯 Valorant", q: "Combien de joueurs y a-t-il dans chaque équipe ?", r: ["5", "4", "6", "3"] },
  { theme: "🪐 Espace", q: "Quelle est la plus grande planète du Système solaire ?", r: ["Jupiter", "Saturne", "Neptune", "La Terre"] },
  { theme: "🪐 Espace", q: "Quelle planète surnomme-t-on « la planète rouge » ?", r: ["Mars", "Vénus", "Mercure", "Jupiter"] },
  { theme: "🪐 Espace", q: "Combien de planètes compte le Système solaire ?", r: ["8", "9", "7", "10"] },
  { theme: "🪐 Espace", q: "Quelle est l'étoile la plus proche de la Terre ?", r: ["Le Soleil", "Proxima du Centaure", "Sirius", "Bételgeuse"] },
  { theme: "🪐 Espace", q: "Comment s'appelle notre galaxie ?", r: ["La Voie lactée", "Andromède", "Le Grand Nuage de Magellan", "Le Tourbillon"] },
  { theme: "🪐 Espace", q: "Combien de temps met la lumière du Soleil pour arriver jusqu'à nous ?", r: ["Environ 8 minutes", "Environ 8 secondes", "Environ 1 heure", "Environ 1 jour"] },
  { theme: "🪐 Espace", q: "Quelle planète est célèbre pour ses grands anneaux ?", r: ["Saturne", "Mars", "Mercure", "Vénus"] },
  { theme: "🪐 Espace", q: "Qui a été le premier humain à marcher sur la Lune ?", r: ["Neil Armstrong", "Buzz Aldrin", "Youri Gagarine", "Thomas Pesquet"] },
  { theme: "🪐 Espace", q: "Dans quelle constellation trouve-t-on la « Grande Casserole » ?", r: ["La Grande Ourse", "Orion", "Cassiopée", "Le Cygne"] },
  { theme: "🪐 Espace", q: "Quelle est la planète la plus proche du Soleil ?", r: ["Mercure", "Vénus", "Mars", "La Terre"] },
  { theme: "🪐 Espace", q: "Quel astronaute français a vécu à bord de l'ISS en 2016-2017 ?", r: ["Thomas Pesquet", "Jean-Loup Chrétien", "Claudie Haigneré", "Philippe Perrin"] },
  { theme: "🪐 Espace", q: "Comment appelle-t-on l'explosion d'une étoile en fin de vie ?", r: ["Une supernova", "Une naine blanche", "Un pulsar", "Une comète"] },
  { theme: "🪐 Espace", q: "Quelle est la planète la plus chaude du Système solaire ?", r: ["Vénus", "Mercure", "Mars", "Jupiter"] },
  { theme: "🪐 Espace", q: "Combien de temps met la Terre pour faire le tour du Soleil ?", r: ["Environ 365 jours", "Environ 30 jours", "Environ 24 heures", "Environ 10 ans"] },
  { theme: "🎮 Jeux vidéo", q: "Dans quel jeu croise-t-on des Creepers ?", r: ["Minecraft", "Fortnite", "Terraria", "Roblox"] },
  { theme: "🎮 Jeux vidéo", q: "Sur quelle carte se joue League of Legends ?", r: ["La Faille de l'invocateur", "Le Nexus des Ombres", "Summoner's Valley", "Le Bois Ancien"] },
  { theme: "🎮 Jeux vidéo", q: "Combien de joueurs au maximum dans une partie classique de Fortnite Battle Royale ?", r: ["100", "50", "64", "150"] },
  { theme: "🎮 Jeux vidéo", q: "Dans Among Us, comment appelle-t-on les traîtres ?", r: ["Les imposteurs", "Les infiltrés", "Les saboteurs", "Les espions"] },
  { theme: "🎮 Jeux vidéo", q: "Comment s'appelle le frère de Mario ?", r: ["Luigi", "Wario", "Toad", "Yoshi"] },
  { theme: "📺 Stream", q: "Que veut dire « GG » ?", r: ["Good game", "Go go", "Great goal", "Game gagnée"] },
  { theme: "📺 Stream", q: "À la fin d'un live Twitch, comment s'appelle le fait d'envoyer ses viewers chez un autre streamer ?", r: ["Un raid", "Un drop", "Un clip", "Un boost"] },
  { theme: "📺 Stream", q: "Sur Twitch, comment s'appellent les points qu'on gagne en regardant un live ?", r: ["Les points de chaîne", "Les bits", "Les crédits", "Les étoiles"] },
];

const NB = 10;
const TEMPS = 15;

function tirage() {
  const q = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, NB);
  return q.map((x) => ({ ...x, ordre: [...x.r].sort(() => Math.random() - 0.5) }));
}

export default function Quiz({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "jeu">("depart");
  const [questions, setQuestions] = useState(tirage);
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
          emoji="❓"
          titre="Quiz de la galaxie"
          regles={<><strong className="text-ink">10 questions</strong> sur Valorant, l’espace, les jeux vidéo et le stream. 15 secondes par question : réponds juste, et vite, pour le bonus !</>}
          onJouer={lancer}
        />
      ) : (
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-between text-sm font-semibold text-ink tabular-nums mb-2">
            <span>Question {i + 1}/{NB}</span>
            <span className="text-ink-soft">{q.theme}</span>
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
              {choix === q.r[0] ? "✅ Bonne réponse !" : choix === "" ? `⏰ Temps écoulé ! C'était « ${q.r[0]} »` : `❌ C'était « ${q.r[0]} »`}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
