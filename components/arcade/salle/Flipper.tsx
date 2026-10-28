"use client";

// Flipper cosmique : un flipper spatial dans l'esprit des pinballs PC des années 90.
// Table vue en légère perspective (CSS), physique 2D maison (bille, murs, planètes-bumpers, lance-pierres,
// cibles, couloirs C-Y-C-Y, trou noir) et missions qui font monter en grade : Cadet → Amiral.
// 3 billes. Commandes : ← / Q / Z (flip gauche), → / M / P (flip droit), Espace ou ↓ (lanceur, maintenir
// puis relâcher). Tactile : moitié gauche / droite de la table ; pour lancer, maintenir puis relâcher.
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import { EcranDepart, type PropsJeu } from "./FinDePartie";

// ── La table (unités logiques) ──
const TW = 400, TH = 720;
const R = 9; // rayon de la bille
const G = 560; // gravité (pente de la table)
const VMAX = 1900;

type P = { x: number; y: number };
type Seg = { a: P; b: P; e?: number; kick?: number; id?: string; porte?: boolean };
const p = (x: number, y: number): P => ({ x, y });

// Contour : mur gauche, voûte, mur droit, couloir du lanceur
const ARC_C = p(205, 200), ARC_R = 185;
const MURS: Seg[] = [];
const ajouter = (pts: P[], e = 0.45, extra: Partial<Seg> = {}) => { for (let i = 0; i < pts.length - 1; i++) MURS.push({ a: pts[i], b: pts[i + 1], e, ...extra }); };
{
  const voute: P[] = [];
  for (let i = 0; i <= 28; i++) { const a = Math.PI + (i / 28) * Math.PI; voute.push(p(ARC_C.x + Math.cos(a) * ARC_R, ARC_C.y + Math.sin(a) * ARC_R)); }
  ajouter([p(20, 760), ...voute, p(390, 760)]);
  ajouter([p(350, 760), p(350, 226)]); // mur du couloir de lancement
  ajouter([p(350, 692), p(390, 692)], 0.2); // le lanceur
  // guides des couloirs intérieurs (vers les flippers)
  ajouter([p(46, 500), p(46, 560), p(104, 618)], 0.3);
  ajouter([p(324, 500), p(324, 560), p(266, 618)], 0.3);
  // dos des lance-pierres
  ajouter([p(72, 470), p(72, 540), p(108, 566)], 0.4);
  ajouter([p(298, 470), p(298, 540), p(262, 566)], 0.4);
  // poteaux des couloirs du haut
  for (const x of [96, 140, 184, 228, 272]) ajouter([p(x, 82), p(x, 120)], 0.4);
  // déflecteur près du trou noir
  ajouter([p(330, 230), p(312, 268)], 0.5);
}
// Lance-pierres (face qui repousse la bille vers le centre)
const FRONDES: Seg[] = [
  { a: p(72, 470), b: p(108, 566), e: 0.5, kick: 380, id: "fg" },
  { a: p(298, 470), b: p(262, 566), e: 0.5, kick: 380, id: "fd" },
];
// Porte à sens unique en haut du couloir de lancement
const PORTE: Seg = { a: p(350, 226), b: p(388, 186), e: 0.4, porte: true };
// Planètes-bumpers
const BUMPERS = [
  { x: 142, y: 236, r: 24, c: "#ff7fd6", nom: "rose" },
  { x: 232, y: 222, r: 24, c: "#6bc4ff", nom: "bleue" },
  { x: 188, y: 304, r: 24, c: "#ffd27a", nom: "or" },
];
// Cibles-étoiles (côté gauche), couloirs C-Y-C-Y (en haut), trou noir (à droite)
const CIBLES = [370, 404, 438].map((y) => ({ a: p(30, y - 15), b: p(30, y + 15), y }));
const COULOIRS = [118, 162, 206, 250]; // centres x, y entre 82 et 120
const LETTRES = ["C", "Y", "C", "Y"];
const TROU = p(300, 314);
// Flippers
const FL = { g: { o: p(108, 628), dir: 1 }, d: { o: p(262, 628), dir: -1 } };
const FL_L = 66, REPOS = 0.5, LEVE = -0.48; // angles (rad), mesurés vers le centre

const RANGS = ["Cadet", "Pilote", "Capitaine", "Commandant", "Amiral"];
type Mission = { texte: string; but: number; type: "bumper" | "cibles" | "lettres" | "trou" };
const MISSIONS: Mission[] = [
  { texte: "Touche 8 fois les planètes", but: 8, type: "bumper" },
  { texte: "Abats les 3 étoiles-cibles", but: 3, type: "cibles" },
  { texte: "Allume les lettres C-Y-C-Y", but: 4, type: "lettres" },
  { texte: "Plonge dans le trou noir", but: 1, type: "trou" },
  { texte: "Touche 16 fois les planètes", but: 16, type: "bumper" },
  { texte: "Plonge 2 fois dans le trou noir", but: 2, type: "trou" },
];

function tipDe(o: P, dir: number, ang: number): P {
  // dir = 1 : flipper gauche (pointe vers la droite) ; -1 : flipper droit
  return p(o.x + Math.cos(ang) * FL_L * dir, o.y + Math.sin(ang) * FL_L);
}

export default function Flipper({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "jeu">("depart");
  const [hud, setHud] = useState({ score: 0, billes: 3, mult: 1, rang: 0, mission: MISSIONS[0].texte, avance: 0, but: MISSIONS[0].but, attente: true, message: "" });
  const zone = useRef<HTMLDivElement | null>(null);
  const toile = useRef<HTMLCanvasElement | null>(null);
  const entree = useRef({ g: false, d: false, lance: false });

  function lancer() {
    setPhase("jeu");
    onDebut();
  }

  // Clavier
  useEffect(() => {
    if (phase !== "jeu") return;
    const regle = (e: KeyboardEvent, v: boolean) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "q", "z", "a"].includes(k) || e.code === "ShiftLeft") { entree.current.g = v; e.preventDefault(); }
      else if (["arrowright", "m", "p"].includes(k) || e.code === "ShiftRight") { entree.current.d = v; e.preventDefault(); }
      else if (k === " " || k === "arrowdown" || k === "enter") { entree.current.lance = v; e.preventDefault(); }
    };
    const bas = (e: KeyboardEvent) => regle(e, true), haut = (e: KeyboardEvent) => regle(e, false);
    window.addEventListener("keydown", bas);
    window.addEventListener("keyup", haut);
    return () => { window.removeEventListener("keydown", bas); window.removeEventListener("keyup", haut); };
  }, [phase]);

  // La partie
  useEffect(() => {
    if (phase !== "jeu" || !toile.current) return;
    const cv = toile.current, ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = TW * dpr; cv.height = TH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Décor fixe pré-dessiné (fond, nébuleuses, étoiles, murs néon)
    const fond = document.createElement("canvas");
    fond.width = TW * dpr; fond.height = TH * dpr;
    const f = fond.getContext("2d")!;
    f.setTransform(dpr, 0, 0, dpr, 0, 0);
    dessinerFond(f);

    const bille = { x: 370, y: 692 - R, vx: 0, vy: 0, enJeu: false, capture: 0 };
    const fl = { g: REPOS, d: REPOS, wg: 0, wd: 0 };
    let score = 0, billes = 3, mult = 1, rang = 0, mi = 0, avance = 0, missions = 0;
    let lettres = [false, false, false, false];
    let cibles = [true, true, true];
    let immobile = 0, charge = 0, sauvetage = 0, billeBonus = false, fini = false, tFin = -1;
    const flash: Record<string, number> = {};
    let textes: { x: number; y: number; t: string; v: number; c: string }[] = [];
    let eclats: { x: number; y: number; vx: number; vy: number; v: number; c: string }[] = [];
    let message = "", tMessage = 0, temps = 0, dernierHud = 0, prevG = false, prevD = false;
    let avant = performance.now(), raf = 0;

    const dire = (m: string) => { message = m; tMessage = 2.4; };
    const gagner = (n: number, x: number, y: number, c = "#ffe9a3") => {
      const v = n * mult;
      score += v;
      textes.push({ x, y, t: `+${v.toLocaleString("fr-FR")}`, v: 1, c });
    };
    const etincelles = (x: number, y: number, c: string, n = 10) => {
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 160; eclats.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, v: 0.5 + Math.random() * 0.4, c }); }
    };
    const progres = (type: Mission["type"], n = 1) => {
      const m = MISSIONS[mi];
      if (m.type !== type) return;
      avance = type === "cibles" ? cibles.filter((c) => !c).length : type === "lettres" ? lettres.filter(Boolean).length : avance + n;
      if (avance >= m.but) {
        missions += 1;
        const prime = 5000 * (rang + 1);
        score += prime * mult;
        if (rang < RANGS.length - 1) rang += 1;
        dire(`Mission accomplie ! +${(prime * mult).toLocaleString("fr-FR")} · grade ${RANGS[rang]}`);
        if (rang === 2 && !billeBonus) { billeBonus = true; billes += 1; setTimeout(() => dire("Bille bonus !"), 1500); }
        mi = (mi + 1) % MISSIONS.length;
        avance = MISSIONS[mi].type === "cibles" ? cibles.filter((c) => !c).length : MISSIONS[mi].type === "lettres" ? lettres.filter(Boolean).length : 0;
        etincelles(bille.x, bille.y, "#ffe066", 24);
      }
    };
    const servir = () => {
      Object.assign(bille, { x: 370, y: 692 - R, vx: 0, vy: 0, enJeu: false, capture: 0 });
      charge = 0;
    };

    // Collision bille / segment (avec vitesse de surface pour les flippers)
    const choc = (s: Seg, sx = 0, sy = 0, epais = 0) => {
      const ax = s.a.x, ay = s.a.y, bx = s.b.x, by = s.b.y;
      const dx = bx - ax, dy = by - ay;
      const l2 = dx * dx + dy * dy;
      let t = ((bille.x - ax) * dx + (bille.y - ay) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      const cx = ax + dx * t, cy = ay + dy * t;
      let nx = bille.x - cx, ny = bille.y - cy;
      const d = Math.hypot(nx, ny), lim = R + epais;
      if (d >= lim || d === 0) return false;
      nx /= d; ny /= d;
      bille.x = cx + nx * lim; bille.y = cy + ny * lim;
      const rx = bille.vx - sx, ry = bille.vy - sy;
      const vn = rx * nx + ry * ny;
      if (vn < 0) {
        const e = s.e ?? 0.45;
        bille.vx = rx - (1 + e) * vn * nx + sx;
        bille.vy = ry - (1 + e) * vn * ny + sy;
        // un peu de frottement le long des murs
        bille.vx *= 0.995; bille.vy *= 0.995;
      }
      if (s.kick && vn < -40) { bille.vx += nx * s.kick; bille.vy += ny * s.kick; return true; }
      return vn < -40;
    };

    const pas = (dt: number) => {
      const lg = entree.current.g, ld = entree.current.d;
      // les flippers tournent vers leur position
      const versG = lg ? LEVE : REPOS, versD = ld ? LEVE : REPOS;
      const vit = 22;
      const ag = fl.g, ad = fl.d;
      fl.g += Math.max(-vit * dt, Math.min(vit * dt, versG - fl.g));
      fl.d += Math.max(-vit * dt, Math.min(vit * dt, versD - fl.d));
      fl.wg = (fl.g - ag) / dt; fl.wd = (fl.d - ad) / dt;

      if (bille.capture > 0) {
        bille.capture -= dt;
        bille.x = TROU.x; bille.y = TROU.y;
        if (bille.capture <= 0) { bille.vx = -380 + Math.random() * 60; bille.vy = 260; bille.y += 18; bille.x -= 18; }
        return;
      }
      bille.vy += G * dt;
      const v = Math.hypot(bille.vx, bille.vy);
      if (v > VMAX) { bille.vx *= VMAX / v; bille.vy *= VMAX / v; }
      bille.x += bille.vx * dt;
      bille.y += bille.vy * dt;

      for (const s of MURS) choc(s);
      // porte à sens unique : une fois sortie du couloir, la bille ne peut plus y rentrer
      if (bille.enJeu) choc(PORTE);
      if (!bille.enJeu && bille.x < 345 && bille.y < 260) bille.enJeu = true;
      // si elle y retombe quand même, elle revient sur le lanceur et on peut la relancer
      if (bille.enJeu && bille.x > 352 && bille.y > 260) { bille.enJeu = false; dire("Relance la bille !"); }
      // bille immobile trop longtemps (coincée quelque part) : petite secousse
      if (Math.hypot(bille.vx, bille.vy) < 12 && !(bille.x > 352 && bille.y > 600) && !entree.current.g && !entree.current.d) immobile += dt; else immobile = 0;
      if (immobile > 2) { immobile = 0; bille.vx = (bille.x > 185 ? -1 : 1) * (120 + Math.random() * 80); bille.vy = -220; dire("Secousse !"); }
      for (const s of FRONDES) if (choc(s)) { flash[s.id!] = 0.15; gagner(50, bille.x, bille.y - 10, "#ff9ae0"); }
      // cibles-étoiles
      CIBLES.forEach((c, i) => {
        if (!cibles[i]) return;
        if (choc({ a: c.a, b: c.b, e: 0.5 }, 0, 0, 4)) {
          cibles[i] = false; gagner(500, c.a.x + 24, c.y, "#ffe066"); etincelles(c.a.x + 6, c.y, "#ffe066");
          progres("cibles");
          if (cibles.every((x) => !x)) { gagner(2500, 80, 400, "#ffe066"); dire("Les 3 étoiles abattues ! +2 500"); setTimeout(() => { cibles = [true, true, true]; }, 1200); }
        }
      });
      // planètes
      for (const b of BUMPERS) {
        const dx = bille.x - b.x, dy = bille.y - b.y, d = Math.hypot(dx, dy);
        if (d < b.r + R) {
          const nx = dx / d, ny = dy / d;
          bille.x = b.x + nx * (b.r + R); bille.y = b.y + ny * (b.r + R);
          const vn = bille.vx * nx + bille.vy * ny;
          bille.vx -= 2 * vn * nx; bille.vy -= 2 * vn * ny;
          const vn2 = bille.vx * nx + bille.vy * ny;
          if (vn2 < 560) { bille.vx += nx * (560 - vn2); bille.vy += ny * (560 - vn2); }
          flash[b.nom] = 0.18; gagner(100, b.x, b.y - b.r - 6, b.c); etincelles(bille.x, bille.y, b.c, 6);
          progres("bumper");
        }
      }
      // flippers (segments épais en mouvement)
      for (const k of ["g", "d"] as const) {
        const { o, dir } = FL[k];
        const ang = fl[k], w = k === "g" ? fl.wg : fl.wd;
        const tip = tipDe(o, dir, ang);
        // vitesse de surface au point de contact : ω × r
        const t = Math.max(0, Math.min(1, ((bille.x - o.x) * (tip.x - o.x) + (bille.y - o.y) * (tip.y - o.y)) / (FL_L * FL_L)));
        const cx = o.x + (tip.x - o.x) * t, cy = o.y + (tip.y - o.y) * t;
        const rx = cx - o.x, ry = cy - o.y;
        const ww = w * dir; // sens de rotation à l'écran
        const sx = -ww * ry, sy = ww * rx;
        choc({ a: o, b: tip, e: 0.25 }, sx, sy, 7 - t * 2.5);
      }
      // couloirs du haut : allument les lettres
      if (bille.y > 82 && bille.y < 120) {
        COULOIRS.forEach((x, i) => {
          if (Math.abs(bille.x - x) < 14 && !lettres[i] && bille.vy > 0) {
            lettres[i] = true; gagner(300, x, 74, "#7ad7ff"); progres("lettres");
            if (lettres.every(Boolean)) {
              mult = Math.min(5, mult + 1);
              dire(mult < 5 ? `C-Y-C-Y ! Multiplicateur ×${mult}` : "C-Y-C-Y ! Multiplicateur maximum ×5");
              setTimeout(() => { lettres = [false, false, false, false]; }, 900);
            }
          }
        });
      }
      // trou noir
      if (Math.hypot(bille.x - TROU.x, bille.y - TROU.y) < 13 && bille.capture <= 0) {
        bille.capture = 1.6; bille.vx = 0; bille.vy = 0;
        gagner(2000, TROU.x, TROU.y - 26, "#c9a8ff"); etincelles(TROU.x, TROU.y, "#c9a8ff", 18);
        dire("Aspirée par le trou noir !");
        progres("trou");
      }
      // bille perdue
      if (bille.y > TH + 30) {
        if (sauvetage > 0) { dire("Bille sauvée !"); servir(); return; }
        billes -= 1;
        if (billes <= 0) { fini = true; tFin = 1.2; dire("Fin de partie"); return; }
        dire(`Bille perdue · encore ${billes}`);
        mult = 1;
        servir();
      }
    };

    const boucle = (t: number) => {
      const dt = Math.min(1 / 30, (t - avant) / 1000);
      avant = t;
      temps += dt;
      if (!fini) {
        // lanceur
        const prete = !bille.enJeu && bille.x > 352 && bille.y > 640 && Math.abs(bille.vy) < 30;
        if (prete) {
          if (entree.current.lance) charge = Math.min(1, charge + dt * 1.1);
          else if (charge > 0) { bille.vy = -(820 + charge * 700); charge = 0; sauvetage = 6; }
        } else charge = 0;
        if (sauvetage > 0 && bille.enJeu) sauvetage -= dt;
        // changer les lettres allumées de couloir en appuyant sur un flipper (comme les vrais)
        if (entree.current.g && !prevG) lettres = [...lettres.slice(1), lettres[0]];
        if (entree.current.d && !prevD) lettres = [lettres[3], ...lettres.slice(0, 3)];
        prevG = entree.current.g; prevD = entree.current.d;
        const n = 10;
        for (let i = 0; i < n; i++) pas(dt / n);
      } else {
        tFin -= dt;
        if (tFin <= 0 && tFin > -1) {
          tFin = -5;
          onFin(score, `Grade ${RANGS[rang]} · ${missions} mission${missions > 1 ? "s" : ""} · multiplicateur ×${mult}`);
        }
      }
      for (const k in flash) flash[k] = Math.max(0, flash[k] - dt);
      textes = textes.filter((x) => (x.v -= dt * 1.1) > 0);
      eclats = eclats.filter((e) => { e.x += e.vx * dt; e.y += e.vy * dt; e.vy += 200 * dt; return (e.v -= dt) > 0; });
      if (tMessage > 0) tMessage -= dt; else message = "";

      // ── Dessin ──
      ctx.clearRect(0, 0, TW, TH);
      ctx.drawImage(fond, 0, 0, TW, TH);
      dessinerJeu(ctx, { temps, flash, cibles, lettres, fl, bille, charge, mult });
      for (const e of eclats) { ctx.globalAlpha = Math.min(1, e.v * 2); ctx.fillStyle = e.c; ctx.fillRect(e.x - 1.5, e.y - 1.5, 3, 3); }
      ctx.globalAlpha = 1;
      ctx.font = "bold 13px system-ui, sans-serif"; ctx.textAlign = "center";
      for (const x of textes) { ctx.globalAlpha = Math.min(1, x.v * 1.6); ctx.fillStyle = x.c; ctx.fillText(x.t, x.x, x.y - (1 - x.v) * 26); }
      ctx.globalAlpha = 1;

      if (t - dernierHud > 120) {
        dernierHud = t;
        const m = MISSIONS[mi];
        setHud({ score, billes: Math.max(0, billes), mult, rang, mission: m.texte, avance: Math.min(avance, m.but), but: m.but, attente: !bille.enJeu && bille.x > 352, message });
      }
      raf = requestAnimationFrame(boucle);
    };
    raf = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(raf);
  }, [phase, onFin]);

  // Tactile / souris : moitié gauche ou droite de la table ; lanceur quand la bille attend
  const doigts = useRef(new Map<number, "g" | "d">());
  const toucher = (ev: React.PointerEvent, v: boolean) => {
    if (phase !== "jeu" || !zone.current) return;
    if (v) {
      ev.preventDefault();
      const r = zone.current.getBoundingClientRect();
      doigts.current.set(ev.pointerId, ev.clientX - r.left > r.width / 2 ? "d" : "g");
    } else doigts.current.delete(ev.pointerId);
    const cotes = [...doigts.current.values()];
    entree.current.g = cotes.includes("g");
    entree.current.d = cotes.includes("d");
    entree.current.lance = hud.attente && cotes.includes("d");
  };

  return (
    <div className="relative select-none overflow-hidden rounded-2xl border border-violet/20" style={{ background: "radial-gradient(ellipse at 50% 0%, #34175e 0%, #130a26 55%, #0a0714 100%)" }}>
      {phase === "depart" ? (
        <div className="min-h-[520px]">
          <EcranDepart
            icone="planete"
            titre="Flipper cosmique"
            regles={<>Garde la bille en jeu avec les flippers (<strong className="text-ink">← →</strong>, <strong className="text-ink">Q / M</strong> ou les deux moitiés de l&apos;écran) et lance-la avec <strong className="text-ink">Espace</strong> (maintiens pour plus de puissance). Fais rebondir les planètes, abats les étoiles, allume <strong className="text-[#7ad7ff]">C-Y-C-Y</strong> pour monter le multiplicateur et plonge dans le trou noir. Chaque mission te fait monter en grade, de Cadet à Amiral. 3 billes.</>}
            onJouer={lancer}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 p-3 md:flex-row md:items-start md:justify-center md:gap-6 md:p-6">
          {/* la table, inclinée comme une vraie */}
          <div className="w-full max-w-[400px]" style={{ perspective: "1100px" }}>
            <div
              ref={zone}
              onPointerDown={(e) => toucher(e, true)}
              onPointerUp={(e) => toucher(e, false)}
              onPointerCancel={(e) => toucher(e, false)}
              onPointerLeave={(e) => toucher(e, false)}
              className="relative touch-none rounded-[28px] p-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.8),0_0_40px_-10px_#b57cff]"
              style={{ transform: "rotateX(12deg)", transformOrigin: "50% 100%", background: "linear-gradient(180deg,#6a45a8,#2b1652 40%,#1a0d36)" }}
            >
              <canvas ref={toile} className="block w-full rounded-[22px]" style={{ aspectRatio: `${TW} / ${TH}` }} />
            </div>
          </div>
          {/* le tableau de bord */}
          <div className="w-full max-w-[400px] md:w-64 flex flex-col gap-3 text-ink">
            <div className="rounded-xl border border-[#ff7fd6]/40 bg-black/40 p-3 text-center shadow-[inset_0_0_18px_rgba(255,127,214,.25)]">
              <p className="text-[11px] uppercase tracking-[.2em] text-[#ffb3e8]">Score</p>
              <p className="font-mono text-3xl font-bold tabular-nums text-[#ffe9a3] drop-shadow-[0_0_8px_rgba(255,210,122,.6)]">{hud.score.toLocaleString("fr-FR")}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white/5 p-2"><p className="text-ink-soft">Billes</p><p className="mt-0.5 flex justify-center gap-1">{Array.from({ length: Math.max(3, hud.billes) }, (_, i) => <span key={i} className={`h-3 w-3 rounded-full ${i < hud.billes ? "bg-gradient-to-br from-white to-[#9aa3c7] shadow-[0_0_6px_#fff]" : "bg-white/15"}`} />)}</p></div>
              <div className="rounded-lg bg-white/5 p-2"><p className="text-ink-soft">Multi</p><p className="text-base font-bold text-[#7ad7ff]">×{hud.mult}</p></div>
              <div className="rounded-lg bg-white/5 p-2"><p className="text-ink-soft">Grade</p><p className="text-sm font-bold text-lilac">{RANGS[hud.rang]}</p></div>
            </div>
            <div className="rounded-xl border border-violet/30 bg-violet/10 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-light"><Icone nom="fusee" className="h-4 w-4" />Mission</p>
              <p className="mt-1 text-sm font-semibold">{hud.mission}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#b57cff] to-[#ff7fd6] transition-[width]" style={{ width: `${(hud.avance / hud.but) * 100}%` }} /></div>
            </div>
            <p className="min-h-[2.5rem] text-center text-sm font-semibold text-[#ffe9a3]" aria-live="polite">{hud.message || (hud.attente ? "Maintiens Espace (ou le côté droit) puis relâche pour lancer la bille" : "")}</p>
            <p className="hidden text-center text-xs text-ink-soft md:block">← / Q : flipper gauche · → / M : flipper droit · Espace : lanceur</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dessins ──
function neon(c: CanvasRenderingContext2D, couleur: string, largeur: number, flou = 10) {
  c.strokeStyle = couleur; c.lineWidth = largeur; c.shadowColor = couleur; c.shadowBlur = flou; c.lineCap = "round"; c.lineJoin = "round";
}

function dessinerFond(c: CanvasRenderingContext2D) {
  const g = c.createLinearGradient(0, 0, 0, TH);
  g.addColorStop(0, "#1d0f3d"); g.addColorStop(0.55, "#140a2c"); g.addColorStop(1, "#0b0619");
  c.fillStyle = g; c.fillRect(0, 0, TW, TH);
  // nébuleuses
  for (const [x, y, r, col] of [[110, 200, 160, "rgba(255,127,214,.16)"], [290, 380, 180, "rgba(107,196,255,.13)"], [180, 560, 150, "rgba(181,124,255,.14)"]] as const) {
    const n = c.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, col); n.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = n; c.fillRect(0, 0, TW, TH);
  }
  // étoiles
  for (let i = 0; i < 120; i++) {
    const x = (i * 137.5) % TW, y = (i * 241.7) % TH, r = (i % 7 === 0 ? 1.4 : 0.7);
    c.globalAlpha = 0.3 + (i % 5) * 0.12; c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  // grande planète décorative et anneau sous le verre
  const pl = c.createRadialGradient(120, 470, 4, 140, 480, 70); pl.addColorStop(0, "rgba(181,124,255,.35)"); pl.addColorStop(1, "rgba(181,124,255,0)");
  c.fillStyle = pl; c.beginPath(); c.arc(140, 480, 70, 0, Math.PI * 2); c.fill();
  // logo central
  c.save(); c.globalAlpha = 0.16; c.fillStyle = "#e0b3ff"; c.font = "900 34px system-ui, sans-serif"; c.textAlign = "center";
  c.fillText("COSMIQUE", 186, 420); c.font = "700 12px system-ui, sans-serif"; c.fillText("FLIPPER CYCYLIVE", 186, 440); c.restore();
  // flèches lumineuses vers le trou noir et les couloirs
  c.save(); c.globalAlpha = 0.5;
  for (const [x, y, a, col] of [[270, 380, -0.9, "#c9a8ff"], [186, 380, -Math.PI / 2, "#7ad7ff"], [100, 330, -2.3, "#ffe066"]] as const) {
    c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = col; c.beginPath(); c.moveTo(14, 0); c.lineTo(-8, -9); c.lineTo(-3, 0); c.lineTo(-8, 9); c.closePath(); c.fill(); c.restore();
  }
  c.restore();
  // murs néon
  c.save();
  neon(c, "#b57cff", 4, 14);
  for (const s of MURS) { c.beginPath(); c.moveTo(s.a.x, s.a.y); c.lineTo(s.b.x, s.b.y); c.stroke(); }
  neon(c, "#f5e1ff", 1.4, 0);
  for (const s of MURS) { c.beginPath(); c.moveTo(s.a.x, s.a.y); c.lineTo(s.b.x, s.b.y); c.stroke(); }
  c.restore();
  // couloir de lancement : rail
  c.fillStyle = "rgba(255,255,255,.04)"; c.fillRect(352, 230, 36, 460);
  // zone de vidange
  const v = c.createLinearGradient(0, 660, 0, TH); v.addColorStop(0, "rgba(255,79,154,0)"); v.addColorStop(1, "rgba(255,79,154,.25)");
  c.fillStyle = v; c.fillRect(20, 660, 330, 60);
  // pivots des flippers
  for (const k of ["g", "d"] as const) { c.fillStyle = "#3a2468"; c.beginPath(); c.arc(FL[k].o.x, FL[k].o.y, 11, 0, Math.PI * 2); c.fill(); }
}

type Etat = { temps: number; flash: Record<string, number>; cibles: boolean[]; lettres: boolean[]; fl: { g: number; d: number }; bille: { x: number; y: number; capture: number }; charge: number; mult: number };

function dessinerJeu(c: CanvasRenderingContext2D, s: Etat) {
  // trou noir qui tourbillonne
  c.save(); c.translate(TROU.x, TROU.y);
  const tr = c.createRadialGradient(0, 0, 2, 0, 0, 30); tr.addColorStop(0, "#000"); tr.addColorStop(0.45, "#2a0f4d"); tr.addColorStop(1, "rgba(181,124,255,0)");
  c.fillStyle = tr; c.beginPath(); c.arc(0, 0, 30, 0, Math.PI * 2); c.fill();
  c.rotate(s.temps * 2.2);
  for (let i = 0; i < 3; i++) { c.rotate((Math.PI * 2) / 3); neon(c, "#c9a8ff", 2, 8); c.beginPath(); c.arc(0, 0, 20, 0, 1.4); c.stroke(); }
  c.restore();
  c.fillStyle = "#000"; c.beginPath(); c.arc(TROU.x, TROU.y, 10, 0, Math.PI * 2); c.fill();

  // planètes-bumpers
  for (const b of BUMPERS) {
    const fl = s.flash[b.nom] || 0;
    c.save();
    c.shadowColor = b.c; c.shadowBlur = 14 + fl * 120;
    const g = c.createRadialGradient(b.x - 8, b.y - 8, 3, b.x, b.y, b.r + fl * 20);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.35, b.c); g.addColorStop(1, "#1a0d36");
    c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y, b.r + fl * 14, 0, Math.PI * 2); c.fill();
    c.shadowBlur = 0;
    neon(c, fl ? "#fff" : b.c, 2, 6);
    c.beginPath(); c.ellipse(b.x, b.y, b.r + 10, (b.r + 10) * 0.32, -0.35, 0, Math.PI * 2); c.stroke();
    c.restore();
  }

  // lance-pierres
  for (const f of FRONDES) {
    const fl = s.flash[f.id!] || 0;
    c.save(); neon(c, fl ? "#ffffff" : "#ff7fd6", 5, 12 + fl * 80);
    c.beginPath(); c.moveTo(f.a.x, f.a.y); c.lineTo(f.b.x, f.b.y); c.stroke(); c.restore();
  }

  // cibles-étoiles
  CIBLES.forEach((t, i) => {
    c.save();
    if (s.cibles[i]) { neon(c, "#ffe066", 6, 12); c.beginPath(); c.moveTo(t.a.x + 2, t.a.y); c.lineTo(t.b.x + 2, t.b.y); c.stroke(); }
    else { c.strokeStyle = "rgba(255,224,102,.25)"; c.lineWidth = 3; c.beginPath(); c.moveTo(t.a.x + 2, t.a.y); c.lineTo(t.b.x + 2, t.b.y); c.stroke(); }
    etoile(c, 52, t.y, 6, s.cibles[i] ? "#ffe066" : "rgba(255,224,102,.25)");
    c.restore();
  });

  // couloirs C-Y-C-Y
  c.font = "900 15px system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
  COULOIRS.forEach((x, i) => {
    c.save();
    const on = s.lettres[i];
    c.fillStyle = on ? "#7ad7ff" : "rgba(122,215,255,.22)"; c.shadowColor = "#7ad7ff"; c.shadowBlur = on ? 14 : 0;
    c.fillText(LETTRES[i], x, 140);
    c.restore();
  });
  c.textBaseline = "alphabetic";

  // multiplicateurs (voyants)
  for (let i = 0; i < 5; i++) {
    const on = s.mult > i;
    c.save(); c.fillStyle = on ? "#ff7fd6" : "rgba(255,127,214,.18)"; c.shadowColor = "#ff7fd6"; c.shadowBlur = on ? 10 : 0;
    c.beginPath(); c.arc(130 + i * 28, 520, 6, 0, Math.PI * 2); c.fill(); c.restore();
  }
  c.save(); c.fillStyle = "rgba(255,179,232,.6)"; c.font = "700 10px system-ui"; c.textAlign = "center"; c.fillText("×1   ×2   ×3   ×4   ×5", 186, 540); c.restore();

  // flippers
  for (const k of ["g", "d"] as const) {
    const { o, dir } = FL[k];
    const tip = tipDe(o, dir, s.fl[k]);
    c.save();
    c.shadowColor = "#ffd27a"; c.shadowBlur = 12;
    const g = c.createLinearGradient(o.x, o.y - 8, o.x, o.y + 8); g.addColorStop(0, "#fff3c9"); g.addColorStop(1, "#e9a53a");
    c.strokeStyle = g; c.lineCap = "round";
    c.lineWidth = 15; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x + (tip.x - o.x) * 0.5, o.y + (tip.y - o.y) * 0.5); c.stroke();
    c.lineWidth = 10; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(tip.x, tip.y); c.stroke();
    c.shadowBlur = 0; c.fillStyle = "#6a3a12"; c.beginPath(); c.arc(o.x, o.y, 3.5, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  // ressort du lanceur
  const comp = s.charge * 34;
  c.save(); neon(c, "#ff9d5c", 2, 6);
  c.beginPath();
  for (let i = 0; i <= 10; i++) { const y = 694 + comp * 0.3 + (i / 10) * (24 - comp * 0.3); c.lineTo(i % 2 ? 360 : 380, y); }
  c.stroke(); c.restore();
  if (s.charge > 0) { c.fillStyle = "rgba(255,157,92,.8)"; c.fillRect(392 - 4, 690 - s.charge * 120, 3, s.charge * 120); }

  // la bille (chromée)
  if (s.bille.capture <= 0 || Math.floor(s.temps * 10) % 2) {
    const { x, y } = s.bille;
    c.save();
    c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.ellipse(x + 3, y + 5, R, R * 0.7, 0, 0, Math.PI * 2); c.fill();
    const g = c.createRadialGradient(x - 3, y - 4, 1, x, y, R);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.4, "#d7dbef"); g.addColorStop(0.8, "#7c84a8"); g.addColorStop(1, "#3c4060");
    c.fillStyle = g; c.shadowColor = "#cfd6ff"; c.shadowBlur = 8;
    c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill();
    c.restore();
  }
}

function etoile(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) {
  c.save(); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 8; c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fill(); c.restore();
}
