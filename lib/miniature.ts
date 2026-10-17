// ============================================================
// CHARTE DES MINIATURES YOUTUBE CYCYLIVE (1280 × 720)
// ============================================================
// Une seule mise en page pour toutes les vidéos, déclinée par série :
//  • fond : une vraie image du jeu (capture de la VOD), étalonnée
//    (contraste, assombrissement côté texte, vignette, grain léger) ;
//  • toi : la vraie capture de ta webcam dans un cadre arrondi lumineux
//    (ou une photo déjà détourée en PNG) ;
//  • titre : 2 lignes courtes, majuscules, une couleur d'accent par série ;
//  • badge de série + numéro toujours au même endroit, logo discret.
// Pas de décor dessiné : c'est ce qui donne l'effet « image générée ».

export type Serie = "valorant" | "letsplay" | "bestof" | "autre";

export const SERIES: Record<Serie, { nom: string; badge: string; accent: string; accent2: string; teinte: string; lueur: string }> = {
  valorant: { nom: "Valorant", badge: "VALORANT", accent: "#ff4655", accent2: "#ffd1d6", teinte: "#2a0509", lueur: "#ff4655" },
  letsplay: { nom: "Let's Play", badge: "LET'S PLAY", accent: "#c9a6ff", accent2: "#ffd36e", teinte: "#140a33", lueur: "#9146ff" },
  bestof: { nom: "Best of", badge: "BEST OF", accent: "#ffd36e", accent2: "#ffffff", teinte: "#1f1206", lueur: "#ffb547" },
  autre: { nom: "Autre", badge: "CYCYLIVE", accent: "#7cc4ff", accent2: "#ffffff", teinte: "#071a2e", lueur: "#5fd4ff" },
};

export type Recadrage = { zoom: number; x: number; y: number }; // zoom ≥ 1, x/y de -1 à 1

export type ParamsMiniature = {
  serie: Serie;
  ligne1: string;
  ligne2: string;
  badge: string; // texte du badge (vide = celui de la série)
  numero: string; // « 4 » → #4 (vide = pas de numéro)
  cote: "droite" | "gauche"; // où se trouve ta webcam
  modeVisage: "cadre" | "detoure" | "aucun";
  tailleVisage: number; // 0.6 à 1.4
  fond: Recadrage;
  visage: Recadrage;
  assombrir: number; // 0 à 1
  flou: number; // 0 à 12 px
  logo: boolean;
  police: string; // famille CSS déjà chargée
};

export const PARAMS_DEFAUT: ParamsMiniature = {
  serie: "valorant", ligne1: "MON PREMIER", ligne2: "ACE !", badge: "", numero: "", cote: "droite", modeVisage: "cadre", tailleVisage: 1,
  fond: { zoom: 1, x: 0, y: 0 }, visage: { zoom: 1, x: 0, y: 0 }, assombrir: 0.45, flou: 0, logo: true, police: "Poppins",
};

const L = 1280, H = 720;

/** Dessine l'image en mode « cover » dans la boîte, avec zoom et décalage. */
function couvrir(ctx: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, bx: number, by: number, bw: number, bh: number, r: Recadrage) {
  const iw = img.width, ih = img.height;
  const k = Math.max(bw / iw, bh / ih) * Math.max(1, r.zoom);
  const w = iw * k, h = ih * k;
  const x = bx + (bw - w) / 2 + ((w - bw) / 2) * r.x;
  const y = by + (bh - h) / 2 + ((h - bh) / 2) * r.y;
  ctx.drawImage(img, x, y, w, h);
}

function rondRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Taille de police la plus grande qui tient dans la largeur. */
function ajuster(ctx: CanvasRenderingContext2D, texte: string, police: string, max: number, largeur: number, min = 40) {
  let t = max;
  while (t > min) { ctx.font = `800 ${t}px "${police}"`; if (ctx.measureText(texte).width <= largeur) break; t -= 4; }
  return t;
}

function grain(ctx: CanvasRenderingContext2D) {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const g = c.getContext("2d")!;
  const d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() - 0.5) * 70; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; }
  g.putImageData(d, 0, 0);
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = ctx.createPattern(c, "repeat")!;
  ctx.fillRect(0, 0, L, H);
  ctx.restore();
}

/** Texte en majuscules avec contour épais et ombre portée (lisible en petit). */
function titre(ctx: CanvasRenderingContext2D, texte: string, x: number, y: number, taille: number, couleur: string, police: string, align: CanvasTextAlign) {
  ctx.save();
  ctx.font = `800 ${taille}px "${police}"`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0,0,0,.65)";
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = taille * 0.07;
  ctx.lineWidth = taille * 0.16;
  ctx.strokeStyle = "#0b0610";
  ctx.strokeText(texte, x, y);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = couleur;
  ctx.fillText(texte, x, y);
  ctx.restore();
}

export function dessinerMiniature(ctx: CanvasRenderingContext2D, p: ParamsMiniature, images: { fond?: HTMLImageElement | HTMLCanvasElement | null; visage?: HTMLImageElement | HTMLCanvasElement | null }) {
  const S = SERIES[p.serie] || SERIES.autre;
  const droite = p.cote === "droite";
  ctx.save();
  ctx.clearRect(0, 0, L, H);

  // ── Fond : capture du jeu étalonnée ──
  ctx.fillStyle = S.teinte;
  ctx.fillRect(0, 0, L, H);
  if (images.fond) {
    ctx.save();
    ctx.filter = `saturate(1.25) contrast(1.12) brightness(${1 - p.assombrir * 0.35})${p.flou ? ` blur(${p.flou}px)` : ""}`;
    couvrir(ctx, images.fond as HTMLImageElement, -p.flou * 2, -p.flou * 2, L + p.flou * 4, H + p.flou * 4, p.fond);
    ctx.restore();
  }
  // dégradé côté texte (le texte reste lisible quel que soit le fond)
  const gx = ctx.createLinearGradient(droite ? 0 : L, 0, droite ? L * 0.75 : L * 0.25, 0);
  gx.addColorStop(0, hexA(S.teinte, 0.55 + p.assombrir * 0.4));
  gx.addColorStop(1, hexA(S.teinte, 0));
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, L, H);
  const gb = ctx.createLinearGradient(0, H * 0.45, 0, H);
  gb.addColorStop(0, "rgba(0,0,0,0)");
  gb.addColorStop(1, `rgba(0,0,0,${0.35 + p.assombrir * 0.3})`);
  ctx.fillStyle = gb;
  ctx.fillRect(0, 0, L, H);
  // vignette
  const v = ctx.createRadialGradient(L / 2, H / 2, H * 0.35, L / 2, H / 2, H * 0.95);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,.55)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, L, H);
  // touche de couleur de la série
  const halo = ctx.createRadialGradient(droite ? L * 0.8 : L * 0.2, H * 0.55, 10, droite ? L * 0.8 : L * 0.2, H * 0.55, H * 0.7);
  halo.addColorStop(0, hexA(S.lueur, 0.28));
  halo.addColorStop(1, hexA(S.lueur, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, L, H);

  // ── Toi ──
  if (images.visage && p.modeVisage !== "aucun") {
    const k = Math.max(0.6, Math.min(1.4, p.tailleVisage));
    if (p.modeVisage === "cadre") {
      const w = 450 * k, h = 380 * k;
      const x = droite ? L - w - 46 : 46, y = H - h - 54;
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((droite ? 2.2 : -2.2) * Math.PI / 180);
      ctx.translate(-w / 2, -h / 2);
      ctx.shadowColor = hexA(S.lueur, 0.85); ctx.shadowBlur = 38;
      rondRect(ctx, -7, -7, w + 14, h + 14, 34);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.shadowBlur = 0;
      rondRect(ctx, 0, 0, w, h, 28);
      ctx.save(); ctx.clip();
      ctx.filter = "saturate(1.1) contrast(1.06)";
      couvrir(ctx, images.visage as HTMLImageElement, 0, 0, w, h, p.visage);
      ctx.restore();
      ctx.lineWidth = 3; ctx.strokeStyle = hexA(S.accent, 0.9);
      rondRect(ctx, 0, 0, w, h, 28); ctx.stroke();
      ctx.restore();
    } else {
      // photo détourée (PNG transparent) : contour blanc et lueur
      const img = images.visage as HTMLImageElement;
      const h = H * 1.02 * k, w = (img.width / img.height) * h;
      const x = droite ? L - w + 30 + p.visage.x * 120 : -30 + p.visage.x * 120, y = H - h + 20 + p.visage.y * 80;
      ctx.save();
      ctx.shadowColor = hexA(S.lueur, 0.9); ctx.shadowBlur = 30;
      for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4]]) { ctx.filter = "brightness(0) invert(1)"; ctx.drawImage(img, x + dx, y + dy, w, h); }
      ctx.restore();
      ctx.save(); ctx.filter = "saturate(1.1) contrast(1.06)"; ctx.drawImage(img, x, y, w, h); ctx.restore();
    }
  }

  // ── Titre ──
  const zoneTexte = images.visage && p.modeVisage !== "aucun" ? (p.modeVisage === "cadre" ? 1280 - 450 * Math.max(0.6, Math.min(1.4, p.tailleVisage)) - 46 - 56 - 44 : 640) : 1140;
  const xt = droite ? 56 : L - 56;
  const align: CanvasTextAlign = droite ? "left" : "right";
  const l1 = (p.ligne1 || "").toUpperCase().trim(), l2 = (p.ligne2 || "").toUpperCase().trim();
  ctx.save();
  ctx.translate(xt, 0);
  ctx.rotate(-2.5 * Math.PI / 180);
  ctx.translate(-xt, 0);
  const t1 = l1 ? ajuster(ctx, l1, p.police, 132, zoneTexte) : 0;
  const t2 = l2 ? ajuster(ctx, l2, p.police, 190, zoneTexte) : 0;
  const total = t1 + t2 + (t1 && t2 ? 6 : 0);
  let y = H * 0.56 - total / 2 + t1 * 0.82;
  if (l1) { titre(ctx, l1, xt, y, t1, "#ffffff", p.police, align); y += t2 * 0.92 + 6; }
  else y = H * 0.56 + t2 * 0.3;
  if (l2) titre(ctx, l2, xt, y, t2, S.accent, p.police, align);
  ctx.restore();

  // ── Badge série + numéro ──
  const badge = (p.badge || S.badge).toUpperCase();
  ctx.save();
  ctx.font = `800 30px "${p.police}"`;
  const bw = ctx.measureText(badge).width + 44, bh = 52;
  const bx = droite ? 44 : L - 44 - bw - (p.numero ? 78 : 0), by = 40;
  ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
  rondRect(ctx, bx, by, bw, bh, 14);
  ctx.fillStyle = S.accent; ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = p.serie === "bestof" ? "#2a1606" : "#ffffff";
  ctx.textBaseline = "middle"; ctx.textAlign = "center";
  ctx.fillText(badge, bx + bw / 2, by + bh / 2 + 2);
  if (p.numero) {
    const nx = bx + bw + 12;
    rondRect(ctx, nx, by - 6, 66, 64, 16);
    ctx.fillStyle = "#0b0610"; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = S.accent; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = `800 34px "${p.police}"`;
    ctx.fillText("#" + String(p.numero).replace(/^#/, "").slice(0, 3), nx + 33, by + 28);
  }
  ctx.restore();

  // ── Logo discret ──
  if (p.logo) {
    ctx.save();
    ctx.font = `800 26px "${p.police}"`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = droite ? "left" : "right";
    const lx = droite ? 58 : L - 58, ly = H - 40;
    ctx.shadowColor = "rgba(0,0,0,.7)"; ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.fillText("✦ CYCYLIVE", lx, ly);
    ctx.restore();
  }

  grain(ctx);
  ctx.restore();
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
}
