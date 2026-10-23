// ============================================================
// HABITAT DU COMPAGNON — ambiances et décorations illustrées
// ============================================================
// Achetées avec les bonbons cosmiques 🍬 et installées dans la scène.
// Un objet par emplacement : fond (ambiance), plafond, mur, sol, gauche, droite.
// Images : public/compagnon/habitats/<ambiance>.webp (4 pièces alignées : même sol,
// mêmes murs, mêmes hublots) et public/compagnon/decos/<objet>.webp.

import type { CSSProperties } from "react";

export type EmplacementDeco = "fond" | "plafond" | "mur" | "sol" | "gauche" | "droite";
export type Habitat = Partial<Record<EmplacementDeco, string>>;

export const EMPLACEMENTS_DECO: { key: EmplacementDeco; label: string }[] = [
  { key: "fond", label: "Ambiance" },
  { key: "plafond", label: "Plafond" },
  { key: "mur", label: "Mur" },
  { key: "sol", label: "Sol" },
  { key: "gauche", label: "À gauche" },
  { key: "droite", label: "À droite" },
];

// (les clés des ambiances restent celles des anciens fonds : les achats déjà faits sont gardés)
export const DECOS: { key: string; nom: string; emplacement: EmplacementDeco; prix: number }[] = [
  { key: "nebuleuse", nom: "Cocon nébuleux", emplacement: "fond", prix: 60 },
  { key: "ocean", nom: "Station lunaire", emplacement: "fond", prix: 70 },
  { key: "couchant", nom: "Refuge martien", emplacement: "fond", prix: 80 },
  { key: "aurore", nom: "Jardin d'aurore", emplacement: "fond", prix: 90 },
  { key: "guirlande", nom: "Guirlande d'étoiles", emplacement: "plafond", prix: 35 },
  { key: "mobile", nom: "Mobile de planètes", emplacement: "plafond", prix: 50 },
  { key: "lune", nom: "Lampe lune", emplacement: "plafond", prix: 60 },
  { key: "hublot", nom: "Hublot sur la Terre", emplacement: "mur", prix: 55 },
  { key: "poster", nom: "Tenture planète", emplacement: "mur", prix: 40 },
  { key: "etagere", nom: "Étagère à trophées", emplacement: "mur", prix: 65 },
  { key: "tapis", nom: "Tapis lune", emplacement: "sol", prix: 30 },
  { key: "nuage", nom: "Coussin nuage", emplacement: "sol", prix: 45 },
  { key: "herbe", nom: "Herbe alien", emplacement: "sol", prix: 35 },
  { key: "plante", nom: "Plante cosmique", emplacement: "gauche", prix: 40 },
  { key: "lave", nom: "Lampe à lave", emplacement: "gauche", prix: 45 },
  { key: "telescope", nom: "Télescope", emplacement: "gauche", prix: 75 },
  { key: "arcade", nom: "Mini borne d'arcade", emplacement: "droite", prix: 90 },
  { key: "aquarium", nom: "Aquarium d'étoiles", emplacement: "droite", prix: 80 },
  { key: "coffre", nom: "Coffre au trésor", emplacement: "droite", prix: 55 },
];

export const decoInfo = (k: string) => DECOS.find((d) => d.key === k);

const AMBIANCE: Record<string, string> = { nebuleuse: "nebuleuse", ocean: "lune", couchant: "mars", aurore: "aurore" };
const img = (k: string) => `url(/compagnon/habitats/${AMBIANCE[k]}.webp)`;

/** Ambiances : remplacent le fond de la scène (la nuit, la pièce s'assombrit). */
export const FONDS: Record<string, { jour: string; nuit: string }> = Object.fromEntries(
  Object.keys(AMBIANCE).map((k) => [k, { jour: `${img(k)} center / cover no-repeat`, nuit: `linear-gradient(#0b0420c4, #0b0420a8), ${img(k)} center / cover no-repeat` }])
);

// Place et taille de chaque objet dans la pièce (en % de la scène). Les objets du sol sont plus grands
// que ceux posés sur les côtés (le coussin nuage est plus large que le télescope…).
const PLACE: Record<string, CSSProperties & { anim?: string }> = {
  guirlande: { right: "12%", top: "-2%", height: "26%" },
  mobile: { left: "30%", top: "-1%", height: "28%", anim: "hb-balance" },
  lune: { right: "15%", top: "-1%", height: "30%", anim: "hb-balance" },
  hublot: { left: "17%", top: "20%", height: "27%" },
  poster: { left: "18%", top: "17%", height: "30%" },
  etagere: { right: "16%", top: "33%", height: "19%" },
  tapis: { left: "50%", bottom: "1%", height: "22%", transform: "translateX(-50%)" },
  nuage: { left: "50%", bottom: "2%", height: "27%", transform: "translateX(-50%)" },
  herbe: { left: "50%", bottom: "1%", height: "25%", transform: "translateX(-50%)" },
  plante: { left: "7%", bottom: "8%", height: "31%" },
  lave: { left: "9%", bottom: "8%", height: "30%", anim: "hb-lueur" },
  telescope: { left: "6%", bottom: "8%", height: "34%" },
  arcade: { right: "7%", bottom: "8%", height: "36%", anim: "hb-lueur" },
  aquarium: { right: "7%", bottom: "8%", height: "30%" },
  coffre: { right: "7%", bottom: "8%", height: "24%" },
};

// proportions des images (largeur / hauteur)
const TAILLE_IMG: Record<string, number> = {
  guirlande: 536 / 234, mobile: 363 / 275, lune: 211 / 326, hublot: 367 / 314, poster: 233 / 284, etagere: 541 / 227, tapis: 571 / 197, nuage: 454 / 193,
  herbe: 431 / 206, plante: 238 / 269, lave: 108 / 259, telescope: 250 / 271, arcade: 223 / 274, aquarium: 242 / 252, coffre: 262 / 218,
};

/** Point lumineux qui scintille (en % de l'objet). */
function Lueur({ x, y, t = 9, c = "#ffe7a8", d = 0 }: { x: number; y: number; t?: number; c?: string; d?: number }) {
  return <span className="hb-luciole" style={{ left: `${x}%`, top: `${y}%`, width: `${t}%`, background: `radial-gradient(circle, #fff 0%, ${c} 28%, ${c}00 70%)`, animationDelay: `${d}s` }} />;
}

// Effets animés posés sur chaque objet : lueurs, bulles, poissons, écran…
function Effets({ k }: { k: string }) {
  switch (k) {
    case "lave":
      return (
        <>
          <span className="hb-halo" style={{ left: "-60%", top: "-10%", width: "220%", height: "90%", background: "radial-gradient(closest-side, rgba(255,120,220,.5), rgba(255,120,220,0))" }} />
          <span className="hb-zone" style={{ left: "22%", top: "12%", width: "56%", height: "46%", borderRadius: "40% 40% 30% 30%" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="hb-goutte" style={{ left: `${10 + ((i * 37) % 70)}%`, width: `${26 + (i % 3) * 10}%`, animationDuration: `${7 + i * 1.7}s`, animationDelay: `${-i * 2.3}s` }} />
            ))}
          </span>
        </>
      );
    case "aquarium":
      return (
        <span className="hb-zone" style={{ left: "11%", top: "21%", width: "79%", height: "54%", borderRadius: "45% 45% 35% 35%" }}>
          <span className="hb-reflet-eau" />
          {[0, 1].map((i) => (
            <span key={i} className="hb-poisson" style={{ top: `${28 + i * 30}%`, animationDuration: `${9 + i * 4}s`, animationDelay: `${-i * 5}s` }}>
              <svg viewBox="0 0 40 20" width="100%" height="100%"><path d="M4 10 Q16 0 28 10 Q16 20 4 10 Z" fill={i ? "#ffb3e0" : "#ffe27a"} /><path d="M28 10 L38 3 L36 10 L38 17 Z" fill={i ? "#ff8fd0" : "#ffc94a"} /><circle cx="10" cy="9" r="1.6" fill="#2b1640" /></svg>
            </span>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="hb-bulle-eau" style={{ left: `${18 + i * 20}%`, width: `${5 + (i % 2) * 3}%`, animationDuration: `${3.2 + i * 0.7}s`, animationDelay: `${-i * 0.9}s` }} />
          ))}
        </span>
      );
    case "arcade":
      return (
        <span className="hb-zone hb-ecran" style={{ left: "26%", top: "22%", width: "48%", height: "21%", borderRadius: "6%" }}>
          <span className="hb-defile" />
          <span className="hb-vaisseau" />
          <span className="hb-scan" />
        </span>
      );
    case "herbe":
      return (
        <>
          <Lueur x={23} y={-3} t={14} c="#8ff3ff" /><Lueur x={50} y={3} t={13} c="#8ff3ff" d={0.8} /><Lueur x={60} y={-2} t={13} c="#8ff3ff" d={1.6} />
          <Lueur x={6} y={44} t={9} d={0.4} /><Lueur x={86} y={60} t={9} d={1.2} /><Lueur x={36} y={70} t={8} d={2} />
        </>
      );
    case "plante":
      return (<><Lueur x={12} y={-2} t={30} c="#ff9fe0" /><Lueur x={65} y={18} t={28} c="#ff9fe0" d={1} /><Lueur x={41} y={37} t={26} c="#ff9fe0" d={2} /></>);
    case "guirlande":
      return (<>{[[3, 40], [21, 64], [70, 42], [53, 62], [36, 70], [87, 38]].map(([x, y], i) => <Lueur key={i} x={x} y={y} t={13} d={i * 0.45} />)}</>);
    case "lune":
      return (<><span className="hb-halo" style={{ left: "-25%", top: "15%", width: "150%", height: "85%", background: "radial-gradient(closest-side, rgba(255,230,150,.45), rgba(255,230,150,0))" }} /><Lueur x={42} y={30} t={26} d={0.5} /><Lueur x={60} y={84} t={30} d={1.4} /><Lueur x={10} y={52} t={22} c="#ffb3e0" d={2.1} /></>);
    case "mobile":
      return (<>{[[5, 42], [83, 40], [55, 75], [20, 70], [60, 30]].map(([x, y], i) => <Lueur key={i} x={x} y={y} t={14} d={i * 0.6} />)}</>);
    case "hublot":
      return (
        <span className="hb-zone" style={{ left: "17%", top: "13%", width: "66%", height: "77%", borderRadius: "50%" }}>
          <span className="hb-nuages" /><Lueur x={22} y={20} t={10} c="#bfe3ff" /><Lueur x={68} y={12} t={8} c="#bfe3ff" d={1.3} />
        </span>
      );
    case "telescope":
      return (<><Lueur x={70} y={4} t={20} c="#d6b3ff" /><Lueur x={68} y={48} t={26} d={0.9} /></>);
    case "poster":
      return (<>{[[18, 22], [74, 18], [70, 70], [22, 74]].map(([x, y], i) => <Lueur key={i} x={x} y={y} t={14} d={i * 0.7} />)}</>);
    case "etagere":
      return (<><Lueur x={45} y={2} t={10} d={0} /><Lueur x={58} y={22} t={11} d={0.9} /><Lueur x={16} y={10} t={9} c="#d6b3ff" d={1.6} /><Lueur x={80} y={5} t={9} c="#d6b3ff" d={2.2} /></>);
    case "nuage":
      return (<>{[[48, 8], [70, 28], [18, 40], [36, 60]].map(([x, y], i) => <Lueur key={i} x={x} y={y} t={12} d={i * 0.8} />)}</>);
    case "tapis":
      return (<>{[[16, 22], [32, 45], [62, 30], [80, 52]].map(([x, y], i) => <Lueur key={i} x={x} y={y} t={8} d={i * 0.8} />)}</>);
    case "coffre":
      return (<><span className="hb-zone" style={{ inset: 0 }}><span className="hb-brillance" /></span><Lueur x={44} y={42} t={16} d={0.5} /></>);
    default:
      return null;
  }
}

const BOUGE: Record<string, string> = { herbe: "hb-ondule", plante: "hb-feuilles" };

function Objet({ k }: { k: string }) {
  const p = PLACE[k];
  if (!p) return null;
  const { anim, ...style } = p;
  return (
    <span aria-hidden className={anim} style={{ position: "absolute", pointerEvents: "none", aspectRatio: String(TAILLE_IMG[k] || 1), ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/compagnon/decos/${k}.webp`} alt="" draggable={false} className={BOUGE[k]} style={{ display: "block", width: "100%", height: "100%", filter: "drop-shadow(0 6px 10px rgba(10,4,30,.35))" }} />
      <Effets k={k} />
    </span>
  );
}

// ── La vue par les fenêtres des ambiances (mêmes fenêtres dans les 4 pièces) ──
function VueFenetres({ fond }: { fond: string }) {
  const amb = AMBIANCE[fond];
  if (!amb) return null;
  const etoiles = [[30, 120], [62, 210], [18, 300], [50, 380], [1150, 140], [1180, 260], [1135, 330], [1170, 400]];
  return (
    <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <defs>
        <clipPath id="hb-fen"><rect x="-40" y="64" width="126" height="376" rx="44" /><rect x="1114" y="64" width="126" height="376" rx="44" /></clipPath>
        <filter id="hb-flou" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      <g clipPath="url(#hb-fen)">
        {amb === "nebuleuse" && (
          <g filter="url(#hb-flou)" opacity=".55">
            <ellipse className="hb-derive" cx="40" cy="260" rx="70" ry="40" fill="#ff8ad8" />
            <ellipse className="hb-derive2" cx="1160" cy="200" rx="70" ry="44" fill="#a98bff" />
            <ellipse className="hb-derive2" cx="20" cy="380" rx="60" ry="30" fill="#b48cff" />
          </g>
        )}
        {amb === "mars" && (
          <g filter="url(#hb-flou)" opacity=".5">
            <ellipse className="hb-vent" cx="0" cy="300" rx="110" ry="18" fill="#ffd2a8" />
            <ellipse className="hb-vent2" cx="1150" cy="340" rx="110" ry="16" fill="#ffc28f" />
            <ellipse className="hb-vent" cx="1150" cy="180" rx="90" ry="14" fill="#ffe0c4" />
          </g>
        )}
        {amb === "aurore" && (
          <g filter="url(#hb-flou)" opacity=".6">
            <path className="hb-aurore" d="M-40 150 Q20 90 90 170 L90 230 Q20 160 -40 220 Z" fill="#7dffc8" />
            <path className="hb-aurore2" d="M1110 120 Q1170 70 1240 140 L1240 200 Q1170 140 1110 190 Z" fill="#8ee7ff" />
          </g>
        )}
        {amb === "lune" && <line className="hb-filante" x1="1120" y1="110" x2="1160" y2="90" stroke="#fff" strokeWidth="3" strokeLinecap="round" />}
        {etoiles.map(([x, y], i) => (
          <circle key={i} className="hb-scint" cx={x} cy={y} r={amb === "mars" ? 1.6 : 2.4} fill="#fff" style={{ animationDelay: `${i * 0.37}s` }} />
        ))}
      </g>
    </svg>
  );
}

/** Toutes les décorations installées, à placer DANS la scène (derrière la créature). */
export function DecorScene({ habitat }: { habitat: Habitat }) {
  return (
    <>
      <style>{`
        .hb-balance{transform-origin:50% 0;animation:hbBal 6s ease-in-out infinite}@keyframes hbBal{50%{transform:rotate(2.5deg)}}
        .hb-luciole{position:absolute;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);mix-blend-mode:screen;animation:hbLuc 2.6s ease-in-out infinite}
        @keyframes hbLuc{0%,100%{opacity:.25;scale:.7}50%{opacity:1;scale:1.15}}
        .hb-halo{position:absolute;pointer-events:none;mix-blend-mode:screen;animation:hbHalo 3.6s ease-in-out infinite}@keyframes hbHalo{50%{opacity:.45}}
        .hb-zone{position:absolute;overflow:hidden}
        .hb-goutte{position:absolute;bottom:-30%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff2fb,#ffb3ea 45%,#ff7fd6);opacity:.85;animation:hbGoutte 8s ease-in-out infinite}
        @keyframes hbGoutte{0%{transform:translateY(0) scale(.8,1.1)}50%{transform:translateY(-260%) scale(1.1,.9)}100%{transform:translateY(0) scale(.8,1.1)}}
        .hb-reflet-eau{position:absolute;inset:-20% -50%;background:repeating-linear-gradient(100deg,rgba(255,255,255,0) 0 22px,rgba(255,255,255,.14) 30px,rgba(255,255,255,0) 40px);animation:hbEau 6s linear infinite}
        @keyframes hbEau{to{transform:translateX(80px)}}
        .hb-poisson{position:absolute;left:0;width:16%;aspect-ratio:2;animation:hbNage 10s ease-in-out infinite}
        @keyframes hbNage{0%{transform:translateX(-120%) scaleX(1)}45%{transform:translateX(560%) scaleX(1)}50%{transform:translateX(560%) scaleX(-1)}95%{transform:translateX(-120%) scaleX(-1)}100%{transform:translateX(-120%) scaleX(1)}}
        .hb-bulle-eau{position:absolute;bottom:-10%;aspect-ratio:1;border-radius:50%;border:1px solid rgba(255,255,255,.8);background:rgba(255,255,255,.18);animation:hbBulleEau 3.5s ease-in infinite}
        @keyframes hbBulleEau{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(-700%) translateX(20%);opacity:0}}
        .hb-ecran{background:#140a33;box-shadow:inset 0 0 12px #6bc4ff88,0 0 16px #6bc4ff55;animation:hbEcran 2.2s ease-in-out infinite}
        @keyframes hbEcran{50%{box-shadow:inset 0 0 16px #a98bffaa,0 0 24px #a98bff77}}
        .hb-defile{position:absolute;inset:0;background:radial-gradient(circle,#fff 0 1px,transparent 1.5px) 0 0/14px 12px,radial-gradient(circle,#ffe27a 0 1px,transparent 1.5px) 7px 5px/22px 18px;animation:hbDefile 1.6s linear infinite}
        @keyframes hbDefile{to{background-position:-14px 0,-15px 5px}}
        .hb-vaisseau{position:absolute;left:18%;top:42%;width:14%;aspect-ratio:1.4;background:linear-gradient(90deg,#ff7fd6,#ffe27a);clip-path:polygon(0 0,100% 50%,0 100%,22% 50%);animation:hbVaisseau 2.8s ease-in-out infinite}
        @keyframes hbVaisseau{25%{transform:translateY(-70%)}75%{transform:translateY(70%)}}
        .hb-scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.25) 0 1px,transparent 1px 3px)}
        .hb-ondule{transform-origin:50% 100%;animation:hbOnd 4s ease-in-out infinite}@keyframes hbOnd{0%,100%{transform:skewX(0)}50%{transform:skewX(3.5deg)}}
        .hb-feuilles{transform-origin:50% 92%;animation:hbFeuilles 5s ease-in-out infinite}@keyframes hbFeuilles{0%,100%{transform:rotate(-1.2deg)}50%{transform:rotate(1.4deg)}}
        .hb-nuages{position:absolute;left:-60%;right:-60%;top:58%;height:30%;background:radial-gradient(ellipse 18% 60% at 20% 60%,#fff 30%,#fff0 70%),radial-gradient(ellipse 14% 50% at 45% 50%,#fff 30%,#fff0 70%),radial-gradient(ellipse 20% 55% at 75% 65%,#fff 30%,#fff0 70%);opacity:.6;filter:blur(1.5px);animation:hbNuages 16s linear infinite}
        @keyframes hbNuages{from{transform:translateX(-18%)}to{transform:translateX(18%)}}
        .hb-brillance{position:absolute;top:-20%;bottom:-20%;width:18%;left:-30%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0));transform:skewX(-18deg);animation:hbBrille 5s ease-in-out infinite;mix-blend-mode:screen}
        @keyframes hbBrille{0%,55%{left:-30%}85%,100%{left:120%}}
        .hb-scint{animation:hbScint 2.4s ease-in-out infinite}@keyframes hbScint{50%{opacity:.2}}
        .hb-derive{animation:hbDer 14s ease-in-out infinite}@keyframes hbDer{50%{transform:translate(20px,-60px)}}
        .hb-derive2{animation:hbDer2 18s ease-in-out infinite}@keyframes hbDer2{50%{transform:translate(-20px,70px)}}
        .hb-vent{animation:hbVent 12s linear infinite}@keyframes hbVent{from{transform:translateX(-160px)}to{transform:translateX(160px)}}
        .hb-vent2{animation:hbVent 17s linear infinite reverse}
        .hb-aurore{animation:hbAur 7s ease-in-out infinite}@keyframes hbAur{50%{transform:translateY(30px) skewY(-8deg);opacity:.5}}
        .hb-aurore2{animation:hbAur 9s ease-in-out infinite reverse}
        .hb-filante{opacity:0;animation:hbFil 7s ease-in infinite}@keyframes hbFil{0%,80%{opacity:0;transform:translate(0,0)}84%{opacity:1}100%{opacity:0;transform:translate(-90px,60px)}}
        @media (prefers-reduced-motion: reduce){[class*="hb-"]{animation:none!important}}
      `}</style>
      {habitat.fond && <VueFenetres fond={habitat.fond} />}
      {(["mur", "plafond", "sol", "gauche", "droite"] as EmplacementDeco[]).map((em) => (habitat[em] ? <Objet key={em} k={habitat[em]!} /> : null))}
    </>
  );
}

/** Petite vignette pour la boutique. */
export function DecoApercu({ k }: { k: string }) {
  const d = decoInfo(k);
  if (!d) return null;
  if (d.emplacement === "fond")
    return <span aria-hidden className="block h-[52px] w-[76px] rounded-xl border border-white/15" style={{ background: FONDS[k]?.jour }} />;
  return (
    <span aria-hidden className="flex h-[56px] w-[84px] items-center justify-center rounded-xl bg-[#1a0f38]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/compagnon/decos/${k}.webp`} alt="" className="max-h-[50px] max-w-[76px] object-contain" draggable={false} />
    </span>
  );
}
