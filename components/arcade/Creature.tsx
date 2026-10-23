// ============================================================
// CRÉATURES DU COMPAGNON — illustrations de Cycylive
// ============================================================
// 5 espèces × 5 humeurs (content, normal, dort, fâché, triste), en bébé et en adulte :
// public/compagnon/<espece>-<b|a>-<humeur>.webp (toile 460 × 440, pieds sur la même ligne).
// Les effets (étoiles, ZzZ, bouffées de colère) sont des images à part, animées ici ;
// les larmes coulent depuis les yeux. Les accessoires (boutique) se calent sur les repères
// mesurés pour chaque image (yeux, haut de la tête, bouche) : lib/compagnonSprites.json.

import type { CSSProperties } from "react";
import REPERES from "@/lib/compagnonSprites.json";

export type Espece = "chat" | "alien" | "dragon" | "poulpe" | "robot";
export type Humeur = "content" | "normal" | "triste" | "fache";
export type Emplacement = "tete" | "yeux" | "cou";
export type Tenue = Partial<Record<Emplacement, string>>;

export const ESPECES: { key: Espece; nom: string; nomParDefaut: string; description: string; couleur: string; clair: string; fonce: string }[] = [
  { key: "chat", nom: "Chat de l'espace", nomParDefaut: "Minou Nova", description: "Curieux et câlin, il ne quitte jamais son casque.", couleur: "#b57cff", clair: "#eadcff", fonce: "#7b38ff" },
  { key: "alien", nom: "Petit alien", nomParDefaut: "Zorblin", description: "Venu d'une planète lointaine, il adore les bonbons.", couleur: "#6fe3b0", clair: "#d9fbe9", fonce: "#23a874" },
  { key: "dragon", nom: "Dragon lunaire", nomParDefaut: "Lunix", description: "Un petit dragon qui crache des paillettes d'étoiles.", couleur: "#7cc4ff", clair: "#dcefff", fonce: "#3b7fe0" },
  { key: "poulpe", nom: "Poulpe cosmique", nomParDefaut: "Tentacla", description: "Huit bras pour faire huit câlins à la fois.", couleur: "#ff8cc8", clair: "#ffe0f0", fonce: "#d9468f" },
  { key: "robot", nom: "Mini-CycyBot", nomParDefaut: "Bip", description: "Le petit frère de CycyBot, carbure aux étoiles.", couleur: "#9d5cff", clair: "#e2d2ff", fonce: "#5a1fd1" },
];

export function especeInfo(e: Espece) {
  return ESPECES.find((x) => x.key === e) || ESPECES[0];
}

// ── Boutique d'accessoires ──────────────────────────────────

export const ACCESSOIRES: { key: string; nom: string; emplacement: Emplacement; prix: number }[] = [
  { key: "fleur", nom: "Fleur des étoiles", emplacement: "tete", prix: 40 },
  { key: "noeud", nom: "Gros nœud", emplacement: "tete", prix: 50 },
  { key: "casquette", nom: "Casquette gamer", emplacement: "tete", prix: 70 },
  { key: "bonnet", nom: "Bonnet à pompon", emplacement: "tete", prix: 90 },
  { key: "hautdeforme", nom: "Haut-de-forme", emplacement: "tete", prix: 140 },
  { key: "sorciere", nom: "Chapeau de sorcier·e", emplacement: "tete", prix: 160 },
  { key: "couronne", nom: "Couronne royale", emplacement: "tete", prix: 220 },
  { key: "aureole", nom: "Auréole", emplacement: "tete", prix: 260 },
  { key: "monocle", nom: "Monocle chic", emplacement: "yeux", prix: 60 },
  { key: "soleil", nom: "Lunettes de soleil", emplacement: "yeux", prix: 90 },
  { key: "coeurs", nom: "Lunettes cœur", emplacement: "yeux", prix: 120 },
  { key: "papillon", nom: "Nœud papillon", emplacement: "cou", prix: 50 },
  { key: "echarpe", nom: "Écharpe douillette", emplacement: "cou", prix: 80 },
  { key: "collier", nom: "Collier étoile", emplacement: "cou", prix: 130 },
];


type Fx = { f: string; x: number; y: number; l: number; h: number; fixe: boolean };
type Repere = { yeux: [number, number]; oeilG: [number, number]; oeilD: [number, number]; ecart: number; angle?: number; tete: number; teteX?: number; bouche: [number, number]; larmes: [number, number][]; fx: Fx[] };
const R = REPERES as unknown as Record<string, Record<string, Repere>>;

// Taille et position de chaque accessoire, en « écarts entre les yeux » (e) depuis son point d'accroche.
// w : largeur ; dy : décalage vertical du HAUT de l'image (chapeaux : depuis le haut de la tête, × hauteur) ;
// ax : point d'accroche horizontal dans l'image (0-1).
const POSE: Record<string, { w: number; ay: number; ax?: number; dy?: number }> = {
  fleur: { w: 0.95, ay: 0.5 },
  noeud: { w: 1.35, ay: 0.72 },
  casquette: { w: 2.05, ay: 0.61 },
  bonnet: { w: 1.95, ay: 0.7 },
  hautdeforme: { w: 1.6, ay: 0.86 },
  sorciere: { w: 2.25, ay: 0.82 },
  couronne: { w: 1.45, ay: 0.85 },
  aureole: { w: 1.55, ay: 1.2 },
  monocle: { w: 0.9, ay: 0.32, ax: 0.6 },
  soleil: { w: 2.1, ay: 0.5 },
  coeurs: { w: 2.2, ay: 0.5 },
  papillon: { w: 1.0, ay: 0.45 },
  echarpe: { w: 1.6, ay: 0.3 },
  collier: { w: 1.6, ay: 0.12 },
};
// proportions (hauteur / largeur) des images portées
const RATIO: Record<string, number> = { fleur: 350 / 328, noeud: 313 / 378, casquette: 502 / 728, bonnet: 383 / 321, hautdeforme: 312 / 375, sorciere: 342 / 374, couronne: 250 / 364, aureole: 450 / 640, monocle: 370 / 306, soleil: 192 / 517, coeurs: 197 / 505, papillon: 241 / 433, echarpe: 396 / 404, collier: 333 / 445 };
const DOSSIER: Record<Emplacement, string> = { tete: "tetes", yeux: "yeux", cou: "yeux" };

// Les têtes n'ont pas toutes la même largeur par rapport à l'écart des yeux (bulle du chat, casque du robot…)
const TETE_LARGE: Record<string, number> = { chat: 1.35, alien: 1.15, dragon: 1.1, poulpe: 1.15, robot: 1.25 };

function Accessoire({ k, rep, espece, couche = false }: { k: string; rep: Repere; espece: Espece; couche?: boolean }) {
  const a = ACCESSOIRES.find((x) => x.key === k);
  const p = POSE[k];
  if (!a || !p) return null;
  const e = rep.ecart * (a.emplacement === "tete" ? TETE_LARGE[espece] || 1.15 : a.emplacement === "cou" ? (TETE_LARGE[espece] || 1.15) * 0.92 : 1);
  const ee = couche ? e * 0.78 : e; // allongé, les yeux paraissent plus écartés : on réduit un peu
  const w = ee * p.w; // en % de la largeur de la toile
  const h = w * (RATIO[k] || 1) * (460 / 440); // en % de la hauteur
  let cx = rep.yeux[0], ay = rep.yeux[1];
  if (a.emplacement === "tete") {
    cx = k === "fleur" ? rep.yeux[0] + rep.ecart * 0.62 : rep.teteX ?? rep.yeux[0];
    ay = rep.tete + (k === "fleur" ? rep.ecart * 0.28 : 0);
  } else if (a.emplacement === "yeux") {
    if (k === "monocle") { cx = rep.oeilD[0]; ay = rep.oeilD[1]; }
  } else {
    cx = rep.bouche[0];
    ay = rep.bouche[1] + rep.ecart * (couche ? 0.12 : 0.45) * (460 / 440);
  }
  const top = ay - h * p.ay + (p.dy || 0) * h;
  const style: CSSProperties = {
    position: "absolute", left: `${cx - w * (p.ax ?? 0.5)}%`, top: `${top}%`, width: `${w}%`, height: `${h}%`, pointerEvents: "none",
    transform: rep.angle ? `rotate(${rep.angle}deg)` : undefined, transformOrigin: `${(p.ax ?? 0.5) * 100}% ${(p.ay - (p.dy || 0)) * 100}%`,
  };
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/compagnon/${DOSSIER[a.emplacement]}/${k}.webp`} alt="" draggable={false} style={style} className={k === "aureole" ? "cr-aureole" : undefined} />;
}

/** Aperçu d'un accessoire pour la boutique (illustration dédiée). */
export function AccessoireApercu({ k, taille = 64 }: { k: string; taille?: number }) {
  const a = ACCESSOIRES.find((x) => x.key === k);
  if (!a) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/compagnon/${a.emplacement === "tete" ? "tetes" : "yeux"}-boutique/${k}.webp`} alt="" aria-hidden draggable={false} style={{ width: taille, height: taille * 0.78, objectFit: "contain" }} />;
}

// ── La créature ─────────────────────────────────────────────

type Props = {
  espece: Espece;
  humeur?: Humeur;
  dort?: boolean;
  sale?: boolean;
  stade?: 0 | 1 | 2; // bébé, enfant, adulte
  taille?: number;
  tenue?: Tenue;
  /** Lumière éteinte : le corps s'assombrit, ses parties lumineuses (étoiles, néons…) restent allumées */
  nuit?: boolean;
  /** Sans animation (vignettes) */
  fixe?: boolean;
};

export const CSS_CREATURE = `
  .cr-respire{transform-origin:50% 95%;animation:cr-respire 3.2s ease-in-out infinite}
  .cr-respire-lent{transform-origin:50% 95%;animation:cr-respire 4.6s ease-in-out infinite}
  @keyframes cr-respire{0%,100%{transform:scale(1,1)}50%{transform:scale(1.015,.985)}}
  .cr-scint{animation:cr-scint 1.8s ease-in-out infinite;transform-origin:center}
  @keyframes cr-scint{0%,100%{opacity:.35;transform:scale(.7) rotate(0deg)}50%{opacity:1;transform:scale(1.12) rotate(12deg)}}
  .cr-zzz{animation:cr-zzz 3.2s ease-in-out infinite}
  @keyframes cr-zzz{0%{opacity:0;transform:translate(-14%,30%) scale(.6)}25%{opacity:1}100%{opacity:0;transform:translate(24%,-60%) scale(1.1)}}
  .cr-colere{animation:cr-colere .9s ease-in-out infinite;transform-origin:center}
  @keyframes cr-colere{0%,100%{transform:scale(.85);opacity:.7}50%{transform:scale(1.12) translateY(-6%);opacity:1}}
  .cr-larme{position:absolute;width:2.2%;aspect-ratio:3/4;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:radial-gradient(circle at 35% 30%,#ffffff,#8fd8ff 45%,#4aa8f0);opacity:0;animation:cr-larme 1.7s ease-in infinite}
  @keyframes cr-larme{0%{opacity:0;transform:translateY(0) scale(.5)}15%{opacity:.95;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(380%) scale(.8)}}
  .cr-aureole{animation:cr-aureole 3s ease-in-out infinite}
  @keyframes cr-aureole{50%{transform:translateY(-4%)}}
  .cr-veille{filter:drop-shadow(0 0 3px rgba(255,236,170,.55));animation:cr-veille 4s ease-in-out infinite,cr-allume 1.4s ease-out both}
  @keyframes cr-veille{50%{opacity:.78}}@keyframes cr-allume{from{opacity:0}}
  .cr-mouche{animation:cr-mouche 2.4s linear infinite}
  @keyframes cr-mouche{0%{transform:rotate(0deg) translateX(18px) rotate(0deg)}100%{transform:rotate(360deg) translateX(18px) rotate(-360deg)}}
  @media (prefers-reduced-motion: reduce){.cr-respire,.cr-respire-lent,.cr-scint,.cr-zzz,.cr-colere,.cr-larme,.cr-aureole,.cr-mouche,.cr-veille{animation:none}}
`;

export default function Creature({ espece, humeur = "normal", dort = false, sale = false, stade = 2, taille = 220, tenue = {}, fixe = false, nuit = false }: Props) {
  const c = especeInfo(espece);
  const age = stade === 2 ? "a" : "b";
  const etat = dort ? "dort" : humeur;
  const rep = R[`${espece}-${age}`]?.[etat] || R[`${espece}-${age}`]?.normal;
  const sombre = nuit && dort;
  const echelle = stade === 0 ? 0.86 : 1;
  const largeur = taille * 1.25;
  const anim = (f: Fx, i: number): string => {
    if (fixe || f.fixe) return "";
    if (etat === "dort") return "cr-zzz";
    if (etat === "fache") return "cr-colere";
    return "cr-scint";
  };
  return (
    <div role="img" aria-label={c.nom} style={{ position: "relative", width: largeur, height: (largeur * 440) / 460, transform: `scale(${echelle})`, transformOrigin: "50% 95%" }}>
      <style>{CSS_CREATURE}</style>
      {/* ombre douce au sol */}
      <span aria-hidden style={{ position: "absolute", left: "20%", right: "20%", top: "90%", height: "7%", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(20,8,40,.5), rgba(20,8,40,0))", pointerEvents: "none" }} />
      <div className={fixe ? "" : dort ? "cr-respire-lent" : "cr-respire"} style={{ position: "absolute", inset: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/compagnon/${espece}-${age}-${etat}.webp`} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", filter: sombre ? `brightness(${sale ? 0.46 : 0.5}) saturate(.8)` : sale ? "saturate(.75) brightness(.92)" : undefined, transition: "filter 1.2s ease" }} />
        {/* la nuit : étoiles, lunes et néons du corps restent doucement éclairés */}
        {sombre && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/compagnon/${espece}-${age}-dort-lueur.webp`} alt="" draggable={false} className={fixe ? "" : "cr-veille"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
        )}
        {/* effets d'humeur collés au corps (reflets de la bulle…) */}
        {rep?.fx.filter((f) => f.fixe).map((f) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={f.f} src={`/compagnon/${f.f}.webp`} alt="" draggable={false} style={{ opacity: sombre ? 0.45 : 1, position: "absolute", left: `${f.x}%`, top: `${f.y}%`, width: `${f.l}%`, height: `${f.h}%`, pointerEvents: "none" }} />
        ))}
        {/* larmes qui coulent */}
        {!fixe && etat === "triste" && rep?.larmes.slice(0, 2).map(([x, y], i) => (
          <span key={i} className="cr-larme" style={{ left: `${x - 1.1}%`, top: `${y - 1}%`, animationDelay: `${i * 0.85}s` }} />
        ))}
        {/* accessoires : cou, puis yeux, puis tête (retirés pour dormir) */}
        {rep && !dort && (["cou", "yeux", "tete"] as Emplacement[]).map((em) => (tenue[em] ? <Accessoire key={em} k={tenue[em]!} rep={rep} espece={espece} couche={etat === "dort"} /> : null))}
        {/* saleté : petites taches et mouches */}
        {sale && rep ? (
          <>
            {[[-0.9, 0.9], [0.8, 1.4], [0.1, 2.1]].map(([dx, dy], i) => (
              <span key={i} style={{ position: "absolute", left: `${rep.yeux[0] + dx * rep.ecart}%`, top: `${rep.yeux[1] + dy * rep.ecart}%`, width: "5%", height: "3.5%", borderRadius: "50%", background: "radial-gradient(circle,#7a5a3acc,#7a5a3a00 70%)", pointerEvents: "none" }} />
            ))}
            {!fixe && (
              <span style={{ position: "absolute", left: `${rep.yeux[0] + rep.ecart * 1.3}%`, top: `${rep.tete - 4}%` }}>
                <span className="cr-mouche" style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "#3a2a20", boxShadow: "-3px -2px 0 -1px #ffffffaa, 3px -2px 0 -1px #ffffffaa" }} />
              </span>
            )}
          </>
        ) : null}
      </div>
      {/* effets animés autour (étoiles, ZzZ, bouffées) */}
      {rep?.fx.filter((f) => !f.fixe).map((f, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={f.f} src={`/compagnon/${f.f}.webp`} alt="" draggable={false} className={anim(f, i)} style={{ position: "absolute", left: `${f.x}%`, top: `${f.y}%`, width: `${f.l}%`, height: `${f.h}%`, pointerEvents: "none", animationDelay: `${(i * 0.37) % 1.8}s` }} />
      ))}
    </div>
  );
}

const etoile = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} L${cx + r * 0.3} ${cy - r * 0.3} L${cx + r} ${cy} L${cx + r * 0.3} ${cy + r * 0.3} L${cx} ${cy + r} L${cx - r * 0.3} ${cy + r * 0.3} L${cx - r} ${cy} L${cx - r * 0.3} ${cy - r * 0.3} Z`;

/** Œuf de la créature (couleurs de l'espèce), fissuré selon la progression (0 → 1). */
export function Oeuf({ espece, progres, taille = 220 }: { espece: Espece; progres: number; taille?: number }) {
  const c = especeInfo(espece);
  const p = Math.max(0, Math.min(1, progres));
  return (
    <svg viewBox="0 0 200 220" width={taille} height={taille * 1.1} role="img" aria-label="Œuf">
      <defs>
        <radialGradient id={`oeuf-${espece}`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor={c.clair} />
          <stop offset="100%" stopColor={c.couleur} />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="206" rx="54" ry="9" fill="#000" opacity="0.3" />
      <path d="M100 18 C 150 18, 172 110, 166 150 C 160 190, 132 204, 100 204 C 68 204, 40 190, 34 150 C 28 110, 50 18, 100 18 Z" fill={`url(#oeuf-${espece})`} stroke={c.fonce} strokeWidth="3" />
      {/* motifs d'étoiles */}
      <g fill={c.fonce} opacity="0.35">
        <path d={etoile(74, 96, 10)} />
        <path d={etoile(130, 76, 7)} />
        <path d={etoile(122, 150, 11)} />
        <path d={etoile(70, 160, 6)} />
      </g>
      {/* fissures */}
      <g stroke="#3a1d6e" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {p > 0.2 && <path d="M92 40 l8 14 l-6 10" />}
        {p > 0.45 && <path d="M60 110 l14 6 l6 -10 l12 8" />}
        {p > 0.65 && <path d="M140 104 l-12 10 l6 12 l-12 6" />}
        {p > 0.85 && <path d="M52 140 l20 -4 l10 10 l16 -8 l16 8 l14 -10 l20 4" />}
      </g>
      <path d="M70 46 Q 60 70 62 92" stroke="#fff" strokeOpacity="0.7" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
