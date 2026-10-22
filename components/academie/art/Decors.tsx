// Décors vectoriels PROVISOIRES de l'Académie. Si une illustration
// peinte est renseignée dans data/academie/illustrations.ts (champ
// `src`), elle est affichée à la place.

import { decors } from "@/data/academie/illustrations";
import type { DecorId } from "@/data/academie/types";
import { aleatoire } from "@/lib/academie/couleurs";

export default function Decor({ id, className }: { id: DecorId; className?: string }) {
  const illus = decors[id];
  if (illus.src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={illus.src} alt={illus.alt} className={`h-full w-full object-cover ${className ?? ""}`} />;
  }
  const Dessin = { "academie-crepuscule": AcademieCrepuscule, "cour-apres-midi": CourApresMidi, "salle-astrolabe": SalleAstrolabe }[id];
  return (
    <div className={`h-full w-full ${className ?? ""}`} role="img" aria-label={illus.alt}>
      <Dessin />
    </div>
  );
}

function Etoiles({ n, largeur, hauteur, graine }: { n: number; largeur: number; hauteur: number; graine: number }) {
  const r = aleatoire(graine);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * largeur;
        const y = Math.pow(r(), 1.6) * hauteur;
        const rayon = 0.5 + r() * 1.5;
        const scintille = r() > 0.7;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={rayon}
            fill="#FFF8E8"
            opacity={0.35 + r() * 0.6}
            className={scintille ? "ada-scintille" : undefined}
            style={scintille ? { animationDelay: `${(r() * 5).toFixed(2)}s` } : undefined}
          />
        );
      })}
    </g>
  );
}

/** Fenêtres éclairées : grille avec quelques fenêtres éteintes. */
function Fenetres({ x, y, colonnes, rangees, pasX, pasY, l, h, graine, ogive = false }: {
  x: number; y: number; colonnes: number; rangees: number; pasX: number; pasY: number; l: number; h: number; graine: number; ogive?: boolean;
}) {
  const r = aleatoire(graine);
  const items = [];
  for (let j = 0; j < rangees; j++) {
    for (let i = 0; i < colonnes; i++) {
      const allumee = r() > 0.22;
      const fx = x + i * pasX;
      const fy = y + j * pasY;
      const d = ogive
        ? `M ${fx} ${fy + h} L ${fx} ${fy + l * 0.6} Q ${fx + l / 2} ${fy - l * 0.4} ${fx + l} ${fy + l * 0.6} L ${fx + l} ${fy + h} Z`
        : `M ${fx} ${fy} h ${l} v ${h} h ${-l} Z`;
      items.push(<path key={`${i}-${j}`} d={d} fill={allumee ? "url(#ada-fenetre)" : "#241A3C"} opacity={allumee ? 0.75 + r() * 0.25 : 1} />);
    }
  }
  return <g filter={"url(#ada-halo)"}>{items}</g>;
}

// ============================================================
// ÉCRAN D'ACCUEIL — l'Académie au crépuscule (panoramique)
// ============================================================

function AcademieCrepuscule() {
  const r = aleatoire(7);
  return (
    <svg viewBox="0 0 1920 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="ada-ciel-crep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#090924" />
          <stop offset="34%" stopColor="#1D1650" />
          <stop offset="56%" stopColor="#47296E" />
          <stop offset="72%" stopColor="#97507C" />
          <stop offset="82%" stopColor="#E0946A" />
          <stop offset="90%" stopColor="#F4C682" />
        </linearGradient>
        <radialGradient id="ada-lune-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF1D0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFF1D0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ada-soleil" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#FFD58A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFD58A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ada-fenetre" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE3A0" />
          <stop offset="100%" stopColor="#F2A24E" />
        </linearGradient>
        <linearGradient id="ada-brume" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9B6F0" stopOpacity="0" />
          <stop offset="100%" stopColor="#C9B6F0" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="ada-dome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3A2E5E" />
          <stop offset="45%" stopColor="#231A42" />
          <stop offset="100%" stopColor="#120C26" />
        </linearGradient>
        <filter id="ada-halo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="flou" />
          <feMerge>
            <feMergeNode in="flou" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="ada-halo-lanterne" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD488" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFD488" stopOpacity="0" />
        </radialGradient>
        <filter id="ada-flou-large">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <mask id="ada-croissant">
          <rect width="1920" height="900" fill="black" />
          <circle cx="1520" cy="160" r="44" fill="white" />
          <circle cx="1540" cy="148" r="40" fill="black" />
        </mask>
      </defs>

      <rect width="1920" height="900" fill="url(#ada-ciel-crep)" />
      <Etoiles n={170} largeur={1920} hauteur={520} graine={11} />
      <circle cx="1520" cy="160" r="140" fill="url(#ada-lune-halo)" />
      <rect width="1920" height="900" fill="#FFF3D6" mask="url(#ada-croissant)" />
      <ellipse cx="960" cy="690" rx="900" ry="200" fill="url(#ada-soleil)" />

      {/* Nuages bas */}
      <g fill="#F2A27C" opacity="0.28" filter="url(#ada-flou-large)">
        <ellipse cx="380" cy="560" rx="320" ry="18" />
        <ellipse cx="1400" cy="540" rx="380" ry="16" />
        <ellipse cx="900" cy="590" rx="260" ry="12" />
      </g>

      {/* Collines lointaines */}
      <path d="M0 640 C 220 570 380 600 560 580 C 760 556 900 600 1100 572 C 1320 544 1500 590 1700 566 C 1800 556 1880 570 1920 580 L 1920 900 L 0 900 Z" fill="#3B2558" opacity="0.85" />
      <path d="M0 690 C 300 640 520 660 760 650 C 1000 640 1240 660 1500 640 C 1700 628 1840 650 1920 660 L 1920 900 L 0 900 Z" fill="#24173F" />

      {/* Arbres d'arrière-plan */}
      <g fill="#1A1132">
        {Array.from({ length: 26 }, (_, i) => {
          const x = i < 13 ? 120 + i * 30 + r() * 20 : 1460 + (i - 13) * 30 + r() * 20;
          const h = 40 + r() * 50;
          return <ellipse key={i} cx={x} cy={668 - h / 2} rx={22 + r() * 10} ry={h / 2 + 10} />;
        })}
      </g>

      {/* ---------- L'Académie ---------- */}
      <g>
        {/* Tourelle gauche */}
        <rect x="470" y="520" width="56" height="150" fill="#170F2E" />
        <path d="M462 522 L 498 438 L 534 522 Z" fill="#1E1538" />
        <line x1="498" y1="438" x2="498" y2="414" stroke="#C9A24A" strokeWidth="2" />
        <Fenetres x={486} y={548} colonnes={1} rangees={3} pasX={0} pasY={38} l={22} h={26} graine={3} ogive />

        {/* Internat (aile gauche) */}
        <rect x="520" y="530" width="390" height="140" fill="#160E2C" />
        <path d="M512 532 L 560 486 L 870 486 L 918 532 Z" fill="#1F1639" />
        {[580, 660, 740, 820].map((x) => (
          <path key={x} d={`M ${x} 500 L ${x + 26} 462 L ${x + 52} 500 Z`} fill="#22183F" />
        ))}
        {[592, 672, 752, 832].map((x, i) => (
          <rect key={x} x={x} y={476} width={14} height={18} fill="url(#ada-fenetre)" opacity={i % 2 ? 0.9 : 0.6} filter="url(#ada-halo)" />
        ))}
        <Fenetres x={540} y={548} colonnes={14} rangees={3} pasX={26} pasY={36} l={14} h={22} graine={5} />

        {/* Tour de l'horloge */}
        <rect x="905" y="372" width="112" height="298" fill="#140C29" />
        <path d="M894 376 L 961 232 L 1028 376 Z" fill="#1D1437" />
        <path d="M961 232 L 961 196" stroke="#D2A54A" strokeWidth="3" />
        <circle cx="961" cy="192" r="5" fill="#E8C066" />
        <circle cx="961" cy="420" r="24" fill="url(#ada-fenetre)" filter="url(#ada-halo)" />
        <path d="M961 420 L 961 404 M 961 420 L 972 426" stroke="#3A2610" strokeWidth="2.5" strokeLinecap="round" />
        <Fenetres x={930} y={470} colonnes={2} rangees={3} pasX={42} pasY={56} l={20} h={36} graine={9} ogive />
        <path d="M940 670 L 940 630 Q 961 600 982 630 L 982 670 Z" fill="#F2B060" opacity="0.85" filter="url(#ada-halo)" />

        {/* Grand hall (aile droite) */}
        <rect x="1012" y="508" width="310" height="162" fill="#170F2E" />
        <path d="M1004 510 L 1167 448 L 1330 510 Z" fill="#1F1639" />
        <Fenetres x={1034} y={540} colonnes={7} rangees={1} pasX={40} pasY={0} l={22} h={70} graine={13} ogive />
        <circle cx="1167" cy="482" r="14" fill="url(#ada-fenetre)" opacity="0.9" filter="url(#ada-halo)" />

        {/* Observatoire */}
        <rect x="1330" y="440" width="128" height="230" fill="#150D2B" />
        <path d="M1318 446 C 1318 360 1470 360 1470 446 Z" fill="url(#ada-dome)" />
        <path d="M1384 368 L 1404 368 L 1408 446 L 1380 446 Z" fill="#F3B663" opacity="0.9" filter="url(#ada-halo)" />
        <path d="M1394 400 L 1444 330" stroke="#B48A3E" strokeWidth="9" strokeLinecap="round" />
        <path d="M1318 446 L 1470 446" stroke="#C9A24A" strokeWidth="2" />
        <Fenetres x={1352} y={476} colonnes={3} rangees={3} pasX={32} pasY={56} l={16} h={30} graine={17} ogive />
      </g>

      {/* ---------- Jardins ---------- */}
      <path d="M0 668 L 1920 668 L 1920 900 L 0 900 Z" fill="#110A22" />
      <path d="M0 700 C 400 690 700 694 960 690 C 1220 694 1520 690 1920 700 L 1920 900 L 0 900 Z" fill="#150D29" />
      <path d="M900 900 C 920 820 940 740 955 676 L 967 676 C 982 740 1000 820 1020 900 Z" fill="#B49AD8" opacity="0.13" />
      {[
        [120, 760, 360], [560, 740, 300], [1100, 740, 300], [1480, 760, 360],
        [40, 840, 520], [1080, 840, 560], [300, 710, 200], [1420, 710, 200],
      ].map(([x, y, l], i) => (
        <rect key={i} x={x} y={y} width={l} height={30 + (y - 700) / 4} rx={22} fill={i < 4 ? "#1A1430" : "#0F0B20"} />
      ))}
      {[700, 820, 1100, 1220, 600, 1320].map((x, i) => {
        const y = i < 4 ? 712 : 700;
        return (
          <g key={x}>
            <path d={`M ${x} ${y} L ${x} ${y - 46}`} stroke="#0B0716" strokeWidth="4" />
            <circle cx={x} cy={y - 50} r={6} fill="#FFD488" filter="url(#ada-halo)" />
            <circle cx={x} cy={y - 50} r={34} fill="url(#ada-halo-lanterne)" />
          </g>
        );
      })}

      {/* Arbres de premier plan */}
      <g fill="#07040F">
        <ellipse cx="40" cy="620" rx="150" ry="230" />
        <ellipse cx="200" cy="700" rx="110" ry="160" />
        <ellipse cx="1880" cy="610" rx="160" ry="240" />
        <ellipse cx="1720" cy="720" rx="110" ry="150" />
      </g>

      <rect y="560" width="1920" height="340" fill="url(#ada-brume)" />
    </svg>
  );
}

// ============================================================
// SCÈNE — la cour principale en fin d'après-midi
// ============================================================

function CourApresMidi() {
  const r = aleatoire(23);
  const arches = [0, 1, 2, 3, 4, 5, 6, 7];
  const bannieres = [
    { x: 296, c: "#D9A63E", s: "#7A5414" },
    { x: 616, c: "#A9C7E6", s: "#3E5878" },
    { x: 936, c: "#9A6BE0", s: "#3A1E6B" },
    { x: 1256, c: "#D9A63E", s: "#7A5414" },
  ];
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="ada-ciel-cour" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4C5A94" />
          <stop offset="45%" stopColor="#B07F9E" />
          <stop offset="80%" stopColor="#F0AE78" />
          <stop offset="100%" stopColor="#F9D294" />
        </linearGradient>
        <linearGradient id="ada-dome-cour" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D9A986" />
          <stop offset="45%" stopColor="#8E6A84" />
          <stop offset="100%" stopColor="#5E4664" />
        </linearGradient>
        <linearGradient id="ada-pierre" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#D2A584" />
          <stop offset="60%" stopColor="#A87C6E" />
          <stop offset="100%" stopColor="#6E4E5E" />
        </linearGradient>
        <linearGradient id="ada-pierre-haute" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C49478" />
          <stop offset="100%" stopColor="#7A5664" />
        </linearGradient>
        <linearGradient id="ada-arche" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2B1C33" />
          <stop offset="100%" stopColor="#4A2F3C" />
        </linearGradient>
        <linearGradient id="ada-sol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B88A72" />
          <stop offset="100%" stopColor="#5E4250" />
        </linearGradient>
        <linearGradient id="ada-eau" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E9C79A" />
          <stop offset="40%" stopColor="#6F87A8" />
          <stop offset="100%" stopColor="#3E4E72" />
        </linearGradient>
        <linearGradient id="ada-bronze" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E2B36A" />
          <stop offset="50%" stopColor="#8A6038" />
          <stop offset="100%" stopColor="#4A3022" />
        </linearGradient>
        <linearGradient id="ada-rayon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE7B0" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFE7B0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ada-lanterne" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD58A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFD58A" stopOpacity="0" />
        </radialGradient>
        <filter id="ada-flou-cour">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#ada-ciel-cour)" />

      {/* Toits et dôme de l'observatoire au loin */}
      <path d="M1060 250 C 1060 150 1260 150 1260 250 Z" fill="url(#ada-dome-cour)" />
      <path d="M1150 158 L 1166 158 L 1170 250 L 1146 250 Z" fill="#4A3450" />
      <path d="M0 250 L 120 190 L 240 250 L 300 250 L 380 205 L 460 250 L 1600 250 L 1600 300 L 0 300 Z" fill="#8A6070" />
      <rect x="160" y="160" width="26" height="60" fill="#7A5466" />
      <rect x="1420" y="170" width="26" height="70" fill="#7A5466" />

      {/* Étage supérieur */}
      <rect y="250" width="1600" height="110" fill="url(#ada-pierre-haute)" />
      {Array.from({ length: 16 }, (_, i) => (
        <path
          key={i}
          d={`M ${40 + i * 100} 345 L ${40 + i * 100} 288 Q ${62 + i * 100} 262 ${84 + i * 100} 288 L ${84 + i * 100} 345 Z`}
          fill={i % 3 === 0 ? "#F6CB86" : "#3A2738"}
          opacity={i % 3 === 0 ? 0.85 : 1}
        />
      ))}
      <rect y="352" width="1600" height="14" fill="#E2B28E" opacity="0.6" />

      {/* Arcades */}
      <rect y="360" width="1600" height="300" fill="url(#ada-pierre)" />
      {arches.map((i) => {
        const x = 40 + i * 200;
        return (
          <g key={i}>
            <path d={`M ${x} 660 L ${x} 470 Q ${x + 80} 380 ${x + 160} 470 L ${x + 160} 660 Z`} fill="url(#ada-arche)" />
            <path d={`M ${x} 470 Q ${x + 80} 380 ${x + 160} 470`} stroke="#E8BC94" strokeOpacity="0.5" strokeWidth="4" fill="none" />
            <ellipse cx={x + 80} cy={600} rx={50} ry={20} fill="#F2B26A" opacity="0.12" filter="url(#ada-flou-cour)" />
          </g>
        );
      })}

      {/* Bannières des maisons */}
      {bannieres.map((b, i) => (
        <g key={i}>
          <path d={`M ${b.x} 370 L ${b.x + 48} 370 L ${b.x + 48} 520 L ${b.x + 24} 500 L ${b.x} 520 Z`} fill={b.c} />
          <path d={`M ${b.x} 370 L ${b.x + 16} 370 L ${b.x + 16} 507 L ${b.x} 520 Z`} fill={b.s} opacity="0.35" />
          <circle cx={b.x + 24} cy={420} r={10} fill="none" stroke={b.s} strokeWidth="2" />
          <path d={`M ${b.x + 24} 410 l 2 7 l 7 1 l -5 4 l 2 7 l -6 -4 l -6 4 l 2 -7 l -5 -4 l 7 -1 Z`} fill={b.s} />
          <rect x={b.x - 4} y={364} width={56} height={8} fill="#5A3A2A" />
        </g>
      ))}

      {/* Lierre */}
      <g>
        {[[30, 380, 90], [1420, 360, 110], [820, 380, 50], [1580, 420, 80]].map(([x, y, n], k) =>
          Array.from({ length: n }, (_, i) => (
            <ellipse
              key={`${k}-${i}`}
              cx={x + (r() - 0.3) * 110}
              cy={y + r() * 260}
              rx={6 + r() * 6}
              ry={4 + r() * 4}
              fill={r() > 0.5 ? "#4C6A40" : "#2F4A30"}
              opacity={0.9}
            />
          ))
        )}
      </g>

      {/* Lanternes */}
      {[200, 600, 1000, 1400].map((x) => (
        <g key={x}>
          <circle cx={x} cy={470} r={60} fill="url(#ada-lanterne)" />
          <path d={`M ${x} 440 L ${x} 456`} stroke="#2A1A1A" strokeWidth="2" />
          <path d={`M ${x - 8} 456 L ${x + 8} 456 L ${x + 6} 482 L ${x - 6} 482 Z`} fill="#FFD68E" stroke="#2A1A1A" strokeWidth="2" />
        </g>
      ))}

      {/* Sol pavé en perspective */}
      <path d="M0 660 L 1600 660 L 1600 900 L 0 900 Z" fill="url(#ada-sol)" />
      <g stroke="#4A3040" strokeOpacity="0.28" strokeWidth="1.5">
        {[672, 690, 714, 746, 788, 840].map((y) => (
          <line key={y} x1="0" y1={y} x2="1600" y2={y} />
        ))}
        {Array.from({ length: 21 }, (_, i) => (
          <line key={i} x1={800 + (i - 10) * 70} y1="660" x2={800 + (i - 10) * 260} y2="900" />
        ))}
      </g>
      {/* Ombres longues */}
      <g fill="#3A2238" opacity="0.22">
        {arches.map((i) => (
          <path key={i} d={`M ${200 + i * 200} 660 L ${236 + i * 200} 660 L ${420 + i * 200} 900 L ${330 + i * 200} 900 Z`} />
        ))}
      </g>

      {/* Fontaine */}
      <ellipse cx="800" cy="770" rx="250" ry="56" fill="#6E4F58" />
      <ellipse cx="800" cy="756" rx="250" ry="52" fill="#C8A089" />
      <ellipse cx="800" cy="756" rx="226" ry="40" fill="url(#ada-eau)" />
      <g stroke="#FFF2D6" strokeOpacity="0.45" strokeWidth="2" fill="none">
        <ellipse cx="800" cy="756" rx="120" ry="18" className="ada-ondule" />
        <ellipse cx="800" cy="756" rx="180" ry="28" className="ada-ondule" style={{ animationDelay: "1.5s" }} />
      </g>
      <path d="M770 756 L 776 610 L 824 610 L 830 756 Z" fill="#B48E7A" />
      <path d="M752 612 L 848 612 L 840 594 L 760 594 Z" fill="#D2AC92" />
      {/* Statue tenant un astrolabe */}
      <path d="M778 594 C 772 540 780 500 788 480 C 780 470 784 452 800 450 C 816 452 820 470 812 480 C 820 500 828 540 822 594 Z" fill="url(#ada-bronze)" />
      <path d="M808 486 C 830 470 842 440 840 418" stroke="url(#ada-bronze)" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="840" cy="396" r="26" fill="none" stroke="url(#ada-bronze)" strokeWidth="5" />
      <ellipse cx="840" cy="396" rx="26" ry="9" fill="none" stroke="#E2B36A" strokeWidth="3" transform="rotate(-25 840 396)" />
      <circle cx="840" cy="396" r="4" fill="#F3D489" />

      {/* Rayons de soleil */}
      <g className="ada-respire">
        <path d="M-100 0 L 200 0 L 900 900 L 500 900 Z" fill="url(#ada-rayon)" />
        <path d="M260 0 L 380 0 L 1100 900 L 900 900 Z" fill="url(#ada-rayon)" opacity="0.6" />
      </g>

      {/* Poussières dorées */}
      {Array.from({ length: 22 }, (_, i) => (
        <circle
          key={i}
          cx={r() * 1600}
          cy={300 + r() * 500}
          r={1 + r() * 2}
          fill="#FFE6B0"
          opacity={0.5}
          className="ada-flotte"
          style={{ animationDelay: `${(r() * 6).toFixed(2)}s` }}
        />
      ))}
    </svg>
  );
}

// ============================================================
// CÉRÉMONIE — la Grande Salle et l'Astrolabe
// ============================================================

function SalleAstrolabe() {
  const r = aleatoire(41);
  const constellation = [
    [-90, -40], [-40, -80], [10, -50], [70, -90], [110, -20], [40, 30], [-30, 60], [-100, 30],
  ];
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="ada-salle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A0920" />
          <stop offset="70%" stopColor="#171236" />
          <stop offset="100%" stopColor="#0C0A1C" />
        </linearGradient>
        <linearGradient id="ada-vitrail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4D63A8" />
          <stop offset="60%" stopColor="#2A3270" />
          <stop offset="100%" stopColor="#181C48" />
        </linearGradient>
        <radialGradient id="ada-lueur-astro" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F3D489" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#9A6BE0" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#9A6BE0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ada-flamme" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE2A0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFB050" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ada-faisceau" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9DB2F0" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#9DB2F0" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#ada-salle)" />

      {/* Vitraux */}
      {[160, 450, 740, 1030, 1320].map((x, i) => (
        <g key={x}>
          <path d={`M ${x} 560 L ${x} 220 Q ${x + 60} 90 ${x + 120} 220 L ${x + 120} 560 Z`} fill="url(#ada-vitrail)" opacity={i === 2 ? 0.55 : 0.85} />
          <path d={`M ${x + 60} 130 L ${x + 60} 560 M ${x} 330 L ${x + 120} 330 M ${x} 450 L ${x + 120} 450`} stroke="#0B0920" strokeWidth="5" />
          <circle cx={x + 60} cy={230} r={24} fill="none" stroke="#0B0920" strokeWidth="5" />
          <path d={`M ${x} 560 L ${x + 120} 560 L ${x + 260} 900 L ${x - 120} 900 Z`} fill="url(#ada-faisceau)" />
        </g>
      ))}
      {/* Colonnes */}
      {[100, 380, 670, 960, 1250, 1540].map((x) => (
        <g key={x}>
          <rect x={x - 22} y={60} width={44} height={620} fill="#0D0A1E" />
          <rect x={x - 22} y={60} width={8} height={620} fill="#2A2350" opacity="0.6" />
        </g>
      ))}

      {/* Sol */}
      <path d="M0 680 L 1600 680 L 1600 900 L 0 900 Z" fill="#0E0B20" />
      <g stroke="#3A3070" strokeOpacity="0.25">
        {Array.from({ length: 17 }, (_, i) => (
          <line key={i} x1={800 + (i - 8) * 80} y1="680" x2={800 + (i - 8) * 300} y2="900" />
        ))}
      </g>
      <ellipse cx="800" cy="760" rx="300" ry="40" fill="#F3D489" opacity="0.07" />

      {/* Bougies flottantes */}
      {Array.from({ length: 34 }, (_, i) => {
        const x = r() * 1600;
        const y = 80 + r() * 420;
        const echelle = 0.6 + r() * 0.6;
        return (
          <g key={i} className="ada-flotte" style={{ animationDelay: `${(r() * 6).toFixed(2)}s` }}>
            <circle cx={x} cy={y - 8 * echelle} r={16 * echelle} fill="url(#ada-flamme)" />
            <rect x={x - 3 * echelle} y={y} width={6 * echelle} height={22 * echelle} rx={2} fill="#EDE2CC" />
            <ellipse cx={x} cy={y - 4 * echelle} rx={2.4 * echelle} ry={5 * echelle} fill="#FFE7A8" />
          </g>
        );
      })}

      {/* L'Astrolabe */}
      <circle cx="800" cy="400" r="320" fill="url(#ada-lueur-astro)" />
      <g transform="translate(800 400)">
        <g className="ada-rotation-lente">
          <circle r="200" fill="none" stroke="#C9A24A" strokeWidth="6" />
          <circle r="188" fill="none" stroke="#8A6420" strokeWidth="1.5" strokeDasharray="2 10" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 24;
            return <line key={i} x1={Math.cos(a) * 192} y1={Math.sin(a) * 192} x2={Math.cos(a) * 206} y2={Math.sin(a) * 206} stroke="#E2B85A" strokeWidth="2" />;
          })}
        </g>
        <ellipse rx="200" ry="60" fill="none" stroke="#E2B85A" strokeWidth="3" transform="rotate(-20)" opacity="0.8" />
        <g className="ada-rotation-inverse">
          <ellipse rx="150" ry="150" fill="none" stroke="#B9C3E0" strokeWidth="2" opacity="0.6" />
          <ellipse rx="60" ry="150" fill="none" stroke="#B9C3E0" strokeWidth="2" opacity="0.5" />
        </g>
        <polyline points={constellation.map((p) => p.join(",")).join(" ")} fill="none" stroke="#D2B8FA" strokeOpacity="0.5" strokeWidth="1.5" />
        {constellation.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} fill="#FFF3D6" className="ada-scintille" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
        <circle r="16" fill="#F3D489" opacity="0.9" />
        <circle r="30" fill="#F3D489" opacity="0.2" />
      </g>
    </svg>
  );
}
