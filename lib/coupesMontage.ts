// Coupes du générateur de contenus (comme dans CapCut) : on coupe le clip en morceaux à la tête de lecture,
// puis on supprime les morceaux qu'on ne veut pas. Tout est en temps de la vidéo SOURCE :
//  • points  : les endroits où le clip est coupé ;
//  • retires : les morceaux enlevés (image ET son).
// Les morceaux gardés sont mis bout à bout dans la vidéo finale ; les éléments (titre, barre de progression,
// fin…) suivent le temps « monté ».

export type PlageTemps = { a: number; b: number };
export type Coupe = { points: number[]; retires: PlageTemps[] };
export type Morceau = PlageTemps & { retire: boolean; i: number };

export const COUPE_VIDE: Coupe = { points: [], retires: [] };
const MIN = 0.05; // morceau le plus court (s)

export function nettoyerCoupe(c: unknown): Coupe {
  const o = (c && typeof c === "object" ? c : {}) as Partial<Coupe>;
  const pts = Array.isArray(o.points) ? o.points.filter((x) => Number.isFinite(x)).map(Number) : [];
  const ret = Array.isArray(o.retires) ? o.retires.filter((r) => r && Number.isFinite(r.a) && Number.isFinite(r.b) && r.b > r.a).map((r) => ({ a: +r.a, b: +r.b })) : [];
  return { points: [...new Set(pts.map((x) => Math.round(x * 1000) / 1000))].sort((a, b) => a - b), retires: ret };
}

/** Les morceaux entre le début et la fin de la coupe, et s'ils sont enlevés. */
export function morceaux(c: Coupe, debut: number, fin: number): Morceau[] {
  const pts = c.points.filter((p) => p > debut + MIN && p < fin - MIN);
  const bornes = [debut, ...pts, fin];
  const out: Morceau[] = [];
  for (let i = 0; i < bornes.length - 1; i++) {
    const a = bornes[i], b = bornes[i + 1], m = (a + b) / 2;
    out.push({ a, b, i, retire: c.retires.some((r) => m >= r.a && m <= r.b) });
  }
  return out;
}

/** Les morceaux gardés, fusionnés quand ils se suivent. */
export function segmentsGardes(c: Coupe, debut: number, fin: number): PlageTemps[] {
  const out: PlageTemps[] = [];
  for (const m of morceaux(c, debut, fin)) {
    if (m.retire) continue;
    const d = out[out.length - 1];
    if (d && Math.abs(d.b - m.a) < 1e-6) d.b = m.b; else out.push({ a: m.a, b: m.b });
  }
  return out;
}

export const dureeMontee = (s: PlageTemps[]) => s.reduce((n, x) => n + (x.b - x.a), 0);

/** Temps de la vidéo finale correspondant à un temps de la source (une partie enlevée compte pour son début). */
export function versMonte(t: number, s: PlageTemps[]): number {
  let r = 0;
  for (const x of s) {
    if (t < x.a) return r;
    if (t <= x.b) return r + (t - x.a);
    r += x.b - x.a;
  }
  return r;
}

/** Temps de la source correspondant à un temps de la vidéo finale. */
export function versSource(r: number, s: PlageTemps[]): number {
  if (!s.length) return 0;
  let reste = Math.max(0, r);
  for (const x of s) {
    const d = x.b - x.a;
    if (reste < d) return x.a + reste;
    reste -= d;
  }
  return s[s.length - 1].b;
}

/** Pendant la lecture : si la tête est dans une partie enlevée, l'endroit où sauter (null = rien à faire). */
export function sautLecture(t: number, s: PlageTemps[]): number | null {
  if (!s.length) return null;
  if (s.some((x) => t >= x.a && t < x.b - 0.02)) return null;
  const suivant = s.find((x) => x.a > t - 0.001);
  return suivant ? suivant.a : s[0].a; // après le dernier morceau : on reboucle au début
}

// ── Opérations (renvoient une nouvelle coupe) ──
export function couperA(c: Coupe, t: number, debut: number, fin: number): Coupe {
  if (t <= debut + MIN || t >= fin - MIN) return c;
  if (c.points.some((p) => Math.abs(p - t) < MIN)) return c;
  return { ...c, points: [...c.points, Math.round(t * 1000) / 1000].sort((a, b) => a - b) };
}
export function retirer(c: Coupe, m: PlageTemps): Coupe {
  return { ...c, retires: [...c.retires, { a: m.a, b: m.b }] };
}
export function remettre(c: Coupe, m: PlageTemps): Coupe {
  const mid = (m.a + m.b) / 2;
  return { ...c, retires: c.retires.filter((r) => !(mid >= r.a && mid <= r.b)) };
}
/** Enlève le point de coupe : les deux morceaux voisins sont recollés (et gardés). */
export function recoller(c: Coupe, p: number): Coupe {
  return { points: c.points.filter((x) => Math.abs(x - p) > 1e-4), retires: c.retires.filter((r) => !(r.a <= p + 1e-4 && r.b >= p - 1e-4)) };
}
