// ============================================================
// CRÉATURES DU COMPAGNON — dessins SVG (aucune image externe)
// ============================================================

export type Espece = "chat" | "alien" | "dragon" | "poulpe" | "robot";
export type Humeur = "content" | "normal" | "triste";

export const ESPECES: { key: Espece; nom: string; nomParDefaut: string; description: string; couleur: string; clair: string; fonce: string }[] = [
  { key: "chat", nom: "Chat de l'espace", nomParDefaut: "Minou Nova", description: "Curieux et câlin, il ne quitte jamais son casque.", couleur: "#b57cff", clair: "#e4d0ff", fonce: "#7b38ff" },
  { key: "alien", nom: "Petit alien", nomParDefaut: "Zorblin", description: "Venu d'une planète lointaine, il adore les bonbons.", couleur: "#5fe0a0", clair: "#c8f7dd", fonce: "#1f9d68" },
  { key: "dragon", nom: "Dragon lunaire", nomParDefaut: "Lunix", description: "Un petit dragon qui crache des paillettes d'étoiles.", couleur: "#62b8ff", clair: "#cbe7ff", fonce: "#2a6fd6" },
  { key: "poulpe", nom: "Poulpe cosmique", nomParDefaut: "Tentacla", description: "Huit bras pour faire huit câlins à la fois.", couleur: "#f472b6", clair: "#fdd2ea", fonce: "#c2307e" },
  { key: "robot", nom: "Mini-CycyBot", nomParDefaut: "Bip", description: "Le petit frère de CycyBot, carbure aux étoiles.", couleur: "#9146ff", clair: "#d7c2ff", fonce: "#5a1fd1" },
];

export function especeInfo(e: Espece) {
  return ESPECES.find((x) => x.key === e) || ESPECES[0];
}

type Props = {
  espece: Espece;
  humeur?: Humeur;
  dort?: boolean;
  sale?: boolean;
  stade?: 0 | 1 | 2; // bébé, enfant, adulte
  taille?: number;
};

function Yeux({ humeur, dort, robot = false, gros = false }: { humeur: Humeur; dort: boolean; robot?: boolean; gros?: boolean }) {
  const r = gros ? 12 : 9.5;
  if (dort) {
    return (
      <g stroke={robot ? "#e0b3ff" : "#2a1552"} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M70 108 q10 7 20 0" />
        <path d="M110 108 q10 7 20 0" />
      </g>
    );
  }
  if (robot) {
    const h = humeur === "triste" ? 6 : humeur === "content" ? 14 : 11;
    return (
      <g className="cp-yeux" style={{ filter: "drop-shadow(0 0 4px #e0b3ff)" }}>
        <rect x="74" y={110 - h / 2} width="14" height={h} rx="4" fill="#f0dcff" />
        <rect x="112" y={110 - h / 2} width="14" height={h} rx="4" fill="#f0dcff" />
      </g>
    );
  }
  if (humeur === "content") {
    return (
      <g stroke="#2a1552" strokeWidth="4.5" strokeLinecap="round" fill="none">
        <path d={`M${80 - r} 110 q${r} -${r * 1.3} ${r * 2} 0`} />
        <path d={`M${120 - r} 110 q${r} -${r * 1.3} ${r * 2} 0`} />
      </g>
    );
  }
  return (
    <g className="cp-yeux">
      <circle cx="80" cy="108" r={r} fill="#2a1552" />
      <circle cx="120" cy="108" r={r} fill="#2a1552" />
      <circle cx={80 + r * 0.3} cy={108 - r * 0.35} r={r * 0.35} fill="#fff" />
      <circle cx={120 + r * 0.3} cy={108 - r * 0.35} r={r * 0.35} fill="#fff" />
      {humeur === "triste" && (
        <g stroke="#2a1552" strokeWidth="3" strokeLinecap="round">
          <path d="M68 96 l14 -5" />
          <path d="M132 96 l-14 -5" />
        </g>
      )}
    </g>
  );
}

function Bouche({ humeur, dort }: { humeur: Humeur; dort: boolean }) {
  if (dort) return <ellipse cx="100" cy="130" rx="4" ry="3" fill="#2a1552" />;
  if (humeur === "content") return <path d="M88 126 q12 14 24 0 q-12 5 -24 0z" fill="#2a1552" />;
  if (humeur === "triste") return <path d="M90 134 q10 -9 20 0" stroke="#2a1552" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  return <path d="M92 128 q8 7 16 0" stroke="#2a1552" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
}

export default function Creature({ espece, humeur = "normal", dort = false, sale = false, stade = 2, taille = 220 }: Props) {
  const c = especeInfo(espece);
  const echelle = stade === 0 ? 0.74 : stade === 1 ? 0.88 : 1;
  const id = `cp-${espece}`;
  const joues = !dort && humeur !== "triste" && espece !== "robot";

  return (
    <svg viewBox="0 0 200 200" width={taille} height={taille} role="img" aria-label={c.nom} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${id}-corps`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor={c.clair} />
          <stop offset="55%" stopColor={c.couleur} />
          <stop offset="100%" stopColor={c.fonce} />
        </radialGradient>
        <radialGradient id={`${id}-ventre`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor={c.clair} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <g transform={`translate(100 175) scale(${echelle}) translate(-100 -175)`}>
        {/* ombre au sol */}
        <ellipse cx="100" cy="178" rx="52" ry="8" fill="#000" opacity="0.28" />

        {/* ── Éléments derrière le corps ── */}
        {espece === "dragon" && (
          <g fill={c.fonce} opacity="0.9">
            <path d="M52 108 C 20 82, 14 120, 30 132 C 36 120, 44 120, 52 124 Z" />
            <path d="M148 108 C 180 82, 186 120, 170 132 C 164 120, 156 120, 148 124 Z" />
          </g>
        )}
        {espece === "chat" && <path d="M150 150 C 182 146, 182 112, 166 104" stroke={c.fonce} strokeWidth="9" fill="none" strokeLinecap="round" />}

        {/* ── Corps ── */}
        {espece === "robot" ? (
          <g>
            <line x1="100" y1="52" x2="104" y2="34" stroke={c.clair} strokeWidth="4" strokeLinecap="round" />
            <circle cx="104" cy="31" r="7" fill="#f472b6" style={{ filter: "drop-shadow(0 0 6px #f472b6)" }} />
            <rect x="80" y="160" width="14" height="16" rx="4" fill={c.fonce} />
            <rect x="106" y="160" width="14" height="16" rx="4" fill={c.fonce} />
            <rect x="44" y="52" width="112" height="112" rx="28" fill={`url(#${id}-corps)`} />
            <rect x="60" y="88" width="80" height="44" rx="16" fill="#140a2e" />
          </g>
        ) : espece === "poulpe" ? (
          <g>
            {[50, 70, 90, 110, 130, 150].map((x, i) => (
              <path
                key={x}
                className="cp-tentacule"
                style={{ animationDelay: `${i * 0.25}s` }}
                d={`M${x} 138 q${i % 2 ? 8 : -8} 20 ${i % 2 ? -4 : 4} 36`}
                stroke={c.fonce}
                strokeWidth="13"
                fill="none"
                strokeLinecap="round"
              />
            ))}
            <ellipse cx="100" cy="108" rx="60" ry="56" fill={`url(#${id}-corps)`} />
          </g>
        ) : (
          <g>
            <ellipse cx="78" cy="168" rx="15" ry="9" fill={c.fonce} />
            <ellipse cx="122" cy="168" rx="15" ry="9" fill={c.fonce} />
            {espece === "chat" && (
              <g fill={`url(#${id}-corps)`} stroke={c.fonce} strokeWidth="2">
                <path d="M56 86 L 62 46 L 90 70 Z" />
                <path d="M144 86 L 138 46 L 110 70 Z" />
              </g>
            )}
            {espece === "chat" && (
              <g fill="#f9c6e3">
                <path d="M63 76 L 66 56 L 80 68 Z" />
                <path d="M137 76 L 134 56 L 120 68 Z" />
              </g>
            )}
            {espece === "dragon" && (
              <g fill="#ffe7a3" stroke="#c99a2e" strokeWidth="1.5">
                <path d="M72 70 Q 64 48 76 40 Q 76 56 86 64 Z" />
                <path d="M128 70 Q 136 48 124 40 Q 124 56 114 64 Z" />
              </g>
            )}
            {espece === "alien" && (
              <g>
                <path d="M80 66 Q 70 44 60 36" stroke={c.fonce} strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M120 66 Q 130 44 140 36" stroke={c.fonce} strokeWidth="4" fill="none" strokeLinecap="round" />
                <circle cx="59" cy="34" r="8" fill="#ffe46b" style={{ filter: "drop-shadow(0 0 6px #ffe46b)" }} />
                <circle cx="141" cy="34" r="8" fill="#ffe46b" style={{ filter: "drop-shadow(0 0 6px #ffe46b)" }} />
              </g>
            )}
            <ellipse cx="100" cy="118" rx="60" ry="56" fill={`url(#${id}-corps)`} />
            <ellipse cx="100" cy="140" rx="36" ry="28" fill={`url(#${id}-ventre)`} />
            {espece === "dragon" && (
              <g stroke={c.fonce} strokeWidth="2.5" opacity="0.5" strokeLinecap="round">
                <path d="M86 132 h28" />
                <path d="M84 142 h32" />
                <path d="M88 152 h24" />
              </g>
            )}
          </g>
        )}

        {/* ── Visage ── */}
        <Yeux humeur={humeur} dort={dort} robot={espece === "robot"} gros={espece === "alien"} />
        {espece !== "robot" && <Bouche humeur={humeur} dort={dort} />}
        {espece === "robot" && !dort && humeur === "content" && <path d="M92 124 q8 6 16 0" stroke="#f0dcff" strokeWidth="3" fill="none" strokeLinecap="round" />}
        {joues && (
          <g fill="#ff8fc7" opacity="0.55">
            <ellipse cx="66" cy="124" rx="8" ry="5" />
            <ellipse cx="134" cy="124" rx="8" ry="5" />
          </g>
        )}
        {espece === "chat" && (
          <g stroke="#2a1552" strokeWidth="1.6" opacity="0.6" strokeLinecap="round">
            <path d="M58 120 h-16" />
            <path d="M58 126 l-15 4" />
            <path d="M142 120 h16" />
            <path d="M142 126 l15 4" />
          </g>
        )}

        {/* Casque du chat de l'espace */}
        {espece === "chat" && (
          <g>
            <circle cx="100" cy="108" r="80" fill="#ffffff" fillOpacity="0.07" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="3" />
            <path d="M48 76 A 70 70 0 0 1 96 34" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* Saleté */}
        {sale && (
          <g>
            <g fill="#7a5230" opacity="0.55">
              <ellipse cx="70" cy="146" rx="9" ry="6" />
              <ellipse cx="128" cy="96" rx="7" ry="5" />
              <ellipse cx="118" cy="154" rx="6" ry="4" />
            </g>
            <g stroke="#9be38f" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8">
              <path d="M150 64 q6 -8 0 -16 q-6 -8 0 -16" />
              <path d="M164 74 q6 -8 0 -16 q-6 -8 0 -16" />
            </g>
          </g>
        )}

        {/* Adulte : petite couronne d'étoiles */}
        {stade === 2 && !dort && (
          <g transform={`translate(100 ${espece === "robot" ? 46 : espece === "poulpe" ? 50 : 58})`} fill="#ffd66b" style={{ filter: "drop-shadow(0 0 6px #ffd66b)" }}>
            <path d="M0 -14 L4 -4 L14 -4 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14 -4 L-4 -4 Z" />
          </g>
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
      <path d="M100 18 C 150 18, 172 110, 166 150 C 160 190, 132 204, 100 204 C 68 204, 40 190, 34 150 C 28 110, 50 18, 100 18 Z" fill={`url(#oeuf-${espece})`} />
      {/* taches */}
      <g fill={c.fonce} opacity="0.35">
        <ellipse cx="74" cy="96" rx="12" ry="9" />
        <ellipse cx="128" cy="76" rx="9" ry="7" />
        <ellipse cx="120" cy="150" rx="14" ry="10" />
        <ellipse cx="70" cy="160" rx="7" ry="6" />
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
