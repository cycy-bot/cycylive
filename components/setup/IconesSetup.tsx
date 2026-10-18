// ============================================================
// ICÔNES DU SETUP — même DA que la banque Cycylive (« Orbite »)
// ============================================================
// Grille 24 × 24, trait 1,7 px arrondi, forme principale remplie à 16 %,
// un petit détail plein. Couleur héritée du texte (currentColor).

import type { ReactNode } from "react";
import type { TypeMateriel } from "@/data/setup";

const T = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const F = { ...T, fill: "currentColor", fillOpacity: 0.16 };
const P = { fill: "currentColor" };
const eclat = (x: number, y: number, r = 2) => (
  <path {...P} d={`M${x} ${y - r}c.25 1.3.6 1.7 ${r * 0.9} ${r}c-1.3.25-1.7.6-${r * 0.9} ${r}c-.25-1.3-.6-1.7-${r * 0.9}-${r}c1.3-.25 1.7-.6 ${r * 0.9}-${r}Z`} />
);

export const TYPES_MATERIEL: Record<TypeMateriel, { label: string; dessin: ReactNode }> = {
  gpu: { label: "Carte graphique", dessin: <>
    <rect {...F} x="3.5" y="6" width="18" height="11" rx="2" />
    <path {...T} d="M2 4.5v14.5M8 17v2.5h6V17" />
    <circle {...T} cx="9" cy="11.5" r="3" />
    <circle {...T} cx="16" cy="11.5" r="3" />
    <circle {...P} cx="9" cy="11.5" r="1" />
    <circle {...P} cx="16" cy="11.5" r="1" />
  </> },
  cpu: { label: "Processeur", dessin: <>
    <rect {...F} x="6" y="6" width="12" height="12" rx="2.2" />
    <path {...T} d="M9.5 2.5V6M14.5 2.5V6M9.5 18v3.5M14.5 18v3.5M2.5 9.5H6M2.5 14.5H6M18 9.5h3.5M18 14.5h3.5" />
    {eclat(12, 12, 2.4)}
  </> },
  ram: { label: "Mémoire vive", dessin: <>
    <rect {...F} x="2.5" y="7" width="19" height="8.5" rx="1.5" />
    <path {...T} d="M5 15.5v2.5M8 15.5v2.5M11 15.5v2.5M14 15.5v2.5M17 15.5v2.5M19.5 15.5v2.5" opacity=".8" />
    <rect {...P} x="5" y="9.5" width="3" height="3.5" rx=".6" />
    <rect {...P} x="10.5" y="9.5" width="3" height="3.5" rx=".6" />
    <rect {...P} x="16" y="9.5" width="3" height="3.5" rx=".6" />
  </> },
  carteMere: { label: "Carte mère", dessin: <>
    <rect {...F} x="3" y="3" width="18" height="18" rx="2.5" />
    <rect {...T} x="6.5" y="6.5" width="6" height="6" rx="1" />
    <path {...T} d="M16 6.5v11M18.5 6.5v11M6.5 16.5h6" />
    <circle {...P} cx="9.5" cy="9.5" r="1.2" />
  </> },
  ssd: { label: "Stockage", dessin: <>
    <rect {...F} x="2.5" y="8" width="19" height="8" rx="1.5" />
    <rect {...T} x="6" y="10.3" width="4.5" height="3.4" rx=".6" />
    <rect {...T} x="12" y="10.3" width="3" height="3.4" rx=".6" />
    <path {...T} d="M2.5 10.5h-.5M2.5 13.5h-.5" />
    <circle {...P} cx="18.8" cy="12" r="1.1" />
  </> },
  alim: { label: "Alimentation", dessin: <>
    <rect {...F} x="2.5" y="5" width="19" height="14" rx="2.5" />
    <circle {...T} cx="9.5" cy="12" r="4.3" />
    <path {...T} d="M9.5 7.7v8.6M5.2 12h8.6" opacity=".55" />
    <path {...P} d="M18 8.2 15.6 12.3h1.9l-.9 3.5 2.6-4.4h-1.9l.7-3.2Z" />
  </> },
  boitier: { label: "Boîtier", dessin: <>
    <rect {...F} x="5.5" y="2.5" width="13" height="19" rx="2" />
    <rect {...T} x="8" y="5" width="8" height="10.5" rx="1" />
    <circle {...T} cx="12" cy="10.2" r="2.3" />
    <circle {...P} cx="12" cy="18.6" r="1.1" />
  </> },
  ventirad: { label: "Refroidissement", dessin: <>
    <path {...T} d="M5.5 3.5v11M8.5 3.5v11M15.5 3.5v11M18.5 3.5v11" opacity=".7" />
    <rect {...F} x="3.5" y="15" width="17" height="3.5" rx="1.2" />
    <circle {...F} cx="12" cy="9" r="4" />
    <path {...T} d="M12 5c1.6 1.4 1.6 2.6 0 4s-1.6 2.6 0 4" />
    <path {...T} d="M9 20.5h6" />
  </> },
  wifi: { label: "Réseau", dessin: <>
    <rect {...F} x="3" y="13" width="18" height="6.5" rx="2" />
    <path {...T} d="m7 13-1.5-6M17 13l1.5-6M9.6 9.2a3.4 3.4 0 0 1 4.8 0M7.8 7a6 6 0 0 1 8.4 0" />
    <circle {...P} cx="7" cy="16.2" r="1" />
    <circle {...P} cx="10" cy="16.2" r="1" />
  </> },
  camera: { label: "Caméra", dessin: <>
    <circle {...F} cx="12" cy="10" r="6.8" />
    <circle {...T} cx="12" cy="10" r="3" />
    <circle {...P} cx="12" cy="10" r="1.2" />
    <path {...T} d="M12 16.8v3.7M8.5 21h7" />
  </> },
  micro: { label: "Micro", dessin: <>
    <rect {...F} x="8.5" y="2.5" width="7" height="12" rx="3.5" />
    <path {...T} d="M8.5 7.5h2M8.5 10h2" opacity=".7" />
    <path {...T} d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21.2h6" />
    {eclat(14.3, 6.2, 1.5)}
  </> },
  clavier: { label: "Clavier", dessin: <>
    <rect {...F} x="2" y="6.5" width="20" height="11" rx="2.2" />
    <path {...T} d="M8 14.5h8" />
    {[5.5, 9, 12.5, 16, 19].map((x) => <circle key={x} {...P} cx={x - 0.5} cy="9.7" r=".95" />)}
    <circle {...P} cx="5.5" cy="14.5" r=".95" />
    <circle {...P} cx="18.5" cy="14.5" r=".95" />
  </> },
  souris: { label: "Souris", dessin: <>
    <rect {...F} x="6.5" y="2.5" width="11" height="19" rx="5.5" />
    <path {...T} d="M12 2.5v6.5M6.5 9h11" />
    <rect {...P} x="11.2" y="4.6" width="1.6" height="3" rx=".8" />
  </> },
  casque: { label: "Casque", dessin: <>
    <path {...T} d="M4 14.5V12a8 8 0 0 1 16 0v2.5" />
    <rect {...F} x="3" y="13" width="5" height="7.5" rx="2" />
    <rect {...F} x="16" y="13" width="5" height="7.5" rx="2" />
    <path {...T} d="M5.5 20.5c.4 1.2 2 1.6 4.5 1.4" />
    <circle {...P} cx="11" cy="21.9" r="1.1" />
  </> },
  ecran: { label: "Écran", dessin: <>
    <rect {...F} x="2.5" y="3.5" width="19" height="12.5" rx="2" />
    <path {...T} d="M12 16v4M8 20.5h8" />
    {eclat(16.5, 7.5, 1.8)}
  </> },
  lumiere: { label: "Éclairage", dessin: <>
    <circle {...T} cx="12" cy="9.5" r="6.8" />
    <circle {...F} cx="12" cy="9.5" r="3.8" />
    <path {...T} d="M12 16.3v4.7M9 21h6" />
    {eclat(12, 9.5, 1.6)}
  </> },
  deck: { label: "Contrôleur", dessin: <>
    <rect {...F} x="3" y="4.5" width="18" height="12" rx="2.5" />
    {[7, 12, 17].flatMap((x) => [8.3, 12.5].map((y) => <rect key={x + "-" + y} {...P} x={x - 1.6} y={y - 1.4} width="3.2" height="2.8" rx=".7" opacity={x === 12 && y === 8.3 ? 1 : 0.55} />))}
    <path {...T} d="m8.5 16.5-1 4h9l-1-4" />
  </> },
  capture: { label: "Carte d'acquisition", dessin: <>
    <rect {...F} x="2.5" y="7.5" width="19" height="9" rx="2.2" />
    <path {...T} d="M5.5 10.5h4.5l-.6 3H6.1Z" />
    <path {...T} d="M14 12h4.5" opacity=".7" />
    <circle {...P} cx="18.5" cy="10" r="1" />
  </> },
  chaise: { label: "Fauteuil", dessin: <>
    <rect {...F} x="7" y="2.5" width="10" height="10.5" rx="3.2" />
    <path {...T} d="M5 14.5h14M12 14.5v4.5M7.5 21.5l4.5-2.5 4.5 2.5M5 12v2.5M19 12v2.5" />
  </> },
  manette: { label: "Manette", dessin: <>
    <path {...F} d="M7 7.5h10a4.5 4.5 0 0 1 4.4 3.6l.9 4.7a2.5 2.5 0 0 1-4.3 2.2L16 16H8l-2 2a2.5 2.5 0 0 1-4.3-2.2l.9-4.7A4.5 4.5 0 0 1 7 7.5Z" />
    <path {...T} d="M7.5 10.5v3M6 12h3" />
    <circle {...P} cx="15.5" cy="11" r="1" />
    <circle {...P} cx="17.5" cy="13" r="1" />
  </> },
  autre: { label: "Accessoire", dessin: <>
    <rect {...F} x="4" y="4" width="16" height="16" rx="3.5" />
    {eclat(12, 12, 3.2)}
  </> },
};

export const ORDRE_TYPES = Object.keys(TYPES_MATERIEL) as TypeMateriel[];

export function IconeMateriel({ type, className = "w-5 h-5" }: { type: TypeMateriel; className?: string }) {
  const def = TYPES_MATERIEL[type] ?? TYPES_MATERIEL.autre;
  return (
    <svg viewBox="0 0 24 24" className={`inline-block shrink-0 ${className}`} aria-hidden>
      {def.dessin}
    </svg>
  );
}

/** Devine le type d'après le nom (quand tu ajoutes un article dans l'admin). */
export function devinerType(nom: string): TypeMateriel | null {
  const t = nom.toLowerCase();
  const regles: [RegExp, TypeMateriel][] = [
    [/rtx|gtx|radeon|rx \d|geforce|carte graphique/, "gpu"],
    [/ryzen|core i\d|intel core|processeur|\bcpu\b/, "cpu"],
    [/ddr\d|\bram\b|m[ée]moire/, "ram"],
    [/b\d{3}|z\d{3}|x\d{3}|carte m[èe]re|prime|tuf gaming [a-z]\d/, "carteMere"],
    [/ssd|nvme|hdd|disque/, "ssd"],
    [/alim|\d{3,4} ?w\b|80 plus/, "alim"],
    [/bo[îi]tier|tower|\btg\b/, "boitier"],
    [/ventirad|watercool|aio|caloduc|refroid/, "ventirad"],
    [/wi-?fi|routeur|archer|r[ée]seau/, "wifi"],
    [/cam|insta360|webcam|facecam/, "camera"],
    [/micro|wave|shure|blue yeti|rode/, "micro"],
    [/clavier|keyboard|g\d{3} ?tkl|g713|g915/, "clavier"],
    [/souris|mouse|deathadder|viper|g pro/, "souris"],
    [/casque|headset|hs\d{2}|arctis|cloud/, "casque"],
    [/[ée]cran|moniteur|iiyama|monitor/, "ecran"],
    [/key ?light|ring|lumi[èe]re|[ée]clairage|led/, "lumiere"],
    [/stream ?deck|deck/, "deck"],
    [/elgato hd|capture|acquisition/, "capture"],
    [/chaise|fauteuil|secretlab/, "chaise"],
    [/manette|controller|dualsense|xbox/, "manette"],
  ];
  for (const [r, type] of regles) if (r.test(t)) return type;
  return null;
}
