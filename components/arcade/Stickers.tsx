// ============================================================
// STICKERS DES JEUX — petites illustrations SVG « kawaii »
// ============================================================
// Même direction artistique que les compagnons (Creature.tsx) : formes
// rondes, couleur pleine + contour plus foncé, reflet blanc, joues roses
// et petits visages. Remplacent les emojis dans les jeux du site
// (compagnon, ticket à gratter, coffres scellés…). Dessinés sur 64 × 64.

import type { ReactNode } from "react";

export type NomSticker =
  | "viande" | "donut" | "taco" | "fraise" | "bonbon"
  | "bulle" | "etincelle" | "coeur" | "zzz" | "caca" | "etoile" | "maison" | "oeuf" | "soleil" | "lune" | "fete"
  | "planete" | "fusee" | "comete" | "soucoupe" | "robot" | "boule" | "cible"
  | "points" | "eclats" | "booster" | "fragment" | "combo" | "pack" | "tresor" | "cadeau";

const C = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Petit visage kawaii centré en (x, y). */
function Visage({ x, y, s = 1, couleur = "#2b1640", bouche = "sourire" }: { x: number; y: number; s?: number; couleur?: string; bouche?: "sourire" | "o" | "dodo" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {bouche === "dodo" ? (
        <path d="M-9 -1 q3 3 6 0 M3 -1 q3 3 6 0" stroke={couleur} strokeWidth="2" fill="none" {...C} />
      ) : (
        <>
          <ellipse cx="-6" cy="-1" rx="2.6" ry="3.2" fill={couleur} />
          <ellipse cx="6" cy="-1" rx="2.6" ry="3.2" fill={couleur} />
          <circle cx="-5.2" cy="-2.3" r="1" fill="#fff" />
          <circle cx="6.8" cy="-2.3" r="1" fill="#fff" />
        </>
      )}
      <ellipse cx="-11" cy="4" rx="3" ry="1.8" fill="#ff8fc4" opacity="0.75" />
      <ellipse cx="11" cy="4" rx="3" ry="1.8" fill="#ff8fc4" opacity="0.75" />
      {bouche === "o" ? <ellipse cx="0" cy="5" rx="1.8" ry="2.2" fill={couleur} /> : <path d="M-3 3.5 q3 3 6 0" stroke={couleur} strokeWidth="1.8" fill="none" {...C} />}
    </g>
  );
}

/** Étincelle à 4 branches (signature du site). */
const Brille = ({ x, y, r = 4, c = "#fff" }: { x: number; y: number; r?: number; c?: string }) => (
  <path d={`M${x} ${y - r} Q${x + r * 0.22} ${y - r * 0.22} ${x + r} ${y} Q${x + r * 0.22} ${y + r * 0.22} ${x} ${y + r} Q${x - r * 0.22} ${y + r * 0.22} ${x - r} ${y} Q${x - r * 0.22} ${y - r * 0.22} ${x} ${y - r} Z`} fill={c} />
);

const Reflet = ({ d }: { d: string }) => <path d={d} stroke="#fff" strokeOpacity="0.65" strokeWidth="3" fill="none" {...C} />;

const ETOILE = "M32 6 L39.6 22.4 L57.5 24.5 L44.3 36.7 L47.8 54.4 L32 45.6 L16.2 54.4 L19.7 36.7 L6.5 24.5 L24.4 22.4 Z";

const DESSINS: Record<NomSticker, ReactNode> = {
  // ── Nourriture du compagnon ──
  viande: (
    <>
      <path d="M40 22 c6 -6 14 -4 15 2 c4 1 5 8 0 10 c-2 5 -9 5 -11 0 Z" fill="#fff5e6" stroke="#c9a67a" strokeWidth="2" {...C} />
      <path d="M42 30 L30 42" stroke="#fff5e6" strokeWidth="7" {...C} />
      <ellipse cx="24" cy="40" rx="17" ry="14" transform="rotate(-40 24 40)" fill="#e9785a" stroke="#a8432c" strokeWidth="2.2" />
      <ellipse cx="24" cy="40" rx="11" ry="8.5" transform="rotate(-40 24 40)" fill="#f79a7a" />
      <Reflet d="M14 36 q3 -7 10 -9" />
    </>
  ),
  donut: (
    <>
      <circle cx="32" cy="34" r="22" fill="#e8a865" stroke="#a96a2c" strokeWidth="2.2" />
      <path d="M12 32 c2 -14 14 -20 22 -19 c12 1 20 9 19 20 c-3 1 -4 5 -8 4 c-3 4 -7 1 -9 4 c-4 -2 -7 2 -10 -1 c-4 2 -6 -2 -9 -1 c-3 -2 -4 -5 -5 -7 Z" fill="#ff7ec2" stroke="#c23a7d" strokeWidth="2" {...C} />
      <circle cx="32" cy="32" r="6.5" fill="#160b2b" stroke="#a96a2c" strokeWidth="2" />
      {[[20, 24, 20], [42, 22, -30], [46, 32, 60], [24, 38, -60], [33, 20, 0], [38, 40, 30]].map(([x, y, r], i) => (
        <rect key={i} x={x - 3} y={y - 1} width="6" height="2.4" rx="1.2" fill={["#ffd66b", "#7cc4ff", "#9dffb0", "#fff"][i % 4]} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <Reflet d="M18 26 q4 -8 12 -10" />
    </>
  ),
  taco: (
    <>
      <path d="M10 30 c4 -8 9 -2 12 -7 c4 4 7 -2 10 1 c3 -4 7 0 10 -3 c3 4 8 2 12 9" fill="#9dffb0" stroke="#2e9c5e" strokeWidth="2" {...C} />
      <circle cx="20" cy="27" r="3.2" fill="#ff6b6b" stroke="#b8243f" strokeWidth="1.4" />
      <circle cx="34" cy="25" r="3.2" fill="#ff6b6b" stroke="#b8243f" strokeWidth="1.4" />
      <circle cx="46" cy="27" r="3.2" fill="#ff6b6b" stroke="#b8243f" strokeWidth="1.4" />
      <path d="M6 31 H58 C58 48 46 56 32 56 C18 56 6 48 6 31 Z" fill="#ffd36e" stroke="#c48a1e" strokeWidth="2.4" {...C} />
      <Visage x={32} y={42} s={0.85} couleur="#7a4a10" />
      <Reflet d="M12 36 q2 7 7 10" />
    </>
  ),
  fraise: (
    <>
      <path d="M32 58 C14 50 8 34 14 24 C20 16 44 16 50 24 C56 34 50 50 32 58 Z" fill="#ff5d7a" stroke="#b8243f" strokeWidth="2.2" />
      <path d="M20 18 l6 4 l6 -7 l6 7 l6 -4 l-2 8 h-20 Z" fill="#6fe3b0" stroke="#23a874" strokeWidth="2" {...C} />
      {[[22, 32], [42, 32], [28, 44], [38, 44], [32, 52], [20, 42], [44, 42]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="1.3" ry="2" fill="#ffe08a" />
      ))}
      <Visage x={32} y={36} s={0.8} couleur="#5a0f20" />
      <Reflet d="M17 28 q2 -5 7 -6" />
    </>
  ),
  bonbon: (
    <>
      <path d="M14 32 L2 22 L4 42 Z M50 32 L62 22 L60 42 Z" fill="#ffd1ec" stroke="#d9468f" strokeWidth="2" {...C} />
      <circle cx="32" cy="32" r="18" fill="#ff8cc8" stroke="#d9468f" strokeWidth="2.2" />
      <path d="M18 26 C24 22 30 30 36 26 C42 22 46 28 48 30 M16 36 C22 32 28 40 34 36 C40 32 44 38 47 40" stroke="#fff" strokeWidth="3.2" fill="none" {...C} opacity="0.85" />
      <Brille x={44} y={18} r={4.5} c="#ffe08a" />
    </>
  ),
  // ── Effets et objets du compagnon ──
  bulle: (
    <>
      <circle cx="32" cy="32" r="22" fill="#d6f3ff" fillOpacity="0.55" stroke="#7cc4ff" strokeWidth="2.2" />
      <path d="M18 26 q4 -10 14 -11" stroke="#fff" strokeWidth="4" fill="none" {...C} opacity="0.9" />
      <circle cx="44" cy="42" r="3" fill="#fff" opacity="0.8" />
      <path d="M46 20 q3 3 2 7" stroke="#f0abfc" strokeWidth="2" fill="none" {...C} opacity="0.8" />
    </>
  ),
  etincelle: (
    <>
      <Brille x={30} y={32} r={20} c="#ffe08a" />
      <Brille x={30} y={32} r={11} c="#fff6cf" />
      <Brille x={50} y={14} r={7} c="#f0abfc" />
      <Brille x={50} y={50} r={5} c="#a6e7ff" />
    </>
  ),
  coeur: (
    <>
      <path d="M32 56 C10 42 4 30 8 20 C12 10 26 8 32 20 C38 8 52 10 56 20 C60 30 54 42 32 56 Z" fill="#ff7ad9" stroke="#c2338f" strokeWidth="2.4" {...C} />
      <Reflet d="M14 22 q3 -7 10 -6" />
      <Brille x={46} y={22} r={4} />
    </>
  ),
  zzz: (
    <>
      <path d="M10 40 h14 l-14 14 h14" stroke="#b8a6ff" strokeWidth="4.5" fill="none" {...C} />
      <path d="M30 22 h11 l-11 11 h11" stroke="#d6c9ff" strokeWidth="4" fill="none" {...C} />
      <path d="M46 8 h8 l-8 8 h8" stroke="#eee8ff" strokeWidth="3.5" fill="none" {...C} />
    </>
  ),
  caca: (
    <>
      {/* petit tas de poussière de comète, avec une tête de chamallow boudeur */}
      <path d="M8 52 C4 52 4 42 12 41 C10 34 16 30 22 31 C21 24 28 19 33 22 C36 14 46 16 45 26 C52 26 55 34 50 39 C58 41 58 52 52 52 Z" fill="#a77ad9" stroke="#5e3496" strokeWidth="2.4" {...C} />
      <path d="M14 46 q18 4 36 0" stroke="#5e3496" strokeWidth="1.6" fill="none" opacity="0.5" {...C} />
      <Visage x={31} y={38} s={0.85} couleur="#2b0f4d" bouche="o" />
      <Reflet d="M27 25 q3 -3 7 -2" />
      <path d="M50 14 q3 -4 0 -8 M56 18 q3 -4 0 -8" stroke="#9dffb0" strokeWidth="2" fill="none" {...C} opacity="0.85" />
    </>
  ),
  etoile: (
    <>
      <path d={ETOILE} fill="#ffd66b" stroke="#d99b1e" strokeWidth="2.6" {...C} />
      <path d="M32 14 L36.5 24" stroke="#fff6cf" strokeWidth="3" {...C} opacity="0.9" />
      <Visage x={32} y={33} s={0.85} couleur="#7a4a10" />
    </>
  ),
  maison: (
    <>
      <path d="M12 30 L32 12 L52 30 V54 H12 Z" fill="#b57cff" stroke="#5a1fd1" strokeWidth="2.4" {...C} />
      <path d="M6 32 L32 8 L58 32" stroke="#ff7ad9" strokeWidth="5" fill="none" {...C} />
      <rect x="26" y="38" width="12" height="16" rx="5" fill="#ffd66b" stroke="#c48a1e" strokeWidth="2" />
      <circle cx="22" cy="30" r="4" fill="#a6e7ff" stroke="#5a1fd1" strokeWidth="1.6" />
      <Brille x={50} y={14} r={5} c="#ffe08a" />
    </>
  ),
  oeuf: (
    <>
      <path d="M32 6 C46 6 54 26 54 38 C54 50 44 58 32 58 C20 58 10 50 10 38 C10 26 18 6 32 6 Z" fill="#f3ecff" stroke="#9d8bd6" strokeWidth="2.4" />
      <path d="M12 34 l8 -5 l7 6 l6 -6 l7 6 l7 -6 l7 5" stroke="#b57cff" strokeWidth="3" fill="none" {...C} />
      <circle cx="22" cy="46" r="3" fill="#ff8cc8" opacity="0.7" />
      <circle cx="40" cy="48" r="2.5" fill="#7cc4ff" opacity="0.7" />
      <Reflet d="M19 22 q3 -8 9 -10" />
    </>
  ),
  soleil: (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d="M32 4 l4 8 h-8 Z" fill="#ffb54d" transform={`rotate(${i * 45} 32 32)`} {...C} />
      ))}
      <circle cx="32" cy="32" r="17" fill="#ffd66b" stroke="#e08a1e" strokeWidth="2.4" />
      <Visage x={32} y={33} s={0.9} couleur="#7a4a10" />
    </>
  ),
  lune: (
    <>
      <path d="M40 6 C24 8 14 20 14 34 C14 48 26 58 40 58 C30 52 24 44 24 32 C24 20 30 12 40 6 Z" fill="#c9b8ff" stroke="#7b5fd6" strokeWidth="2.4" {...C} />
      <circle cx="22" cy="26" r="2.5" fill="#a48fe6" />
      <circle cx="20" cy="42" r="3.2" fill="#a48fe6" />
      <Brille x={48} y={22} r={5} c="#fff6cf" />
      <Brille x={52} y={44} r={3.5} c="#f0abfc" />
    </>
  ),
  fete: (
    <>
      <path d="M8 58 L22 22 L42 42 Z" fill="#ff7ad9" stroke="#c2338f" strokeWidth="2.4" {...C} />
      <path d="M13 46 l12 6 M17 36 l14 10" stroke="#ffd66b" strokeWidth="3" {...C} />
      {[[36, 14, "#7cc4ff"], [48, 20, "#ffd66b"], [52, 34, "#9dffb0"], [30, 8, "#ff8cc8"], [56, 10, "#b57cff"]].map(([x, y, c], i) => (
        <rect key={i} x={Number(x) - 3} y={Number(y) - 1.5} width="6" height="3" rx="1.5" fill={String(c)} transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
      <path d="M40 28 q6 -6 12 -2" stroke="#b57cff" strokeWidth="2.4" fill="none" {...C} />
    </>
  ),
  // ── Espace (memory, réflexes…) ──
  planete: (
    <>
      <circle cx="32" cy="32" r="18" fill="#7cc4ff" stroke="#3b7fe0" strokeWidth="2.4" />
      <path d="M18 26 c6 4 12 -2 18 2 c4 3 9 0 12 2" stroke="#dcefff" strokeWidth="3" fill="none" {...C} opacity="0.7" />
      <ellipse cx="32" cy="34" rx="29" ry="8" fill="none" stroke="#ffb3e0" strokeWidth="3.4" transform="rotate(-14 32 34)" />
      <Visage x={32} y={34} s={0.8} couleur="#173a73" />
      <Brille x={52} y={12} r={4.5} />
    </>
  ),
  fusee: (
    <>
      <path d="M22 44 L12 54 L14 42 Z M42 44 L52 54 L50 42 Z" fill="#ff7ad9" stroke="#c2338f" strokeWidth="2" {...C} />
      <path d="M32 4 C44 12 46 32 42 46 H22 C18 32 20 12 32 4 Z" fill="#eadcff" stroke="#7b38ff" strokeWidth="2.4" {...C} />
      <circle cx="32" cy="24" r="7" fill="#7cc4ff" stroke="#7b38ff" strokeWidth="2.2" />
      <circle cx="30" cy="22" r="2" fill="#fff" />
      <path d="M25 46 L28 58 L32 50 L36 58 L39 46 Z" fill="#ffb54d" stroke="#e0701e" strokeWidth="1.8" {...C} />
      <Reflet d="M26 14 q-2 8 -2 16" />
    </>
  ),
  comete: (
    <>
      <path d="M4 6 C16 14 30 22 42 28 L36 44 C24 36 14 22 4 6 Z" fill="#a6e7ff" opacity="0.45" />
      <path d="M14 4 C24 14 34 20 44 26 L40 34 C30 26 22 16 14 4 Z" fill="#f0abfc" opacity="0.55" />
      <path d="M4 20 C16 26 26 32 36 36 L34 44 C22 38 12 30 4 20 Z" fill="#dcefff" opacity="0.5" />
      <circle cx="44" cy="40" r="14" fill="#a6e7ff" stroke="#3b7fe0" strokeWidth="2.4" />
      <Visage x={44} y={41} s={0.7} couleur="#173a73" />
      <Reflet d="M36 34 q2 -5 7 -6" />
    </>
  ),
  soucoupe: (
    <>
      <path d="M20 30 C20 16 44 16 44 30 Z" fill="#a6e7ff" fillOpacity="0.8" stroke="#3b7fe0" strokeWidth="2.2" />
      <path d="M26 24 C26 18 38 18 38 24" fill="#6fe3b0" stroke="#23a874" strokeWidth="1.8" />
      <circle cx="29.5" cy="22.5" r="1.4" fill="#10261a" /><circle cx="34.5" cy="22.5" r="1.4" fill="#10261a" />
      <ellipse cx="32" cy="34" rx="26" ry="9" fill="#b57cff" stroke="#5a1fd1" strokeWidth="2.4" />
      {[14, 24, 32, 40, 50].map((x) => <circle key={x} cx={x} cy={35} r="2.4" fill="#ffd66b" />)}
      <path d="M22 44 L16 58 M42 44 L48 58" stroke="#ffe7a8" strokeWidth="5" opacity="0.5" {...C} />
    </>
  ),
  robot: (
    <>
      <path d="M32 8 v6" stroke="#5a1fd1" strokeWidth="2.6" {...C} />
      <circle cx="32" cy="7" r="3.5" fill="#ff7ad9" stroke="#c2338f" strokeWidth="1.6" />
      <rect x="12" y="14" width="40" height="34" rx="12" fill="#9d5cff" stroke="#5a1fd1" strokeWidth="2.4" />
      <rect x="18" y="20" width="28" height="20" rx="8" fill="#1e1440" />
      <ellipse cx="26" cy="29" rx="3.2" ry="4" fill="#7cf3ff" /><ellipse cx="38" cy="29" rx="3.2" ry="4" fill="#7cf3ff" />
      <path d="M28 35 q4 3 8 0" stroke="#7cf3ff" strokeWidth="2" fill="none" {...C} />
      <rect x="22" y="48" width="20" height="10" rx="4" fill="#e2d2ff" stroke="#5a1fd1" strokeWidth="2" />
      <ellipse cx="14" cy="34" rx="3" ry="6" fill="#e2d2ff" stroke="#5a1fd1" strokeWidth="1.8" />
      <ellipse cx="50" cy="34" rx="3" ry="6" fill="#e2d2ff" stroke="#5a1fd1" strokeWidth="1.8" />
      <Reflet d="M17 22 q2 -5 7 -5" />
    </>
  ),
  boule: (
    <>
      <path d="M18 52 h28 l-4 -8 h-20 Z" fill="#b57cff" stroke="#5a1fd1" strokeWidth="2.2" {...C} />
      <circle cx="32" cy="28" r="20" fill="#f0abfc" fillOpacity="0.55" stroke="#c026d3" strokeWidth="2.4" />
      <path d="M22 30 c4 -6 10 4 14 -2 c3 -4 6 -2 8 0" stroke="#fff" strokeWidth="2.4" fill="none" {...C} opacity="0.7" />
      <Brille x={36} y={24} r={6} c="#fff6cf" />
      <Reflet d="M18 22 q3 -8 11 -10" />
    </>
  ),
  cible: (
    <>
      <circle cx="32" cy="32" r="28" fill="#ff4f6d" stroke="#b8243f" strokeWidth="2.4" />
      <circle cx="32" cy="32" r="20" fill="#ffe0e6" />
      <circle cx="32" cy="32" r="13" fill="#ff4f6d" />
      <circle cx="32" cy="32" r="7" fill="#fff6cf" />
      <ellipse cx="29.5" cy="31" rx="1.3" ry="1.7" fill="#5a0f20" /><ellipse cx="34.5" cy="31" rx="1.3" ry="1.7" fill="#5a0f20" />
      <path d="M30.5 34 q1.5 1.5 3 0" stroke="#5a0f20" strokeWidth="1.2" fill="none" {...C} />
      <Reflet d="M12 24 q4 -10 14 -13" />
    </>
  ),
  // ── Récompenses Discord ──
  points: (
    <>
      <circle cx="32" cy="32" r="26" fill="#3b1d7a" opacity="0.35" />
      <path d={ETOILE} fill="#ffd66b" stroke="#d99b1e" strokeWidth="2.6" {...C} />
      <path d="M32 14 L36.5 24" stroke="#fff6cf" strokeWidth="3" {...C} />
      <path d="M32 28 v12 M26 34 h12" stroke="#a8620b" strokeWidth="3.6" {...C} />
      <Brille x={54} y={10} r={5} />
    </>
  ),
  eclats: (
    <>
      <path d="M32 4 L46 22 L32 60 L18 22 Z" fill="#c084fc" stroke="#6d28d9" strokeWidth="2.4" {...C} />
      <path d="M18 22 H46 M32 4 L28 22 L32 60 L36 22 Z" stroke="#6d28d9" strokeWidth="1.6" fill="#e9d5ff" fillOpacity="0.5" {...C} />
      <path d="M10 36 L16 44 L10 58 L4 44 Z" fill="#7cc4ff" stroke="#2563eb" strokeWidth="2" {...C} />
      <path d="M54 34 L60 42 L54 54 L48 42 Z" fill="#ff8cc8" stroke="#be185d" strokeWidth="2" {...C} />
      <Brille x={40} y={12} r={4} />
    </>
  ),
  booster: (
    <>
      <rect x="16" y="6" width="34" height="50" rx="6" fill="#7b38ff" stroke="#3d1590" strokeWidth="2.4" transform="rotate(8 33 31)" />
      <rect x="12" y="8" width="34" height="50" rx="6" fill="#b57cff" stroke="#3d1590" strokeWidth="2.4" />
      <path d="M12 16 h34 M12 50 h34" stroke="#3d1590" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M29 22 L32.6 29.4 L40.5 30.3 L34.6 35.8 L36.2 43.6 L29 39.7 L21.8 43.6 L23.4 35.8 L17.5 30.3 L25.4 29.4 Z" fill="#ffd66b" stroke="#d99b1e" strokeWidth="1.8" {...C} />
      <Reflet d="M17 22 v14" />
      <Brille x={54} y={10} r={5} c="#ffe08a" />
    </>
  ),
  fragment: (
    <>
      <defs>
        <clipPath id="stk-frag-g"><path d="M0 0 H33 L29 22 L36 34 L30 64 H0 Z" /></clipPath>
        <clipPath id="stk-frag-d"><path d="M33 0 H64 V64 H30 L36 34 L29 22 Z" /></clipPath>
      </defs>
      <g clipPath="url(#stk-frag-g)" transform="translate(-4 2) rotate(-8 32 32)">
        <path d={ETOILE} fill="#ffd66b" stroke="#d99b1e" strokeWidth="2.6" {...C} />
        <path d="M33 0 L29 22 L36 34 L30 64" stroke="#d99b1e" strokeWidth="2.6" fill="none" {...C} />
      </g>
      <g clipPath="url(#stk-frag-d)" transform="translate(5 -2) rotate(8 32 32)">
        <path d={ETOILE} fill="#ffe7a8" stroke="#d99b1e" strokeWidth="2.6" {...C} />
        <path d="M33 0 L29 22 L36 34 L30 64" stroke="#d99b1e" strokeWidth="2.6" fill="none" {...C} />
      </g>
      <Brille x={33} y={30} r={4} c="#f0abfc" />
      <Brille x={54} y={10} r={4} />
    </>
  ),
  combo: (
    <>
      <path d="M46 18 L56 30 L46 56 L36 30 Z" fill="#c084fc" stroke="#6d28d9" strokeWidth="2.2" {...C} />
      <path d="M26 8 L32.5 21.5 L47 23.3 L36.3 33.2 L39.2 47.6 L26 40.4 L12.8 47.6 L15.7 33.2 L5 23.3 L19.5 21.5 Z" fill="#ffd66b" stroke="#d99b1e" strokeWidth="2.4" {...C} />
      <Visage x={26} y={30} s={0.7} couleur="#7a4a10" />
      <Brille x={54} y={10} r={5} />
    </>
  ),
  pack: (
    <>
      <rect x="22" y="10" width="30" height="44" rx="5" fill="#ff7ad9" stroke="#9d1f6c" strokeWidth="2.2" transform="rotate(14 37 32)" />
      <rect x="10" y="10" width="30" height="44" rx="5" fill="#b57cff" stroke="#3d1590" strokeWidth="2.2" transform="rotate(-8 25 32)" />
      <path d="M25 22 L28.2 28.6 L35.4 29.4 L30.1 34.4 L31.5 41.4 L25 37.9 L18.5 41.4 L19.9 34.4 L14.6 29.4 L21.8 28.6 Z" fill="#ffd66b" stroke="#d99b1e" strokeWidth="1.6" {...C} />
      <path d="M50 46 L56 52 L50 60 L44 52 Z" fill="#ffe7a8" stroke="#d99b1e" strokeWidth="2" {...C} />
      <Brille x={52} y={10} r={5} c="#ffe08a" />
    </>
  ),
  tresor: (
    <>
      <path d="M6 44 C10 22 54 22 58 44" stroke="#ff6b6b" strokeWidth="4" fill="none" {...C} />
      <path d="M10 44 C14 27 50 27 54 44" stroke="#ffd66b" strokeWidth="4" fill="none" {...C} />
      <path d="M14 44 C18 32 46 32 50 44" stroke="#9dffb0" strokeWidth="4" fill="none" {...C} />
      <path d="M18 44 C22 37 42 37 46 44" stroke="#7cc4ff" strokeWidth="4" fill="none" {...C} />
      <path d="M14 30 L18 12 L26 22 L32 8 L38 22 L46 12 L50 30 Z" fill="#ffd66b" stroke="#d99b1e" strokeWidth="2.4" {...C} />
      <circle cx="32" cy="22" r="3" fill="#ff7ad9" stroke="#c2338f" strokeWidth="1.4" />
      <rect x="10" y="44" width="44" height="14" rx="4" fill="#b57cff" stroke="#3d1590" strokeWidth="2.2" />
      <Brille x={56} y={10} r={5} />
      <Brille x={8} y={16} r={4} c="#f0abfc" />
    </>
  ),
  cadeau: (
    <>
      <rect x="10" y="26" width="44" height="30" rx="5" fill="#b57cff" stroke="#3d1590" strokeWidth="2.4" />
      <rect x="6" y="18" width="52" height="12" rx="4" fill="#ff7ad9" stroke="#9d1f6c" strokeWidth="2.4" />
      <path d="M32 18 v38" stroke="#ffd66b" strokeWidth="6" />
      <path d="M32 18 C24 6 12 10 18 18 Z M32 18 C40 6 52 10 46 18 Z" fill="#ffd66b" stroke="#c48a1e" strokeWidth="2" {...C} />
      <Reflet d="M14 34 v10" />
    </>
  ),
};

export default function Sticker({ nom, taille = 32, className = "", titre }: { nom: NomSticker; taille?: number; className?: string; titre?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={taille} height={taille} className={`inline-block align-middle ${className}`} role={titre ? "img" : undefined} aria-label={titre} aria-hidden={titre ? undefined : true} style={{ overflow: "visible" }}>
      {DESSINS[nom]}
    </svg>
  );
}

/** Illustration d'un gain Discord d'après sa clé (ticket, compagnon, coffres scellés). */
export function stickerDuGain(cle: string, label = ""): NomSticker {
  const k = String(cle || "").toLowerCase();
  const l = label.toLowerCase();
  if (/jackpot|tresor|g-pack|pack/.test(k)) return k.includes("pack") && !k.includes("jackpot") ? "pack" : "tresor";
  if (/booster/.test(k) || /booster/.test(l)) return /\+/.test(l) && /éclats/.test(l) ? "combo" : "booster";
  if (/fragment/.test(k) || /fragment/.test(l)) return "fragment";
  if (/combo|mix|soin/.test(k)) return "combo";
  if (/calin/.test(k)) return "coeur";
  if (/eclats/.test(k) || /éclats/.test(l)) return "eclats";
  if (/xp/.test(k) || /points/.test(l)) return "points";
  return "cadeau";
}
