"use client";

// Grille du planning (page d'accueil) : la semaine en cours, et les suivantes au clic.
// Toutes les cases ont la même taille, qu'il y ait 1, 2 ou 3 jeux dans la soirée.
import { useState } from "react";
import type React from "react";
import Icone from "@/components/icones/Icone";
import { IconCrystal } from "@/components/Icons";

export type JourGrille = { jour: string; date: string; off: boolean; heure?: string; fin?: string; jeux: string[]; note?: string; modifie?: boolean };
export type SemaineGrille = { du: string; au: string; jours: JourGrille[] };

// Lives spéciaux (même détection que l'image du planning Discord) : illustration et couleurs à part
type TypeLive = "caritatif" | "horreur" | "evenement" | "";
const sansAcc = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function typeLive(jour: JourGrille): TypeLive {
  const t = sansAcc(`${jour.jeux.join(" ")} ${jour.note || ""}`);
  if (/caritati|association|charit|telethon|zevent|cagnotte|solidaire|au profit/.test(t)) return "caritatif";
  if (/horreur|horror|epouvante|flipp|phasmo|outlast|resident evil|silent hill|fnaf|five nights|dead by daylight|\bdbd\b|lethal company|amnesia|alien isolation|until dawn|the forest|sons of the forest|visage|mouthwashing|poppy playtime|dark deception|the quarry|madison|dredge/.test(t)) return "horreur";
  if (/evenement|event|special|anniversaire|subathon|giveaway|halloween|noel|nouvel an|reveillon|tournoi|soiree speciale|concours|ceremonie|nuit speciale/.test(t)) return "evenement";
  return "";
}
// Couleurs en style direct : la classe carte-holo (globals.css) passerait devant les utilitaires Tailwind
const carte = (bord: string, haut: string, bas: string, halo: string) => ({ borderColor: bord, background: `linear-gradient(180deg, ${haut}, ${bas} 55%, rgba(13,10,23,.92))`, boxShadow: `0 0 24px ${halo}` });
const STYLE_LIVE: Record<Exclude<TypeLive, "">, { label: string; carte: React.CSSProperties; pastille: string; texte: string }> = {
  caritatif: { label: "💜 Caritatif", carte: carte("rgba(244,114,182,.75)", "rgba(244,114,182,.30)", "rgba(157,23,77,.18)", "rgba(244,114,182,.32)"), pastille: "bg-pink-900/70 border-pink-400/80 text-pink-100", texte: "text-pink-300" },
  horreur: { label: "👻 Horreur", carte: carte("rgba(239,68,68,.75)", "rgba(220,38,38,.30)", "rgba(69,10,10,.35)", "rgba(220,38,38,.32)"), pastille: "bg-red-950/80 border-red-500/80 text-red-100", texte: "text-red-300" },
  evenement: { label: "✨ Événement", carte: carte("rgba(251,191,36,.75)", "rgba(251,191,36,.26)", "rgba(180,83,9,.18)", "rgba(251,191,36,.28)"), pastille: "bg-amber-900/70 border-amber-400/80 text-amber-100", texte: "text-amber-200" },
};
function IconeLive({ type }: { type: Exclude<TypeLive, ""> }) {
  if (type === "caritatif")
    return (
      <svg viewBox="0 0 48 48" className="w-7 h-7 shrink-0 drop-shadow-[0_0_10px_rgba(244,114,182,.8)]" aria-hidden>
        <defs><linearGradient id="gl-coeur" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fce7f3" /><stop offset=".5" stopColor="#f472b6" /><stop offset="1" stopColor="#9d174d" /></linearGradient></defs>
        <path d="M22 40C6 29 4 20 8 14c4-6 11-5 14 1 3-6 10-7 14-1 4 6 2 15-14 26z" fill="url(#gl-coeur)" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" />
        <path d="M40 4c-2-3-6-1-5 2 0 2 3 4 5 6 2-2 5-4 5-6 1-3-3-5-5-2z" fill="#fbcfe8" />
      </svg>
    );
  if (type === "horreur")
    return (
      <svg viewBox="0 0 48 48" className="w-7 h-7 shrink-0 drop-shadow-[0_0_10px_rgba(248,113,113,.8)]" aria-hidden>
        <circle cx="36" cy="10" r="7" fill="#ef4444" />
        <path d="M10 44V22C10 8 38 8 38 22v22l-4.7-4-4.6 4-4.7-4-4.6 4-4.7-4z" fill="#fff5f5" />
        <ellipse cx="19" cy="23" rx="3" ry="4.5" fill="#1a0505" /><ellipse cx="29" cy="23" rx="3" ry="4.5" fill="#1a0505" /><ellipse cx="24" cy="32" rx="2.6" ry="3.6" fill="#1a0505" />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 48" className="w-7 h-7 shrink-0 drop-shadow-[0_0_10px_rgba(251,191,36,.8)]" aria-hidden>
      <defs><linearGradient id="gl-etoile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fffbeb" /><stop offset=".5" stopColor="#fbbf24" /><stop offset="1" stopColor="#b45309" /></linearGradient></defs>
      <path d="M24 4l5.6 13 14 1.2-10.6 9.2 3.2 13.8L24 34l-12.2 7.2 3.2-13.8L4.4 18.2l14-1.2z" fill="url(#gl-etoile)" stroke="#fff" strokeOpacity=".6" strokeWidth="1.2" />
      <path d="M42 34l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM6 4l.8 2.2L9 7l-2.2.8L6 10l-.8-2.2L3 7l2.2-.8z" fill="#fde68a" />
    </svg>
  );
}

const NOMS_SEMAINE = ["Cette semaine", "Semaine prochaine", "Dans 2 semaines", "Dans 3 semaines"];

function Jeux({ jeux, couleur = "text-lilac" }: { jeux: string[]; couleur?: string }) {
  if (!jeux.length) return <span className={`${couleur} text-sm font-medium leading-tight`}>Stream</span>;
  if (jeux.length === 1) return <span className={`${couleur} block text-sm font-medium leading-tight line-clamp-2`}>{jeux[0]}</span>;
  return (
    <ol className="flex md:flex-col flex-wrap items-center gap-x-1.5 gap-y-1 w-full">
      {jeux.map((j, i) => (
        <li key={i} className="flex items-center gap-1.5 md:w-full md:justify-center min-w-0">
          {i > 0 ? <span className="hidden md:inline text-[10px] text-ink-soft/50">puis</span> : <span className="md:hidden" />}
          <span className={`truncate rounded-full border border-violet/25 bg-violet/10 px-2 py-0.5 text-[11.5px] font-medium ${couleur} max-w-full`}>{j}</span>
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
          const sp = jour.off ? "" : typeLive(jour);
          const st = sp ? STYLE_LIVE[sp] : null;
          const valo = !jour.off && !sp && jour.jeux.some((j) => /valorant/i.test(j));
          return (
            <div
              key={jour.date || jour.jour}
              style={st?.carte}
              className={`relative carte-holo rounded-2xl px-4 py-3 md:p-4 md:min-h-[168px] flex flex-wrap md:flex-col items-center md:justify-center md:text-center gap-x-3 gap-y-1 md:gap-2 border ${
                st ? (estAujourdhui ? "ring-2 ring-violet-light/80 ring-offset-2 ring-offset-void" : "") : estAujourdhui ? "border-violet-light shadow-glow" : jour.off ? "border-violet/10 opacity-80" : "border-violet/35 shadow-glow-sm"
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
                  {sp ? <IconeLive type={sp} /> : valo ? (
                    // même logo violet que le planning du Discord (image du bot)
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src="/images/jeux/valorant.png" alt="Valorant" width={30} height={24} className="h-6 w-auto shrink-0 drop-shadow-[0_0_10px_rgba(181,124,255,.7)]" />
                  ) : <IconCrystal className="w-6 h-6 text-lilac shrink-0" />}
                  <div className="flex-1 md:flex-none md:w-full min-w-0">
                    {st ? <span className={`mb-1 inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${st.pastille}`}>{st.label}</span> : null}
                    <Jeux jeux={jour.jeux} couleur={st?.texte} />
                  </div>
                  <span className="ml-auto md:ml-0 text-ink text-sm font-semibold whitespace-nowrap">
                    {jour.heure}
                    {jour.fin ? <span className="font-normal text-ink-soft"> → {jour.fin}</span> : null}
                  </span>
                </>
              )}
              {jour.note ? <span className="w-full md:w-auto text-[11px] leading-tight text-ink-soft line-clamp-2">{jour.note}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
