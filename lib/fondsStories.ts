// ============================================================
// FONDS DES STORIES — fixes ou animés (boucle parfaite de 6 s)
// ============================================================
// Chaque fond se dessine sur un canvas 1080 × 1920 à l'instant t (0 → 1).
// La teinte suit le jeu de la story (Valorant rouge, Minecraft vert…).

export type StyleFond = "fixe" | "etoiles" | "nebuleuse" | "aurore" | "hyperespace" | "orbites" | "particules";

export const FONDS: { valeur: StyleFond; label: string; anime: boolean }[] = [
  { valeur: "fixe", label: "Ciel fixe", anime: false },
  { valeur: "etoiles", label: "Étoiles filantes", anime: true },
  { valeur: "nebuleuse", label: "Nébuleuse", anime: true },
  { valeur: "aurore", label: "Aurore", anime: true },
  { valeur: "hyperespace", label: "Hyperespace", anime: true },
  { valeur: "orbites", label: "Orbites", anime: true },
  { valeur: "particules", label: "Poussière d'étoiles", anime: true },
];

export const DUREE_BOUCLE = 6; // secondes
const FOND = "#0d0a17";
const TAU = Math.PI * 2;

// Générateur pseudo-aléatoire stable : les étoiles restent à la même place d'une image à l'autre
function hasard(graine: number) {
  let s = graine >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const R = hasard(42);
const ETOILES = Array.from({ length: 230 }, () => ({ x: R(), y: R(), r: 0.6 + R() * 2.4, p: R(), v: 1 + Math.floor(R() * 3) }));
const PARTICULES = Array.from({ length: 70 }, () => ({ x: R(), y: R(), r: 3 + R() * 11, p: R(), v: 1 + Math.floor(R() * 2), a: 0.25 + R() * 0.5 }));
const RAYONS = Array.from({ length: 160 }, () => ({ a: R() * TAU, d: R(), v: 1 + Math.floor(R() * 2), l: 0.5 + R() }));

const rgba = (rgb: string, a: number) => `rgba(${rgb},${a})`;

function halo(ctx: CanvasRenderingContext2D, L: number, H: number, x: number, y: number, rayon: number, couleur: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rayon);
  g.addColorStop(0, couleur);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, L, H);
}

function etoile4(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - t);
  ctx.quadraticCurveTo(x, y, x + t, y);
  ctx.quadraticCurveTo(x, y, x, y + t);
  ctx.quadraticCurveTo(x, y, x - t, y);
  ctx.quadraticCurveTo(x, y, x, y - t);
  ctx.fill();
}

function cielEtoile(ctx: CanvasRenderingContext2D, L: number, H: number, t: number, scintille: boolean) {
  for (const e of ETOILES) {
    const a = scintille ? 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(TAU * (t * e.v + e.p))) : 0.35 + e.p * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(e.x * L, e.y * H, e.r, 0, TAU);
    ctx.fill();
  }
}

/** Le voile du bas garde les textes lisibles, quel que soit le fond. */
function voile(ctx: CanvasRenderingContext2D, L: number, H: number) {
  const v = ctx.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, "rgba(13,10,23,.18)");
  v.addColorStop(0.5, "rgba(13,10,23,.32)");
  v.addColorStop(1, "rgba(13,10,23,.9)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, L, H);
}

export function dessinerFondStory(ctx: CanvasRenderingContext2D, L: number, H: number, style: StyleFond, teinte: string, t: number, image: HTMLImageElement | null) {
  ctx.fillStyle = FOND;
  ctx.fillRect(0, 0, L, H);
  const violet = "161,92,255", rose = "240,171,252";

  if (style === "fixe") {
    if (image) {
      const s = Math.max(L / image.width, H / image.height);
      const w = image.width * s, h = image.height * s;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(image, (L - w) / 2, (H - h) / 2, w, h);
      ctx.globalAlpha = 1;
    } else cielEtoile(ctx, L, H, 0, false);
    halo(ctx, L, H, L * 0.85, H * 0.12, 760, rgba(violet, 0.45));
    halo(ctx, L, H, L * 0.1, H * 0.78, 820, rgba(teinte, 0.32));
  }

  if (style === "etoiles") {
    halo(ctx, L, H, L * 0.8, H * 0.15, 800, rgba(violet, 0.4));
    halo(ctx, L, H, L * 0.15, H * 0.8, 820, rgba(teinte, 0.3));
    cielEtoile(ctx, L, H, t, true);
    // 3 étoiles filantes, chacune passe une fois par boucle
    [0.05, 0.4, 0.72].forEach((debut, k) => {
      const u = (t - debut + 1) % 1;
      if (u > 0.22) return;
      const p = u / 0.22;
      const x0 = L * (0.95 - k * 0.25), y0 = H * (0.05 + k * 0.12);
      const x = x0 - p * L * 0.75, y = y0 + p * L * 0.42;
      const g = ctx.createLinearGradient(x, y, x + 260, y - 145);
      g.addColorStop(0, `rgba(255,255,255,${(1 - p).toFixed(3)})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 260, y - 145);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${(1 - p).toFixed(3)})`;
      etoile4(ctx, x, y, 12);
    });
  }

  if (style === "nebuleuse") {
    cielEtoile(ctx, L, H, t, true);
    ctx.globalCompositeOperation = "lighter";
    const nuages: [number, number, number, number, string, number][] = [
      [0.3, 0.25, 0.18, 0.08, rgba(violet, 0.42), 900],
      [0.75, 0.45, 0.14, 0.1, rgba(teinte, 0.36), 820],
      [0.4, 0.75, 0.16, 0.07, rgba(rose, 0.26), 860],
      [0.8, 0.88, 0.1, 0.06, rgba(violet, 0.3), 700],
    ];
    nuages.forEach(([cx, cy, rx, ry, c, r], k) => {
      const a = TAU * (t + k * 0.25) * (k % 2 ? -1 : 1);
      halo(ctx, L, H, (cx + Math.cos(a) * rx) * L, (cy + Math.sin(a) * ry) * H, r, c);
    });
    ctx.globalCompositeOperation = "source-over";
  }

  if (style === "aurore") {
    cielEtoile(ctx, L, H, t, true);
    halo(ctx, L, H, L * 0.5, H * 0.1, 900, rgba(violet, 0.3));
    ctx.globalCompositeOperation = "lighter";
    // rubans lumineux qui ondulent (plusieurs passes de plus en plus fines = bords doux)
    const rubans: [number, string, number][] = [[0.2, violet, 0.08], [0.3, teinte, 0.07], [0.4, rose, 0.05]];
    rubans.forEach(([base, c, a], k) => {
      for (const ep of [170, 110, 60]) {
        ctx.fillStyle = rgba(c, a);
        ctx.beginPath();
        const y = (x: number) => H * base + Math.sin((x / L) * TAU * 1.1 + TAU * t + k * 1.7) * 110 + Math.sin((x / L) * TAU * 2.4 - TAU * t * 2 + k) * 45;
        for (let x = -20; x <= L + 20; x += 24) ctx.lineTo(x, y(x) - ep / 2 + Math.sin((x / L) * TAU * 3 + TAU * t) * ep * 0.15);
        for (let x = L + 20; x >= -20; x -= 24) ctx.lineTo(x, y(x) + ep / 2);
        ctx.closePath();
        ctx.fill();
      }
    });
    ctx.globalCompositeOperation = "source-over";
  }

  if (style === "hyperespace") {
    const cx = L / 2, cy = H * 0.38, max = Math.hypot(L, H) * 0.65;
    halo(ctx, L, H, cx, cy, 700, rgba(violet, 0.4));
    halo(ctx, L, H, cx, cy, 380, rgba(teinte, 0.28));
    ctx.lineCap = "round";
    for (const r of RAYONS) {
      const d = (r.d + t * r.v) % 1;
      const p = d * d;
      const r1 = 60 + p * max, r2 = r1 + 30 + p * 260 * r.l;
      const a = Math.min(1, d * 2.2) * (1 - d * 0.3);
      ctx.strokeStyle = `rgba(255,255,255,${(a * 0.85).toFixed(3)})`;
      ctx.lineWidth = 1.2 + p * 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(r.a) * r1, cy + Math.sin(r.a) * r1);
      ctx.lineTo(cx + Math.cos(r.a) * r2, cy + Math.sin(r.a) * r2);
      ctx.stroke();
    }
  }

  if (style === "orbites") {
    cielEtoile(ctx, L, H, t, true);
    const cx = L / 2, cy = H * 0.4;
    const pulse = 0.5 + 0.5 * Math.sin(TAU * t);
    halo(ctx, L, H, cx, cy, 620 + pulse * 80, rgba(violet, 0.34 + pulse * 0.08));
    halo(ctx, L, H, L * 0.15, H * 0.85, 760, rgba(teinte, 0.26));
    const orbites: [number, number, number, number][] = [[430, 0.32, 1, 0], [560, 0.38, -1, 0.3], [700, 0.3, 1, 0.65]];
    orbites.forEach(([rx, k, sens, ph], i) => {
      const ry = rx * k;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.35 + i * 0.25);
      ctx.strokeStyle = "rgba(224,179,255,.2)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
      ctx.stroke();
      const a = TAU * (t * sens + ph);
      const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 40);
      g.addColorStop(0, i === 1 ? rgba(teinte, 1) : "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, 40, 0, TAU);
      ctx.fill();
      ctx.restore();
    });
  }

  if (style === "particules") {
    halo(ctx, L, H, L * 0.8, H * 0.18, 820, rgba(violet, 0.38));
    halo(ctx, L, H, L * 0.2, H * 0.75, 820, rgba(teinte, 0.3));
    cielEtoile(ctx, L, H, t, false);
    for (const p of PARTICULES) {
      const y = ((p.y - t * p.v) % 1 + 1) % 1;
      const x = p.x * L + Math.sin(TAU * (t * p.v + p.p)) * 30;
      const bord = Math.min(1, y * 6, (1 - y) * 6);
      const g = ctx.createRadialGradient(x, y * H, 0, x, y * H, p.r * 2.4);
      g.addColorStop(0, `rgba(224,179,255,${(p.a * bord).toFixed(3)})`);
      g.addColorStop(1, "rgba(224,179,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y * H, p.r * 2.4, 0, TAU);
      ctx.fill();
    }
  }

  voile(ctx, L, H);
}
