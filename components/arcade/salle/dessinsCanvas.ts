// Illustrations des jeux d'arcade dessinées sur <canvas>, dans le style de la banque d'icônes
// Cycylive (traits arrondis, remplissage léger, petit éclat signature) : plus aucun emoji.

type C = CanvasRenderingContext2D;

/** Petit éclat à 4 branches (signature Cycylive). */
export function eclat(ctx: C, x: number, y: number, r: number, couleur = "#fff") {
  ctx.save();
  ctx.fillStyle = couleur;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.18, y - r * 0.18, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.18, y + r * 0.18, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.18, y + r * 0.18, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.18, y - r * 0.18, x, y - r);
  ctx.fill();
  ctx.restore();
}

/** Étoile à 5 branches brillante (dégradé, reflet). */
export function etoile(ctx: C, x: number, y: number, r: number, couleur: string, angle = 0, lueur = 12) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.48 : r, a = (i * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, "#fffbe6");
  g.addColorStop(0.45, couleur);
  g.addColorStop(1, couleur);
  ctx.shadowColor = couleur;
  ctx.shadowBlur = lueur;
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.strokeStyle = "rgba(255,255,255,.75)";
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.7)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.22, -r * 0.3, r * 0.16, r * 0.09, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Pastille ronde d'un bonus : halo, anneau, puis l'icône dessinée par `icone`. */
export function pastilleBonus(ctx: C, x: number, y: number, r: number, couleur: string, t: number, icone: (ctx: C, s: number) => void) {
  const pulse = 1 + Math.sin(t * 6) * 0.07;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.5);
  g.addColorStop(0, couleur + "55");
  g.addColorStop(1, couleur + "00");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#140b24cc";
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 2.4; ctx.strokeStyle = couleur; ctx.stroke();
  ctx.strokeStyle = couleur; ctx.fillStyle = couleur;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  icone(ctx, r * 0.62);
  ctx.restore();
  eclat(ctx, x + r * 0.72, y - r * 0.72, r * 0.28, "#fff");
}

// ── Icônes (centrées en 0,0, taille s) ──
export function iconeBouclier(ctx: C, s: number) {
  ctx.lineWidth = s * 0.2;
  ctx.beginPath();
  ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.55, -s * 0.72, s * 0.9, -s * 0.72);
  ctx.quadraticCurveTo(s * 0.95, s * 0.45, 0, s); ctx.quadraticCurveTo(-s * 0.95, s * 0.45, -s * 0.9, -s * 0.72);
  ctx.quadraticCurveTo(-s * 0.55, -s * 0.72, 0, -s);
  ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s * 0.35, 0); ctx.lineTo(-s * 0.05, s * 0.3); ctx.lineTo(s * 0.4, -s * 0.25); ctx.stroke();
}
export function iconeSablier(ctx: C, s: number) {
  ctx.lineWidth = s * 0.2;
  ctx.beginPath(); ctx.moveTo(-s * 0.7, -s); ctx.lineTo(s * 0.7, -s); ctx.moveTo(-s * 0.7, s); ctx.lineTo(s * 0.7, s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s * 0.55, -s); ctx.quadraticCurveTo(-s * 0.5, -s * 0.2, 0, 0); ctx.quadraticCurveTo(-s * 0.5, s * 0.2, -s * 0.55, s);
  ctx.moveTo(s * 0.55, -s); ctx.quadraticCurveTo(s * 0.5, -s * 0.2, 0, 0); ctx.quadraticCurveTo(s * 0.5, s * 0.2, s * 0.55, s); ctx.stroke();
  ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(-s * 0.4, s * 0.85); ctx.lineTo(s * 0.4, s * 0.85); ctx.lineTo(0, s * 0.3); ctx.fill(); ctx.globalAlpha = 1;
}
export function iconeMiniVaisseau(ctx: C, s: number) {
  ctx.lineWidth = s * 0.18;
  ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.6, s * 0.6); ctx.lineTo(0, s * 0.3); ctx.lineTo(-s * 0.6, s * 0.6); ctx.closePath();
  ctx.globalAlpha = 0.3; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s * 0.95, -s * 0.15); ctx.lineTo(-s * 0.6, -s * 0.15); ctx.moveTo(s * 0.6, -s * 0.15); ctx.lineTo(s * 0.95, -s * 0.15); ctx.stroke();
}
export function iconeEtoile(ctx: C, s: number) {
  ctx.lineWidth = s * 0.16;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? s * 0.45 : s, a = (i * Math.PI) / 5 - Math.PI / 2; const px = Math.cos(a) * rr, py = Math.sin(a) * rr; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
  ctx.closePath(); ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
}
export function iconeCoeur(ctx: C, s: number) {
  ctx.lineWidth = s * 0.18;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.85);
  ctx.bezierCurveTo(-s * 1.2, 0, -s * 0.7, -s, 0, -s * 0.35);
  ctx.bezierCurveTo(s * 0.7, -s, s * 1.2, 0, 0, s * 0.85);
  ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
}
export function iconeAimant(ctx: C, s: number) {
  ctx.lineWidth = s * 0.34;
  ctx.beginPath(); ctx.arc(0, -s * 0.05, s * 0.6, Math.PI, 0, true); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-s * 0.6, -s * 0.05); ctx.lineTo(-s * 0.6, -s * 0.75); ctx.moveTo(s * 0.6, -s * 0.05); ctx.lineTo(s * 0.6, -s * 0.75); ctx.stroke();
  ctx.save(); ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(-s * 0.6, -s * 0.6); ctx.lineTo(-s * 0.6, -s * 0.85); ctx.moveTo(s * 0.6, -s * 0.6); ctx.lineTo(s * 0.6, -s * 0.85); ctx.stroke(); ctx.restore();
}
export function iconeFilet(ctx: C, s: number) {
  ctx.lineWidth = s * 0.18;
  ctx.beginPath(); ctx.moveTo(-s, -s * 0.35); ctx.quadraticCurveTo(0, s * 1.2, s, -s * 0.35); ctx.stroke();
  ctx.lineWidth = s * 0.08;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * s * 0.38, -s * 0.3); ctx.lineTo(i * s * 0.18, s * 0.45); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-s * 0.85, 0); ctx.quadraticCurveTo(0, s * 0.5, s * 0.85, 0); ctx.stroke();
}
export function iconeDouble(ctx: C, s: number) {
  ctx.font = `900 ${s * 1.35}px system-ui, sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("×2", 0, s * 0.08);
}

/** Astéroïde illustré : roche polygonale ombrée, cratères, liseré clair. */
export function asteroide(ctx: C, x: number, y: number, r: number, angle: number, forme: number[], teinte: string) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle);
  ctx.beginPath();
  forme.forEach((k, i) => { const a = (i / forme.length) * Math.PI * 2; const px = Math.cos(a) * r * k, py = Math.sin(a) * r * k; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
  g.addColorStop(0, "#d9c4b8"); g.addColorStop(0.45, teinte); g.addColorStop(1, "#2a1d33");
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,230,255,.28)"; ctx.stroke();
  ctx.fillStyle = "rgba(20,10,30,.32)";
  ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.18, r * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-r * 0.32, r * 0.3, r * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(r * 0.05, r * 0.42, r * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.18)";
  ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.24, r * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** Météorite enflammée avec traînée. */
export function meteorite(ctx: C, x: number, y: number, vx: number, r = 13) {
  const g = ctx.createLinearGradient(x, y, x - vx * 0.18, y - 56);
  g.addColorStop(0, "rgba(255,150,80,.9)"); g.addColorStop(0.5, "rgba(255,90,120,.45)"); g.addColorStop(1, "rgba(255,90,120,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - r * 0.8, y - 2); ctx.lineTo(x - vx * 0.18, y - 58); ctx.lineTo(x + r * 0.8, y - 2); ctx.fill();
  asteroide(ctx, x, y, r, x * 0.05, [1, 0.86, 0.95, 0.8, 1, 0.9, 0.85], "#9a5a48");
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "rgba(255,140,60,.35)"; ctx.beginPath(); ctx.arc(x, y + 2, r * 1.2, 0, Math.PI); ctx.fill(); ctx.restore();
}

/** Trou noir : disque d'accrétion qui tourne. */
export function trouNoir(ctx: C, x: number, y: number, t: number, r = 22) {
  const g = ctx.createRadialGradient(x, y, 2, x, y, r * 1.3);
  g.addColorStop(0, "#000"); g.addColorStop(0.45, "#0b0218"); g.addColorStop(0.7, "rgba(168,85,247,.55)"); g.addColorStop(1, "rgba(168,85,247,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2.4);
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = i === 1 ? "rgba(255,120,220,.8)" : "rgba(170,120,255,.75)";
    ctx.lineWidth = 2.2 - i * 0.4;
    ctx.beginPath(); ctx.ellipse(0, 0, r * (0.95 + i * 0.12), r * (0.32 + i * 0.05), i * 0.5, 0.3, Math.PI * 1.6); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(x, y, r * 0.42, 0, Math.PI * 2); ctx.fill();
}

// ── Armes d'Astro Dodge ──
export function iconeLaser(ctx: C, s: number) {
  ctx.lineWidth = s * 0.22;
  ctx.beginPath(); ctx.moveTo(0, s); ctx.lineTo(0, -s); ctx.stroke();
  ctx.lineWidth = s * 0.1;
  ctx.beginPath(); ctx.moveTo(-s * 0.5, -s * 0.3); ctx.lineTo(0, -s); ctx.lineTo(s * 0.5, -s * 0.3); ctx.stroke();
  ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.45, s, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
}
export function iconeRafale(ctx: C, s: number) {
  ctx.lineWidth = s * 0.18;
  for (const [dx, dy] of [[-s * 0.45, s * 0.2], [s * 0.45, s * 0.2], [0, -s * 0.35]] as [number, number][]) {
    ctx.beginPath(); ctx.moveTo(dx, dy + s * 0.55); ctx.lineTo(dx, dy - s * 0.55); ctx.stroke();
    ctx.beginPath(); ctx.arc(dx, dy - s * 0.55, s * 0.12, 0, Math.PI * 2); ctx.fill();
  }
}
export function iconeEventail(ctx: C, s: number) {
  ctx.lineWidth = s * 0.16;
  for (const a of [-0.7, -0.35, 0, 0.35, 0.7]) {
    ctx.beginPath(); ctx.moveTo(0, s * 0.8); ctx.lineTo(Math.sin(a) * s * 1.05, s * 0.8 - Math.cos(a) * s * 1.6); ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0, s * 0.8, s * 0.22, 0, Math.PI * 2); ctx.fill();
}
export function iconeChercheur(ctx: C, s: number) {
  ctx.lineWidth = s * 0.16;
  ctx.beginPath(); ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, -s * 0.55); ctx.moveTo(0, s); ctx.lineTo(0, s * 0.55); ctx.moveTo(-s, 0); ctx.lineTo(-s * 0.55, 0); ctx.moveTo(s, 0); ctx.lineTo(s * 0.55, 0); ctx.stroke();
}

/** Soucoupe extraterrestre ennemie (dôme, disque, hublots qui clignotent). */
export function soucoupe(ctx: C, x: number, y: number, r: number, t: number, touche: number, teinte = "#6bffc8") {
  ctx.save(); ctx.translate(x, y);
  // faisceau de lueur sous la soucoupe
  const g = ctx.createRadialGradient(0, r * 0.3, 0, 0, r * 0.3, r * 1.6);
  g.addColorStop(0, teinte + "44"); g.addColorStop(1, teinte + "00");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, r * 0.3, r * 1.6, 0, Math.PI * 2); ctx.fill();
  // dôme
  const d = ctx.createLinearGradient(0, -r * 0.9, 0, 0);
  d.addColorStop(0, "#d8fbff"); d.addColorStop(1, "#5fd4ff88");
  ctx.fillStyle = d; ctx.beginPath(); ctx.ellipse(0, -r * 0.15, r * 0.52, r * 0.6, 0, Math.PI, 0); ctx.fill();
  // petit alien dans le dôme
  ctx.fillStyle = teinte; ctx.beginPath(); ctx.ellipse(0, -r * 0.28, r * 0.22, r * 0.24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#140b24"; ctx.beginPath(); ctx.ellipse(-r * 0.09, -r * 0.3, r * 0.06, r * 0.09, 0, 0, Math.PI * 2); ctx.ellipse(r * 0.09, -r * 0.3, r * 0.06, r * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  // disque
  const c = ctx.createLinearGradient(0, -r * 0.2, 0, r * 0.35);
  c.addColorStop(0, touche > 0 ? "#ffffff" : "#c9c3e6"); c.addColorStop(0.5, touche > 0 ? "#ffd1d1" : "#8a7fb3"); c.addColorStop(1, "#3c2f66");
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = "#ffffff66"; ctx.stroke();
  // hublots qui clignotent
  for (let i = 0; i < 5; i++) {
    const on = Math.floor(t * 6 + i) % 5 < 2;
    ctx.fillStyle = on ? "#ffe27a" : "#ff6bd6";
    ctx.beginPath(); ctx.arc(-r * 0.66 + i * r * 0.33, r * 0.06, r * 0.08, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
