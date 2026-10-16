// Emblème de rank Valorant dessiné (couleur du palier + niveaux de division), sans image externe.
import type { Palier } from "@/lib/rangValorant";

export default function EmblemeRang({ palier, division, taille = 120, id = "e" }: { palier: Palier; division: number | null; taille?: number; id?: string }) {
  const k = `rang-${id}`;
  const radiant = palier.cle === "Radiant";
  return (
    <svg width={taille} height={taille} viewBox="0 0 120 124" role="img" aria-label={`Emblème ${palier.fr}${division ? ` ${division}` : ""}`}>
      <defs>
        <linearGradient id={`${k}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palier.clair} />
          <stop offset="100%" stopColor={palier.couleur} />
        </linearGradient>
        <radialGradient id={`${k}-h`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={palier.clair} stopOpacity="0.55" />
          <stop offset="100%" stopColor={palier.clair} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="58" r="56" fill={`url(#${k}-h)`} />
      {radiant ? (
        // Radiant : étoile rayonnante
        <g transform="translate(60 58)">
          {[0, 45, 90, 135].map((a) => (
            <path key={a} d="M0 -48 L7 -8 L0 0 L-7 -8 Z" fill={`url(#${k}-g)`} transform={`rotate(${a})`} />
          ))}
          {[0, 45, 90, 135].map((a) => (
            <path key={`b${a}`} d="M0 48 L7 8 L0 0 L-7 8 Z" fill={`url(#${k}-g)`} transform={`rotate(${a})`} />
          ))}
          <circle r="12" fill="#fffbe6" />
        </g>
      ) : (
        <>
          {/* gemme */}
          <path d="M60 10 L98 38 L84 92 L60 106 L36 92 L22 38 Z" fill={`url(#${k}-g)`} stroke={palier.clair} strokeWidth="2" />
          <path d="M60 10 L60 106 M22 38 L60 58 L98 38 M36 92 L60 58 L84 92" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.5" fill="none" />
          <path d="M60 22 L84 40 L60 52 L36 40 Z" fill="#fff" opacity="0.22" />
          {/* niveaux de division */}
          <g transform="translate(60 120)">
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
