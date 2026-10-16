// ============================================================
// HABITAT DU COMPAGNON — décorations de la chambre (SVG, sans image)
// ============================================================
// Achetées avec les bonbons cosmiques 🍬 et installées dans la scène.
// Un objet par emplacement : fond, plafond, mur, sol, gauche, droite.

import type { CSSProperties } from "react";

export type EmplacementDeco = "fond" | "plafond" | "mur" | "sol" | "gauche" | "droite";
export type Habitat = Partial<Record<EmplacementDeco, string>>;

export const EMPLACEMENTS_DECO: { key: EmplacementDeco; label: string }[] = [
  { key: "fond", label: "Fond" },
  { key: "plafond", label: "Plafond" },
  { key: "mur", label: "Mur" },
  { key: "sol", label: "Sol" },
  { key: "gauche", label: "À gauche" },
  { key: "droite", label: "À droite" },
];

export const DECOS: { key: string; nom: string; emplacement: EmplacementDeco; prix: number }[] = [
  { key: "nebuleuse", nom: "Ciel nébuleuse rose", emplacement: "fond", prix: 60 },
  { key: "aurore", nom: "Aurore boréale", emplacement: "fond", prix: 70 },
  { key: "ocean", nom: "Océan d'étoiles", emplacement: "fond", prix: 70 },
  { key: "couchant", nom: "Couchant sur Mars", emplacement: "fond", prix: 80 },
  { key: "guirlande", nom: "Guirlande d'étoiles", emplacement: "plafond", prix: 35 },
  { key: "mobile", nom: "Mobile de planètes", emplacement: "plafond", prix: 50 },
  { key: "lune", nom: "Lampe lune", emplacement: "plafond", prix: 60 },
  { key: "hublot", nom: "Hublot sur la Terre", emplacement: "mur", prix: 55 },
  { key: "poster", nom: "Poster Cycylive", emplacement: "mur", prix: 40 },
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

/** Fonds : remplacent le dégradé de la scène. */
export const FONDS: Record<string, { jour: string; nuit: string }> = {
  nebuleuse: {
    jour: "radial-gradient(ellipse at 20% 20%, #ff7ad955 0%, transparent 45%), radial-gradient(ellipse at 80% 30%, #9146ff66 0%, transparent 50%), radial-gradient(ellipse at 50% 120%, #6b2a8f 0%, #2a0f45 55%, #12061f 100%)",
    nuit: "radial-gradient(ellipse at 30% 20%, #ff7ad922 0%, transparent 45%), radial-gradient(ellipse at 50% 120%, #2a1240 0%, #08040f 70%)",
  },
  aurore: {
    jour: "linear-gradient(170deg, transparent 20%, #34d39944 35%, #22d3ee33 45%, transparent 60%), radial-gradient(ellipse at 50% 120%, #1f4f6b 0%, #0d2238 55%, #050b17 100%)",
    nuit: "linear-gradient(170deg, transparent 20%, #34d39922 35%, transparent 55%), radial-gradient(ellipse at 50% 120%, #0d2238 0%, #03060d 70%)",
  },
  ocean: {
    jour: "radial-gradient(ellipse at 70% 10%, #60a5fa44 0%, transparent 40%), radial-gradient(ellipse at 50% 120%, #1e3a8a 0%, #0c1a4a 55%, #050a1f 100%)",
    nuit: "radial-gradient(ellipse at 50% 120%, #0c1a4a 0%, #02050f 70%)",
  },
  couchant: {
    jour: "linear-gradient(180deg, #2a0f45 0%, #7c2d5a 45%, #e8794a 75%, #f6b26b 100%)",
    nuit: "linear-gradient(180deg, #0b0418 0%, #2a0f2a 60%, #4a1d24 100%)",
  },
};

const pos = (style: CSSProperties): CSSProperties => ({ position: "absolute", pointerEvents: "none", ...style });

function Plafond({ k }: { k: string }) {
  if (k === "guirlande")
    return (
      <svg viewBox="0 0 400 60" style={pos({ left: 0, top: 0, width: "100%", height: "16%" })} preserveAspectRatio="none" aria-hidden>
        <path d="M0 8 Q100 50 200 12 T400 10" stroke="#cdb4ff" strokeWidth="1.5" fill="none" opacity=".6" />
        {[30, 75, 120, 165, 210, 255, 300, 345, 385].map((x, i) => (
          <path key={x} className="hb-scint" style={{ animationDelay: `${i * 0.3}s` }} d={`M${x} ${18 + Math.sin(i) * 10}l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z`} fill={["#ffe27a", "#ff9ad9", "#9be7ff"][i % 3]} />
        ))}
      </svg>
    );
  if (k === "mobile")
    return (
      <svg viewBox="0 0 120 110" style={pos({ left: "8%", top: 0, width: "22%", maxWidth: 140 })} aria-hidden className="hb-balance">
        <line x1="60" y1="0" x2="60" y2="18" stroke="#cdb4ff" strokeWidth="2" />
        <line x1="15" y1="18" x2="105" y2="18" stroke="#cdb4ff" strokeWidth="2.5" strokeLinecap="round" />
        {[[20, 50, 11, "#ff9f5a"], [60, 75, 14, "#7ec8ff"], [100, 45, 9, "#f472b6"]].map(([x, y, r, c], i) => (
          <g key={i}>
            <line x1={x as number} y1="18" x2={x as number} y2={(y as number) - (r as number)} stroke="#cdb4ff" strokeWidth="1.2" />
            <circle cx={x as number} cy={y as number} r={r as number} fill={c as string} />
            {i === 1 && <ellipse cx={x as number} cy={y as number} rx={(r as number) + 8} ry="4" fill="none" stroke="#ffe27a" strokeWidth="2" />}
          </g>
        ))}
      </svg>
    );
  if (k === "lune")
    return (
      <svg viewBox="0 0 80 120" style={pos({ right: "10%", top: 0, width: "13%", maxWidth: 90 })} aria-hidden>
        <line x1="40" y1="0" x2="40" y2="50" stroke="#cdb4ff" strokeWidth="2" />
        <circle cx="40" cy="80" r="34" fill="#fff4c2" opacity=".25" />
        <circle cx="40" cy="80" r="24" fill="#fff1c9" />
        <circle cx="32" cy="74" r="5" fill="#f2deaa" /><circle cx="48" cy="88" r="4" fill="#f2deaa" /><circle cx="46" cy="70" r="2.5" fill="#f2deaa" />
      </svg>
    );
  return null;
}

function Mur({ k }: { k: string }) {
  const s = pos({ left: "6%", top: "22%", width: "18%", maxWidth: 120 });
  if (k === "hublot")
    return (
      <svg viewBox="0 0 100 100" style={s} aria-hidden>
        <circle cx="50" cy="50" r="46" fill="#9aa4b8" /><circle cx="50" cy="50" r="38" fill="#050a1f" />
        <circle cx="62" cy="60" r="20" fill="#3b82f6" /><path d="M48 52q8-8 16 0t12 6q-6 10-18 6z" fill="#34d399" />
        <circle cx="30" cy="30" r="1.5" fill="#fff" /><circle cx="40" cy="70" r="1" fill="#fff" />
        {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx={50 + 42 * Math.cos((a * Math.PI) / 180)} cy={50 + 42 * Math.sin((a * Math.PI) / 180)} r="2.5" fill="#6b7280" />)}
        <path d="M25 30q10-12 25-14" stroke="#fff" strokeOpacity=".35" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  if (k === "poster")
    return (
      <svg viewBox="0 0 80 100" style={s} aria-hidden>
        <rect x="2" y="2" width="76" height="96" rx="6" fill="#2a1457" stroke="#f5c76b" strokeWidth="3" />
        <circle cx="40" cy="42" r="20" fill="#9146ff" /><ellipse cx="40" cy="42" rx="30" ry="7" fill="none" stroke="#ff7ad9" strokeWidth="3" />
        <text x="40" y="84" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="sans-serif">CYCYLIVE</text>
      </svg>
    );
  if (k === "etagere")
    return (
      <svg viewBox="0 0 120 70" style={pos({ left: "5%", top: "26%", width: "22%", maxWidth: 150 })} aria-hidden>
        <rect x="0" y="52" width="120" height="8" rx="3" fill="#8b5cf6" />
        <path d="M14 52v-18h14v18zM10 34h22l-3-10H13z" fill="#fbbf24" />
        <circle cx="62" cy="38" r="12" fill="#ff7ad9" /><text x="62" y="43" textAnchor="middle" fontSize="13">⭐</text>
        <rect x="88" y="22" width="20" height="30" rx="3" fill="#22d3ee" /><rect x="92" y="28" width="12" height="4" fill="#fff" opacity=".6" />
      </svg>
    );
  return null;
}

function Sol({ k }: { k: string }) {
  if (k === "tapis")
    return (
      <svg viewBox="0 0 200 50" style={pos({ left: "50%", bottom: "4%", width: "48%", transform: "translateX(-50%)" })} aria-hidden>
        <ellipse cx="100" cy="25" rx="98" ry="22" fill="#fff1c9" opacity=".9" />
        <ellipse cx="100" cy="25" rx="84" ry="16" fill="none" stroke="#f2deaa" strokeWidth="3" strokeDasharray="6 6" />
        <circle cx="70" cy="22" r="6" fill="#f2deaa" /><circle cx="130" cy="30" r="4" fill="#f2deaa" />
      </svg>
    );
  if (k === "nuage")
    return (
      <svg viewBox="0 0 200 70" style={pos({ left: "50%", bottom: "3%", width: "46%", transform: "translateX(-50%)" })} aria-hidden>
        <path d="M30 60q-28 0-24-22 4-18 26-14 6-20 30-18 14-16 36-4 22-14 40 4 26-6 32 16 22 4 18 24 0 14-20 14z" fill="#f5f0ff" />
        <path d="M30 60h140" stroke="#d9ccff" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  if (k === "herbe")
    return (
      <svg viewBox="0 0 400 40" style={pos({ left: 0, bottom: 0, width: "100%", height: "14%" })} preserveAspectRatio="none" aria-hidden>
        {Array.from({ length: 40 }).map((_, i) => (
          <path key={i} d={`M${i * 10 + 3} 40q${i % 2 ? 4 : -4} -${16 + (i % 5) * 5} ${i % 3 ? 2 : -2} -${22 + (i % 4) * 5}`} stroke={["#34d399", "#5eead4", "#a3e635"][i % 3]} strokeWidth="3" fill="none" strokeLinecap="round" className={i % 4 === 0 ? "hb-ondule" : ""} />
        ))}
        {[60, 190, 320].map((x) => <circle key={x} cx={x} cy={14} r="4" fill="#f472b6" className="hb-scint" />)}
      </svg>
    );
  return null;
}

function Cote({ k, droite }: { k: string; droite: boolean }) {
  const s = pos(droite ? { right: "4%", bottom: "6%", width: "20%", maxWidth: 130 } : { left: "4%", bottom: "6%", width: "18%", maxWidth: 120 });
  if (k === "plante")
    return (
      <svg viewBox="0 0 80 110" style={s} aria-hidden>
        <path d="M40 70q-30-10-28-44 22 8 28 44zM40 70q30-12 30-48-24 10-30 48zM40 72q-4-36 6-62 10 30-6 62z" fill="#34d399" />
        <circle cx="16" cy="26" r="4" fill="#f472b6" className="hb-scint" /><circle cx="68" cy="22" r="4" fill="#ffe27a" className="hb-scint" /><circle cx="46" cy="10" r="4" fill="#9be7ff" className="hb-scint" />
        <path d="M20 72h40l-6 34H26z" fill="#9146ff" /><rect x="18" y="68" width="44" height="8" rx="4" fill="#b18cff" />
      </svg>
    );
  if (k === "lave")
    return (
      <svg viewBox="0 0 60 120" style={s} aria-hidden>
        <path d="M22 10h16l10 70H12z" fill="#ff7ad9" opacity=".35" />
        <circle cx="30" cy="40" r="7" fill="#ff7ad9" className="hb-lave" /><circle cx="26" cy="62" r="9" fill="#f472b6" className="hb-lave" style={{ animationDelay: "1.2s" }} />
        <path d="M18 2h24l-4 8H22z" fill="#cbd5e1" /><path d="M12 80h36l-6 34H18z" fill="#cbd5e1" />
      </svg>
    );
  if (k === "telescope")
    return (
      <svg viewBox="0 0 120 120" style={pos(droite ? { right: "3%", bottom: "6%", width: "22%", maxWidth: 140 } : { left: "3%", bottom: "6%", width: "22%", maxWidth: 140 })} aria-hidden>
        <rect x="20" y="30" width="80" height="20" rx="8" fill="#e5e7eb" transform="rotate(-30 60 40)" />
        <rect x="88" y="10" width="16" height="26" rx="5" fill="#9146ff" transform="rotate(-30 96 23)" />
        <path d="M60 50l-22 60M60 50l0 62M60 50l22 60" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  if (k === "arcade")
    return (
      <svg viewBox="0 0 80 130" style={s} aria-hidden>
        <path d="M10 20q0-18 30-18t30 18v108H10z" fill="#7c3aed" />
        <rect x="16" y="24" width="48" height="38" rx="4" fill="#0b0817" />
        <rect x="20" y="28" width="40" height="30" rx="2" fill="#1e1b4b" /><text x="40" y="47" textAnchor="middle" fontSize="12">🚀</text>
        <rect x="10" y="66" width="60" height="16" fill="#5b21b6" />
        <circle cx="28" cy="74" r="4" fill="#f472b6" /><circle cx="44" cy="74" r="3" fill="#ffe27a" /><circle cx="54" cy="74" r="3" fill="#22d3ee" />
        <text x="40" y="17" textAnchor="middle" fontSize="8" fontWeight="800" fill="#ffe27a" fontFamily="sans-serif">ARCADE</text>
      </svg>
    );
  if (k === "aquarium")
    return (
      <svg viewBox="0 0 110 100" style={pos(droite ? { right: "3%", bottom: "6%", width: "24%", maxWidth: 150 } : { left: "3%", bottom: "6%", width: "24%", maxWidth: 150 })} aria-hidden>
        <rect x="6" y="14" width="98" height="64" rx="10" fill="#60a5fa" opacity=".3" stroke="#bfdbfe" strokeWidth="3" />
        <path d="M30 40l6 4-6 4 2-4zM24 44a6 4 0 1 0 12 0 6 4 0 1 0-12 0z" fill="#ffe27a" className="hb-nage" />
        <path d="M70 56a7 5 0 1 0 14 0 7 5 0 1 0-14 0zM84 56l6-5v10z" fill="#f472b6" className="hb-nage" style={{ animationDelay: "1.5s" }} />
        <circle cx="50" cy="30" r="2" fill="#fff" className="hb-bulle" /><circle cx="56" cy="40" r="1.5" fill="#fff" className="hb-bulle" style={{ animationDelay: ".8s" }} />
        <rect x="16" y="78" width="78" height="18" rx="4" fill="#7c3aed" />
      </svg>
    );
  if (k === "coffre")
    return (
      <svg viewBox="0 0 100 80" style={pos(droite ? { right: "4%", bottom: "6%", width: "20%", maxWidth: 120 } : { left: "4%", bottom: "6%", width: "20%", maxWidth: 120 })} aria-hidden>
        <path d="M8 34h84v42H8z" fill="#b45309" /><path d="M8 34q0-26 42-26t42 26z" fill="#d97706" />
        <rect x="8" y="34" width="84" height="7" fill="#fbbf24" /><rect x="44" y="34" width="12" height="18" rx="2" fill="#fde68a" />
        <circle cx="30" cy="22" r="3" fill="#fff" className="hb-scint" /><circle cx="70" cy="18" r="2.5" fill="#fff" className="hb-scint" />
      </svg>
    );
  return null;
}

/** Toutes les décorations installées, à placer DANS la scène (derrière la créature). */
export function DecorScene({ habitat }: { habitat: Habitat }) {
  return (
    <>
      <style>{`
        .hb-scint{animation:hbScint 2.4s ease-in-out infinite}@keyframes hbScint{50%{opacity:.35}}
        .hb-balance{transform-origin:50% 0;animation:hbBal 6s ease-in-out infinite}@keyframes hbBal{50%{transform:rotate(4deg)}}
        .hb-lave{animation:hbLave 4s ease-in-out infinite}@keyframes hbLave{50%{transform:translateY(-14px)}}
        .hb-nage{animation:hbNage 5s ease-in-out infinite}@keyframes hbNage{50%{transform:translateX(16px)}}
        .hb-bulle{animation:hbBulle 3s linear infinite}@keyframes hbBulle{to{transform:translateY(-14px);opacity:0}}
        .hb-ondule{transform-origin:bottom;animation:hbOnd 3s ease-in-out infinite}@keyframes hbOnd{50%{transform:skewX(6deg)}}
      `}</style>
      {habitat.mur && <Mur k={habitat.mur} />}
      {habitat.plafond && <Plafond k={habitat.plafond} />}
      {habitat.sol && <Sol k={habitat.sol} />}
      {habitat.gauche && <Cote k={habitat.gauche} droite={false} />}
      {habitat.droite && <Cote k={habitat.droite} droite />}
    </>
  );
}

/** Petite vignette pour la boutique. */
export function DecoApercu({ k }: { k: string }) {
  const d = decoInfo(k);
  if (!d) return null;
  if (d.emplacement === "fond")
    return <span aria-hidden className="block h-[52px] w-[76px] rounded-xl border border-white/15" style={{ background: FONDS[k]?.jour }} />;
  const h: Habitat = { [d.emplacement]: k };
  return (
    <span aria-hidden className="relative block h-[56px] w-[84px] rounded-xl bg-[#1a0f38] overflow-hidden">
      <span className="absolute inset-0" style={{ transform: d.emplacement === "gauche" || d.emplacement === "droite" ? "scale(1.9)" : d.emplacement === "mur" ? "scale(1.6) translate(14%,-6%)" : "scale(1.2)", transformOrigin: d.emplacement === "droite" ? "right bottom" : d.emplacement === "gauche" ? "left bottom" : "center" }}>
        <DecorScene habitat={h} />
      </span>
    </span>
  );
}
