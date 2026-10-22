// Miniatures illustrées des jeux (SVG, aucune image à charger).
// Une petite scène par jeu, dans les couleurs de sa fiche (lib/jeux.ts).
import { jeuParId } from "@/lib/jeux";
import CoffreSvg, { TEINTES_COFFRES } from "@/components/arcade/CoffreSvg";

type Props = { id: string; className?: string; anime?: boolean };

// Étoiles de fond (positions fixes pour un rendu identique côté serveur et client)
const ETOILES = [
  [18, 22, 1.2], [52, 70, 0.8], [88, 18, 1], [140, 40, 0.7], [176, 14, 1.3], [214, 52, 0.8], [252, 26, 1.1], [292, 60, 0.9],
  [30, 120, 0.7], [300, 112, 1], [270, 150, 0.7], [120, 96, 0.6], [196, 92, 0.6], [64, 160, 0.8],
];

function Fond({ id, de, a }: { id: string; de: string; a: string }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-fond`} cx="50%" cy="0%" r="110%">
          <stop offset="0%" stopColor={de} />
          <stop offset="100%" stopColor={a} />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${id}-fond)`} />
      {ETOILES.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.35 + (i % 3) * 0.2} />
      ))}
    </>
  );
}

function Runner({ k, accent }: { k: string; accent: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${k}-sol`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d3bd6" />
          <stop offset="100%" stopColor="#2a1260" />
        </linearGradient>
        <linearGradient id={`${k}-comete`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffe3a3" />
          <stop offset="100%" stopColor="#ffe3a3" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* planète géante à l'horizon */}
      <circle cx="268" cy="44" r="22" fill="#ff9ad5" opacity="0.85" />
      <ellipse cx="268" cy="44" rx="36" ry="7" fill="none" stroke="#ffd1ec" strokeWidth="2" opacity="0.7" />
      {/* comète */}
      <path d="M196 30 L100 42" stroke={`url(#${k}-comete)`} strokeWidth="6" strokeLinecap="round" />
      <circle cx="198" cy="30" r="6" fill="#fff4d6" />
      {/* sol courbe */}
      <path d="M-10 168 Q160 132 330 168 L330 210 L-10 210 Z" fill={`url(#${k}-sol)`} />
      <path d="M-10 168 Q160 132 330 168" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" />
      <circle cx="60" cy="178" r="5" fill="#2a1260" opacity="0.8" />
      <circle cx="230" cy="182" r="7" fill="#2a1260" opacity="0.8" />
      {/* astéroïde */}
      <g transform="translate(222 128)">
        <path d="M0 14 L8 2 L22 0 L32 10 L30 24 L16 30 L4 26 Z" fill="#8a8299" />
        <circle cx="12" cy="12" r="4" fill="#6c6480" />
        <circle cx="23" cy="19" r="3" fill="#6c6480" />
      </g>
      {/* traits de vitesse */}
      {[96, 108, 120].map((y, i) => (
        <path key={y} d={`M${40 - i * 6} ${y} H${84 - i * 4}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      ))}
      {/* CycyBot en plein saut */}
      <g transform="translate(104 78) rotate(-8)">
        <line x1="22" y1="-2" x2="22" y2="-12" stroke={accent} strokeWidth="2.5" />
        <circle cx="22" cy="-14" r="4" fill="#ffd76b" />
        <rect x="0" y="0" width="44" height="38" rx="14" fill="#efe6ff" />
        <rect x="7" y="9" width="30" height="16" rx="8" fill="#1a1033" />
        <circle cx="16" cy="17" r="3.2" fill="#6bf0ff" />
        <circle cx="28" cy="17" r="3.2" fill="#6bf0ff" />
        <rect x="6" y="38" width="10" height="12" rx="5" fill="#cbbdf0" transform="rotate(-20 11 38)" />
        <rect x="28" y="38" width="10" height="12" rx="5" fill="#cbbdf0" transform="rotate(25 33 38)" />
      </g>
    </>
  );
}

function Reflexes({ accent }: { accent: string }) {
  const cible = (x: number, y: number, r: number, o = 1) => (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill="#fff" />
      <circle cx={x} cy={y} r={r * 0.72} fill={accent} />
      <circle cx={x} cy={y} r={r * 0.44} fill="#fff" />
      <circle cx={x} cy={y} r={r * 0.18} fill={accent} />
    </g>
  );
  return (
    <>
      {/* sol en perspective façon stand de tir */}
      <path d="M0 150 L320 150 L320 200 L0 200 Z" fill="#000" opacity="0.35" />
      {[40, 100, 160, 220, 280].map((x) => (
        <line key={x} x1={x} y1="150" x2={(x - 160) * 2.2 + 160} y2="200" stroke={accent} strokeOpacity="0.25" />
      ))}
      {cible(78, 74, 26)}
      {cible(232, 58, 18, 0.9)}
      {cible(262, 128, 12, 0.75)}
      {/* impact */}
      <circle cx="160" cy="104" r="34" fill="none" stroke="#fff" strokeOpacity="0.15" strokeWidth="10" />
      {/* viseur */}
      <g stroke="#7dffb0" strokeWidth="3" strokeLinecap="round">
        <line x1="160" y1="86" x2="160" y2="96" />
        <line x1="160" y1="112" x2="160" y2="122" />
        <line x1="142" y1="104" x2="152" y2="104" />
        <line x1="168" y1="104" x2="178" y2="104" />
      </g>
      <circle cx="160" cy="104" r="2" fill="#7dffb0" />
      <text x="96" y="40" fontSize="15" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">+150</text>
    </>
  );
}

function Rythme({ k, accent }: { k: string; accent: string }) {
  const couleurs = ["#ff7ad9", "#5fd4ff", "#ffd76b", "#9dffb0"];
  const pistes = [0, 1, 2, 3];
  const xHaut = (i: number) => 128 + i * 21;
  const xBas = (i: number) => 52 + i * 72;
  return (
    <>
      <defs>
        <linearGradient id={`${k}-piste`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <path d="M118 20 L210 20 L330 200 L-10 200 Z" fill={`url(#${k}-piste)`} />
      {pistes.map((i) => (
        <line key={i} x1={xHaut(i) - 10} y1="20" x2={xBas(i) - 36} y2="200" stroke="#fff" strokeOpacity="0.12" />
      ))}
      {/* notes qui descendent */}
      {[[0, 0.35], [1, 0.7], [2, 0.5], [3, 0.2], [1, 0.25], [3, 0.82]].map(([i, t], n) => {
        const x = xHaut(i) + (xBas(i) - xHaut(i)) * t;
        const y = 20 + 150 * t;
        const w = 16 + 40 * t;
        return <rect key={n} x={x - w / 2} y={y - 5 - 4 * t} width={w} height={10 + 8 * t} rx={5 + 4 * t} fill={couleurs[i]} opacity={0.6 + 0.4 * t} />;
      })}
      {/* ligne de frappe */}
      <line x1="0" y1="172" x2="320" y2="172" stroke={accent} strokeWidth="2" opacity="0.7" />
      {pistes.map((i) => (
        <circle key={i} cx={xHaut(i) + (xBas(i) - xHaut(i)) * 0.93} cy="172" r="17" fill="none" stroke={couleurs[i]} strokeWidth="3" />
      ))}
      <circle cx={xHaut(1) + (xBas(1) - xHaut(1)) * 0.93} cy="172" r="24" fill={couleurs[1]} opacity="0.25" />
      <text x="232" y="62" fontSize="26" fill="#fff" opacity="0.85">♪</text>
      <text x="62" y="88" fontSize="20" fill="#fff" opacity="0.6">♫</text>
      <text x="240" y="100" fontSize="14" fontWeight="800" fill={accent} fontFamily="system-ui, sans-serif">×4</text>
    </>
  );
}

function Constellations({ accent }: { accent: string }) {
  const pts: [number, number][] = [[58, 140], [96, 92], [142, 112], [176, 58], [226, 76], [262, 40], [244, 132]];
  return (
    <>
      <circle cx="160" cy="100" r="90" fill={accent} opacity="0.05" />
      <polyline points={pts.slice(0, 5).map((p) => p.join(",")).join(" ")} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" opacity="0.9" />
      <line x1={pts[4][0]} y1={pts[4][1]} x2={pts[5][0]} y2={pts[5][1]} stroke={accent} strokeWidth="2.5" strokeDasharray="5 6" opacity="0.7" />
      <line x1={pts[4][0]} y1={pts[4][1]} x2={pts[6][0]} y2={pts[6][1]} stroke="#fff" strokeWidth="1.5" strokeDasharray="2 6" opacity="0.4" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 5 ? 11 : 8} fill={i === 5 ? accent : "#fff"} opacity={i === 5 ? 0.25 : 0.12} />
          <circle cx={x} cy={y} r={i === 5 ? 5 : 4} fill={i === 6 ? "#ff6b8b" : "#fff"} />
        </g>
      ))}
      {/* curseur */}
      <path d="M262 40 l12 30 l5 -11 l11 -4 Z" fill="#fff" stroke="#1a1033" strokeWidth="1.5" transform="translate(4 8)" />
    </>
  );
}

function Memory({ accent }: { accent: string }) {
  const cartes = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <g transform="translate(40 26)">
      {cartes.map((i) => {
        const x = (i % 4) * 62;
        const y = Math.floor(i / 4) * 78;
        const visible = i === 1 || i === 6;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(i % 3) - 1} 26 34)`}>
            <rect width="52" height="68" rx="9" fill={visible ? "#f3ecff" : "#2a1748"} stroke={visible ? accent : "#5a3a8a"} strokeWidth="2" />
            {visible ? (
              <g transform="translate(26 34)">
                <circle r="13" fill="#ff9ad5" />
                <ellipse rx="22" ry="5" fill="none" stroke="#7b38ff" strokeWidth="3" transform="rotate(-18)" />
              </g>
            ) : (
              <path d="M26 22 l3.5 8 8.5 1 -6.5 5.5 2 8.5 -7.5 -4.5 -7.5 4.5 2 -8.5 -6.5 -5.5 8.5 -1 Z" fill={accent} opacity="0.55" />
            )}
          </g>
        );
      })}
    </g>
  );
}

function Quiz({ accent }: { accent: string }) {
  const lignes = ["A", "B", "C", "D"];
  return (
    <>
      <g transform="translate(34 40)">
        <rect width="92" height="92" rx="24" fill="#fff" opacity="0.1" />
        <text x="46" y="72" textAnchor="middle" fontSize="70" fontWeight="800" fill={accent} fontFamily="system-ui, sans-serif">?</text>
        <circle cx="84" cy="8" r="17" fill="#0b1a18" stroke={accent} strokeWidth="3" />
        <path d="M84 8 L84 -2 A10 10 0 0 1 93 12 Z" fill={accent} />
      </g>
      {lignes.map((l, i) => (
        <g key={l} transform={`translate(150 ${34 + i * 34})`}>
          <rect width="140" height="26" rx="13" fill={i === 2 ? accent : "#fff"} opacity={i === 2 ? 0.9 : 0.12} />
          <text x="14" y="18" fontSize="12" fontWeight="700" fill={i === 2 ? "#0b1a18" : "#fff"} fontFamily="system-ui, sans-serif">{l}</text>
          <rect x="32" y="11" width={i === 2 ? 70 : 50 + i * 12} height="5" rx="2.5" fill={i === 2 ? "#0b1a18" : "#fff"} opacity={i === 2 ? 0.5 : 0.35} />
        </g>
      ))}
    </>
  );
}

function AstroDodge({ k, accent }: { k: string; accent: string }) {
  const roches: [number, number, number, number][] = [[60, 46, 18, 10], [236, 36, 24, -20], [270, 120, 14, 30], [110, 118, 12, 0], [196, 86, 16, 45], [34, 150, 10, 15]];
  return (
    <>
      <defs>
        <linearGradient id={`${k}-coque`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b57cff" />
          <stop offset="100%" stopColor="#f0abfc" />
        </linearGradient>
        <linearGradient id={`${k}-flamme`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="60%" stopColor={accent} />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {roches.map(([x, y, r, a], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d={`M${-r} ${-r * 0.3} L${-r * 0.4} ${-r} L${r * 0.6} ${-r * 0.8} L${r} ${r * 0.1} L${r * 0.4} ${r} L${-r * 0.7} ${r * 0.7} Z`} fill="#8a6d5a" stroke="#fff" strokeOpacity="0.2" strokeWidth="2" />
          <circle cx={r * 0.25} cy={-r * 0.2} r={r * 0.22} fill="#000" opacity="0.22" />
        </g>
      ))}
      {/* traînées des astéroïdes */}
      {[[236, 36], [196, 86]].map(([x, y], i) => (
        <path key={i} d={`M${x - 8} ${y - 26} L${x - 20} ${y - 60}`} stroke="#fff" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
      ))}
      <g transform="translate(160 148)">
        <circle r="34" fill="none" stroke="#5fd4ff" strokeOpacity="0.7" strokeWidth="2.5" strokeDasharray="6 5" />
        <path d="M-7 14 L0 46 L7 14 Z" fill={`url(#${k}-flamme)`} />
        <path d="M0 -28 L17 16 L0 9 L-17 16 Z" fill={`url(#${k}-coque)`} stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <ellipse cy="-8" rx="4.5" ry="8" fill="#5fd4ff" />
      </g>
      <g transform="translate(268 168)">
        <circle r="13" fill="#ffd76b" fillOpacity="0.2" stroke="#ffd76b" strokeWidth="2" />
        <path d="M0 -7 L2 -2 L7 -2 L3 1.5 L4.5 7 L0 3.8 L-4.5 7 L-3 1.5 L-7 -2 L-2 -2 Z" fill="#ffd76b" />
      </g>
    </>
  );
}

function StarCatcher({ accent }: { accent: string }) {
  const etoile = (x: number, y: number, r: number, c: string, o = 1) => (
    <path transform={`translate(${x} ${y}) scale(${r / 10})`} d="M0 -10 L2.9 -3.1 L9.5 -3.1 L4.3 1.2 L6.2 8.1 L0 4.1 L-6.2 8.1 L-4.3 1.2 L-9.5 -3.1 L-2.9 -3.1 Z" fill={c} opacity={o} />
  );
  return (
    <>
      {etoile(84, 50, 13, accent)}
      {etoile(150, 92, 10, accent, 0.9)}
      {etoile(226, 38, 17, "#ffb627")}
      {etoile(196, 122, 9, accent, 0.8)}
      {etoile(62, 112, 8, accent, 0.7)}
      {/* météorite */}
      <path d="M268 64 L246 20" stroke="#ff7a45" strokeOpacity="0.5" strokeWidth="9" strokeLinecap="round" />
      <circle cx="270" cy="70" r="12" fill="#7a4a3a" stroke="#ffb08a" strokeWidth="2" />
      {/* trou noir */}
      <circle cx="38" cy="62" r="16" fill="#000" stroke="#a855f7" strokeOpacity="0.6" strokeWidth="2" />
      <ellipse cx="38" cy="62" rx="22" ry="6" fill="none" stroke="#a855f7" strokeOpacity="0.8" strokeWidth="2" transform="rotate(-18 38 62)" />
      {/* filet cosmique */}
      <path d="M104 160 Q160 196 216 160" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      {[118, 132, 146, 160, 174, 188, 202].map((x) => (
        <line key={x} x1={x} y1={164} x2={160 + (x - 160) * 0.5} y2={182} stroke="#fff" strokeOpacity="0.4" strokeWidth="1.2" />
      ))}
      <circle cx="104" cy="160" r="5" fill="#fff" />
      <circle cx="216" cy="160" r="5" fill="#fff" />
      <text x="248" y="176" fontSize="16" fontWeight="800" fill={accent} fontFamily="system-ui, sans-serif">×5</text>
    </>
  );
}

function CycyWord({ accent }: { accent: string }) {
  const lignes: [string, ("b" | "m" | "a")[]][] = [["ASTRE", ["a", "m", "a", "a", "b"]], ["CYCLE", ["m", "a", "a", "b", "b"]], ["COMBO", ["b", "b", "b", "b", "b"]]];
  const fond = { b: "#9146ff", m: "#e8b83a", a: "#ffffff22" };
  return (
    <>
      {lignes.map(([mot, c], l) => (
        <g key={mot} transform={`translate(78 ${30 + l * 50})`}>
          {mot.split("").map((lettre, i) => (
            <g key={i} transform={`translate(${i * 34} 0)`}>
              <rect width="30" height="40" rx="7" fill={fond[c[i]]} stroke={l === 2 ? accent : "none"} strokeOpacity="0.6" />
              <text x="15" y="28" textAnchor="middle" fontSize="20" fontWeight="800" fill={c[i] === "m" ? "#1a1206" : "#fff"} fontFamily="system-ui, sans-serif">{l === 2 ? "?" : lettre}</text>
            </g>
          ))}
        </g>
      ))}
    </>
  );
}

function Gratter({ k, accent }: { k: string; accent: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${k}-or`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="55%" stopColor="#f2b94b" />
          <stop offset="100%" stopColor="#b97a1f" />
        </linearGradient>
      </defs>
      <g transform="translate(46 38) rotate(-6 114 62)">
        <path d="M0 0 H228 V46 a12 12 0 0 0 0 24 V124 H0 V70 a12 12 0 0 0 0 -24 Z" fill={`url(#${k}-or)`} />
        <rect x="18" y="16" width="192" height="92" rx="12" fill="#1a130b" opacity="0.18" />
        <text x="30" y="38" fontSize="12" fontWeight="800" fill="#5a3a0b" fontFamily="system-ui, sans-serif" letterSpacing="2">TICKET GALACTIQUE</text>
        {/* zone grattée en partie */}
        <rect x="30" y="50" width="168" height="46" rx="10" fill="#a8a2b8" />
        <path d="M30 96 L30 60 C60 48 80 86 112 56 C128 44 136 76 150 62 L150 96 Z" fill="#fff8e6" />
        <text x="58" y="86" fontSize="22" fontWeight="900" fill="#7b38ff" fontFamily="system-ui, sans-serif">✦ 50</text>
      </g>
      {/* pièce qui gratte */}
      <g transform="translate(212 104)">
        <circle r="20" fill={accent} stroke="#b97a1f" strokeWidth="3" />
        <text y="7" textAnchor="middle" fontSize="18" fontWeight="900" fill="#7a4a10" fontFamily="system-ui, sans-serif">✦</text>
      </g>
      <path d="M186 100 l-10 -4 M190 90 l-8 -8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    </>
  );
}

function Compagnon({ accent }: { accent: string }) {
  return (
    <>
      <ellipse cx="160" cy="170" rx="110" ry="20" fill={accent} opacity="0.15" />
      {/* créature */}
      <g transform="translate(160 112)">
        <path d="M-46 40 C-56 -10 -30 -48 0 -48 C30 -48 56 -10 46 40 C30 52 -30 52 -46 40 Z" fill="#9dffb0" />
        <path d="M-30 -40 C-40 -62 -24 -66 -18 -46" fill="#9dffb0" />
        <path d="M30 -40 C40 -62 24 -66 18 -46" fill="#9dffb0" />
        <ellipse cx="-16" cy="-6" rx="8" ry="10" fill="#10261a" />
        <ellipse cx="16" cy="-6" rx="8" ry="10" fill="#10261a" />
        <circle cx="-13" cy="-10" r="3" fill="#fff" />
        <circle cx="19" cy="-10" r="3" fill="#fff" />
        <ellipse cx="-30" cy="10" rx="7" ry="4" fill="#ff9ad5" opacity="0.7" />
        <ellipse cx="30" cy="10" rx="7" ry="4" fill="#ff9ad5" opacity="0.7" />
        <path d="M-8 14 Q0 22 8 14" stroke="#10261a" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* coquille d'œuf */}
      <path d="M92 168 l10 -14 8 10 8 -12 8 16 Z" fill="#f3ecff" opacity="0.85" />
      {/* cœurs */}
      {[[232, 60, 1], [252, 92, 0.7], [84, 72, 0.8]].map(([x, y, s], i) => (
        <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M0 6 C-10 -4 -18 4 -10 12 L0 20 L10 12 C18 4 10 -4 0 6 Z" fill="#ff7ad9" />
      ))}
    </>
  );
}

function Coffres({ k, accent }: { k: string; accent: string }) {
  // Trois coffres : celui du milieu est ouvert et laisse échapper sa lumière
  const places: [number, number, number, number][] = [[0, 92, 96, 0.56], [2, 176, 96, 0.56], [1, 122, 66, 0.76]];
  return (
    <>
      <ellipse cx="160" cy="178" rx="140" ry="16" fill={accent} opacity="0.12" />
      {places.map(([i, x, y, s]) => (
        <CoffreSvg key={i} id={`${k}-c${i}`} teinte={TEINTES_COFFRES[i]} ouvert={i === 1} cadre={{ x, y, width: 100 * s, height: 113 * s }} />
      ))}
      {[[160, 44, 1.3], [134, 34, 0.8], [188, 36, 0.9]].map(([x, y, r], i) => (
        <path key={i} transform={`translate(${x} ${y}) scale(${r})`} d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill="#ffe7a8" />
      ))}
    </>
  );
}

function Grappin({ accent }: { accent: string }) {
  // Une borne à pinces néon : rail, pince, et la vitrine pleine de petites bestioles
  const bestioles: [number, number, string][] = [[118, 160, "#9dff3d"], [150, 166, "#3df5ff"], [186, 158, "#ff6bd6"], [218, 166, "#9dff3d"], [250, 160, "#b98cff"]];
  return (
    <>
      <rect x="70" y="18" width="210" height="172" rx="16" fill="#12052b" opacity="0.55" stroke={accent} strokeWidth="2.5" />
      <rect x="82" y="30" width="186" height="6" rx="3" fill="#3df5ff" opacity="0.6" />
      <circle cx="175" cy="120" r="34" fill="#ffe066" opacity="0.25" />
      <line x1="200" y1="36" x2="200" y2="92" stroke="#d9d2f2" strokeWidth="2" />
      <rect x="189" y="90" width="22" height="12" rx="4" fill="#2a1a4a" stroke="#3df5ff" strokeWidth="2" />
      <path d="M192 102 L186 120 L192 126 M208 102 L214 120 L208 126" stroke="#d9d2f2" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {bestioles.map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(0.8)`}>
          <path d="M-7 -14 L-11 -22 M7 -14 L11 -22" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="-11" cy="-22" r="2.6" fill="#ffe066" />
          <circle cx="11" cy="-22" r="2.6" fill="#ffe066" />
          <path d="M0 -16 C12 -16 17 -4 17 6 C17 15 9 18 0 18 C-9 18 -17 15 -17 6 C-17 -4 -12 -16 0 -16 Z" fill={c} />
          <circle cx="-5.5" cy="1" r="4.5" fill="#fff" />
          <circle cx="5.5" cy="1" r="4.5" fill="#fff" />
          <circle cx="-5" cy="2" r="2.3" fill="#1a0b2e" />
          <circle cx="6" cy="2" r="2.3" fill="#1a0b2e" />
        </g>
      ))}
      <g transform="translate(232 128)">
        <ellipse rx="20" ry="6" fill="#c9c3e6" stroke="#fff" strokeWidth="1.5" />
        <path d="M-9 -2 A9 9 0 0 1 9 -2 Z" fill="#3df5ff" opacity="0.7" />
      </g>
      <rect x="20" y="132" width="38" height="58" rx="6" fill="#000" opacity="0.4" stroke={accent} strokeWidth="2" />
      <text x="39" y="126" textAnchor="middle" fontSize="9" fontWeight="900" fill={accent} fontFamily="system-ui, sans-serif">SORTIE</text>
    </>
  );
}

function Capsules({ accent }: { accent: string }) {
  // La vraie machine Cosmo-Capsules, avec quelques figurines sorties de leur capsule
  const figs: [string, number, number, number, number][] = [
    ["fig25", 196, 64, 62, -6], ["nibi03", 252, 92, 64, 7], ["fig64", 210, 130, 70, 0],
  ];
  return (
    <>
      <defs>
        <radialGradient id="cc-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={accent} stopOpacity="0.55" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="96" cy="104" rx="88" ry="96" fill="url(#cc-halo)" />
      <ellipse cx="240" cy="120" rx="90" ry="78" fill="url(#cc-halo)" opacity="0.8" />
      <ellipse cx="96" cy="194" rx="56" ry="7" fill="#000" opacity="0.35" />
      <image href="/figurines/machine.webp" x="30" y="8" width="132" height="192" preserveAspectRatio="xMidYMid meet" />
      <image href="/figurines/boule-doree.webp" x="150" y="150" width="34" height="34" />
      <image href="/figurines/boule-rose.webp" x="282" y="150" width="28" height="28" />
      {figs.map(([f, x, y, t, r]) => (
        <image key={f} href={`/figurines/${f}.webp`} x={x - t / 2} y={y - t / 2} width={t} height={t} transform={`rotate(${r} ${x} ${y})`} preserveAspectRatio="xMidYMid meet" />
      ))}
      {[[176, 34, 1], [298, 52, 0.8], [282, 178, 0.7], [168, 112, 0.6]].map(([x, y, k], i) => (
        <path key={i} transform={`translate(${x} ${y}) scale(${k})`} d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill="#ffe7a8" />
      ))}
    </>
  );
}

export default function MiniatureJeu({ id, className = "", anime = false }: Props) {
  const fiche = jeuParId(id);
  if (!fiche) return null;
  const { de, a, accent } = fiche.teinte;
  const k = `mj-${id}`;
  return (
    <svg viewBox="0 0 320 200" className={className} role="img" aria-label={`Illustration du jeu ${fiche.nom}`} preserveAspectRatio="xMidYMid slice">
      <Fond id={k} de={de} a={a} />
      <g className={anime ? "mj-anime" : undefined}>
        {id === "runner" && <Runner k={k} accent={accent} />}
        {id === "reflexes" && <Reflexes accent={accent} />}
        {id === "rythme" && <Rythme k={k} accent={accent} />}
        {id === "constellations" && <Constellations accent={accent} />}
        {id === "memory" && <Memory accent={accent} />}
        {id === "quiz" && <Quiz accent={accent} />}
        {id === "astrododge" && <AstroDodge k={k} accent={accent} />}
        {id === "starcatcher" && <StarCatcher accent={accent} />}
        {id === "cycyword" && <CycyWord accent={accent} />}
        {id === "gratter" && <Gratter k={k} accent={accent} />}
        {id === "compagnon" && <Compagnon accent={accent} />}
        {id === "coffres" && <Coffres k={k} accent={accent} />}
        {id === "grappin" && <Grappin accent={accent} />}
        {id === "capsules" && <Capsules accent={accent} />}
      </g>
    </svg>
  );
}
