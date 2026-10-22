// Les 24 Cosmo-Copains : figurines kawaii originales de la galaxie Cycylive (SVG, aucune image).
// Chaque figurine = un corps, une couleur, des oreilles et un accessoire. viewBox -50 -50 100 100.

export type Rarete = "commune" | "peu" | "rare" | "epique" | "legendaire" | "mythique";
type Corps = "rond" | "goutte" | "mochi" | "nuage";
type Oreilles = "aucune" | "antennes" | "lapin" | "chat" | "renard" | "panda" | "cornes" | "plumes" | "branchies" | "parabole" | "bosses" | "corne";
type Accessoire = "aucun" | "lune" | "queue" | "crateres" | "pepites" | "bulles" | "petales" | "anneau" | "etoile" | "casque" | "tentacules" | "ailes" | "criniere" | "jet" | "eclipse" | "feu" | "cristaux" | "nageoire" | "astronaute" | "robot";
type Def = { corps: Corps; c: string; c2: string; oreilles: Oreilles; acc: Accessoire; joues?: string };

export const COULEUR_RARETE: Record<Rarete, string> = { commune: "#ffb3d6", peu: "#c9a8ff", rare: "#7fd0ff", epique: "#b26bff", legendaire: "#ffd23f", mythique: "#ff6bd6" };
export const NOM_RARETE: Record<Rarete, string> = { commune: "Commune", peu: "Peu commune", rare: "Rare", epique: "Épique", legendaire: "Légendaire", mythique: "Mythique" };

const DEFS: Record<string, Def> = {
  pompon: { corps: "rond", c: "#ffd1e8", c2: "#ffb3d6", oreilles: "antennes", acc: "lune" },
  bulle: { corps: "goutte", c: "#bfe9ff", c2: "#8fd6ff", oreilles: "aucune", acc: "queue" },
  mochi: { corps: "mochi", c: "#ece4ff", c2: "#cfc2f2", oreilles: "aucune", acc: "crateres" },
  nuage: { corps: "nuage", c: "#fff6d6", c2: "#ffe7a3", oreilles: "aucune", acc: "pepites" },
  choupi: { corps: "rond", c: "#c8ffe0", c2: "#93f0c0", oreilles: "parabole", acc: "aucun" },
  gelee: { corps: "goutte", c: "#e3c2ff", c2: "#c99bff", oreilles: "aucune", acc: "bulles" },
  petale: { corps: "rond", c: "#ffd6e5", c2: "#ff9fc4", oreilles: "aucune", acc: "petales" },
  biscuit: { corps: "rond", c: "#ffd9a8", c2: "#f5b56b", oreilles: "aucune", acc: "anneau" },
  lapin: { corps: "mochi", c: "#f6f1ff", c2: "#e0d3ff", oreilles: "lapin", acc: "lune" },
  chat: { corps: "rond", c: "#ffd0a3", c2: "#ffad6b", oreilles: "chat", acc: "anneau" },
  meduse: { corps: "goutte", c: "#ffb3f2", c2: "#ff7ae6", oreilles: "aucune", acc: "tentacules" },
  renard: { corps: "rond", c: "#ffb486", c2: "#ff8a4c", oreilles: "renard", acc: "etoile" },
  panda: { corps: "rond", c: "#ffffff", c2: "#3b2f55", oreilles: "panda", acc: "casque" },
  grenouille: { corps: "mochi", c: "#a8ffbd", c2: "#6ee891", oreilles: "bosses", acc: "etoile" },
  dragonnet: { corps: "goutte", c: "#9fe6ff", c2: "#5fc8f5", oreilles: "cornes", acc: "ailes" },
  licorne: { corps: "rond", c: "#fff8ff", c2: "#ffd6f5", oreilles: "corne", acc: "criniere" },
  baleine: { corps: "mochi", c: "#9cc0ff", c2: "#6a96f5", oreilles: "aucune", acc: "jet" },
  hibou: { corps: "rond", c: "#a993ff", c2: "#7d5cf0", oreilles: "plumes", acc: "eclipse" },
  axolotl: { corps: "rond", c: "#ffc2dc", c2: "#ff8fbf", oreilles: "branchies", acc: "aucun" },
  phenix: { corps: "goutte", c: "#ffd36b", c2: "#ff8f3d", oreilles: "plumes", acc: "feu" },
  golem: { corps: "mochi", c: "#bdf2ff", c2: "#7fd8f5", oreilles: "aucune", acc: "cristaux" },
  sirene: { corps: "goutte", c: "#9ff5e0", c2: "#4fd9b8", oreilles: "aucune", acc: "nageoire" },
  minicycy: { corps: "rond", c: "#ffe4d6", c2: "#b57cff", oreilles: "aucune", acc: "astronaute" },
  cycybot: { corps: "rond", c: "#f3ecff", c2: "#3df5ff", oreilles: "aucune", acc: "robot" },
};

function Visage({ y = 4, joues = "#ff8fbf", dodo = false }: { y?: number; joues?: string; dodo?: boolean }) {
  return (
    <g transform={`translate(0 ${y})`}>
      {dodo ? (
        <path d="M-15 -2 q4 4 8 0 M7 -2 q4 4 8 0" stroke="#2b1640" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx="-11" cy="-2" rx="4.6" ry="5.6" fill="#2b1640" />
          <ellipse cx="11" cy="-2" rx="4.6" ry="5.6" fill="#2b1640" />
          <circle cx="-9.4" cy="-4.4" r="1.8" fill="#fff" />
          <circle cx="12.6" cy="-4.4" r="1.8" fill="#fff" />
          <circle cx="-12.2" cy="0" r=".9" fill="#fff" />
          <circle cx="9.8" cy="0" r=".9" fill="#fff" />
        </>
      )}
      <path d="M-3.5 5 Q0 8.5 3.5 5" stroke="#2b1640" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="-19" cy="5" rx="5" ry="3" fill={joues} opacity=".55" />
      <ellipse cx="19" cy="5" rx="5" ry="3" fill={joues} opacity=".55" />
    </g>
  );
}

function CorpsForme({ corps, c, c2 }: { corps: Corps; c: string; c2: string }) {
  const d =
    corps === "goutte" ? "M0 -34 C18 -20 32 -2 32 14 C32 30 18 38 0 38 C-18 38 -32 30 -32 14 C-32 -2 -18 -20 0 -34 Z"
    : corps === "mochi" ? "M-36 22 C-38 -4 -22 -26 0 -26 C22 -26 38 -4 36 22 C35 34 20 38 0 38 C-20 38 -35 34 -36 22 Z"
    : corps === "nuage" ? "M-30 30 C-42 30 -42 10 -30 8 C-32 -10 -14 -18 -6 -10 C0 -26 26 -22 26 -4 C40 -4 42 18 32 24 C34 34 22 38 12 34 C4 40 -10 40 -16 34 C-22 38 -30 36 -30 30 Z"
    : "M0 -32 C22 -32 36 -14 36 6 C36 26 20 38 0 38 C-20 38 -36 26 -36 6 C-36 -14 -22 -32 0 -32 Z";
  return (
    <>
      <path d={d} fill={c} stroke={c2} strokeWidth="2.5" />
      <ellipse cx="0" cy="26" rx="20" ry="8" fill={c2} opacity=".28" />
      <path d="M-20 -14 C-16 -22 -8 -25 -2 -25" stroke="#fff" strokeOpacity=".8" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  );
}

const etoile = (x: number, y: number, r: number, c: string) => (
  <path transform={`translate(${x} ${y}) scale(${r / 10})`} d="M0 -10 L2.9 -3.1 L9.5 -3.1 L4.3 1.2 L6.2 8.1 L0 4.1 L-6.2 8.1 L-4.3 1.2 L-9.5 -3.1 L-2.9 -3.1 Z" fill={c} />
);

function Derriere({ d }: { d: Def }) {
  // Ce qui passe derrière le corps
  switch (d.acc) {
    case "queue": return <path d="M20 10 C38 4 46 -10 48 -24 C40 -10 30 -6 18 -2 Z" fill={d.c2} opacity=".7" />;
    case "ailes": return <g fill={d.c2} opacity=".9"><path d="M-28 -2 C-46 -16 -50 4 -44 14 C-40 6 -34 6 -28 10 Z" /><path d="M28 -2 C46 -16 50 4 44 14 C40 6 34 6 28 10 Z" /></g>;
    case "feu": return <g><path d="M-26 0 C-48 -10 -46 -34 -36 -40 C-38 -24 -28 -20 -22 -14 Z" fill="#ff8f3d" /><path d="M26 0 C48 -10 46 -34 36 -40 C38 -24 28 -20 22 -14 Z" fill="#ff8f3d" /><path d="M-6 -30 C-4 -44 4 -46 6 -50 C10 -40 8 -34 4 -28 Z" fill="#ffd36b" /></g>;
    case "nageoire": return <path d="M10 30 C26 36 36 30 44 18 C40 34 30 44 14 40 Z" fill={d.c2} />;
    case "criniere": return <g>{["#ff9ec7", "#ffd36b", "#9fe6ff", "#c9a8ff"].map((c, i) => <path key={i} d={`M${-6 + i * 5} -30 C${-22 + i * 3} -26 ${-30 + i * 2} -12 ${-28 + i * 3} ${4 + i * 3}`} stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />)}</g>;
    case "jet": return <g>{etoile(-8, -44, 5, "#9fe6ff")}{etoile(6, -48, 6, "#fff")}{etoile(16, -40, 4, "#9fe6ff")}<path d="M0 -28 L0 -38" stroke="#9fe6ff" strokeWidth="3" strokeLinecap="round" /></g>;
    case "anneau": return <ellipse cx="0" cy="8" rx="46" ry="11" fill="none" stroke={d.c2} strokeWidth="5" transform="rotate(-12)" strokeDasharray="70 200" strokeDashoffset="40" />;
    default: return null;
  }
}

function Oreilles({ d }: { d: Def }) {
  const { c, c2 } = d;
  switch (d.oreilles) {
    case "antennes": return <g stroke={c2} strokeWidth="3" strokeLinecap="round" fill="none"><path d="M-10 -28 Q-14 -40 -20 -44" /><path d="M10 -28 Q14 -40 20 -44" /><circle cx="-20" cy="-45" r="5" fill="#fff3b0" stroke="none" /><circle cx="20" cy="-45" r="5" fill="#fff3b0" stroke="none" /></g>;
    case "lapin": return <g><ellipse cx="-12" cy="-40" rx="8" ry="20" fill={c} stroke={c2} strokeWidth="2.5" transform="rotate(-12 -12 -40)" /><ellipse cx="12" cy="-40" rx="8" ry="20" fill={c} stroke={c2} strokeWidth="2.5" transform="rotate(12 12 -40)" /><ellipse cx="-12" cy="-40" rx="3.5" ry="13" fill="#ffb3d6" transform="rotate(-12 -12 -40)" /><ellipse cx="12" cy="-40" rx="3.5" ry="13" fill="#ffb3d6" transform="rotate(12 12 -40)" /></g>;
    case "chat": case "renard": {
      const h = d.oreilles === "renard" ? 22 : 16;
      return <g fill={c} stroke={c2} strokeWidth="2.5" strokeLinejoin="round"><path d={`M-28 -16 L-22 ${-26 - h} L-6 -28 Z`} /><path d={`M28 -16 L22 ${-26 - h} L6 -28 Z`} /><path d={`M-23 -20 L-20 ${-20 - h} L-11 -27 Z`} fill={d.oreilles === "renard" ? "#fff2e6" : "#ffb3d6"} stroke="none" /><path d={`M23 -20 L20 ${-20 - h} L11 -27 Z`} fill={d.oreilles === "renard" ? "#fff2e6" : "#ffb3d6"} stroke="none" /></g>;
    }
    case "panda": return <g fill={c2}><circle cx="-24" cy="-26" r="10" /><circle cx="24" cy="-26" r="10" /></g>;
    case "cornes": return <g fill="#fff3b0" stroke="#f5c46b" strokeWidth="2"><path d="M-14 -26 C-18 -38 -14 -46 -10 -48 C-10 -40 -6 -34 -6 -28 Z" /><path d="M14 -26 C18 -38 14 -46 10 -48 C10 -40 6 -34 6 -28 Z" /></g>;
    case "corne": return <g><path d="M-5 -30 L0 -54 L5 -30 Z" fill="#ffe7a3" stroke="#f5c46b" strokeWidth="2" strokeLinejoin="round" /><path d="M-3 -38 L3 -41 M-2 -45 L2 -47" stroke="#f5c46b" strokeWidth="1.5" /></g>;
    case "plumes": return <g fill={c2}><path d="M-24 -20 L-30 -42 L-12 -28 Z" /><path d="M24 -20 L30 -42 L12 -28 Z" /></g>;
    case "branchies": return <g stroke={c2} strokeWidth="4" strokeLinecap="round">{[-1, 1].map((s) => [0, 1, 2].map((i) => <path key={`${s}${i}`} d={`M${s * 30} ${-10 + i * 8} L${s * (44 + (i === 1 ? 4 : 0))} ${-20 + i * 10}`} />))}</g>;
    case "parabole": return <g><path d="M0 -30 L0 -40" stroke={c2} strokeWidth="3" /><path d="M-14 -46 A14 9 0 0 0 14 -46 Z" fill="#e8fff2" stroke={c2} strokeWidth="2.5" /><circle cx="0" cy="-50" r="2.5" fill="#ff8fbf" /></g>;
    case "bosses": return <g fill={c} stroke={c2} strokeWidth="2.5"><circle cx="-14" cy="-24" r="10" /><circle cx="14" cy="-24" r="10" /></g>;
    default: return null;
  }
}

function Devant({ d }: { d: Def }) {
  switch (d.acc) {
    case "lune": return <path d="M26 -30 A10 10 0 1 0 36 -16 A8 8 0 1 1 26 -30 Z" fill="#fff3b0" />;
    case "crateres": return <g fill={d.c2} opacity=".6"><circle cx="-22" cy="16" r="4" /><circle cx="24" cy="12" r="3" /><circle cx="16" cy="26" r="2.5" /></g>;
    case "pepites": return <g>{etoile(-26, -16, 5, "#ffd23f")}{etoile(28, -8, 4, "#ffd23f")}{etoile(20, 28, 3.5, "#ffd23f")}</g>;
    case "bulles": return <g fill="#fff" opacity=".7"><circle cx="-20" cy="16" r="3.5" /><circle cx="22" cy="20" r="2.5" /><circle cx="18" cy="-12" r="2" /></g>;
    case "petales": return <g>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-8" rx="4" ry="7" fill="#ff9fc4" transform={`translate(22 -24) rotate(${a}) `} />)}<circle cx="22" cy="-24" r="3.5" fill="#ffd23f" /></g>;
    case "etoile": return <g>{etoile(26, -26, 9, "#ffd23f")}</g>;
    case "casque": return <g><path d="M-34 4 C-34 -30 34 -30 34 4" fill="none" stroke="#bfe9ff" strokeWidth="3" opacity=".8" /><ellipse cx="0" cy="-2" rx="38" ry="38" fill="#bfe9ff" opacity=".18" stroke="#e8f8ff" strokeWidth="2.5" /><path d="M-22 -24 C-14 -32 -4 -34 4 -34" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".9" /></g>;
    case "tentacules": return <g stroke={d.c2} strokeWidth="5" strokeLinecap="round" fill="none">{[-20, -8, 4, 16].map((x, i) => <path key={x} d={`M${x} 34 q${i % 2 ? 6 : -6} 8 0 14`} />)}</g>;
    case "eclipse": return <g><circle cx="26" cy="-30" r="9" fill="#ffd23f" /><circle cx="30" cy="-32" r="8" fill="#2b1640" /></g>;
    case "cristaux": return <g stroke="#e8fbff" strokeWidth="2" strokeLinejoin="round"><path d="M-18 -26 L-12 -44 L-6 -26 Z" fill="#7fd8f5" /><path d="M2 -28 L8 -50 L14 -28 Z" fill="#b26bff" /><path d="M20 -22 L26 -36 L30 -20 Z" fill="#7fd8f5" /></g>;
    case "astronaute": return <g><path d="M-30 -8 C-34 -36 34 -36 30 -8 C24 -24 -24 -24 -30 -8 Z" fill="#b57cff" /><circle cx="22" cy="-30" r="8" fill="#b57cff" /><ellipse cx="0" cy="0" rx="40" ry="40" fill="#bfe9ff" opacity=".15" stroke="#f3eeff" strokeWidth="3" /><path d="M-24 -26 C-16 -34 -6 -36 2 -36" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />{etoile(-24, 26, 5, "#ffd23f")}</g>;
    default: return null;
  }
}

function Robot() {
  return (
    <g>
      <defs>
        <linearGradient id="cf-arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff6bd6" /><stop offset="35%" stopColor="#ffd23f" /><stop offset="70%" stopColor="#3df5ff" /><stop offset="100%" stopColor="#b26bff" /></linearGradient>
      </defs>
      <line x1="0" y1="-34" x2="0" y2="-46" stroke="url(#cf-arc)" strokeWidth="3.5" />
      <circle cx="0" cy="-48" r="5.5" fill="#ffd23f" />
      <rect x="-34" y="-34" width="68" height="62" rx="24" fill="#f3ecff" stroke="url(#cf-arc)" strokeWidth="4" />
      <rect x="-24" y="-20" width="48" height="26" rx="13" fill="#1a1033" />
      <circle cx="-10" cy="-7" r="5" fill="#6bf0ff" />
      <circle cx="10" cy="-7" r="5" fill="#6bf0ff" />
      <path d="M-5 14 Q0 18 5 14" stroke="#2b1640" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="-22" cy="14" rx="5" ry="3" fill="#ff8fbf" opacity=".6" />
      <ellipse cx="22" cy="14" rx="5" ry="3" fill="#ff8fbf" opacity=".6" />
      <rect x="-26" y="28" width="14" height="12" rx="6" fill="#cbbdf0" />
      <rect x="12" y="28" width="14" height="12" rx="6" fill="#cbbdf0" />
    </g>
  );
}

/** Une figurine (silhouette = pas encore trouvée). */
export default function CosmoFigurine({ id, silhouette = false, taille = 80, className = "" }: { id: string; silhouette?: boolean; taille?: number; className?: string }) {
  const d = DEFS[id] || DEFS.pompon;
  return (
    <svg viewBox="-50 -56 100 104" width={taille} height={taille} className={className} aria-hidden style={silhouette ? { filter: "brightness(0) opacity(.28)" } : undefined}>
      {d.acc === "robot" ? (
        <Robot />
      ) : (
        <>
          <Derriere d={d} />
          <Oreilles d={d} />
          <CorpsForme corps={d.corps} c={d.c} c2={d.c2} />
          {d.oreilles === "panda" ? <g fill={d.c2} opacity=".85"><ellipse cx="-11" cy="2" rx="8" ry="9" transform="rotate(-20 -11 2)" /><ellipse cx="11" cy="2" rx="8" ry="9" transform="rotate(20 11 2)" /></g> : null}
          <Visage y={d.corps === "mochi" ? 10 : 6} joues={d.joues} dodo={id === "nuage"} />
          {d.oreilles === "panda" ? <g fill="#fff"><circle cx="-9.4" cy="1.6" r="1.8" /><circle cx="12.6" cy="1.6" r="1.8" /></g> : null}
          <Devant d={d} />
        </>
      )}
    </svg>
  );
}

/** Figurine dessinée (image de la collection) ou Cosmo-Copain en SVG. */
export function FigurineVisuel({ id, image = "", taille = 80, silhouette = false, className = "" }: { id: string; image?: string; taille?: number; silhouette?: boolean; className?: string }) {
  if (!image) return <CosmoFigurine id={id} taille={taille} silhouette={silhouette} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt=""
      width={taille}
      height={taille}
      loading="lazy"
      draggable={false}
      className={className}
      style={{ width: taille, height: taille, objectFit: "contain", filter: silhouette ? "brightness(0) opacity(.28)" : undefined }}
    />
  );
}
