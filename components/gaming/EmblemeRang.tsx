// Emblème de rank Valorant dessiné (silhouette propre à chaque palier, métal dégradé + niveaux de division), sans image externe.
import type { Palier } from "@/lib/rangValorant";

// Assombrit une couleur hex (0 → identique, 1 → noir)
function sombre(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * (1 - k)).toString(16).padStart(2, "0");
  return `#${f(n >> 16)}${f((n >> 8) & 255)}${f(n & 255)}`;
}

const ECU = "M60 14 L94 27 L91 72 L60 100 L29 72 L26 27 Z";
const HEXA = "M60 10 L99 31 L99 79 L60 104 L21 79 L21 31 Z";
const LOSANGE = "M60 6 L100 52 L60 106 L20 52 Z";

// Silhouette du corps + ornements (ailes, pointes…) par palier
const FORMES: Record<string, { corps: string; ornements: string[] }> = {
  Iron: { corps: ECU, ornements: [] },
  Bronze: { corps: ECU, ornements: ["M27 36 L9 44 L28 58 Z", "M93 36 L111 44 L92 58 Z"] },
  Silver: { corps: ECU, ornements: ["M27 32 L8 38 L28 50 Z", "M27 50 L12 60 L30 66 Z", "M93 32 L112 38 L92 50 Z", "M93 50 L108 60 L90 66 Z"] },
  Gold: {
    corps: ECU,
    ornements: ["M27 32 L8 38 L28 50 Z", "M27 50 L12 60 L30 66 Z", "M93 32 L112 38 L92 50 Z", "M93 50 L108 60 L90 66 Z", "M44 20 L48 4 L56 16 Z", "M76 20 L72 4 L64 16 Z", "M56 15 L60 0 L64 15 Z"],
  },
  Platinum: { corps: HEXA, ornements: ["M21 40 L6 52 L21 66 Z", "M99 40 L114 52 L99 66 Z"] },
  Diamond: { corps: LOSANGE, ornements: ["M30 40 L8 30 L22 58 Z", "M90 40 L112 30 L98 58 Z", "M34 78 L16 88 L42 92 Z", "M86 78 L104 88 L78 92 Z"] },
  Ascendant: {
    corps: LOSANGE,
    ornements: ["M32 42 L2 22 L10 46 L0 50 L14 64 L24 62 Z", "M88 42 L118 22 L110 46 L120 50 L106 64 L96 62 Z", "M36 82 L18 96 L46 94 Z", "M84 82 L102 96 L74 94 Z"],
  },
  Immortal: {
    corps: HEXA,
    ornements: ["M30 28 L14 2 L40 22 Z", "M90 28 L106 2 L80 22 Z", "M48 14 L60 -2 L72 14 Z", "M21 46 L2 40 L21 66 Z", "M99 46 L118 40 L99 66 Z"],
  },
};

export default function EmblemeRang({ palier, division, taille = 120, id = "e" }: { palier: Palier; division: number | null; taille?: number; id?: string }) {
  const k = `rang-${id}`;
  const radiant = palier.cle === "Radiant";
  const forme = FORMES[palier.cle] ?? FORMES.Iron;
  const fonce = sombre(palier.couleur, 0.45);
  const interieur = "translate(60 56) scale(.74) translate(-60 -56)";
  return (
    <svg width={taille} height={taille} viewBox="0 -4 120 128" role="img" aria-label={`Emblème ${palier.fr}${division ? ` ${division}` : ""}`}>
      <defs>
        {/* métal : reflet clair en haut, cœur de la couleur, ombre en bas */}
        <linearGradient id={`${k}-g`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={palier.clair} />
          <stop offset="45%" stopColor={palier.couleur} />
          <stop offset="70%" stopColor={palier.clair} stopOpacity="0.9" />
          <stop offset="100%" stopColor={fonce} />
        </linearGradient>
        <linearGradient id={`${k}-o`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palier.couleur} />
          <stop offset="100%" stopColor={fonce} />
        </linearGradient>
        <radialGradient id={`${k}-h`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={palier.clair} stopOpacity="0.5" />
          <stop offset="100%" stopColor={palier.clair} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="56" r="58" fill={`url(#${k}-h)`} />
      {radiant ? (
        <g transform="translate(60 56)">
          {[0, 45, 90, 135].map((a) => (
            <path key={a} d="M0 -50 L7 -8 L0 0 L-7 -8 Z" fill={`url(#${k}-g)`} transform={`rotate(${a})`} />
          ))}
          {[0, 45, 90, 135].map((a) => (
            <path key={`b${a}`} d="M0 50 L7 8 L0 0 L-7 8 Z" fill={`url(#${k}-g)`} transform={`rotate(${a})`} />
          ))}
          <circle r="14" fill="#fffbe6" />
          <circle r="22" fill="none" stroke="#fff3b0" strokeOpacity=".5" strokeWidth="1.5" />
        </g>
      ) : (
        <>
          {/* ornements (derrière le corps) */}
          {forme.ornements.map((d, i) => (
            <path key={i} d={d} fill={`url(#${k}-o)`} stroke={palier.clair} strokeOpacity=".7" strokeWidth="1.5" strokeLinejoin="round" />
          ))}
          {/* corps métallique */}
          <path d={forme.corps} fill={`url(#${k}-g)`} stroke={palier.clair} strokeWidth="2.5" strokeLinejoin="round" />
          {/* biseau intérieur */}
          <path d={forme.corps} transform={interieur} fill={fonce} fillOpacity=".35" stroke="#fff" strokeOpacity=".35" strokeWidth="2" strokeLinejoin="round" />
          {/* facette de reflet */}
          <path d="M60 22 L80 34 L60 46 L40 34 Z" fill="#fff" opacity=".2" />
          {/* éclat central (signature) */}
          <path d="M60 40 C61.4 50 63 52 72 56 C63 58 61.4 60 60 70 C58.6 60 57 58 48 56 C57 52 58.6 50 60 40 Z" fill={palier.clair} stroke="#fff" strokeOpacity=".6" strokeWidth="1" />
          {/* niveaux de division */}
          <g transform="translate(60 122)">
            {[1, 2, 3].map((n) => (
              <path
                key={n}
                d="M-6 -4 L0 -10 L6 -4"
                transform={`translate(${(n - 2) * 16} 0)`}
                fill="none"
                stroke={division && n <= division ? palier.clair : "#ffffff"}
                strokeOpacity={division && n <= division ? 1 : 0.18}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        </>
      )}
    </svg>
  );
}
