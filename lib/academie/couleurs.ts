// Petits calculs de couleurs pour les illustrations vectorielles
// (ombres et lumières à partir d'une teinte de base).

function versRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function versHex([r, g, b]: number[]): string {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

/** Mélange deux couleurs : t = 0 → a, t = 1 → b. */
export function melanger(a: string, b: string, t: number): string {
  const ca = versRgb(a);
  const cb = versRgb(b);
  return versHex(ca.map((v, i) => v + (cb[i] - v) * t));
}

/** Assombrit en tirant vers un brun-violet chaud plutôt que vers le noir pur. */
export function ombre(hex: string, t: number): string {
  return melanger(hex, "#2A1426", t);
}

export function lumiere(hex: string, t: number): string {
  return melanger(hex, "#FFF4E6", t);
}

/** Générateur pseudo-aléatoire déterministe (positions d'étoiles stables). */
export function aleatoire(graine: number) {
  let s = graine;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
