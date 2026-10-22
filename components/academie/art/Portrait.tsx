// Portrait vectoriel en couches : sert à la fois au créateur de
// personnage et aux personnages non joueurs, pour que tout le monde
// partage exactement le même style de dessin.
//
// Ordre des couches : cheveux (arrière) → cou → tenue → oreilles →
// visage → ombres → yeux, sourcils, nez, bouche → pilosité →
// cheveux (avant) → mèches sur les épaules → lunettes.
//
// Illustrations PROVISOIRES : elles seront remplacées par des
// portraits peints (voir data/academie/illustrations.ts).

import { useId } from "react";
import type { Apparence, Coiffure, Expression, FormeVisage, Tenue } from "@/data/academie/types";
import { lumiere, melanger, ombre } from "@/lib/academie/couleurs";

type Props = {
  apparence: Apparence;
  expression?: Expression;
  /** Couleur de la maison (cravate, liserés...). */
  accent?: string;
  /** "buste" = portrait complet, "tete" / "torse" = vignettes recadrées. */
  cadrage?: "buste" | "tete" | "torse";
  className?: string;
  titre?: string;
};

// ---------- Formes de visage (tête centrée en x = 200) ----------

const visages: Record<FormeVisage, string> = {
  ovale: "M200 98 C 248 98 268 140 266 200 C 264 252 244 290 200 302 C 156 290 136 252 134 200 C 132 140 152 98 200 98 Z",
  rond: "M200 100 C 252 100 270 146 268 206 C 266 258 240 294 200 298 C 160 294 134 258 132 206 C 130 146 148 100 200 100 Z",
  anguleux:
    "M200 98 C 250 98 268 138 266 194 L 262 246 C 258 272 236 292 200 298 C 164 292 142 272 138 246 L 134 194 C 132 138 150 98 200 98 Z",
  coeur: "M200 98 C 254 98 270 140 266 196 C 262 242 236 284 200 304 C 164 284 138 242 134 196 C 130 140 146 98 200 98 Z",
};

// ---------- Coiffures ----------

type DessinCoiffure = {
  arriere?: string[];
  avant: string[];
  /** Mèches qui retombent devant la tenue. */
  epaules?: string[];
  reflets?: string[];
  boucles?: { arriere: [number, number, number][]; avant: [number, number, number][] };
};

const rideauxMilong = [
  "M140 140 C 146 104 170 88 200 88 C 230 88 254 104 260 140 C 240 120 220 112 200 112 C 180 112 160 120 140 140 Z",
  "M200 84 C 160 82 128 110 126 170 C 126 220 132 270 140 316 C 152 300 152 260 150 226 C 148 190 156 158 176 136 C 188 122 196 108 200 96 Z",
  "M200 84 C 240 82 272 110 274 170 C 274 220 268 270 260 316 C 248 300 248 260 250 226 C 252 190 244 158 224 136 C 212 122 204 108 200 96 Z",
];

const coiffures: Record<Coiffure, DessinCoiffure> = {
  court: {
    arriere: ["M134 190 C 128 130 160 86 204 84 C 250 84 278 126 268 190 Z"],
    avant: [
      "M132 200 C 124 140 150 84 204 80 C 258 78 284 128 270 200 C 266 178 262 160 254 148 C 236 156 210 150 190 138 C 176 150 156 156 144 160 C 138 172 134 186 132 200 Z",
    ],
    reflets: ["M166 104 C 190 92 222 92 246 108"],
  },
  undercut: {
    avant: [
      "M134 214 C 130 186 132 166 140 150 L 146 200 Z",
      "M266 214 C 270 186 268 166 260 150 L 254 200 Z",
      "M140 172 C 126 118 162 70 214 72 C 262 74 288 112 270 168 C 262 150 250 138 236 132 C 214 120 186 126 168 134 C 156 140 146 154 140 172 Z",
      "M148 146 C 168 104 216 92 256 116 C 230 110 194 118 168 146 Z",
    ],
    reflets: ["M170 96 C 198 82 232 86 252 102"],
  },
  boucles: {
    avant: [],
    boucles: {
      arriere: [
        [140, 132, 32], [166, 102, 34], [200, 92, 36], [234, 102, 34], [260, 132, 32],
        [126, 172, 28], [274, 172, 28], [128, 210, 22], [272, 210, 22],
      ],
      avant: [
        [150, 142, 21], [173, 124, 23], [199, 118, 23], [225, 124, 23], [249, 142, 21],
        [139, 168, 16], [261, 168, 16],
      ],
    },
  },
  ebouriffe: {
    arriere: ["M128 200 C 116 130 150 78 204 76 C 256 76 290 130 272 200 Z"],
    avant: [
      "M128 196 C 118 150 130 110 150 96 C 148 84 160 76 172 82 C 180 66 200 64 210 74 C 224 62 246 70 248 84 C 266 84 280 104 274 120 C 286 140 280 170 272 198 C 268 176 262 164 256 156 L 248 170 L 240 146 L 226 162 L 218 140 L 204 160 L 196 138 L 182 156 L 174 136 L 160 158 L 152 146 C 140 160 132 176 128 196 Z",
    ],
    reflets: ["M168 92 C 186 82 214 80 236 90"],
  },
  carre: {
    arriere: [
      "M126 150 C 120 110 156 80 200 80 C 244 80 280 110 274 150 L 280 270 C 270 286 250 290 236 284 L 236 250 L 164 250 L 164 284 C 150 290 130 286 120 270 Z",
    ],
    avant: [
      "M134 160 C 130 112 160 86 200 86 C 240 86 270 112 266 160 C 250 155 228 152 200 154 C 172 152 150 155 134 160 Z",
      "M134 150 C 128 190 130 240 124 272 C 136 282 150 282 160 276 C 150 240 146 200 148 156 Z",
      "M266 150 C 272 190 270 240 276 272 C 264 282 250 282 240 276 C 250 240 254 200 252 156 Z",
    ],
    reflets: ["M156 104 C 180 92 220 92 244 104", "M138 180 C 136 210 136 240 132 262"],
  },
  milong: {
    arriere: [
      "M126 150 C 112 210 116 290 128 340 C 146 356 170 350 178 330 L 222 330 C 230 350 254 356 272 340 C 284 290 288 210 274 150 C 264 100 236 80 200 80 C 164 80 136 100 126 150 Z",
    ],
    avant: rideauxMilong,
    reflets: ["M164 102 C 178 94 192 92 200 92", "M138 190 C 136 230 138 270 142 300"],
  },
  long: {
    arriere: [
      "M128 150 C 108 230 110 360 114 480 L 286 480 C 290 360 292 230 272 150 C 262 100 236 80 200 80 C 164 80 138 100 128 150 Z",
    ],
    avant: rideauxMilong,
    epaules: [
      "M140 300 C 132 360 126 420 132 480 L 164 480 C 156 420 156 360 158 316 Z",
      "M260 300 C 268 360 274 420 268 480 L 236 480 C 244 420 244 360 242 316 Z",
    ],
    reflets: ["M164 102 C 178 94 192 92 200 92", "M138 200 C 134 260 134 320 136 380"],
  },
  chignon: {
    arriere: [
      "M200 40 C 222 40 236 56 236 74 C 236 92 222 104 200 104 C 178 104 164 92 164 74 C 164 56 178 40 200 40 Z",
      "M130 170 C 124 116 158 84 200 84 C 242 84 276 116 270 170 Z",
    ],
    avant: [
      "M134 176 C 128 124 160 88 200 88 C 240 88 272 124 266 176 C 258 150 244 130 222 122 C 200 116 176 120 160 132 C 148 142 140 158 134 176 Z",
    ],
    reflets: ["M182 52 C 194 46 210 48 220 56", "M160 104 C 180 94 214 94 238 106"],
  },
  savant: {
    arriere: [
      "M122 230 C 98 196 112 164 100 132 C 124 136 126 116 124 96 C 146 108 152 86 162 70 C 176 90 196 74 210 64 C 218 86 238 78 256 74 C 254 96 276 104 292 108 C 280 128 298 148 302 172 C 288 178 288 204 280 232 L 264 204 C 270 152 248 114 200 112 C 152 114 130 152 136 204 Z",
    ],
    avant: [
      "M134 200 C 122 180 124 160 138 146 C 138 164 146 176 152 184 Z",
      "M266 200 C 278 180 276 160 262 146 C 262 164 254 176 248 184 Z",
      "M172 118 C 180 100 198 94 210 102 C 198 102 188 108 180 120 Z",
    ],
  },
};

// ---------- Expressions ----------

type Regard = { ouverture: number; gx: number; gy: number; ferme?: boolean; paupiere?: boolean };

const regards: Record<Expression, Regard> = {
  neutre: { ouverture: 1, gx: 0, gy: 0 },
  sourire: { ouverture: 0.78, gx: 0, gy: 0, paupiere: true },
  rire: { ouverture: 0, gx: 0, gy: 0, ferme: true },
  surpris: { ouverture: 1.3, gx: 0, gy: -1 },
  gene: { ouverture: 0.82, gx: -3, gy: 3 },
  pensif: { ouverture: 0.86, gx: 5, gy: -3 },
  malicieux: { ouverture: 0.68, gx: 2, gy: 0, paupiere: true },
};

/** Sourcils, en coordonnées locales (x négatif = côté du nez). [droit, gauche] */
const sourcils: Record<Expression, [string, string]> = {
  neutre: ["M -16 3 Q -2 -4 17 1", "M -16 3 Q -2 -4 17 1"],
  sourire: ["M -16 2 Q -2 -6 17 0", "M -16 2 Q -2 -6 17 0"],
  rire: ["M -16 0 Q -2 -8 17 -1", "M -16 0 Q -2 -8 17 -1"],
  surpris: ["M -16 -6 Q -2 -16 17 -8", "M -16 -6 Q -2 -16 17 -8"],
  gene: ["M -16 -5 Q 0 -4 17 4", "M -16 -5 Q 0 -4 17 4"],
  pensif: ["M -16 -2 Q -2 -12 17 -5", "M -16 5 Q -2 0 17 3"],
  malicieux: ["M -16 -1 Q -2 -12 17 -4", "M -16 6 Q -2 0 17 4"],
};

const bouches: Record<Expression, { trait?: string; ouverte?: string; dents?: boolean }> = {
  neutre: { trait: "M188 268 Q 200 271 212 268" },
  sourire: { trait: "M184 265 Q 200 279 216 265" },
  rire: { ouverte: "M182 262 Q 200 296 218 262 Q 200 268 182 262 Z", dents: true },
  surpris: { ouverte: "M193 270 C 193 262 207 262 207 270 C 207 280 193 280 193 270 Z" },
  gene: { trait: "M186 271 Q 193 266 200 270 Q 207 274 214 269" },
  pensif: { trait: "M190 271 Q 203 273 213 266" },
  malicieux: { trait: "M186 269 Q 203 276 217 262" },
};

// ---------- Composant ----------

export default function Portrait({
  apparence,
  expression = "neutre",
  accent = "#C9CED8",
  cadrage = "buste",
  className,
  titre,
}: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${n}-${uid}`;
  const url = (n: string) => `url(#${id(n)})`;

  const peau = apparence.peau;
  const peauOmbre = ombre(peau, 0.3);
  const peauLum = lumiere(peau, 0.2);
  const levres = melanger(peau, "#A8455A", 0.38);
  const ch = apparence.cheveux;
  const sourcil = melanger(ch, "#2A1A1C", 0.35);
  const accessoires = apparence.accessoires ?? [];
  const coiffure = coiffures[apparence.coiffure];
  const regard = regards[expression];
  const formeVisage = visages[apparence.visage];

  const viewBox = { buste: "0 0 400 500", tete: "92 40 216 260", torse: "40 170 320 300" }[cadrage];

  const dessinerBoucles = (liste: [number, number, number][], cle: string) =>
    liste.map(([x, y, r], i) => (
      <g key={cle + i}>
        <circle cx={x} cy={y} r={r} fill={url("ch")} />
        <path
          d={`M ${x - r * 0.55} ${y - r * 0.1} Q ${x - r * 0.1} ${y - r * 0.75} ${x + r * 0.5} ${y - r * 0.35}`}
          stroke={lumiere(ch, 0.35)}
          strokeOpacity={0.45}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    ));

  const avantCheveux = (
    <>
      {coiffure.avant.map((d, i) => (
        <path key={"av" + i} d={d} fill={url("ch")} />
      ))}
      {coiffure.boucles && dessinerBoucles(coiffure.boucles.avant, "ba")}
      {coiffure.reflets?.map((d, i) => (
        <path key={"re" + i} d={d} stroke={lumiere(ch, 0.45)} strokeOpacity={0.35} strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
    </>
  );

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={titre ?? "Portrait"} preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id={id("peau")} cx="44%" cy="36%" r="72%">
          <stop offset="0%" stopColor={peauLum} />
          <stop offset="55%" stopColor={peau} />
          <stop offset="100%" stopColor={peauOmbre} />
        </radialGradient>
        <linearGradient id={id("cou")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ombre(peau, 0.42)} />
          <stop offset="70%" stopColor={ombre(peau, 0.12)} />
        </linearGradient>
        <linearGradient id={id("ch")} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={lumiere(ch, 0.22)} />
          <stop offset="50%" stopColor={ch} />
          <stop offset="100%" stopColor={ombre(ch, 0.4)} />
        </linearGradient>
        <radialGradient id={id("iris")} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={lumiere(apparence.yeux, 0.45)} />
          <stop offset="60%" stopColor={apparence.yeux} />
          <stop offset="100%" stopColor={ombre(apparence.yeux, 0.55)} />
        </radialGradient>
        <radialGradient id={id("joue")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0707A" stopOpacity={expression === "gene" ? 0.5 : 0.2} />
          <stop offset="100%" stopColor="#E0707A" stopOpacity={0} />
        </radialGradient>
        <filter id={id("flou")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <clipPath id={id("visage")}>
          <path d={formeVisage} />
        </clipPath>
        {tenueDefs(apparence.tenue, id)}
      </defs>

      {/* Cheveux, arrière */}
      {coiffure.arriere?.map((d, i) => <path key={"ar" + i} d={d} fill={url("ch")} />)}
      {coiffure.boucles && dessinerBoucles(coiffure.boucles.arriere, "bb")}

      {/* Cou */}
      <path d="M164 262 C 167 298 162 326 150 354 L 250 354 C 238 326 233 298 236 262 Z" fill={url("cou")} />

      {/* Tenue */}
      <DessinTenue tenue={apparence.tenue} accent={accent} url={url} />

      {/* Oreilles */}
      {[136, 264].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={220} rx={10} ry={18} fill={ombre(peau, 0.12)} />
          <path d={`M ${x + (x < 200 ? 3 : -3)} 210 q ${x < 200 ? -6 : 6} 10 0 20`} stroke={peauOmbre} strokeOpacity={0.5} strokeWidth={2} fill="none" />
        </g>
      ))}

      {/* Visage */}
      <path d={formeVisage} fill={url("peau")} />
      <g clipPath={url("visage")}>
        {/* Ombre portée des cheveux sur le front */}
        <g transform="translate(0 8)" opacity={0.4} filter={url("flou")}>
          {coiffure.avant.map((d, i) => (
            <path key={i} d={d} fill={peauOmbre} />
          ))}
          {coiffure.boucles?.avant.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={peauOmbre} />)}
        </g>
        {/* Modelé : mâchoire et lumière chaude */}
        <ellipse cx={200} cy={312} rx={80} ry={34} fill={peauOmbre} opacity={0.35} filter={url("flou")} />
        <ellipse cx={226} cy={150} rx={34} ry={22} fill="#FFF6E8" opacity={0.08} filter={url("flou")} />
        <circle cx={162} cy={244} r={20} fill={url("joue")} />
        <circle cx={238} cy={244} r={20} fill={url("joue")} />
      </g>
      <path d={formeVisage} fill="none" stroke={peauOmbre} strokeOpacity={0.35} strokeWidth={1.2} />

      {accessoires.includes("taches") && (
        <g fill={ombre(peau, 0.38)} opacity={0.55}>
          {[[176, 236], [184, 230], [190, 240], [170, 244], [214, 232], [222, 238], [210, 242], [228, 246], [196, 232], [204, 236]].map(
            ([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.6} />
            )
          )}
        </g>
      )}

      {accessoires.includes("rides") && (
        <g stroke={peauOmbre} strokeOpacity={0.4} strokeWidth={1.6} fill="none" strokeLinecap="round">
          <path d="M172 146 Q 200 140 228 146" />
          <path d="M178 158 Q 200 153 222 158" />
          <path d="M150 214 l -8 4 M 150 220 l -7 6 M 250 214 l 8 4 M 250 220 l 7 6" />
          <path d="M184 250 Q 176 262 180 278 M 216 250 Q 224 262 220 278" />
        </g>
      )}

      {/* Yeux et sourcils */}
      {([
        [230, 1],
        [170, -1],
      ] as const).map(([cx, cote], i) => (
        <g key={cx} transform={`translate(${cx} 0) scale(${cote} 1)`}>
          <Oeil regard={regard} cote={cote} idIris={url("iris")} clipId={id("oeil" + i)} peauOmbre={peauOmbre} />
          <path
            d={sourcils[expression][i]}
            transform="translate(0 186)"
            stroke={sourcil}
            strokeWidth={4.2}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ))}

      {/* Nez */}
      <path d="M204 222 C 207 236 209 242 206 249" stroke={peauOmbre} strokeOpacity={0.45} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M191 250 Q 200 256 209 250" stroke={peauOmbre} strokeOpacity={0.5} strokeWidth={2} fill="none" strokeLinecap="round" />
      <ellipse cx={199} cy={238} rx={2.5} ry={8} fill={peauLum} opacity={0.35} />

      {/* Bouche */}
      <Bouche expression={expression} levres={levres} />

      {accessoires.includes("moustache") && (
        <path
          d="M166 262 C 170 248 188 246 200 254 C 212 246 230 248 234 262 C 226 258 216 262 200 262 C 184 262 174 258 166 262 Z"
          fill={url("ch")}
        />
      )}

      {/* Cheveux, avant */}
      {avantCheveux}
      {coiffure.epaules?.map((d, i) => <path key={"ep" + i} d={d} fill={url("ch")} />)}

      {accessoires.includes("barrette") && (
        <path d="M244 132 l 4 9 l 10 1 l -7 7 l 2 10 l -9 -5 l -9 5 l 2 -10 l -7 -7 l 10 -1 Z" fill="#E4E8F0" stroke="#9AA3B5" strokeWidth={1} />
      )}

      {accessoires.includes("lunettes") && (
        <g fill="#FFFFFF" fillOpacity={0.07} stroke="#C79F4A" strokeWidth={2.6}>
          <circle cx={170} cy={208} r={21} />
          <circle cx={230} cy={208} r={21} />
          <path d="M191 205 Q 200 198 209 205 M 149 204 L 137 212 M 251 204 L 263 212" fill="none" />
        </g>
      )}
    </svg>
  );
}

// ---------- Éléments du visage ----------

function Oeil({
  regard,
  cote,
  idIris,
  clipId,
  peauOmbre,
}: {
  regard: Regard;
  cote: 1 | -1;
  idIris: string;
  clipId: string;
  peauOmbre: string;
}) {
  const y = 208;
  if (regard.ferme) {
    return (
      <path d={`M -15 ${y + 1} Q 0 ${y - 9} 15 ${y + 1}`} stroke="#2A1A22" strokeWidth={2.8} fill="none" strokeLinecap="round" />
    );
  }
  const o = regard.ouverture;
  const forme = `M -16 ${y} Q -2 ${y - 13 * o} 16 ${y - 1} Q 2 ${y + 8 * o} -16 ${y} Z`;
  const rayon = regard.ouverture > 1.1 ? 6.2 : 7.2;
  // Le regard est exprimé dans le repère de l'écran : on l'inverse pour l'œil retourné.
  const gx = regard.gx * cote;
  return (
    <g>
      <clipPath id={clipId}>
        <path d={forme} />
      </clipPath>
      <path d={forme} fill="#F6F1EE" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx={gx} cy={y + regard.gy - 1} r={rayon} fill={idIris} />
        <circle cx={gx} cy={y + regard.gy - 1} r={rayon * 0.45} fill="#120A10" />
        <circle cx={gx + 2.4 * cote} cy={y + regard.gy - 4} r={1.8} fill="#FFFFFF" opacity={0.9} />
        <path d={`M -16 ${y - 12 * o} L 16 ${y - 12 * o} L 16 ${y - 4 * o} Q 0 ${y - 9 * o} -16 ${y - 4 * o} Z`} fill={peauOmbre} opacity={0.18} />
      </g>
      <path d={`M -17 ${y + 1} Q -2 ${y - 13.5 * o} 17 ${y - 1} L 21 ${y - 4}`} stroke="#2A1A22" strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {regard.paupiere && (
        <path d={`M -13 ${y + 4} Q 0 ${y + 1} 13 ${y + 2}`} stroke={peauOmbre} strokeOpacity={0.6} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

function Bouche({ expression, levres }: { expression: Expression; levres: string }) {
  const b = bouches[expression];
  const fonce = ombre(levres, 0.35);
  if (b.ouverte) {
    return (
      <g>
        <path d={b.ouverte} fill="#4A1F2A" stroke={fonce} strokeWidth={1.5} />
        {b.dents && <path d="M186 264 Q 200 270 214 264 L 212 268 Q 200 273 188 268 Z" fill="#F4EFEA" />}
        <ellipse cx={200} cy={expression === "rire" ? 282 : 276} rx={6} ry={2.5} fill="#B4505E" opacity={0.6} />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={200} cy={275} rx={9} ry={3.4} fill={levres} opacity={0.55} />
      <path d={b.trait} stroke={fonce} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    </g>
  );
}

// ---------- Tenues ----------

const torse = "M48 500 C 52 430 92 378 160 352 C 176 362 224 362 240 352 C 308 378 348 430 352 500 Z";

const couleursTenue: Record<Tenue, string> = {
  uniforme: "#1E2347",
  pull: "#4A3557",
  redingote: "#2B2133",
  cape: "#171428",
  tweed: "#6E4C35",
};

function tenueDefs(tenue: Tenue, id: (n: string) => string) {
  const base = couleursTenue[tenue];
  return (
    <>
      <linearGradient id={id("tenue")} x1="0.3" y1="0" x2="0.7" y2="1">
        <stop offset="0%" stopColor={lumiere(base, 0.14)} />
        <stop offset="100%" stopColor={ombre(base, 0.45)} />
      </linearGradient>
      <pattern id={id("tweed")} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0 L0 8 M4 0 L4 8" stroke="#3A2618" strokeOpacity="0.35" strokeWidth="1.2" />
        <path d="M0 2 L8 2" stroke="#A4805C" strokeOpacity="0.25" strokeWidth="1" />
      </pattern>
    </>
  );
}

function Col() {
  return (
    <>
      <path d="M168 350 L 200 432 L 232 350 C 222 360 178 360 168 350 Z" fill="#ECE8F2" />
      <path d="M168 348 L 186 386 L 198 362 Z M 232 348 L 214 386 L 202 362 Z" fill="#F7F4FA" stroke="#CFC8DA" strokeWidth={1} />
    </>
  );
}

function DessinTenue({ tenue, accent, url }: { tenue: Tenue; accent: string; url: (n: string) => string }) {
  const base = couleursTenue[tenue];
  const sombre = ombre(base, 0.35);
  switch (tenue) {
    case "uniforme":
      return (
        <g>
          <path d={torse} fill={url("tenue")} />
          <Col />
          <path d="M193 362 L 207 362 L 205 375 L 195 375 Z" fill={ombre(accent, 0.15)} />
          <path d="M195 375 L 205 375 L 212 442 L 200 458 L 188 442 Z" fill={accent} />
          <path d="M193 392 L 207 384 M 192 410 L 209 400 M 190 428 L 210 418" stroke={ombre(accent, 0.4)} strokeWidth={3} />
          <path d="M160 352 C 168 384 182 424 200 462 L 184 476 C 164 436 146 404 120 380 L 148 372 Z" fill={sombre} />
          <path d="M240 352 C 232 384 218 424 200 462 L 216 476 C 236 436 254 404 280 380 L 252 372 Z" fill={sombre} />
          <path d="M160 352 C 168 384 182 424 200 462 M 240 352 C 232 384 218 424 200 462" stroke={accent} strokeOpacity={0.55} strokeWidth={1.5} fill="none" />
          <path d="M262 420 l 22 0 l 0 14 c 0 9 -6 15 -11 17 c -5 -2 -11 -8 -11 -17 Z" fill={accent} stroke={lumiere(accent, 0.4)} strokeWidth={1} />
        </g>
      );
    case "pull":
      return (
        <g>
          <path d={torse} fill={url("tenue")} />
          <Col />
          <path d="M162 352 L 200 414 L 238 352" stroke={sombre} strokeWidth={12} fill="none" strokeLinejoin="round" />
          <path d="M162 352 L 200 414 L 238 352" stroke={accent} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          {[110, 140, 260, 290].map((x) => (
            <path
              key={x}
              d={`M ${x} 420 q 8 10 0 20 q -8 10 0 20 q 8 10 0 20 q -8 10 0 20`}
              stroke={sombre}
              strokeOpacity={0.6}
              strokeWidth={4}
              fill="none"
            />
          ))}
        </g>
      );
    case "redingote":
      return (
        <g>
          <path d={torse} fill={url("tenue")} />
          <path d="M170 350 L 200 440 L 230 350 Z" fill="#E8E2EC" />
          <path d="M156 354 C 148 330 158 314 170 316 L 200 362 L 230 316 C 242 314 252 330 244 354 L 200 384 Z" fill={sombre} />
          <path d="M186 354 C 194 362 206 362 214 354 L 222 394 C 212 386 205 398 200 414 C 195 398 188 386 178 394 Z" fill={accent} />
          {[176, 224].map((x) =>
            [424, 454, 484].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={4} fill="#D2A54A" stroke="#8A6420" strokeWidth={1} />)
          )}
          <path d="M200 440 L 200 500" stroke={sombre} strokeWidth={2} />
        </g>
      );
    case "cape":
      return (
        <g>
          <path d="M28 500 C 40 420 92 370 160 350 C 176 360 224 360 240 350 C 308 370 360 420 372 500 Z" fill={url("tenue")} />
          <path d="M176 352 L 200 470 L 224 352 Z" fill={ombre(accent, 0.55)} />
          <path d="M150 352 C 144 326 158 310 172 314 L 200 352 L 228 314 C 242 310 256 326 250 352" fill={lumiere(base, 0.08)} stroke="#C9CED8" strokeWidth={2.5} />
          <path d="M120 380 C 150 420 160 460 156 500 M 280 380 C 250 420 240 460 244 500" stroke={sombre} strokeWidth={3} fill="none" />
          <path d="M150 372 Q 200 392 250 372" stroke="#D2A54A" strokeWidth={1.5} fill="none" />
          <path d="M200 360 l 5 11 l 12 1 l -9 8 l 3 12 l -11 -6 l -11 6 l 3 -12 l -9 -8 l 12 -1 Z" fill="#E2B85A" stroke="#8A6420" strokeWidth={1} />
        </g>
      );
    case "tweed":
      return (
        <g>
          <path d={torse} fill={url("tenue")} />
          <path d={torse} fill={url("tweed")} />
          <path d="M172 350 L 200 450 L 228 350 Z" fill="#3E2C24" />
          <path d="M178 350 L 200 404 L 222 350 C 212 358 188 358 178 350 Z" fill="#EEE7DE" />
          <path d="M184 360 L 200 366 L 216 360 L 216 376 L 200 370 L 184 376 Z" fill={accent} />
          <circle cx={200} cy={368} r={4} fill={ombre(accent, 0.3)} />
          {[420, 444].map((y) => (
            <circle key={y} cx={200} cy={y} r={3} fill="#C9A05A" />
          ))}
          <path d="M160 352 C 170 390 184 430 196 470 L 176 470 C 162 430 140 400 118 384 Z" fill={ombre(base, 0.2)} />
          <path d="M240 352 C 230 390 216 430 204 470 L 224 470 C 238 430 260 400 282 384 Z" fill={ombre(base, 0.2)} />
          <path d="M268 410 L 268 428" stroke="#C9A05A" strokeWidth={2} />
          <circle cx={268} cy={434} r={7} fill="none" stroke="#C9A05A" strokeWidth={2} />
        </g>
      );
  }
}
