// Coffre au trésor dessiné en SVG (jeu des 3 coffres scellés et sa miniature).
// Le couvercle pivote quand le coffre s'ouvre ; une lueur sort du coffre ouvert.

export type TeinteCoffre = { nom: string; bois: string; boisSombre: string; metal: string; lueur: string };

export const TEINTES_COFFRES: TeinteCoffre[] = [
  { nom: "Coffre de comète", bois: "#b4642b", boisSombre: "#6e3612", metal: "#ffd27a", lueur: "#ffcf6b" },
  { nom: "Coffre de lune", bois: "#3f6ea8", boisSombre: "#1d3a63", metal: "#d9ecff", lueur: "#8fd8ff" },
  { nom: "Coffre de nébuleuse", bois: "#7a3fb8", boisSombre: "#3f1a6e", metal: "#f3c6ff", lueur: "#e3a6ff" },
];

type Props = {
  teinte: TeinteCoffre;
  ouvert?: boolean;
  /** Coffre ouvert mais vide d'intérêt (grisé), pour celui que CycyBot ouvre. */
  terne?: boolean;
  id: string;
  className?: string;
  /** Position dans un autre SVG (miniature de la vitrine). */
  cadre?: { x: number; y: number; width: number; height: number };
};

export default function CoffreSvg({ teinte, ouvert = false, terne = false, id, className = "", cadre }: Props) {
  const { bois, boisSombre, metal, lueur } = teinte;
  return (
    <svg viewBox="0 -26 120 136" className={className} aria-hidden="true" style={{ overflow: "visible" }} {...cadre}>
      <defs>
        <linearGradient id={`${id}-bois`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bois} />
          <stop offset="100%" stopColor={boisSombre} />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="45%" stopColor={metal} />
          <stop offset="100%" stopColor={boisSombre} />
        </linearGradient>
        <radialGradient id={`${id}-lueur`} cx="50%" cy="100%" r="80%">
          <stop offset="0%" stopColor={lueur} stopOpacity="0.95" />
          <stop offset="100%" stopColor={lueur} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* ombre au sol */}
      <ellipse cx="60" cy="102" rx="44" ry="6" fill="#000" opacity="0.35" />
      {/* lueur du coffre ouvert */}
      {ouvert && !terne && <path d="M22 54 L8 2 H112 L98 54 Z" fill={`url(#${id}-lueur)`} opacity="0.85" />}
      {/* caisse */}
      <g opacity={terne ? 0.55 : 1}>
        <rect x="16" y="52" width="88" height="46" rx="6" fill={`url(#${id}-bois)`} />
        <path d="M16 66 H104 M16 84 H104" stroke={boisSombre} strokeWidth="1.5" opacity="0.6" />
        <rect x="28" y="52" width="9" height="46" fill={`url(#${id}-metal)`} />
        <rect x="83" y="52" width="9" height="46" fill={`url(#${id}-metal)`} />
        {/* serrure */}
        {!ouvert && (
          <g>
            <rect x="51" y="56" width="18" height="20" rx="4" fill={`url(#${id}-metal)`} />
            <circle cx="60" cy="64" r="3" fill={boisSombre} />
            <path d="M60 66 v5" stroke={boisSombre} strokeWidth="2.4" strokeLinecap="round" />
          </g>
        )}
        {ouvert && <rect x="20" y="52" width="80" height="6" rx="2" fill={boisSombre} opacity="0.8" />}
      </g>
      {/* couvercle : fermé (bombé) ou ouvert (basculé vers l'arrière) */}
      <g
        opacity={terne ? 0.55 : 1}
        style={{ transformOrigin: "16px 52px", transformBox: "view-box", transform: ouvert ? "translate(2px, -16px) rotate(-24deg)" : "none", transition: "transform 0.6s cubic-bezier(.3,1.4,.5,1)" }}
      >
        <path d="M16 52 V40 C16 26 30 18 46 18 H74 C90 18 104 26 104 40 V52 Z" fill={`url(#${id}-bois)`} />
        <path d="M28 52 V24 M92 52 V24" stroke={`url(#${id}-metal)`} strokeWidth="9" />
        <path d="M16 52 H104" stroke={`url(#${id}-metal)`} strokeWidth="4" />
        <path d="M30 30 C40 24 52 23 60 23" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" fill="none" />
      </g>
    </svg>
  );
}
