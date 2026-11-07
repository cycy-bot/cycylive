// Habillage « thème Cycylive » des TikToks : calques posés sur la vidéo (carte titre, encart sur la séparation
// caméra / jeu, barre de progression, étiquettes, textes libres, sous-titres, flashs de kill), chacun avec ses temps,
// sa position et son animation. Le même dessin sert à l'aperçu (timeline) et à l'export.

export const W = 1080, H = 1920;
export type Anim = "fondu" | "pop" | "glisse-haut" | "glisse-bas" | "zoom" | "aucune";
export type TypeCalque = "carte" | "encart" | "barre" | "etiquette" | "texte" | "soustitres" | "flash";
export type Calque = {
  id: string; type: TypeCalque; visible: boolean;
  debut: number; fin: number;          // secondes depuis le début de la vidéo coupée
  x: number; y: number;                // centre, en fraction de la largeur / hauteur
  anim: Anim; texte: string; sous: string;
  intensite: number; zoom: boolean; onde: boolean; // flash
  lie: boolean;                        // encart : reste collé à la barre (séparation)
};
export type SousTitre = { id: string; debut: number; fin: number; texte: string };

export const ANIMS: { v: Anim; l: string }[] = [
  { v: "fondu", l: "Fondu" }, { v: "pop", l: "Pop (rebond)" }, { v: "glisse-haut", l: "Monte du bas" },
  { v: "glisse-bas", l: "Descend du haut" }, { v: "zoom", l: "Zoom arrière" }, { v: "aucune", l: "Sans animation" },
];
export const NOMS: Record<TypeCalque, string> = {
  carte: "Carte titre", encart: "Encart CYCYLIVE", barre: "Barre de progression", etiquette: "Étiquette de fin",
  texte: "Texte", soustitres: "Sous-titres", flash: "Flash (kill)",
};
export const COULEURS: Record<TypeCalque, string> = {
  carte: "#a970ff", encart: "#9146ff", barre: "#ec4899", etiquette: "#f472b6", texte: "#38bdf8", soustitres: "#fbbf24", flash: "#ffffff",
};

const F = { titre: "CyAnton, Impact, sans-serif", cond: "CyBarlowC, 'Arial Narrow', sans-serif", texte: "CyBarlow, system-ui, sans-serif" };
const VIOLET = [145, 70, 255], ROSE = [240, 120, 220];
export const melange = (k: number) => `rgb(${VIOLET.map((v, i) => Math.round(v + (ROSE[i] - v) * k)).join(",")})`;
export const easeOut = (x: number) => { const v = Math.max(0, Math.min(1, x)); return 1 - (1 - v) ** 3; };
const backOut = (x: number) => { const v = Math.max(0, Math.min(1, x)) - 1, s = 1.7; return 1 + v * v * ((s + 1) * v + s); };
export const nouvelId = () => Math.random().toString(36).slice(2, 9);

const calque = (p: Partial<Calque> & Pick<Calque, "type">): Calque => ({
  id: nouvelId(), visible: true, debut: 0, fin: 1, x: 0.5, y: 0.5, anim: "fondu", texte: "", sous: "",
  intensite: 0.6, zoom: true, onde: true, lie: true, ...p,
});

// ── Modèle (ce qui est gardé d'une vidéo à l'autre) ──
export type Modele = {
  sep: number; carteDuree: number; carteY: number; carteAnim: Anim; carteOn: boolean;
  encartOn: boolean; encartTexte: string; encartAnim: Anim; barreOn: boolean;
  etiqOn: boolean; etiqTexte: string; etiqDuree: number; etiqY: number; etiqAnim: Anim;
  stY: number; ending: boolean;
};
export const MODELE_DEFAUT: Modele = {
  sep: 731 / H, carteDuree: 3, carteY: 1231 / H, carteAnim: "zoom", carteOn: true,
  encartOn: true, encartTexte: "CYCYLIVE  ·  TWITCH", encartAnim: "fondu", barreOn: true,
  etiqOn: true, etiqTexte: "ABONNE-TOI POUR NE RIEN MANQUER  ›", etiqDuree: 1.6, etiqY: 1111 / H, etiqAnim: "pop",
  stY: 902 / H, ending: true,
};

/** Calques de départ pour une vidéo de `duree` secondes, d'après le modèle. */
export function calquesDepuisModele(m: Modele, duree: number, titre = "", sous = ""): Calque[] {
  const d = Math.max(1, duree);
  return [
    calque({ type: "barre", debut: 0, fin: d, y: m.sep, visible: m.barreOn, anim: "aucune" }),
    calque({ type: "encart", debut: 0, fin: d, y: m.sep, texte: m.encartTexte, visible: m.encartOn, anim: m.encartAnim }),
    calque({ type: "soustitres", debut: 0, fin: d, y: m.stY, anim: "pop" }),
    calque({ type: "carte", debut: 0, fin: Math.min(d, m.carteDuree), y: m.carteY, texte: titre, sous, visible: m.carteOn, anim: m.carteAnim }),
    calque({ type: "etiquette", debut: Math.max(0, d - m.etiqDuree), fin: d, y: m.etiqY, texte: m.etiqTexte, visible: m.etiqOn, anim: m.etiqAnim }),
  ];
}
/** Ce qui est réutilisé la prochaine fois (positions, durées, animations, textes fixes). */
export function modeleDepuisCalques(c: Calque[], duree: number, ending: boolean): Modele {
  const t = (k: TypeCalque) => c.find((x) => x.type === k);
  const ca = t("carte"), en = t("encart"), ba = t("barre"), et = t("etiquette"), st = t("soustitres");
  return {
    sep: ba?.y ?? MODELE_DEFAUT.sep,
    carteDuree: ca ? Math.max(0.5, ca.fin - ca.debut) : MODELE_DEFAUT.carteDuree, carteY: ca?.y ?? MODELE_DEFAUT.carteY, carteAnim: ca?.anim ?? "zoom", carteOn: ca?.visible ?? true,
    encartOn: en?.visible ?? true, encartTexte: en?.texte || MODELE_DEFAUT.encartTexte, encartAnim: en?.anim ?? "fondu", barreOn: ba?.visible ?? true,
    etiqOn: et?.visible ?? true, etiqTexte: et?.texte || MODELE_DEFAUT.etiqTexte, etiqDuree: et ? Math.max(0.5, Math.min(duree, et.fin) - et.debut) : 1.6, etiqY: et?.y ?? MODELE_DEFAUT.etiqY, etiqAnim: et?.anim ?? "pop",
    stY: st?.y ?? MODELE_DEFAUT.stY, ending,
  };
}
export const nouveauFlash = (t: number): Calque => calque({ type: "flash", debut: t, fin: t + 0.25, y: 0.69, intensite: 0.6, anim: "aucune" });
export const nouveauTexte = (t: number, duree: number): Calque => calque({ type: "texte", debut: t, fin: Math.min(duree, t + 2.5), y: 0.6, texte: "TEXTE", anim: "pop" });

// ── Animations d'entrée / sortie (0,3 s) ──
function animation(anim: Anim, rel: number, duree: number) {
  if (anim === "aucune") return { a: 1, dy: 0, s: 1 };
  const ent = Math.min(1, rel / 0.3), sor = Math.min(1, (duree - rel) / 0.3);
  const k = Math.min(ent, sor), e = easeOut(k);
  switch (anim) {
    case "pop": return { a: Math.min(1, k * 3), dy: 0, s: ent < 1 ? 0.6 + 0.4 * backOut(ent) : 0.85 + 0.15 * easeOut(sor) };
    case "glisse-haut": return { a: e, dy: (1 - e) * 70, s: 1 };
    case "glisse-bas": return { a: e, dy: -(1 - e) * 70, s: 1 };
    case "zoom": return { a: e, dy: 0, s: 1.18 - 0.18 * e };
    default: return { a: e, dy: 0, s: 0.96 + 0.04 * e };
  }
}

// ── Dessins ──
function lignes(ctx: CanvasRenderingContext2D, texte: string, largeur: number) {
  const out: string[] = []; let l = "";
  for (const mot of texte.split(/\s+/).filter(Boolean)) { const essai = l ? `${l} ${mot}` : mot; if (ctx.measureText(essai).width > largeur && l) { out.push(l); l = mot; } else l = essai; }
  if (l) out.push(l); return out;
}
const pilule = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
type Boite = { x: number; y: number; w: number; h: number };

function carteTitre(ctx: CanvasRenderingContext2D, titre: string, sous: string, cx: number, cy: number): Boite {
  const w = 940;
  let taille = 92; ctx.font = `${taille}px ${F.titre}`;
  let ls = [titre.toUpperCase()];
  while (ctx.measureText(ls[0]).width > w - 70 && taille > 70) { taille -= 2; ctx.font = `${taille}px ${F.titre}`; }
  if (ctx.measureText(ls[0]).width > w - 70) { taille = 80; ctx.font = `${taille}px ${F.titre}`; ls = lignes(ctx, titre.toUpperCase(), w - 70).slice(0, 2); }
  const h = 70 + ls.length * taille * 1.02 + (sous ? 60 : 10);
  const x = cx - w / 2, y = cy - h / 2;
  ctx.save();
  ctx.shadowColor = "rgba(10,0,30,.7)"; ctx.shadowBlur = 36; ctx.shadowOffsetY = 8;
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, "rgba(28,10,52,.91)"); g.addColorStop(1, "rgba(52,8,70,.91)");
  ctx.fillStyle = g; pilule(ctx, x, y, w, h, 42); ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.save(); pilule(ctx, x, y, w, h, 42); ctx.clip();
  const l = ctx.createLinearGradient(x, 0, x + w, 0); l.addColorStop(0, melange(0)); l.addColorStop(1, melange(1));
  ctx.fillStyle = l; ctx.fillRect(x, y, w, 5); ctx.restore();
  ctx.strokeStyle = "rgba(200,160,255,.55)"; ctx.lineWidth = 3; pilule(ctx, x + 1.5, y + 1.5, w - 3, h - 3, 41); ctx.stroke();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.font = `${taille}px ${F.titre}`;
  ls.forEach((t, i) => ctx.fillText(t, cx, y + 50 + taille * 0.5 + i * taille * 1.02));
  if (sous) { ctx.font = `38px ${F.texte}`; ctx.fillStyle = "rgb(226,206,255)"; ctx.fillText(sous, cx, y + h - 44); }
  ctx.restore();
  return { x, y, w, h };
}
function etiquette(ctx: CanvasRenderingContext2D, texte: string, cx: number, cy: number, taille = 44): Boite {
  ctx.save(); ctx.font = `${taille}px ${F.cond}`;
  const w = ctx.measureText(texte).width + 44, h = taille + 26;
  ctx.fillStyle = "rgba(20,6,44,.88)"; pilule(ctx, cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = "rgba(190,150,255,.47)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(texte, cx, cy + 2);
  ctx.restore();
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
function encart(ctx: CanvasRenderingContext2D, texte: string, cy: number): Boite {
  ctx.save(); ctx.font = `30px ${F.cond}`;
  const w = ctx.measureText(texte).width + 84, h = 46, x = W / 2 - w / 2, y = cy - h / 2;
  ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
  ctx.fillStyle = "rgba(14,5,30,.94)"; pilule(ctx, x, y, w, h, h / 2); ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(169,112,255,.8)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "rgb(145,70,255)"; ctx.beginPath(); ctx.arc(x + 30, cy, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + 30, cy, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(texte, x + 50, cy + 1);
  ctx.restore();
  return { x, y, w, h };
}
// Sous-titre : majuscules, contour sombre, *mots* entre astérisques en rose
function sousTitre(ctx: CanvasRenderingContext2D, texte: string, cy: number): Boite {
  const taille = 54;
  ctx.save(); ctx.font = `${taille}px ${F.titre}`;
  const mots: { m: string; fort: boolean }[] = []; let actif = false;
  for (const brut of texte.toUpperCase().split(/\s+/).filter(Boolean)) {
    const deb = brut.startsWith("*"); if (deb) actif = true;
    mots.push({ m: brut.replace(/\*/g, ""), fort: actif });
    if (brut.slice(1).includes("*") || (deb && brut.length > 1 && brut.endsWith("*"))) actif = false;
  }
  const esp = ctx.measureText(" ").width;
  const larg = (l: typeof mots) => l.reduce((n, x) => n + ctx.measureText(x.m).width, 0) + esp * (l.length - 1);
  let rangs = [mots];
  if (larg(mots) > 960 && mots.length > 1) { let best = 1e9, cut = 1; for (let k = 1; k < mots.length; k++) { const m = Math.max(larg(mots.slice(0, k)), larg(mots.slice(k))); if (m < best) { best = m; cut = k; } } rangs = [mots.slice(0, cut), mots.slice(cut)]; }
  ctx.textBaseline = "middle"; ctx.textAlign = "left"; ctx.lineJoin = "round";
  const h = rangs.length * 64, y0 = cy - h / 2 + 32;
  let wMax = 0;
  rangs.forEach((r, i) => {
    const lw = larg(r); wMax = Math.max(wMax, lw);
    let x = W / 2 - lw / 2; const y = y0 + i * 64;
    for (const { m, fort } of r) { ctx.lineWidth = 9; ctx.strokeStyle = "rgb(16,4,34)"; ctx.strokeText(m, x, y); ctx.fillStyle = fort ? "rgb(255,140,225)" : "#fff"; ctx.fillText(m, x, y); x += ctx.measureText(m).width + esp; }
  });
  ctx.restore();
  return { x: W / 2 - wMax / 2, y: cy - h / 2, w: wMax, h };
}
function texteLibre(ctx: CanvasRenderingContext2D, texte: string, cx: number, cy: number): Boite {
  ctx.save(); const taille = 72; ctx.font = `${taille}px ${F.titre}`;
  const ls = lignes(ctx, texte.toUpperCase(), 940).slice(0, 3);
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  let w = 0;
  ls.forEach((l, i) => { const y = cy + (i - (ls.length - 1) / 2) * taille * 1.05; w = Math.max(w, ctx.measureText(l).width); ctx.lineWidth = 12; ctx.strokeStyle = "rgb(16,4,34)"; ctx.strokeText(l, cx, y); ctx.fillStyle = "#fff"; ctx.fillText(l, cx, y); });
  ctx.restore();
  const h = ls.length * taille * 1.05;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** Zoom ponctuel (« punch ») sur un kill : monte vite, redescend en douceur. */
function punch(t: number, flashs: Calque[]) {
  let z = 0;
  for (const f of flashs) {
    if (!f.visible || !f.zoom) continue;
    const d = t - f.debut;
    if (d >= 0 && d < 0.16) z = Math.max(z, 0.06 * easeOut(d / 0.16));
    else if (d >= 0.16 && d < 0.86) { const x = (d - 0.16) / 0.7; z = Math.max(z, 0.06 * (1 - x * x * (3 - 2 * x))); }
  }
  return 1 + z;
}

/** Dessine la vidéo (remplit le 1080×1920) avec, s'il y a lieu, le zoom de kill sur la partie jeu. */
export function dessinerVideo(ctx: CanvasRenderingContext2D, v: HTMLVideoElement, t: number, calques: Calque[]) {
  const vw = v.videoWidth || W, vh = v.videoHeight || H, s = Math.max(W / vw, H / vh);
  const dw = vw * s, dh = vh * s, dx = (W - dw) / 2, dy = (H - dh) / 2;
  ctx.drawImage(v, dx, dy, dw, dh);
  const z = punch(t, calques.filter((c) => c.type === "flash"));
  if (z > 1.001) {
    const sep = (calques.find((c) => c.type === "barre")?.y ?? MODELE_DEFAUT.sep) * H;
    const cy = sep + (H - sep) * 0.46;
    ctx.save(); ctx.beginPath(); ctx.rect(0, sep + 4, W, H - sep); ctx.clip();
    ctx.translate(W / 2, cy); ctx.scale(z, z); ctx.translate(-W / 2, -cy);
    ctx.drawImage(v, dx, dy, dw, dh); ctx.restore();
  }
}

/** Dessine tous les calques à l'instant t (secondes depuis le début de la vidéo coupée). Renvoie les zones cliquables. */
// tSource : temps de la vidéo source (les sous-titres y sont calés) ; sans coupe, c'est t + debutCoupe
export function dessinerCalques(ctx: CanvasRenderingContext2D, t: number, total: number, calques: Calque[], sousTitres: SousTitre[], debutCoupe = 0, tSource?: number): Record<string, Boite> {
  const ts = tSource ?? t + debutCoupe;
  const zones: Record<string, Boite> = {};
  const barre = calques.find((c) => c.type === "barre");
  const sep = (barre?.y ?? MODELE_DEFAUT.sep) * H;
  // flashs (sous les éléments graphiques, comme sur les TikToks montés)
  for (const f of calques) {
    if (f.type !== "flash" || !f.visible) continue;
    const d = (t - f.debut) / Math.max(0.05, f.fin - f.debut);
    if (d >= 0 && d < 1) { ctx.fillStyle = `rgba(255,245,255,${(0.6 * f.intensite * (1 - d) ** 2).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
    const r = t - f.debut;
    if (f.onde && r >= 0 && r < 0.38) {
      const e = easeOut(r / 0.38), R = 40 + 150 * e, cx = f.x * W, cy = f.y * H;
      ctx.save(); ctx.globalAlpha = 1 - e;
      ctx.strokeStyle = "rgba(255,220,250,.9)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(240,140,230,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R * 0.72, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    zones[f.id] = { x: f.x * W - 60, y: f.y * H - 60, w: 120, h: 120 };
  }
  const ordre: TypeCalque[] = ["barre", "encart", "soustitres", "texte", "etiquette", "carte"];
  for (const type of ordre) {
    for (const c of calques) {
      if (c.type !== type || !c.visible) continue;
      if (type === "soustitres") {
        const st = sousTitres.find((x) => ts >= x.debut && ts < x.fin);
        if (!st?.texte) continue;
        const rel = ts - st.debut, an = animation(c.anim, rel, st.fin - st.debut);
        ctx.save(); ctx.globalAlpha = an.a; ctx.translate(W / 2, c.y * H + an.dy); ctx.scale(an.s, an.s); ctx.translate(-W / 2, -c.y * H);
        zones[c.id] = sousTitre(ctx, st.texte, c.y * H); ctx.restore();
        continue;
      }
      if (t < c.debut || t > c.fin) continue;
      if (type === "barre") {
        const y = c.y * H;
        ctx.fillStyle = "rgb(8,2,20)"; ctx.fillRect(0, y - 3, W, 8);
        const pw = Math.round(W * Math.max(0, Math.min(1, t / Math.max(0.1, total))));
        if (pw > 0) { const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, melange(0)); g.addColorStop(1, melange(1)); ctx.fillStyle = g; ctx.fillRect(0, y - 3, pw, 7); }
        zones[c.id] = { x: 0, y: y - 14, w: W, h: 28 };
        continue;
      }
      const an = animation(c.anim, t - c.debut, c.fin - c.debut);
      if (an.a <= 0.01) continue;
      const cx = (type === "encart" ? 0.5 : c.x) * W, cy = (type === "encart" && c.lie ? sep / H : c.y) * H + an.dy;
      ctx.save(); ctx.globalAlpha = an.a; ctx.translate(cx, cy); ctx.scale(an.s, an.s); ctx.translate(-cx, -cy);
      if (type === "encart") zones[c.id] = encart(ctx, c.texte || "CYCYLIVE  ·  TWITCH", cy);
      else if (type === "carte" && c.texte) zones[c.id] = carteTitre(ctx, c.texte, c.sous, cx, cy);
      else if (type === "etiquette" && c.texte) zones[c.id] = etiquette(ctx, c.texte, cx, cy);
      else if (type === "texte" && c.texte) zones[c.id] = texteLibre(ctx, c.texte, cx, cy);
      ctx.restore();
    }
  }
  return zones;
}
