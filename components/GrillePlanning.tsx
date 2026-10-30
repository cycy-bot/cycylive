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
type TypeLive = "caritatif" | "horreur" | "halloween" | "noel" | "anniversaire" | "tournoi" | "giveaway" | "evenement" | "";
type TypeSpecial = Exclude<TypeLive, "">;
const sansAcc = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function typeLive(jour: JourGrille): TypeLive {
  const t = sansAcc(`${jour.jeux.join(" ")} ${jour.note || ""}`);
  if (/caritati|association|charit|telethon|zevent|cagnotte|solidaire|au profit/.test(t)) return "caritatif";
  if (/halloween/.test(t)) return "halloween";
  if (/noel|christmas|xmas|reveillon/.test(t)) return "noel";
  if (/horreur|horror|epouvante|flipp|phasmo|outlast|resident evil|silent hill|fnaf|five nights|dead by daylight|\bdbd\b|lethal company|amnesia|alien isolation|until dawn|the forest|sons of the forest|visage|mouthwashing|poppy playtime|dark deception|the quarry|madison|dredge/.test(t)) return "horreur";
  if (/anniv|birthday|\bans\b de la chaine/.test(t)) return "anniversaire";
  if (/tournoi|tournament|\bcup\b|coupe|championnat|finale/.test(t)) return "tournoi";
  if (/giveaway|concours|cadeaux?|tirage/.test(t)) return "giveaway";
  if (/evenement|event|special|subathon|nouvel an|soiree speciale|ceremonie|nuit speciale/.test(t)) return "evenement";
  return "";
}
// Couleurs en style direct : la classe carte-holo (globals.css) passerait devant les utilitaires Tailwind
const carte = (rgb: string, rgb2: string) => ({ borderColor: `rgba(${rgb},.75)`, background: `linear-gradient(180deg, rgba(${rgb},.28), rgba(${rgb2},.2) 55%, rgba(13,10,23,.92))`, boxShadow: `0 0 24px rgba(${rgb},.3)` });
const STYLE_LIVE: Record<TypeSpecial, { label: string; carte: React.CSSProperties; pastille: string; texte: string; halo: string }> = {
  caritatif: { label: "💜 Caritatif", carte: carte("244,114,182", "157,23,77"), pastille: "bg-pink-900/70 border-pink-400/80 text-pink-100", texte: "text-pink-300", halo: "rgba(244,114,182,.8)" },
  horreur: { label: "👻 Horreur", carte: carte("220,38,38", "69,10,10"), pastille: "bg-red-950/80 border-red-500/80 text-red-100", texte: "text-red-300", halo: "rgba(248,113,113,.8)" },
  halloween: { label: "🎃 Halloween", carte: carte("249,115,22", "124,45,18"), pastille: "bg-orange-950/80 border-orange-400/80 text-orange-100", texte: "text-orange-300", halo: "rgba(253,186,116,.8)" },
  noel: { label: "🎄 Noël", carte: carte("34,197,94", "127,29,29"), pastille: "bg-green-950/80 border-green-400/80 text-green-100", texte: "text-green-300", halo: "rgba(134,239,172,.8)" },
  anniversaire: { label: "🎂 Anniversaire", carte: carte("192,132,252", "134,25,143"), pastille: "bg-fuchsia-950/80 border-fuchsia-400/80 text-fuchsia-100", texte: "text-fuchsia-300", halo: "rgba(240,171,252,.8)" },
  tournoi: { label: "🏆 Tournoi", carte: carte("56,189,248", "30,58,138"), pastille: "bg-sky-950/80 border-sky-400/80 text-sky-100", texte: "text-sky-300", halo: "rgba(125,211,252,.8)" },
  giveaway: { label: "🎁 Giveaway", carte: carte("52,211,153", "6,95,70"), pastille: "bg-emerald-950/80 border-emerald-400/80 text-emerald-100", texte: "text-emerald-300", halo: "rgba(110,231,183,.8)" },
  evenement: { label: "✨ Événement", carte: carte("251,191,36", "180,83,9"), pastille: "bg-amber-900/70 border-amber-400/80 text-amber-100", texte: "text-amber-200", halo: "rgba(251,191,36,.8)" },
};
const Grad = ({ id, c }: { id: string; c: string[] }) => (
  <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1">{c.map((k, i) => <stop key={i} offset={i / (c.length - 1)} stopColor={k} />)}</linearGradient></defs>
);
const DESSINS: Record<TypeSpecial, React.ReactNode> = {
  caritatif: (<><Grad id="gl-c" c={["#fce7f3", "#f472b6", "#9d174d"]} /><path d="M22 40C6 29 4 20 8 14c4-6 11-5 14 1 3-6 10-7 14-1 4 6 2 15-14 26z" fill="url(#gl-c)" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" /><path d="M40 4c-2-3-6-1-5 2 0 2 3 4 5 6 2-2 5-4 5-6 1-3-3-5-5-2z" fill="#fbcfe8" /></>),
  horreur: (<><circle cx="36" cy="10" r="7" fill="#ef4444" /><path d="M10 44V22C10 8 38 8 38 22v22l-4.7-4-4.6 4-4.7-4-4.6 4-4.7-4z" fill="#fff5f5" /><ellipse cx="19" cy="23" rx="3" ry="4.5" fill="#1a0505" /><ellipse cx="29" cy="23" rx="3" ry="4.5" fill="#1a0505" /><ellipse cx="24" cy="32" rx="2.6" ry="3.6" fill="#1a0505" /></>),
  halloween: (<><Grad id="gl-h" c={["#fdba74", "#f97316", "#9a3412"]} /><path d="M23 12c0-5 3-8 7-9l1 3c-3 1-5 3-5 6z" fill="#4d7c0f" /><ellipse cx="15" cy="28" rx="11" ry="15" fill="url(#gl-h)" /><ellipse cx="33" cy="28" rx="11" ry="15" fill="url(#gl-h)" /><ellipse cx="24" cy="28" rx="12" ry="16" fill="url(#gl-h)" /><path d="M14 22h6l-3-5zM28 22h6l-3-5zM13 31q11 9 22 0l-4 1-2 3-3-2-3 3-3-3-3 2z" fill="#fef08a" /></>),
  noel: (<><Grad id="gl-n" c={["#bbf7d0", "#22c55e", "#14532d"]} /><rect x="21" y="38" width="6" height="7" fill="#78350f" /><path d="M24 7l9 12h-5l9 10h-5l9 10H7l9-10h-5l9-10h-5z" fill="url(#gl-n)" /><path d="M24 2l1.6 3.3 3.6.5-2.6 2.5.6 3.6L24 10.2l-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#fde047" /><circle cx="19" cy="22" r="2" fill="#ef4444" /><circle cx="29" cy="27" r="2" fill="#fbbf24" /><circle cx="16" cy="34" r="2" fill="#fbbf24" /><circle cx="27" cy="35" r="2" fill="#ef4444" /><circle cx="34" cy="37" r="1.8" fill="#f472b6" /></>),
  anniversaire: (<><Grad id="gl-a" c={["#fdf4ff", "#f0abfc", "#a21caf"]} /><rect x="6" y="28" width="36" height="15" rx="4" fill="url(#gl-a)" /><rect x="12" y="18" width="24" height="12" rx="3" fill="url(#gl-a)" /><path d="M12 21q3 4 6 0t6 0 6 0 6 0v-3H12zM6 31q3 4 6 0t6 0 6 0 6 0 6 0 6 0v-3H6z" fill="#fff" /><rect x="16" y="9" width="3" height="9" fill="#38bdf8" /><rect x="22.5" y="9" width="3" height="9" fill="#fbbf24" /><rect x="29" y="9" width="3" height="9" fill="#f472b6" /><ellipse cx="17.5" cy="6" rx="2" ry="3.2" fill="#fde047" /><ellipse cx="24" cy="6" rx="2" ry="3.2" fill="#fde047" /><ellipse cx="30.5" cy="6" rx="2" ry="3.2" fill="#fde047" /></>),
  tournoi: (<><Grad id="gl-t" c={["#fffbeb", "#fbbf24", "#a16207"]} /><path d="M12 10a6 6 0 0 0 0 12M36 10a6 6 0 0 1 0 12" fill="none" stroke="#eab308" strokeWidth="3" /><path d="M11 6h26q0 20-13 21Q11 26 11 6z" fill="url(#gl-t)" /><rect x="21.5" y="26" width="5" height="7" fill="#ca8a04" /><rect x="14" y="33" width="20" height="4" rx="1.5" fill="url(#gl-t)" /><rect x="11" y="37" width="26" height="6" rx="2" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="1" /><path d="M24 10l1.4 2.9 3.2.4-2.3 2.2.6 3.1L24 17l-2.9 1.6.6-3.1-2.3-2.2 3.2-.4z" fill="#fff" fillOpacity=".85" /></>),
  giveaway: (<><Grad id="gl-g" c={["#a7f3d0", "#34d399", "#047857"]} /><rect x="9" y="20" width="30" height="22" rx="3" fill="url(#gl-g)" /><rect x="7" y="14" width="34" height="8" rx="2" fill="url(#gl-g)" /><rect x="21.5" y="14" width="5" height="28" fill="#f472b6" /><rect x="7" y="17" width="34" height="3" fill="#f472b6" /><path d="M24 14C21 4 12 6 22 14zM24 14c3-10 12-8 2 0z" fill="#ec4899" /><circle cx="24" cy="14" r="2.4" fill="#fbcfe8" /></>),
  evenement: (<><Grad id="gl-e" c={["#fffbeb", "#fbbf24", "#b45309"]} /><path d="M24 4l5.6 13 14 1.2-10.6 9.2 3.2 13.8L24 34l-12.2 7.2 3.2-13.8L4.4 18.2l14-1.2z" fill="url(#gl-e)" stroke="#fff" strokeOpacity=".6" strokeWidth="1.2" /><path d="M42 34l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM6 4l.8 2.2L9 7l-2.2.8L6 10l-.8-2.2L3 7l2.2-.8z" fill="#fde68a" /></>),
};
function IconeLive({ type }: { type: TypeSpecial }) {
  return (
    <svg viewBox="0 0 48 48" className="w-7 h-7 shrink-0" style={{ filter: `drop-shadow(0 0 8px ${STYLE_LIVE[type].halo})` }} aria-hidden>
      {DESSINS[type]}
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
