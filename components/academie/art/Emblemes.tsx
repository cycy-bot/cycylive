// Emblèmes héraldiques des trois maisons (vectoriels, provisoires).

import { useId } from "react";
import { maisons } from "@/data/academie/maisons";
import type { MaisonId } from "@/data/academie/types";

const bouclier = "M100 8 L 184 34 C 186 122 160 192 100 232 C 40 192 14 122 16 34 Z";

function Etoile({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.32;
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} />;
}

function Lion({ c, s, l }: { c: string; f: string; s: string; l: string }) {
  const criniere = Array.from({ length: 28 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 28;
    const r = i % 2 === 0 ? 56 : 42;
    return `${100 + Math.cos(a) * r},${120 + Math.sin(a) * r * 1.02}`;
  }).join(" ");
  return (
    <g>
      <polygon points={criniere} fill={c} stroke={s} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={78} cy={88} r={10} fill={l} stroke={s} strokeWidth={1.5} />
      <circle cx={122} cy={88} r={10} fill={l} stroke={s} strokeWidth={1.5} />
      <path d="M74 106 C 74 82 126 82 126 106 C 130 130 120 154 100 160 C 80 154 70 130 74 106 Z" fill={l} stroke={s} strokeWidth={1.5} />
      <path d="M84 110 Q 91 105 96 111 M 104 111 Q 109 105 116 110" stroke={s} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M92 130 L 108 130 L 100 140 Z" fill={s} />
      <path d="M100 140 L 100 146 M 90 148 Q 100 154 110 148" stroke={s} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M100 96 L 100 124" stroke={s} strokeOpacity={0.35} strokeWidth={1.5} />
    </g>
  );
}

function Cygne({ c, s }: { c: string; f: string; s: string; l: string }) {
  return (
    <g>
      <path d="M50 168 Q 100 178 150 168 M 62 180 Q 100 188 138 180" stroke={c} strokeOpacity={0.6} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M54 150 C 56 128 90 118 120 130 C 140 140 152 150 164 144 C 156 166 122 176 92 172 C 72 170 54 162 54 150 Z" fill={c} stroke={s} strokeWidth={1.5} />
      <path d="M110 134 C 94 110 92 86 106 72 C 116 62 134 62 138 78 C 132 74 122 74 118 84 C 112 100 120 118 130 134 Z" fill={c} stroke={s} strokeWidth={1.5} />
      <path d="M121 68 L 100 76 L 120 80 Z" fill="#D9A63E" stroke={s} strokeWidth={1} />
      <circle cx={126} cy={72} r={2.2} fill={s} />
      <path d="M78 140 C 100 114 134 108 160 116 C 140 124 124 134 112 148 C 100 148 88 146 78 140 Z" fill={c} stroke={s} strokeWidth={1.5} />
      <path d="M96 136 Q 116 122 140 118 M 104 142 Q 122 130 146 124" stroke={s} strokeOpacity={0.45} strokeWidth={1.4} fill="none" />
    </g>
  );
}

function Dragon({ c, f, s }: { c: string; f: string; s: string; l: string }) {
  return (
    <g>
      <path
        d="M70 150 C 40 128 36 88 54 62 C 58 84 68 94 80 100 C 78 82 84 66 96 58 C 96 76 100 88 108 96 Z"
        fill={f}
        stroke={s}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M58 136 C 60 112 80 96 104 96 L 128 90 L 150 100 C 158 102 164 108 164 114 L 148 118 L 158 126 C 152 132 140 134 128 132 L 118 140 C 112 156 100 168 84 172 C 70 174 58 156 58 136 Z"
        fill={c}
        stroke={s}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path d="M96 100 C 90 82 96 66 110 58 C 106 72 108 84 114 96 Z" fill={f} stroke={s} strokeWidth={1.2} />
      <path d="M110 96 C 110 80 120 68 134 64 C 128 76 126 86 126 94 Z" fill={f} stroke={s} strokeWidth={1.2} />
      <path d="M118 108 L 132 105 L 127 112 Z" fill="#F3D489" />
      <circle cx={156} cy={108} r={1.8} fill={s} />
      <path d="M84 120 Q 100 126 112 120 M 78 136 Q 92 142 104 136 M 76 152 Q 88 156 96 152" stroke={s} strokeOpacity={0.4} strokeWidth={1.4} fill="none" />
    </g>
  );
}

export default function Embleme({ maison, className }: { maison: MaisonId; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const m = maisons[maison];
  const { principale, claire, sombre } = m.couleurs;
  const Animal = { lion: Lion, cygne: Cygne, dragon: Dragon }[maison];
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={`Emblème de la ${m.nom}`}>
      <defs>
        <linearGradient id={`fond-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1C1838" />
          <stop offset="100%" stopColor="#0B0919" />
        </linearGradient>
        <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={claire} />
          <stop offset="55%" stopColor={principale} />
          <stop offset="100%" stopColor={sombre} />
        </linearGradient>
      </defs>
      <path d={bouclier} fill={`url(#fond-${uid})`} stroke={`url(#metal-${uid})`} strokeWidth={6} />
      <path d={bouclier} fill="none" stroke={claire} strokeOpacity={0.5} strokeWidth={1} transform="translate(100 120) scale(0.9) translate(-100 -120)" />
      <Etoile x={100} y={36} r={9} fill={claire} />
      <Etoile x={50} y={56} r={4} fill={principale} />
      <Etoile x={150} y={56} r={4} fill={principale} />
      <Etoile x={100} y={208} r={5} fill={principale} />
      <Animal c={`url(#metal-${uid})`} f={sombre} s={sombre} l={claire} />
    </svg>
  );
}
