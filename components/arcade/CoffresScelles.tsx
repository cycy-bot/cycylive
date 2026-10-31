"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icone, { Pastille } from "@/components/icones/Icone";
import { idAppareil } from "@/components/arcade/appareil";
import Sticker, { stickerDuGain, type NomSticker } from "@/components/arcade/Stickers";
import { BandeauDiscord, BoutonDiscord, sessionDiscord, useCompteDiscord } from "@/components/arcade/compteDiscord";
import { TEINTES_COFFRES } from "@/components/arcade/CoffreSvg";

// Les coffres illustrés (public/coffres/<couleur>-ferme|ouvert.webp, même cadrage 500 × 480)
const IMAGES = ["comete", "lune", "nebuleuse"];

function Coffre({ i, ouvert, terne, suspense, lueur, survol }: { i: number; ouvert: boolean; terne: boolean; suspense: boolean; lueur: string; survol: boolean }) {
  const n = IMAGES[i] || IMAGES[0];
  return (
    <div className={`relative w-full ${suspense && !ouvert ? "cf-tremble" : ""}`} style={{ aspectRatio: "500 / 480" }}>
      {/* lueur et rayons qui sortent du coffre ouvert */}
      {ouvert && !terne ? (
        <>
          <span className="cf-rayons pointer-events-none absolute left-1/2 top-[38%] aspect-square w-[130%]" style={{ ["--c" as string]: lueur }} aria-hidden />
          <span className="cf-eclat pointer-events-none absolute inset-[8%] rounded-full" style={{ background: `radial-gradient(circle at 50% 55%, ${lueur}cc, ${lueur}33 45%, transparent 70%)` }} aria-hidden />
        </>
      ) : null}
      {/* halo au survol / pendant le suspense */}
      <span className={`pointer-events-none absolute inset-[14%] rounded-full blur-2xl transition-opacity duration-300 ${survol || suspense ? "opacity-70" : "opacity-0"}`} style={{ background: lueur }} aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/coffres/${n}-ferme.webp`} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none drop-shadow-[0_10px_16px_rgba(0,0,0,.55)] transition-opacity duration-200" style={{ opacity: ouvert ? 0 : 1 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/coffres/${n}-ouvert.webp`} alt="" draggable={false} className={`pointer-events-none absolute inset-0 h-full w-full select-none drop-shadow-[0_10px_16px_rgba(0,0,0,.55)] ${ouvert ? "cf-ouvre" : ""}`} style={{ opacity: ouvert ? 1 : 0, filter: terne ? "grayscale(.65) brightness(.7)" : undefined }} />
      {/* paillettes à l'ouverture */}
      {ouvert && !terne ? (
        <span className="pointer-events-none absolute left-1/2 top-[45%]" aria-hidden>
          {Array.from({ length: 12 }, (_, k) => (
            <span key={k} className="cf-paillette" style={{ ["--a" as string]: `${-80 + (k / 11) * 160}deg`, ["--d" as string]: `${50 + (k % 3) * 18}%`, background: k % 3 ? lueur : "#fff", animationDelay: `${120 + (k % 4) * 40}ms` }} />
          ))}
        </span>
      ) : null}
    </div>
  );
}

// ============================================================
// LES 3 COFFRES SCELLÉS — une partie par jour
// ============================================================
// CycyBot (bot.cycylive.fr/api/coffres) remplit les 3 coffres dès le début :
// un petit lot, un lot moyen et un gros lot. Le site ne connaît jamais le
// contenu d'un coffre fermé. Le joueur choisit, CycyBot ouvre un autre coffre
// (jamais le gros lot), le joueur garde ou change, puis reçoit un code à
// coller dans /tresor sur Discord.

const BOT = process.env.NEXT_PUBLIC_CYCYBOT_URL || "https://bot.cycylive.fr";
const DISCORD = "https://discord.gg/sER6tztDSz";

type Gain = { key: string; emoji: string; label: string; tier: "petit" | "moyen" | "gros"; tierLabel: string; rarity: string; rarityLabel: string };
type Partie = {
  etape: "choix" | "decision" | "fin";
  choix: number | null;
  ouvert: number | null;
  final: number | null;
  change: boolean;
  contenuOuvert?: Gain;
  coffres?: Gain[];
  gain?: Gain;
  code?: string;
  recupere?: boolean;
  credited?: boolean;
  given?: string[];
  note?: string;
  bonus?: number;
  encore?: boolean;
};

const COULEUR_TIER: Record<string, string> = { petit: "#d6d0ea", moyen: "#7ee2a8", gros: "#facc15" };

const LOTS: [NomSticker, string, string][] = [
  ["eclats", "10 à 15 Éclats ou 1 fragment d'étoile", "Petit lot"],
  ["fragment", "35 Éclats, ou 1 à 2 fragments d'étoile + Éclats", "Lot moyen"],
  ["booster", "Toujours au moins 1 booster : + Éclats, + fragments, ou 2 boosters", "Gros lot"],
  ["tresor", "Trésor de Cycy : 3 boosters + 2 fragments + 150 Éclats", "Très rare"],
];

class ConnexionRequise extends Error {}

async function appel(corps: Record<string, unknown>): Promise<Partie> {
  const r = await fetch(`${BOT}/api/coffres`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appareil: idAppareil(), session: sessionDiscord(), ...corps }) });
  const d = await r.json().catch(() => ({}));
  if (d.connexion) throw new ConnexionRequise(d.error);
  if (!r.ok || !d.ok) throw new Error(d.error || "Les coffres sont indisponibles pour le moment.");
  return d as Partie;
}

// Le décor de la salle : une alcôve voûtée ouverte sur la nébuleuse, des colonnes dorées, une estrade de
// marbre, un rayon de lumière et des paillettes qui flottent (dans la même ambiance que les autres jeux).
function DecorSalle() {
  return (
    <>
    {/* la salle : hauteur limitée et ancrée en haut, pour que l'arche reste toujours au-dessus du texte */}
    <svg className="pointer-events-none absolute inset-x-0 top-0 w-full h-[min(100%,520px)] md:h-[min(100%,600px)]" viewBox="0 0 1200 460" preserveAspectRatio="xMidYMin slice" aria-hidden>
      <defs>
        <linearGradient id="cs-salle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1450" /><stop offset="1" stopColor="#0d071c" /></linearGradient>
        <radialGradient id="cs-ciel" cx="50%" cy="30%" r="75%"><stop offset="0" stopColor="#4d2788" /><stop offset=".55" stopColor="#221250" /><stop offset="1" stopColor="#0f0826" /></radialGradient>
        <linearGradient id="cs-or" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff0b8" /><stop offset=".5" stopColor="#e9b65a" /><stop offset="1" stopColor="#9a6424" /></linearGradient>
        <linearGradient id="cs-col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1f0f3d" /><stop offset=".45" stopColor="#4f3283" /><stop offset="1" stopColor="#160a2e" /></linearGradient>
        <linearGradient id="cs-marbre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a3a96" /><stop offset="1" stopColor="#1a0d38" /></linearGradient>
        <linearGradient id="cs-rayon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9b0" stopOpacity=".26" /><stop offset="1" stopColor="#ffc46b" stopOpacity="0" /></linearGradient>
        <radialGradient id="cs-voile" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#0d071c" stopOpacity="0" /><stop offset="1" stopColor="#0d071c" stopOpacity=".55" /></radialGradient>
        <filter id="cs-flou" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24" /></filter>
        <clipPath id="cs-arche"><path d="M330 400 V190 Q330 34 600 34 Q870 34 870 190 V400 Z" /></clipPath>
      </defs>
      <rect width="1200" height="460" fill="url(#cs-salle)" />
      {/* murs : panneaux sombres et arcs secondaires */}
      {[90, 1110].map((x) => (
        <path key={x} d={`M${x - 70} 400 V170 Q${x - 70} 90 ${x} 90 Q${x + 70} 90 ${x + 70} 170 V400 Z`} fill="#1a0d36" stroke="#e9b65a" strokeOpacity=".25" strokeWidth="2" />
      ))}
      <g clipPath="url(#cs-arche)">
        <rect width="1200" height="460" fill="url(#cs-ciel)" />
        <ellipse cx="470" cy="150" rx="130" ry="55" fill="#ff7fd6" opacity=".22" filter="url(#cs-flou)" />
        <ellipse cx="740" cy="210" rx="150" ry="60" fill="#6bc4ff" opacity=".2" filter="url(#cs-flou)" />
        <ellipse cx="620" cy="100" rx="90" ry="34" fill="#ffd27a" opacity=".18" filter="url(#cs-flou)" />
        {Array.from({ length: 46 }, (_, i) => (
          <circle key={i} className={i % 4 ? undefined : "cs-scint"} style={{ animationDelay: `${(i % 7) * 0.4}s` }} cx={340 + ((i * 137) % 520)} cy={44 + ((i * 89) % 300)} r={i % 5 ? 1.1 : 2} fill="#fff" opacity={0.35 + (i % 3) * 0.2} />
        ))}
        <path d="M530 34 L670 34 L790 400 L410 400 Z" fill="url(#cs-rayon)" />
      </g>
      <path d="M330 400 V190 Q330 34 600 34 Q870 34 870 190 V400" fill="none" stroke="url(#cs-or)" strokeWidth="5" opacity=".85" />
      <path d="M348 400 V194 Q348 54 600 54 Q852 54 852 194 V400" fill="none" stroke="#e9b65a" strokeOpacity=".3" strokeWidth="2" />
      <path d="M586 20 L600 4 L614 20 L600 36 Z" fill="url(#cs-or)" />
      {[226, 900].map((x) => (
        <g key={x}>
          <rect x={x} y="44" width="74" height="352" fill="url(#cs-col)" />
          {[0, 1, 2, 3].map((r) => <rect key={r} x={x + 12 + r * 16} y="60" width="4" height="324" fill="#000" opacity=".2" />)}
          <rect x={x - 10} y="28" width="94" height="20" rx="4" fill="url(#cs-or)" />
          <rect x={x - 10} y="390" width="94" height="16" rx="4" fill="url(#cs-or)" />
        </g>
      ))}
      {[[410, 140, 9], [800, 160, 8], [440, 300, 6], [770, 300, 7], [520, 80, 5], [690, 88, 6], [150, 250, 6], [1050, 240, 7]].map(([x, y, r], i) => (
        <g key={i} className="cs-flotte" style={{ animationDelay: `${i * 0.5}s` }}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.82} fill="url(#cs-or)" opacity=".85" />
        </g>
      ))}
      <rect width="1200" height="460" fill="url(#cs-voile)" />
      {/* fondu vers le bas de la salle : la suite (texte, sol) se pose dans la pénombre */}
      <linearGradient id="cs-fondu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d071c" stopOpacity="0" /><stop offset="1" stopColor="#0d071c" /></linearGradient>
      <rect y="330" width="1200" height="131" fill="url(#cs-fondu)" />
      <style>{`.cs-scint{animation:cs-scint 3s ease-in-out infinite}@keyframes cs-scint{50%{opacity:.1}}
        .cs-flotte{animation:cs-flotte 4s ease-in-out infinite}@keyframes cs-flotte{50%{transform:translateY(-8px)}}
        @media (prefers-reduced-motion: reduce){.cs-scint,.cs-flotte{animation:none}}`}</style>
    </svg>
    {/* le sol de marbre : toujours la même hauteur, collé en bas de la salle (le texte reste au-dessus) */}
    <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full md:h-16" viewBox="0 360 1200 100" preserveAspectRatio="none" aria-hidden>
      <path d="M0 410 Q600 368 1200 410 L1200 460 L0 460 Z" fill="url(#cs-marbre)" />
      <path d="M0 410 Q600 368 1200 410" fill="none" stroke="url(#cs-or)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      <path d="M160 444 Q600 410 1040 444" fill="none" stroke="#e9b65a" strokeOpacity=".25" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
    </>
  );
}

export default function CoffresScelles() {
  const compte = useCompteDiscord();
  const [partie, setPartie] = useState<Partie | null>(null);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState(false);
  // Petit suspense avant d'ouvrir les coffres
  const [suspense, setSuspense] = useState<number | null>(null);
  const annonce = useRef<HTMLParagraphElement | null>(null);

  const agir = useCallback(async (corps: Record<string, unknown>, attente = 0) => {
    setCharge(true);
    setErreur("");
    try {
      const [p] = await Promise.all([appel(corps), new Promise((r) => setTimeout(r, attente))]);
      setPartie(p);
    } catch (e) {
      if (e instanceof ConnexionRequise) {
        compte.oublier();
        setPartie(null);
      }
      setErreur(e instanceof Error && e.message !== "Failed to fetch" ? e.message : "Impossible de joindre CycyBot pour le moment. Réessaie dans un instant.");
    } finally {
      setCharge(false);
      setSuspense(null);
    }
  }, []);

  useEffect(() => {
    if (partie) annonce.current?.focus();
  }, [partie?.etape]); // eslint-disable-line react-hooks/exhaustive-deps

  const choisir = (i: number) => {
    if (charge || partie?.etape !== "choix") return;
    setSuspense(i);
    agir({ action: "choisir", choix: i }, 700);
  };
  const decider = (changer: boolean) => {
    if (charge || partie?.etape !== "decision") return;
    setSuspense(changer ? autre(partie) : partie.choix);
    agir({ action: "decider", changer }, 900);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
      <div className="relative overflow-hidden rounded-3xl border border-[#e9b65a]/25 px-5 pt-20 pb-20 md:px-8 md:pt-24 md:pb-24 shadow-glow-sm bg-[#0d071c]">
        <DecorSalle />
        <div className="relative">
        {!partie ? (
          <div className="text-center py-10 md:py-14">
            <Pastille nom="coffre" teinte="or" taille="lg" className="mb-4" />
            <h2 className="text-2xl md:text-3xl font-semibold text-ink mb-2">La salle des coffres scellés</h2>
            <p className="text-ink-soft max-w-lg mx-auto mb-6">
              Trois coffres t&apos;attendent : un petit lot, un lot moyen et un <strong className="text-ink">gros lot</strong>. Choisis le tien… puis
              CycyBot te mettra face à un choix.
            </p>
            {compte.joueur ? (
              <>
                <button
                  type="button"
                  onClick={() => agir({ action: "etat" })}
                  disabled={charge}
                  className="rounded-full px-7 py-3 bg-violet text-ink font-semibold hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {charge ? "CycyBot remplit les coffres…" : "Entrer dans la salle"}
                </button>
                <div className="mt-4">
                  <BandeauDiscord compte={compte} />
                </div>
              </>
            ) : compte.pret ? (
              <BoutonDiscord erreur={compte.erreur} texte="Une partie par jour et par compte Discord : ton trésor arrive directement sur ton profil, sans code à copier." />
            ) : (
              <div className="h-12" aria-hidden />
            )}
            {erreur && <p className="text-sm text-red-300 mt-4">{erreur}</p>}
          </div>
        ) : (
          <div>
            <p ref={annonce} tabIndex={-1} className="text-center text-lg md:text-xl font-semibold text-ink mb-1 outline-none" aria-live="polite">
              {texteEtape(partie, suspense)}
            </p>
            <p className="text-center text-sm text-ink-soft mb-6 min-h-[1.25rem]">{sousTexte(partie, suspense)}</p>

            <div className="grid grid-cols-3 gap-2 sm:gap-5 max-w-2xl mx-auto">
              {TEINTES_COFFRES.map((t, i) => {
                const fin = partie.etape === "fin";
                const ouvertParBot = partie.ouvert === i;
                const ouvert = fin || ouvertParBot;
                const contenu = fin ? partie.coffres?.[i] : ouvertParBot ? partie.contenuOuvert : undefined;
                const choisi = fin ? partie.final === i : partie.choix === i;
                const cliquable = partie.etape === "choix" && !charge;
                const enSuspense = suspense === i;
                return (
                  <div key={t.nom} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => choisir(i)}
                      disabled={!cliquable}
                      aria-label={`${t.nom}${choisi ? " (ton choix)" : ""}${contenu ? ` : ${contenu.label}` : ""}`}
                      className={`group relative w-full rounded-2xl p-1 sm:p-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-light ${
                        cliquable ? "cursor-pointer hover:-translate-y-1.5 hover:bg-white/5 hover:drop-shadow-[0_0_22px_rgba(255,210,122,0.35)]" : "cursor-default"
                      } ${choisi ? "bg-white/[0.06] ring-2" : ""}`}
                      style={choisi ? { ["--tw-ring-color" as string]: t.lueur } : undefined}
                    >
                      {choisi && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-void" style={{ background: t.lueur }}>
                          {fin ? "Ton coffre" : "Ton choix"}
                        </span>
                      )}
                      <div className="relative">
                        <Coffre i={i} ouvert={ouvert} terne={fin && !choisi} suspense={enSuspense} lueur={t.lueur} survol={false} />
                        {/* la récompense sort du coffre et flotte au-dessus */}
                        {contenu && (
                          <span
                            className={`absolute left-1/2 top-[6%] w-[40%] drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] ${fin && !choisi ? "cf-sort-terne" : "cf-sort"}`}
                            aria-hidden
                          >
                            <Sticker nom={stickerDuGain(contenu.key, contenu.label)} taille={80} className="w-full h-auto" />
                          </span>
                        )}
                      </div>
                    </button>
                    <p className="mt-2 text-[11px] sm:text-xs text-ink-soft text-center leading-tight">{t.nom}</p>
                    {contenu && (
                      <p className="mt-1 text-[11px] sm:text-sm text-center leading-tight font-medium" style={{ color: COULEUR_TIER[contenu.tier] }}>
                        {contenu.tierLabel}
                        <span className="block text-ink-soft font-normal text-[11px] sm:text-xs mt-0.5">{contenu.label}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {partie.etape === "decision" && (
              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => decider(false)}
                  disabled={charge}
                  className="rounded-full px-6 py-3 border border-violet/40 bg-violet/15 text-ink font-semibold hover:bg-violet/25 disabled:opacity-50"
                >
                  Je garde le {TEINTES_COFFRES[partie.choix ?? 0].nom.toLowerCase()}
                </button>
                <button
                  type="button"
                  onClick={() => decider(true)}
                  disabled={charge}
                  className="rounded-full px-6 py-3 bg-violet text-ink font-semibold hover:bg-violet-light hover:shadow-glow disabled:opacity-50"
                >
                  Je change pour le {TEINTES_COFFRES[autre(partie) ?? 0].nom.toLowerCase()}
                </button>
              </div>
            )}

            {partie.etape === "fin" && partie.gain && <Resultat partie={partie} copie={copie} setCopie={setCopie} rejouer={() => agir({ action: "etat" })} charge={charge} />}
            {erreur && <p className="text-sm text-red-300 mt-4 text-center">{erreur}</p>}
          </div>
        )}
        </div>
      </div>

      <aside className="carte-holo rounded-2xl border border-violet/12 p-5">
        <h2 className="text-lg font-semibold text-ink mb-3">Comment ça marche ?</h2>
        <ol className="space-y-2 text-sm text-ink-soft mb-5 list-decimal list-inside">
          <li>Choisis un des trois coffres (1 partie par jour).</li>
          <li>CycyBot ouvre un des deux autres : il ne cache <strong className="text-ink">jamais</strong> le gros lot.</li>
          <li>Garde ton coffre ou change pour le dernier coffre fermé.</li>
          <li>
            Ton trésor arrive directement sur ton compte du{" "}
            <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="text-lilac underline">
              Discord Cycylive
            </a>{" "}
            (connexion avec Discord, 1 partie par compte et par jour).
          </li>
        </ol>
        <h3 className="text-sm font-semibold text-ink mb-2">Dans les coffres</h3>
        <ul className="space-y-1.5 text-sm">
          {LOTS.map(([e, nom, niveau]) => (
            <li key={nom} className="flex items-start gap-2">
              <Sticker nom={e} taille={24} className="shrink-0" />
              <span className="flex-1 text-ink-soft">{nom}</span>
              <span className="text-xs text-ink-soft/60 whitespace-nowrap mt-0.5">{niveau}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-soft/60 mt-4">
          Tu repars toujours avec quelque chose. Les coffres sont remplis par CycyBot avant ton choix : personne ne peut tricher, pas même le site. Il faut être
          membre du Discord Cycylive pour récupérer son trésor.
        </p>
      </aside>
      <style>{`
        .cf-tremble{animation:cf-tremble .5s ease-in-out infinite}
        @keyframes cf-tremble{0%,100%{transform:rotate(0)}20%{transform:rotate(-3deg) translateY(-2px)}40%{transform:rotate(3deg)}60%{transform:rotate(-2deg) translateY(-1px)}80%{transform:rotate(2deg)}}
        .cf-ouvre{animation:cf-ouvre .7s cubic-bezier(.3,1.6,.5,1) both;transform-origin:50% 90%}
        @keyframes cf-ouvre{0%{transform:scale(.92,.96)}40%{transform:scale(1.06,1.04) translateY(-3%)}100%{transform:scale(1)}}
        .cf-eclat{animation:cf-eclat 1.2s ease-out both,cf-respire 2.6s ease-in-out 1.2s infinite;mix-blend-mode:screen}
        @keyframes cf-eclat{0%{transform:scale(.3);opacity:0}25%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:.75}}
        @keyframes cf-respire{0%,100%{opacity:.6}50%{opacity:.95}}
        .cf-rayons{margin-left:-65%;margin-top:-65%;background:repeating-conic-gradient(from 0deg,var(--c) 0deg 6deg,transparent 6deg 24deg);-webkit-mask:radial-gradient(circle,#000 10%,transparent 62%);mask:radial-gradient(circle,#000 10%,transparent 62%);opacity:.45;mix-blend-mode:screen;animation:cf-tourne 14s linear infinite,cf-apparait .8s ease-out both}
        @keyframes cf-tourne{to{transform:rotate(360deg)}}
        @keyframes cf-apparait{from{opacity:0;transform:scale(.4)}}
        .cf-paillette{position:absolute;width:7px;height:7px;border-radius:2px;opacity:0;animation:cf-paillette 1.1s ease-out forwards}
        @keyframes cf-paillette{0%{transform:rotate(var(--a)) translateY(0) scale(1);opacity:1}100%{transform:rotate(var(--a)) translateY(calc(-1 * var(--d) * 3)) scale(.2);opacity:0}}
        .cf-sort{animation:cf-sort .9s cubic-bezier(.3,1.4,.5,1) .15s both,cf-flotte 2.4s ease-in-out 1.1s infinite}
        @keyframes cf-sort{from{transform:translate(-50%,70%) scale(.3);opacity:0}to{transform:translate(-50%,0) scale(1);opacity:1}}
        @keyframes cf-flotte{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-6px)}}
        .cf-sort-terne{transform:translate(-50%,8%) scale(.85);opacity:.6;filter:grayscale(.4)}
        @media (prefers-reduced-motion: reduce){.cf-tremble,.cf-ouvre,.cf-eclat,.cf-rayons,.cf-paillette,.cf-sort{animation:none}}
      `}</style>
    </div>
  );
}

/** Le dernier coffre encore fermé (ni choisi, ni ouvert par CycyBot). */
function autre(p: Partie): number | null {
  if (p.choix == null || p.ouvert == null) return null;
  return [0, 1, 2].find((x) => x !== p.choix && x !== p.ouvert) ?? null;
}

function texteEtape(p: Partie, suspense: number | null): string {
  if (p.etape === "choix") return suspense != null ? "CycyBot s'approche des coffres…" : "Un de ces coffres cache le gros lot. Lequel choisis-tu ?";
  if (p.etape === "decision") return suspense != null ? "Le coffre s'ouvre…" : `CycyBot ouvre le ${TEINTES_COFFRES[p.ouvert ?? 0].nom.toLowerCase()} : ${p.contenuOuvert?.label}.`;
  if (p.gain?.tier === "gros") return p.gain.rarity === "mythique" ? "LE TRÉSOR DE CYCY !!!" : "Gros lot ! Bien joué !";
  return p.gain?.tier === "moyen" ? "Un joli lot moyen !" : "Un petit lot, c'est toujours ça !";
}

function sousTexte(p: Partie, suspense: number | null): string {
  if (suspense != null) return "";
  if (p.etape === "choix") return "Prends ton temps : tu pourras encore changer d'avis.";
  if (p.etape === "decision") return "Ce coffre ne cachait pas le gros lot. Tu gardes ton coffre, ou tu tentes l'autre ?";
  const gros = p.coffres?.findIndex((c) => c.tier === "gros") ?? -1;
  if (p.gain?.tier === "gros") return p.change ? "Changer de coffre t'a porté chance." : "Ton instinct ne t'a pas trompé·e.";
  return gros >= 0 ? `Le gros lot était dans le ${TEINTES_COFFRES[gros].nom.toLowerCase()}. Retente ta chance demain !` : "";
}

function Resultat({ partie, copie, setCopie, rejouer, charge }: { partie: Partie; copie: boolean; setCopie: (v: boolean) => void; rejouer: () => void; charge: boolean }) {
  const code = partie.code || "";
  const gain = partie.gain!;
  return (
    <div className="mt-8 text-center" aria-live="polite">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-void/50 px-5 py-3 mb-5">
        <span aria-hidden>
          <Sticker nom={stickerDuGain(gain.key, gain.label)} taille={56} />
        </span>
        <span className="text-left">
          <span className="block text-xs uppercase tracking-widest" style={{ color: COULEUR_TIER[gain.tier] }}>
            {gain.tierLabel} · {gain.rarityLabel}
          </span>
          <span className="block text-lg font-semibold text-ink">{gain.label}</span>
        </span>
      </div>
      {partie.credited ? (
        <div>
          <p className="text-ink font-semibold text-lg mb-1">
            <Icone nom="valide" className="w-5 h-5 mr-1.5 text-emerald-300" />
            {partie.given ? "Trésor ajouté à ton compte Discord !" : "Ton trésor du jour est déjà sur ton compte Discord."}
          </p>
          {partie.given && <p className="text-ink-soft">{partie.given.map((g) => g.replace(/\*\*/g, "")).join(" · ")}</p>}
          {partie.encore ? (
            <button type="button" onClick={rejouer} disabled={charge} className="mt-4 rounded-full bg-gradient-to-b from-[#ffe08a] to-[#f5b84a] px-6 py-2.5 font-semibold text-[#3a2048] shadow-[0_0_20px_rgba(245,184,74,.45)] hover:brightness-110 disabled:opacity-60">
              <Icone nom="cadeau" className="w-5 h-5 mr-1.5" />{charge ? "CycyBot remplit les coffres…" : "Ouvrir mes coffres bonus du jour"}
            </button>
          ) : (
            <p className="text-xs text-ink-soft/60 mt-3">Trois nouveaux coffres t&apos;attendent demain, dès minuit.</p>
          )}
        </div>
      ) : partie.recupere ? (
        <p className="text-ink-soft">Ce trésor a déjà été récupéré sur Discord. Trois nouveaux coffres t&apos;attendent demain !</p>
      ) : (
        <>
          {partie.note && <p className="text-sm text-amber-200 mb-3 max-w-md mx-auto">{partie.note}</p>}
          <p className="text-ink font-semibold mb-1">Récupère ton trésor sur Discord :</p>
          <ol className="text-ink-soft text-sm mb-4 mx-auto max-w-md text-left space-y-1 list-decimal list-inside">
            <li>
              Copie ton code avec le bouton <strong className="text-ink">Copier le code</strong>.
            </li>
            <li>
              Dans le salon <strong className="text-ink">CycyBot</strong>, tape <code className="text-lilac">/tresor</code> et choisis la commande.
            </li>
            <li>
              <strong className="text-ink">Colle uniquement le code</strong> dans la case « code », puis valide.
            </li>
          </ol>
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <code className="select-all rounded-xl bg-void/70 border border-violet/30 px-4 py-2.5 font-mono text-lilac text-lg md:text-xl tracking-wider">{code}</code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(code)
                  .then(() => {
                    setCopie(true);
                    setTimeout(() => setCopie(false), 2000);
                  })
                  .catch(() => {});
              }}
              className="rounded-full px-5 py-2.5 bg-violet/20 border border-violet/40 text-ink text-sm font-medium hover:bg-violet/30"
            >
              {copie ? <><Icone nom="valide" className="w-4 h-4 mr-1" />Code copié</> : "Copier le code"}
            </button>
            <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2.5 bg-violet text-ink text-sm font-medium hover:bg-violet-light">
              Ouvrir Discord
            </a>
          </div>
          <p className="text-xs text-ink-soft/60 mt-3">Code valable 48 h · un trésor récupéré par jour</p>
        </>
      )}
    </div>
  );
}
