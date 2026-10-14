// ============================================================
// CRÉATURES DU COMPAGNON — dessins SVG (aucune image externe)
// ============================================================
// Style « kawaii » commun : grands yeux brillants, joues roses,
// contour doux, reflet sur le corps. Chaque espèce a ses détails.
// Les accessoires (boutique) se posent sur la tête, les yeux ou le cou.

import type { ReactNode } from "react";

export type Espece = "chat" | "alien" | "dragon" | "poulpe" | "robot";
export type Humeur = "content" | "normal" | "triste";
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

// Points d'accroche des accessoires (haut de la tête, ligne des yeux, cou)
const ANCRES: Record<Espece, { tete: number; yeux: number; cou: number; largeur: number }> = {
  chat: { tete: 66, yeux: 110, cou: 160, largeur: 1 },
  alien: { tete: 60, yeux: 110, cou: 160, largeur: 1 },
  dragon: { tete: 66, yeux: 112, cou: 162, largeur: 1 },
  poulpe: { tete: 48, yeux: 100, cou: 142, largeur: 1.05 },
  robot: { tete: 54, yeux: 110, cou: 160, largeur: 1.05 },
};

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

/** Dessin d'un accessoire, centré en (0, 0) sur son point d'accroche. */
function Accessoire({ k }: { k: string }): ReactNode {
  switch (k) {
    case "fleur":
      return (
        <g transform="translate(22 -2) rotate(12)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-9" rx="7" ry="10" fill="#ffd1ec" stroke="#e86aa8" strokeWidth="1.5" transform={`rotate(${a})`} />
          ))}
          <circle r="6" fill="#ffd66b" stroke="#e0a82e" strokeWidth="1.5" />
        </g>
      );
    case "noeud":
      return (
        <g transform="translate(0 -4)">
          <path d="M0 0 C -14 -16, -34 -12, -32 2 C -30 14, -12 12, 0 0 Z" fill="#ff6fb1" stroke="#c23a7d" strokeWidth="2" />
          <path d="M0 0 C 14 -16, 34 -12, 32 2 C 30 14, 12 12, 0 0 Z" fill="#ff6fb1" stroke="#c23a7d" strokeWidth="2" />
          <circle r="7" fill="#ff8fc4" stroke="#c23a7d" strokeWidth="2" />
          <path d="M-22 -4 q6 -4 12 0 M22 -4 q-6 -4 -12 0" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "casquette":
      return (
        <g transform="translate(0 2)">
          <path d="M-36 0 C -36 -30, 36 -30, 36 0 Z" fill="#7b38ff" stroke="#3d1590" strokeWidth="2.5" />
          <path d="M8 -2 C 30 -6, 52 -2, 58 4 C 40 8, 20 6, 8 4 Z" fill="#5a1fd1" stroke="#3d1590" strokeWidth="2.5" />
          <circle cx="0" cy="-26" r="4" fill="#ffd66b" />
          <path d="M-10 -14 l4 -8 l4 8 l-8 -5 h8 z" fill="#ffd66b" />
        </g>
      );
    case "bonnet":
      return (
        <g transform="translate(0 4)">
          <path d="M-38 0 C -40 -40, 40 -40, 38 0 Z" fill="#ff7d9c" stroke="#c43d63" strokeWidth="2.5" />
          <rect x="-41" y="-8" width="82" height="14" rx="7" fill="#fff4f8" stroke="#c43d63" strokeWidth="2" />
          {[-24, -8, 8, 24].map((x) => (
            <path key={x} d={`M${x} -12 v-14`} stroke="#ffb3c6" strokeWidth="4" strokeLinecap="round" />
          ))}
          <circle cx="0" cy="-36" r="9" fill="#fff4f8" stroke="#c43d63" strokeWidth="2" />
        </g>
      );
    case "hautdeforme":
      return (
        <g transform="translate(0 2)">
          <ellipse cx="0" cy="0" rx="40" ry="8" fill="#241640" stroke="#0e0820" strokeWidth="2" />
          <rect x="-24" y="-44" width="48" height="44" rx="5" fill="#2f1d55" stroke="#0e0820" strokeWidth="2" />
          <rect x="-24" y="-14" width="48" height="9" fill="#ff6fb1" />
          <path d="M-14 -38 v20" stroke="#fff" strokeOpacity="0.25" strokeWidth="5" strokeLinecap="round" />
          <path d="M14 -10 l3 -6 l3 6 l-6 -3.5 h6 z" fill="#ffd66b" />
        </g>
      );
    case "sorciere":
      return (
        <g transform="translate(0 4)">
          <ellipse cx="0" cy="0" rx="46" ry="9" fill="#3b1d7a" stroke="#1d0b45" strokeWidth="2" />
          <path d="M-28 -2 C -18 -30, -6 -58, 14 -70 C 10 -56, 18 -40, 28 -2 Z" fill="#4c27a0" stroke="#1d0b45" strokeWidth="2" />
          <path d="M-26 -8 C -8 -14, 10 -14, 27 -8" stroke="#ffd66b" strokeWidth="5" fill="none" />
          <path d="M-4 -40 l3 -7 l3 7 l-7 -4 h8 z" fill="#ffd66b" />
          <path d="M8 -26 l2 -4 l2 4 l-4 -2.5 h5 z" fill="#ffe9a8" />
        </g>
      );
    case "couronne":
      return (
        <g transform="translate(0 0)" style={{ filter: "drop-shadow(0 0 5px rgba(255,214,107,0.7))" }}>
          <path d="M-32 0 L -34 -30 L -16 -14 L 0 -36 L 16 -14 L 34 -30 L 32 0 Z" fill="#ffd66b" stroke="#c9952a" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="-33" y="-6" width="66" height="9" rx="3" fill="#ffc53d" stroke="#c9952a" strokeWidth="2" />
          <circle cx="0" cy="-2" r="3.5" fill="#ff6fb1" />
          <circle cx="-18" cy="-2" r="3" fill="#7cc4ff" />
          <circle cx="18" cy="-2" r="3" fill="#6fe3b0" />
        </g>
      );
    case "aureole":
      return (
        <g transform="translate(0 -18)" style={{ filter: "drop-shadow(0 0 8px rgba(255,236,150,0.9))" }}>
          <ellipse rx="32" ry="9" fill="none" stroke="#ffe48a" strokeWidth="6" />
          <ellipse rx="32" ry="9" fill="none" stroke="#fff8d6" strokeWidth="2" />
        </g>
      );
    case "monocle":
      return (
        <g>
          <circle cx="20" cy="0" r="15" fill="#cfe9ff" fillOpacity="0.25" stroke="#d9a63a" strokeWidth="3.5" />
          <path d="M33 8 q8 18 2 34" stroke="#d9a63a" strokeWidth="1.8" fill="none" />
          <path d="M12 -6 q4 -4 9 -3" stroke="#fff" strokeOpacity="0.8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "soleil":
      return (
        <g>
          <path d="M-36 -10 H 36" stroke="#1d1233" strokeWidth="4" strokeLinecap="round" />
          <rect x="-36" y="-11" width="30" height="20" rx="9" fill="#1d1233" stroke="#8a6fd1" strokeWidth="2" />
          <rect x="6" y="-11" width="30" height="20" rx="9" fill="#1d1233" stroke="#8a6fd1" strokeWidth="2" />
          <path d="M-30 -6 l10 0 M12 -6 l10 0" stroke="#9fd8ff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "coeurs":
      return (
        <g>
          <path d="M-6 -6 H 6" stroke="#c23a7d" strokeWidth="3" />
          {[-20, 20].map((x) => (
            <path key={x} transform={`translate(${x} -2)`} d="M0 12 C -18 0, -16 -16, -6 -14 C -2 -13, 0 -10, 0 -8 C 0 -10, 2 -13, 6 -14 C 16 -16, 18 0, 0 12 Z" fill="#ff5fa8" fillOpacity="0.85" stroke="#c23a7d" strokeWidth="2.5" />
          ))}
          <path d="M-27 -10 q3 -3 6 -2 M13 -10 q3 -3 6 -2" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "papillon":
      return (
        <g transform="translate(0 -4)">
          <path d="M0 0 L -22 -12 Q -28 0 -22 12 Z" fill="#7cc4ff" stroke="#2f6fc4" strokeWidth="2" strokeLinejoin="round" />
          <path d="M0 0 L 22 -12 Q 28 0 22 12 Z" fill="#7cc4ff" stroke="#2f6fc4" strokeWidth="2" strokeLinejoin="round" />
          <rect x="-6" y="-6" width="12" height="12" rx="4" fill="#a7d8ff" stroke="#2f6fc4" strokeWidth="2" />
        </g>
      );
    case "echarpe":
      return (
        <g transform="translate(0 -8)">
          <path d="M-44 -4 C -20 10, 20 10, 44 -4 L 44 8 C 20 22, -20 22, -44 8 Z" fill="#ff9f5a" stroke="#c96422" strokeWidth="2" />
          <path d="M18 10 L 30 44 L 14 46 L 8 14 Z" fill="#ff9f5a" stroke="#c96422" strokeWidth="2" strokeLinejoin="round" />
          {[-28, -10, 8, 26].map((x) => (
            <path key={x} d={`M${x} 2 l0 12`} stroke="#ffd0ae" strokeWidth="4" strokeLinecap="round" />
          ))}
        </g>
      );
    case "collier":
      return (
        <g transform="translate(0 -10)">
          <path d="M-34 -4 C -16 12, 16 12, 34 -4" stroke="#ffe48a" strokeWidth="3" fill="none" />
          <g transform="translate(0 14)" style={{ filter: "drop-shadow(0 0 5px rgba(255,214,107,0.9))" }}>
            <path d="M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3 Z" fill="#ffd66b" stroke="#c9952a" strokeWidth="1.5" />
          </g>
        </g>
      );
    default:
      return null;
  }
}

/** Petit aperçu d'un accessoire (boutique). */
export function AccessoireApercu({ k, taille = 64 }: { k: string; taille?: number }) {
  const a = ACCESSOIRES.find((x) => x.key === k);
  // Recentre l'objet (les chapeaux montent au-dessus de leur point d'accroche, la fleur est décalée)
  const y = a?.emplacement === "tete" ? (k === "aureole" ? 18 : k === "fleur" || k === "noeud" ? 2 : 26) : a?.emplacement === "cou" ? (k === "echarpe" ? -10 : 0) : 2;
  const x = k === "fleur" ? -22 : k === "monocle" ? -20 : 0;
  return (
    <svg viewBox="-46 -40 92 72" width={taille} height={taille * 0.78} aria-hidden style={{ overflow: "visible" }}>
      <g transform={`translate(${x} ${y})`}>
        <Accessoire k={k} />
      </g>
    </svg>
  );
}

// ── Visage ──────────────────────────────────────────────────

function Oeil({ x, y, id, rx = 11, ry = 13 }: { x: number; y: number; id: string; rx?: number; ry?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={`url(#${id}-iris)`} />
      <ellipse cx={x + rx * 0.32} cy={y - ry * 0.38} rx={rx * 0.38} ry={ry * 0.32} fill="#fff" />
      <circle cx={x - rx * 0.35} cy={y + ry * 0.38} r={rx * 0.18} fill="#fff" opacity="0.85" />
    </g>
  );
}

function Yeux({ humeur, dort, y, id, gros = false }: { humeur: Humeur; dort: boolean; y: number; id: string; gros?: boolean }) {
  const dx = gros ? 22 : 20;
  if (dort) {
    return (
      <g stroke="#2a1552" strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d={`M${100 - dx - 10} ${y - 1} q10 8 20 0`} />
        <path d={`M${100 + dx - 10} ${y - 1} q10 8 20 0`} />
        <path d={`M${100 - dx - 11} ${y + 1} l-4 3 M${100 + dx + 11} ${y + 1} l4 3`} strokeWidth="2.5" />
      </g>
    );
  }
  if (humeur === "content") {
    return (
      <g stroke="#2a1552" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d={`M${100 - dx - 11} ${y + 3} q11 -15 22 0`} />
        <path d={`M${100 + dx - 11} ${y + 3} q11 -15 22 0`} />
      </g>
    );
  }
  const rx = gros ? 13 : 11, ry = gros ? 15 : 13;
  return (
    <g className="cp-yeux">
      <Oeil x={100 - dx} y={y} id={id} rx={rx} ry={humeur === "triste" ? ry - 2 : ry} />
      <Oeil x={100 + dx} y={y} id={id} rx={rx} ry={humeur === "triste" ? ry - 2 : ry} />
      {humeur === "triste" && (
        <g>
          <g stroke="#2a1552" strokeWidth="3" strokeLinecap="round">
            <path d={`M${100 - dx - 12} ${y - 18} l14 4`} />
            <path d={`M${100 + dx + 12} ${y - 18} l-14 4`} />
          </g>
          <path d={`M${100 + dx + 8} ${y + 10} q-4 8 0 12 q4 -4 0 -12z`} fill="#8fd3ff" />
        </g>
      )}
    </g>
  );
}

function Bouche({ humeur, dort, y, chat = false, dent = false }: { humeur: Humeur; dort: boolean; y: number; chat?: boolean; dent?: boolean }) {
  if (dort) return <ellipse cx="100" cy={y + 2} rx="3.5" ry="2.8" fill="#2a1552" />;
  if (humeur === "triste") return <path d={`M91 ${y + 6} q9 -8 18 0`} stroke="#2a1552" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  if (humeur === "content") {
    return (
      <g>
        <path d={`M89 ${y - 2} q11 16 22 0 z`} fill="#4a1f3d" stroke="#2a1552" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={`M94 ${y + 5} q6 5 12 0 q-6 -4 -12 0z`} fill="#ff7fa8" />
        {dent && <path d={`M93 ${y - 1} l3 5 l3 -5z`} fill="#fff" />}
      </g>
    );
  }
  if (chat) return <path d={`M91 ${y - 1} q4.5 6 9 0 q4.5 6 9 0`} stroke="#2a1552" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <g>
      <path d={`M93 ${y - 1} q7 7 14 0`} stroke="#2a1552" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {dent && <path d={`M96 ${y + 1} l2.5 4 l2.5 -4z`} fill="#fff" />}
    </g>
  );
}

function Joues({ y, dx = 36 }: { y: number; dx?: number }) {
  return (
    <g fill="#ff8fc7" opacity="0.6">
      <ellipse cx={100 - dx} cy={y} rx="9" ry="5.5" />
      <ellipse cx={100 + dx} cy={y} rx="9" ry="5.5" />
    </g>
  );
}

const etoile = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} L${cx + r * 0.3} ${cy - r * 0.3} L${cx + r} ${cy} L${cx + r * 0.3} ${cy + r * 0.3} L${cx} ${cy + r} L${cx - r * 0.3} ${cy + r * 0.3} L${cx - r} ${cy} L${cx - r * 0.3} ${cy - r * 0.3} Z`;

// ── La créature ─────────────────────────────────────────────

type Props = {
  espece: Espece;
  humeur?: Humeur;
  dort?: boolean;
  sale?: boolean;
  stade?: 0 | 1 | 2; // bébé, enfant, adulte
  taille?: number;
  tenue?: Tenue;
};

export default function Creature({ espece, humeur = "normal", dort = false, sale = false, stade = 2, taille = 220, tenue = {} }: Props) {
  const c = especeInfo(espece);
  const echelle = stade === 0 ? 0.74 : stade === 1 ? 0.88 : 1;
  const id = `cp-${espece}`;
  const a = ANCRES[espece];
  const joues = !dort && humeur !== "triste" && espece !== "robot";
  const contour = { stroke: c.fonce, strokeWidth: 3, strokeLinejoin: "round" as const };

  return (
    <svg viewBox="0 0 200 200" width={taille} height={taille} role="img" aria-label={c.nom} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${id}-corps`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={c.clair} />
          <stop offset="50%" stopColor={c.couleur} />
          <stop offset="100%" stopColor={c.fonce} />
        </radialGradient>
        <radialGradient id={`${id}-ventre`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor={c.clair} stopOpacity="0.75" />
        </radialGradient>
        <linearGradient id={`${id}-iris`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b0d36" />
          <stop offset="70%" stopColor="#3a1d6e" />
          <stop offset="100%" stopColor={c.fonce} />
        </linearGradient>
      </defs>
      <g transform={`translate(100 176) scale(${echelle}) translate(-100 -176)`}>
        {/* ombre au sol */}
        <ellipse cx="100" cy="179" rx="54" ry="8" fill="#000" opacity="0.28" />

        {/* ════════ CHAT DE L'ESPACE ════════ */}
        {espece === "chat" && (
          <g>
            {/* queue avec pompon étoile */}
            <path d="M146 152 C 182 150, 186 112, 166 100" stroke={c.fonce} strokeWidth="11" fill="none" strokeLinecap="round" />
            <path d="M146 152 C 182 150, 186 112, 166 100" stroke={c.couleur} strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d={etoile(166, 98, 9)} fill="#ffd66b" stroke="#d9a63a" strokeWidth="1.5" />
            {/* pattes */}
            <ellipse cx="78" cy="170" rx="15" ry="9" fill={c.couleur} {...contour} />
            <ellipse cx="122" cy="170" rx="15" ry="9" fill={c.couleur} {...contour} />
            {/* oreilles */}
            <path d="M54 92 C 50 66, 56 46, 66 44 C 76 46, 86 60, 92 72 Z" fill={`url(#${id}-corps)`} {...contour} />
            <path d="M146 92 C 150 66, 144 46, 134 44 C 124 46, 114 60, 108 72 Z" fill={`url(#${id}-corps)`} {...contour} />
            <path d="M62 80 C 60 66, 63 56, 67 55 C 73 58, 79 66, 82 72 Z" fill="#ffc2e2" />
            <path d="M138 80 C 140 66, 137 56, 133 55 C 127 58, 121 66, 118 72 Z" fill="#ffc2e2" />
            {/* corps */}
            <ellipse cx="100" cy="120" rx="60" ry="55" fill={`url(#${id}-corps)`} {...contour} />
            <ellipse cx="100" cy="144" rx="34" ry="24" fill={`url(#${id}-ventre)`} />
            {/* rayures */}
            <g stroke={c.fonce} strokeWidth="3.5" strokeLinecap="round" opacity="0.45">
              <path d="M100 68 v12 M88 70 l2 9 M112 70 l-2 9" />
            </g>
            {/* moustaches */}
            <g stroke="#2a1552" strokeWidth="1.8" opacity="0.55" strokeLinecap="round">
              <path d="M56 122 h-18 M57 129 l-16 5" />
              <path d="M144 122 h18 M143 129 l16 5" />
            </g>
          </g>
        )}

        {/* ════════ PETIT ALIEN ════════ */}
        {espece === "alien" && (
          <g>
            {/* antennes à étoiles */}
            <path d="M80 66 Q 72 44 58 34" stroke={c.fonce} strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M120 66 Q 128 44 142 34" stroke={c.fonce} strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d={etoile(56, 32, 11)} fill="#ffe46b" stroke="#d9a63a" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 6px #ffe46b)" }} />
            <path d={etoile(144, 32, 11)} fill="#ffe46b" stroke="#d9a63a" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 6px #ffe46b)" }} />
            {/* petits pieds */}
            <ellipse cx="80" cy="171" rx="13" ry="8" fill={c.couleur} {...contour} />
            <ellipse cx="120" cy="171" rx="13" ry="8" fill={c.couleur} {...contour} />
            {/* bras qui saluent */}
            <path d="M46 128 C 30 122, 26 108, 32 100" stroke={c.fonce} strokeWidth="13" fill="none" strokeLinecap="round" />
            <path d="M46 128 C 30 122, 26 108, 32 100" stroke={c.couleur} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M154 128 C 168 132, 172 144, 166 152" stroke={c.fonce} strokeWidth="13" fill="none" strokeLinecap="round" />
            <path d="M154 128 C 168 132, 172 144, 166 152" stroke={c.couleur} strokeWidth="8" fill="none" strokeLinecap="round" />
            {/* corps en forme de haricot */}
            <path d="M100 60 C 142 60, 160 94, 160 126 C 160 160, 134 174, 100 174 C 66 174, 40 160, 40 126 C 40 94, 58 60, 100 60 Z" fill={`url(#${id}-corps)`} {...contour} />
            <ellipse cx="100" cy="148" rx="30" ry="20" fill={`url(#${id}-ventre)`} />
            <path d="M100 152 C 92 144, 90 140, 96 138 C 98 138, 100 140, 100 141 C 100 140, 102 138, 104 138 C 110 140, 108 144, 100 152 Z" fill="#ff8fc7" opacity="0.7" />
            {/* taches */}
            <g fill={c.clair} opacity="0.7">
              <circle cx="72" cy="80" r="5" />
              <circle cx="132" cy="86" r="4" />
              <circle cx="124" cy="72" r="2.5" />
            </g>
          </g>
        )}

        {/* ════════ DRAGON LUNAIRE ════════ */}
        {espece === "dragon" && (
          <g>
            {/* queue avec un croissant de lune */}
            <path d="M144 156 C 176 158, 186 136, 178 118" stroke={c.fonce} strokeWidth="13" fill="none" strokeLinecap="round" />
            <path d="M144 156 C 176 158, 186 136, 178 118" stroke={c.couleur} strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M178 104 a10 10 0 1 0 8 16 a8 8 0 1 1 -8 -16z" fill="#ffe7a3" stroke="#d9a63a" strokeWidth="1.5" />
            {/* ailes en forme de cœur */}
            <path d="M52 112 C 26 90, 10 108, 22 124 C 28 132, 42 132, 54 126 Z" fill={c.clair} {...contour} />
            <path d="M148 112 C 174 90, 190 108, 178 124 C 172 132, 158 132, 146 126 Z" fill={c.clair} {...contour} />
            <path d="M48 116 L 26 112 M48 120 L 28 124 M152 116 L 174 112 M152 120 L 172 124" stroke={c.couleur} strokeWidth="2" strokeLinecap="round" />
            {/* petites crêtes */}
            <g fill="#ffe7a3" stroke="#d9a63a" strokeWidth="1.5" strokeLinejoin="round">
              <path d="M92 68 q8 -16 16 0 z" />
            </g>
            {/* pattes */}
            <ellipse cx="78" cy="171" rx="15" ry="9" fill={c.couleur} {...contour} />
            <ellipse cx="122" cy="171" rx="15" ry="9" fill={c.couleur} {...contour} />
            {/* cornes arrondies */}
            <path d="M70 80 C 62 62, 66 50, 74 46 C 76 58, 82 66, 88 72 Z" fill="#ffe7a3" stroke="#d9a63a" strokeWidth="2" strokeLinejoin="round" />
            <path d="M130 80 C 138 62, 134 50, 126 46 C 124 58, 118 66, 112 72 Z" fill="#ffe7a3" stroke="#d9a63a" strokeWidth="2" strokeLinejoin="round" />
            {/* corps */}
            <ellipse cx="100" cy="122" rx="60" ry="54" fill={`url(#${id}-corps)`} {...contour} />
            {/* ventre tout doux (comme les autres), avec deux fines écailles claires */}
            <ellipse cx="100" cy="152" rx="28" ry="19" fill={`url(#${id}-ventre)`} />
            <g stroke={c.couleur} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.45">
              <path d="M88 150 q12 4 24 0" />
              <path d="M90 158 q10 3.5 20 0" />
            </g>
            {/* narines */}
            <g fill={c.fonce} opacity="0.6">
              <ellipse cx="94" cy="122" rx="2" ry="1.5" />
              <ellipse cx="106" cy="122" rx="2" ry="1.5" />
            </g>
            {/* étoiles sur le dos */}
            <g fill="#fff" opacity="0.8">
              <path d={etoile(64, 104, 4)} />
              <path d={etoile(140, 96, 3)} />
            </g>
          </g>
        )}

        {/* ════════ POULPE COSMIQUE ════════ */}
        {espece === "poulpe" && (
          <g>
            {/* tentacules enroulées */}
            {[
              { x: 56, s: -1 },
              { x: 74, s: 1 },
              { x: 92, s: -1 },
              { x: 108, s: 1 },
              { x: 126, s: -1 },
              { x: 144, s: 1 },
            ].map((t, i) => (
              <g key={t.x} className="cp-tentacule" style={{ animationDelay: `${i * 0.2}s` }}>
                <path d={`M${t.x} 132 C ${t.x + t.s * 4} 152, ${t.x - t.s * 10} 164, ${t.x + t.s * 2} 172 C ${t.x + t.s * 10} 176, ${t.x + t.s * 12} 166, ${t.x + t.s * 6} 164`} stroke={c.fonce} strokeWidth="15" fill="none" strokeLinecap="round" />
                <path d={`M${t.x} 132 C ${t.x + t.s * 4} 152, ${t.x - t.s * 10} 164, ${t.x + t.s * 2} 172 C ${t.x + t.s * 10} 176, ${t.x + t.s * 12} 166, ${t.x + t.s * 6} 164`} stroke={c.couleur} strokeWidth="10" fill="none" strokeLinecap="round" />
                <circle cx={t.x - t.s * 2} cy={155} r="2.4" fill={c.clair} />
                <circle cx={t.x - t.s * 3} cy={164} r="2" fill={c.clair} />
              </g>
            ))}
            {/* tête en dôme */}
            <path d="M100 44 C 148 44, 162 82, 160 110 C 158 134, 140 146, 100 146 C 60 146, 42 134, 40 110 C 38 82, 52 44, 100 44 Z" fill={`url(#${id}-corps)`} {...contour} />
            {/* taches */}
            <g fill={c.clair} opacity="0.75">
              <circle cx="70" cy="70" r="6" />
              <circle cx="132" cy="64" r="4.5" />
              <circle cx="142" cy="84" r="3" />
              <circle cx="60" cy="88" r="3" />
            </g>
            {/* bulles */}
            <g fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.5">
              <circle cx="162" cy="58" r="5" />
              <circle cx="170" cy="44" r="3" />
            </g>
          </g>
        )}

        {/* ════════ MINI-CYCYBOT ════════ */}
        {espece === "robot" && (
          <g>
            {/* antenne cœur */}
            <line x1="100" y1="56" x2="100" y2="36" stroke={c.fonce} strokeWidth="4" strokeLinecap="round" />
            <path d="M100 38 C 90 32, 90 22, 96 22 C 98 22, 100 24, 100 26 C 100 24, 102 22, 104 22 C 110 22, 110 32, 100 38 Z" fill="#ff6fb1" style={{ filter: "drop-shadow(0 0 6px #ff6fb1)" }} />
            {/* pieds */}
            <rect x="74" y="160" width="20" height="16" rx="7" fill={c.fonce} />
            <rect x="106" y="160" width="20" height="16" rx="7" fill={c.fonce} />
            {/* oreilles boulons */}
            <rect x="34" y="96" width="14" height="30" rx="7" fill={c.fonce} />
            <rect x="152" y="96" width="14" height="30" rx="7" fill={c.fonce} />
            {/* corps */}
            <rect x="44" y="54" width="112" height="110" rx="32" fill={`url(#${id}-corps)`} {...contour} />
            {/* écran */}
            <rect x="58" y="80" width="84" height="56" rx="20" fill="#140a2e" stroke="#2f1a5e" strokeWidth="3" />
            <path d="M66 88 q10 -6 20 -4" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* voyant */}
            <circle cx="100" cy="150" r="5" fill="#6fe3b0" style={{ filter: "drop-shadow(0 0 5px #6fe3b0)" }} />
          </g>
        )}

        {/* reflet commun sur le corps */}
        {espece !== "robot" && (
          <path
            d={espece === "poulpe" ? "M62 66 C 70 54, 84 48, 96 48" : "M58 98 C 62 82, 74 72, 88 68"}
            stroke="#ffffff"
            strokeOpacity="0.6"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* ── Visage ── */}
        {espece === "robot" ? (
          <g>
            {dort ? (
              <g stroke="#e0b3ff" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <path d="M72 108 q9 6 18 0" />
                <path d="M110 108 q9 6 18 0" />
              </g>
            ) : humeur === "content" ? (
              <g stroke="#f0dcff" strokeWidth="4.5" strokeLinecap="round" fill="none" style={{ filter: "drop-shadow(0 0 4px #e0b3ff)" }}>
                <path d="M72 110 q9 -11 18 0" />
                <path d="M110 110 q9 -11 18 0" />
              </g>
            ) : (
              <g className="cp-yeux" style={{ filter: "drop-shadow(0 0 4px #e0b3ff)" }}>
                <rect x="74" y={humeur === "triste" ? 104 : 98} width="16" height={humeur === "triste" ? 10 : 20} rx="7" fill="#f0dcff" />
                <rect x="110" y={humeur === "triste" ? 104 : 98} width="16" height={humeur === "triste" ? 10 : 20} rx="7" fill="#f0dcff" />
              </g>
            )}
            {!dort && humeur !== "triste" && <path d="M92 124 q8 6 16 0" stroke="#f0dcff" strokeWidth="3" fill="none" strokeLinecap="round" />}
            {!dort && humeur === "triste" && <path d="M92 128 q8 -6 16 0" stroke="#f0dcff" strokeWidth="3" fill="none" strokeLinecap="round" />}
            {!dort && humeur !== "triste" && (
              <g fill="#ff8fc7" opacity="0.7">
                <rect x="62" y="120" width="12" height="5" rx="2.5" />
                <rect x="126" y="120" width="12" height="5" rx="2.5" />
              </g>
            )}
          </g>
        ) : (
          <g>
            <Yeux humeur={humeur} dort={dort} y={espece === "poulpe" ? 98 : 108} id={id} gros={espece === "alien"} />
            <Bouche humeur={humeur} dort={dort} y={espece === "poulpe" ? 122 : 130} chat={espece === "chat"} dent={espece === "dragon"} />
            {joues && <Joues y={espece === "poulpe" ? 114 : 124} dx={espece === "alien" ? 40 : 36} />}
          </g>
        )}

        {/* casque du chat de l'espace (devant le visage) */}
        {espece === "chat" && (
          <g pointerEvents="none">
            <circle cx="100" cy="110" r="82" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="3" />
            <path d="M46 78 A 72 72 0 0 1 96 34" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="5" fill="none" strokeLinecap="round" />
            <circle cx="146" cy="58" r="4" fill="#fff" opacity="0.6" />
          </g>
        )}

        {/* saleté */}
        {sale && (
          <g>
            <g fill="#7a5230" opacity="0.5">
              <ellipse cx="72" cy="150" rx="9" ry="6" />
              <ellipse cx="128" cy="98" rx="7" ry="5" />
              <ellipse cx="120" cy="158" rx="6" ry="4" />
            </g>
            <g stroke="#9be38f" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
              <path d="M152 66 q6 -8 0 -16 q-6 -8 0 -16" />
              <path d="M166 76 q6 -8 0 -16 q-6 -8 0 -16" />
            </g>
          </g>
        )}

        {/* ── Accessoires ── */}
        {tenue.cou && (
          <g transform={`translate(100 ${a.cou}) scale(${a.largeur})`}>
            <Accessoire k={tenue.cou} />
          </g>
        )}
        {tenue.yeux && !dort && (
          <g transform={`translate(100 ${a.yeux - (espece === "poulpe" ? 0 : 2)}) scale(${a.largeur})`}>
            <Accessoire k={tenue.yeux} />
          </g>
        )}
        {tenue.tete ? (
          <g transform={`translate(100 ${a.tete}) scale(${a.largeur})`}>
            <Accessoire k={tenue.tete} />
          </g>
        ) : (
          stade === 2 &&
          !dort && (
            <g transform={`translate(100 ${a.tete - 6})`} fill="#ffd66b" style={{ filter: "drop-shadow(0 0 6px #ffd66b)" }}>
              <path d="M0 -14 L4 -4 L14 -4 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14 -4 L-4 -4 Z" />
            </g>
          )
        )}
      </g>
    </svg>
  );
}

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
