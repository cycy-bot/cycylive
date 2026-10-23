// ============================================================
// HABITAT DU COMPAGNON — ambiances et décorations illustrées
// ============================================================
// Achetées avec les bonbons cosmiques 🍬 et installées dans la scène.
// Un objet par emplacement : fond (ambiance), plafond, mur, sol, gauche, droite.
// Images : public/compagnon/habitats/<ambiance>.webp (4 pièces alignées : même sol,
// mêmes murs, mêmes hublots) et public/compagnon/decos/<objet>.webp.

import type { CSSProperties } from "react";

export type EmplacementDeco = "fond" | "plafond" | "mur" | "sol" | "gauche" | "droite";
export type Habitat = Partial<Record<EmplacementDeco, string>>;

export const EMPLACEMENTS_DECO: { key: EmplacementDeco; label: string }[] = [
  { key: "fond", label: "Ambiance" },
  { key: "plafond", label: "Plafond" },
  { key: "mur", label: "Mur" },
  { key: "sol", label: "Sol" },
  { key: "gauche", label: "À gauche" },
  { key: "droite", label: "À droite" },
];

// (les clés des ambiances restent celles des anciens fonds : les achats déjà faits sont gardés)
export const DECOS: { key: string; nom: string; emplacement: EmplacementDeco; prix: number }[] = [
  { key: "nebuleuse", nom: "Cocon nébuleux", emplacement: "fond", prix: 60 },
  { key: "ocean", nom: "Station lunaire", emplacement: "fond", prix: 70 },
  { key: "couchant", nom: "Refuge martien", emplacement: "fond", prix: 80 },
  { key: "aurore", nom: "Jardin d'aurore", emplacement: "fond", prix: 90 },
  { key: "guirlande", nom: "Guirlande d'étoiles", emplacement: "plafond", prix: 35 },
  { key: "mobile", nom: "Mobile de planètes", emplacement: "plafond", prix: 50 },
  { key: "lune", nom: "Lampe lune", emplacement: "plafond", prix: 60 },
  { key: "hublot", nom: "Hublot sur la Terre", emplacement: "mur", prix: 55 },
  { key: "poster", nom: "Tenture planète", emplacement: "mur", prix: 40 },
  { key: "etagere", nom: "Étagère à trophées", emplacement: "mur", prix: 65 },
  { key: "tapis", nom: "Tapis lune", emplacement: "sol", prix: 30 },
  { key: "nuage", nom: "Coussin nuage", emplacement: "sol", prix: 45 },
  { key: "herbe", nom: "Herbe alien", emplacement: "sol", prix: 35 },
  { key: "plante", nom: "Plante cosmique", emplacement: "gauche", prix: 40 },
  { key: "lave", nom: "Lampe à lave", emplacement: "gauche", prix: 45 },
  { key: "telescope", nom: "Télescope", emplacement: "gauche", prix: 75 },
  { key: "arcade", nom: "Mini borne d'arcade", emplacement: "droite", prix: 90 },
  { key: "aquarium", nom: "Aquarium d'étoiles", emplacement: "droite", prix: 80 },
  { key: "coffre", nom: "Coffre au trésor", emplacement: "droite", prix: 55 },
];

export const decoInfo = (k: string) => DECOS.find((d) => d.key === k);

const AMBIANCE: Record<string, string> = { nebuleuse: "nebuleuse", ocean: "lune", couchant: "mars", aurore: "aurore" };
const img = (k: string) => `url(/compagnon/habitats/${AMBIANCE[k]}.webp)`;

/** Ambiances : remplacent le fond de la scène (la nuit, la pièce s'assombrit). */
export const FONDS: Record<string, { jour: string; nuit: string }> = Object.fromEntries(
  Object.keys(AMBIANCE).map((k) => [k, { jour: `${img(k)} center 62% / cover no-repeat`, nuit: `linear-gradient(#0b0420c4, #0b0420a8), ${img(k)} center 62% / cover no-repeat` }])
);

// Place et taille de chaque objet dans la pièce (en % de la scène). Les objets du sol sont plus grands
// que ceux posés sur les côtés (le coussin nuage est plus large que le télescope…).
const PLACE: Record<string, CSSProperties & { anim?: string }> = {
  guirlande: { right: "12%", top: "-2%", height: "26%" },
  mobile: { left: "14%", top: "-1%", height: "30%", anim: "hb-balance" },
  lune: { right: "15%", top: "-1%", height: "30%", anim: "hb-balance" },
  hublot: { left: "17%", top: "20%", height: "27%" },
  poster: { left: "18%", top: "17%", height: "30%" },
  etagere: { right: "16%", top: "33%", height: "19%" },
  tapis: { left: "50%", bottom: "1%", height: "22%", transform: "translateX(-50%)" },
  nuage: { left: "50%", bottom: "2%", height: "27%", transform: "translateX(-50%)" },
  herbe: { left: "50%", bottom: "1%", height: "25%", transform: "translateX(-50%)" },
  plante: { left: "7%", bottom: "8%", height: "31%" },
  lave: { left: "9%", bottom: "8%", height: "30%", anim: "hb-lueur" },
  telescope: { left: "6%", bottom: "8%", height: "34%" },
  arcade: { right: "7%", bottom: "8%", height: "36%", anim: "hb-lueur" },
  aquarium: { right: "7%", bottom: "8%", height: "30%" },
  coffre: { right: "7%", bottom: "8%", height: "24%" },
};

function Objet({ k }: { k: string }) {
  const p = PLACE[k];
  if (!p) return null;
  const { anim, ...style } = p;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/compagnon/decos/${k}.webp`} alt="" aria-hidden draggable={false} className={anim} style={{ position: "absolute", pointerEvents: "none", width: "auto", maxWidth: "none", filter: "drop-shadow(0 6px 10px rgba(10,4,30,.35))", ...style }} />
  );
}

/** Toutes les décorations installées, à placer DANS la scène (derrière la créature). */
export function DecorScene({ habitat }: { habitat: Habitat }) {
  return (
    <>
      <style>{`
        .hb-balance{transform-origin:50% 0;animation:hbBal 6s ease-in-out infinite}@keyframes hbBal{50%{transform:rotate(2.5deg)}}
        .hb-lueur{animation:hbLueur 3.4s ease-in-out infinite}@keyframes hbLueur{50%{filter:drop-shadow(0 0 14px rgba(255,150,230,.55)) brightness(1.08)}}
        @media (prefers-reduced-motion: reduce){.hb-balance,.hb-lueur{animation:none}}
      `}</style>
      {(["mur", "plafond", "sol", "gauche", "droite"] as EmplacementDeco[]).map((em) => (habitat[em] ? <Objet key={em} k={habitat[em]!} /> : null))}
    </>
  );
}

/** Petite vignette pour la boutique. */
export function DecoApercu({ k }: { k: string }) {
  const d = decoInfo(k);
  if (!d) return null;
  if (d.emplacement === "fond")
    return <span aria-hidden className="block h-[52px] w-[76px] rounded-xl border border-white/15" style={{ background: FONDS[k]?.jour }} />;
  return (
    <span aria-hidden className="flex h-[56px] w-[84px] items-center justify-center rounded-xl bg-[#1a0f38]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/compagnon/decos/${k}.webp`} alt="" className="max-h-[50px] max-w-[76px] object-contain" draggable={false} />
    </span>
  );
}
