"use client";

// Astro Dodge : pilote ton vaisseau à travers une pluie d'astéroïdes qui s'intensifie.
// 10 points par seconde de survie, multipliés par le palier (×2 à 20 s, ×3 à 40 s, ×4 à 60 s).
// Le vaisseau tire tout seul : au début des missiles lents et espacés, puis de plus en plus rapides,
// doublés puis triplés avec les paliers. Les gros astéroïdes se brisent en deux, les soucoupes
// extraterrestres (dès 12 s) tirent sur toi et lâchent souvent un bonus d'arme.
// Bonus : bouclier, ralenti, mini-vaisseau, étoile (+150) et 4 armes temporaires : laser, rafale,
// tir en éventail, missiles à tête chercheuse. Dessins : dessinsCanvas.ts
// Souris / doigt : le vaisseau suit le pointeur. Clavier : flèches ou ZQSD / WASD.
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import { EcranDepart, type PropsJeu } from "./FinDePartie";
import type { NomIcone } from "@/components/icones/banque";
import { asteroide, etoile as etoileCanvas, eclat, pastilleBonus, iconeBouclier, iconeSablier, iconeMiniVaisseau, iconeEtoile, iconeLaser, iconeRafale, iconeEventail, iconeChercheur, soucoupe } from "./dessinsCanvas";

type Roche = { x: number; y: number; vx: number; vy: number; r: number; a: number; va: number; forme: number[]; teinte: string; pv: number; touche: number };
type TypeArme = "laser" | "rafale" | "eventail" | "chercheur";
type TypeBonus = "bouclier" | "ralenti" | "mini" | "etoile" | TypeArme;
type Missile = { x: number; y: number; vx: number; vy: number; degat: number; chercheur: boolean; vie: number };
type Ovni = { x: number; y: number; base: number; vx: number; phase: number; r: number; pv: number; pvMax: number; tir: number; touche: number; t: number };
type Plasma = { x: number; y: number; vx: number; vy: number };
type Bonus = { x: number; y: number; vy: number; type: TypeBonus; t: number };
type Eclat = { x: number; y: number; vx: number; vy: number; vie: number; c: string };

const BONUS: Record<TypeBonus, { icone: NomIcone; dessin: (ctx: CanvasRenderingContext2D, s: number) => void; couleur: string; nom: string }> = {
  bouclier: { icone: "bouclier", dessin: iconeBouclier, couleur: "#5fd4ff", nom: "Bouclier" },
  ralenti: { icone: "sablier", dessin: iconeSablier, couleur: "#c084fc", nom: "Ralenti" },
  mini: { icone: "fusee", dessin: iconeMiniVaisseau, couleur: "#6bffc8", nom: "Mini-vaisseau" },
  etoile: { icone: "etoile", dessin: iconeEtoile, couleur: "#ffd76b", nom: "+150" },
  laser: { icone: "eclair", dessin: iconeLaser, couleur: "#ff6bd6", nom: "Laser" },
  rafale: { icone: "boost", dessin: iconeRafale, couleur: "#ffb15c", nom: "Rafale" },
  eventail: { icone: "galaxie", dessin: iconeEventail, couleur: "#7ee2a8", nom: "Éventail" },
  chercheur: { icone: "cible", dessin: iconeChercheur, couleur: "#ff5c7a", nom: "Tête chercheuse" },
};
const ARMES: TypeArme[] = ["laser", "rafale", "eventail", "chercheur"];
const DUREE_ARME = 8;
const TEINTES = ["#8a6d5a", "#7a6a7f", "#9b7b62", "#6d5f7a"];
const palier = (t: number) => Math.min(4, 1 + Math.floor(t / 20));

export default function AstroDodge({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "decompte" | "jeu">("depart");
  const [decompte, setDecompte] = useState(3);
  const [hud, setHud] = useState({ t: 0, score: 0, mult: 1, effets: [] as TypeBonus[] });
  const zone = useRef<HTMLDivElement | null>(null);
  const toile = useRef<HTMLCanvasElement | null>(null);
  const cible = useRef<{ x: number; y: number } | null>(null);
  const touches = useRef(new Set<string>());

  function lancer() {
    setPhase("decompte");
    let n = 3;
    setDecompte(n);
    const t = setInterval(() => {
      n -= 1;
      setDecompte(n);
      if (n === 0) {
        clearInterval(t);
        setPhase("jeu");
        onDebut();
      }
    }, 650);
  }

  // Clavier
  useEffect(() => {
    if (phase !== "jeu") return;
    const bas = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "z", "q", "s", "d", "w", "a"].includes(k)) {
        e.preventDefault();
        touches.current.add(k);
        cible.current = null;
      }
    };
    const haut = (e: KeyboardEvent) => touches.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", bas);
    window.addEventListener("keyup", haut);
    return () => {
      window.removeEventListener("keydown", bas);
      window.removeEventListener("keyup", haut);
      touches.current.clear();
    };
  }, [phase]);

  // Boucle de jeu
  useEffect(() => {
    if (phase !== "jeu" || !toile.current || !zone.current) return;
    const cv = toile.current, ctx = cv.getContext("2d")!;
    let W = 0, H = 0;
    const dim = () => {
      const r = zone.current!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    dim();
    window.addEventListener("resize", dim);
    const fond = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.9 }));
    const vaisseau = { x: W / 2, y: H - 80, bouclier: 0, mini: 0, invincible: 0 };
    let roches: Roche[] = [], bonus: Bonus[] = [], eclats: Eclat[] = [], missiles: Missile[] = [], ovnis: Ovni[] = [], plasmas: Plasma[] = [];
    let t = 0, score = 0, prochaine = 0.6, prochainBonus = 5, ralenti = 0, ramasses = 0, mort = -1, fini = false, dernierHud = 0;
    let prochainTir = 0.8, prochainOvni = 12, detruites = 0, ovnisAbattus = 0, laserFlash = 0;
    const armes: Record<TypeArme, number> = { laser: 0, rafale: 0, eventail: 0, chercheur: 0 };
    let enfants: Roche[] = []; // morceaux des gros astéroïdes brisés (ajoutés après les collisions)
    const pvDe = (r: number) => (r < 16 ? 1 : r < 24 ? 2 : 3);
    const nouvelleRoche = (x: number, y: number, r: number, vx: number, vy: number): Roche => {
      const pts = 7 + Math.floor(Math.random() * 4);
      return { x, y, r, vx, vy, a: Math.random() * 6, va: (Math.random() - 0.5) * 2.4, forme: Array.from({ length: pts }, () => 0.72 + Math.random() * 0.34), teinte: TEINTES[Math.floor(Math.random() * TEINTES.length)], pv: pvDe(r), touche: 0 };
    };
    /** Une roche touchée : se brise en deux si elle est grosse, rapporte des points. Renvoie true si détruite. */
    const toucherRoche = (p: Roche, degat: number) => {
      p.pv -= degat; p.touche = 0.12;
      if (p.pv > 0) return false;
      detruites += 1;
      score += Math.round((p.r < 16 ? 15 : p.r < 24 ? 25 : 40) * palier(t));
      exploser(p.x, p.y, "#ffc59a", 10 + Math.round(p.r / 2));
      if (p.r >= 22) for (const s of [-1, 1]) enfants.push(nouvelleRoche(p.x + s * p.r * 0.4, p.y, p.r * 0.55, p.vx + s * (60 + Math.random() * 40), p.vy * 0.85));
      return true;
    };
    const toucherOvni = (o: Ovni, degat: number) => {
      o.pv -= degat; o.touche = 0.12;
      if (o.pv > 0) return false;
      ovnisAbattus += 1;
      score += 120 * palier(t);
      exploser(o.x, o.y, "#6bffc8", 30); exploser(o.x, o.y, "#fff3c4", 14);
      // souvent, la soucoupe lâche une arme
      if (Math.random() < 0.65) bonus.push({ x: o.x, y: o.y, vy: 110, type: ARMES[Math.floor(Math.random() * ARMES.length)], t: 0 });
      return true;
    };
    let avant = performance.now(), raf = 0;

    const exploser = (x: number, y: number, c: string, n = 18) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 220;
        eclats.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vie: 0.5 + Math.random() * 0.5, c });
      }
    };

    const boucle = (now: number) => {
      const dt = Math.min(0.05, (now - avant) / 1000);
      avant = now;
      const vivant = mort < 0;
      if (vivant) t += dt;
      const lent = ralenti > 0 ? 0.45 : 1;
      const dtm = dt * lent; // le monde ralentit, pas le vaisseau

      // ── vaisseau ──
      if (vivant) {
        const k = touches.current;
        let dx = 0, dy = 0;
        if (k.has("arrowleft") || k.has("q") || k.has("a")) dx -= 1;
        if (k.has("arrowright") || k.has("d")) dx += 1;
        if (k.has("arrowup") || k.has("z") || k.has("w")) dy -= 1;
        if (k.has("arrowdown") || k.has("s")) dy += 1;
        if (dx || dy) {
          const n = Math.hypot(dx, dy);
          vaisseau.x += (dx / n) * 430 * dt;
          vaisseau.y += (dy / n) * 430 * dt;
        } else if (cible.current) {
          vaisseau.x += (cible.current.x - vaisseau.x) * Math.min(1, dt * 14);
          vaisseau.y += (cible.current.y - vaisseau.y) * Math.min(1, dt * 14);
        }
        vaisseau.x = Math.max(16, Math.min(W - 16, vaisseau.x));
        vaisseau.y = Math.max(40, Math.min(H - 22, vaisseau.y));
        vaisseau.bouclier = Math.max(0, vaisseau.bouclier - dt);
        vaisseau.mini = Math.max(0, vaisseau.mini - dt);
        vaisseau.invincible = Math.max(0, vaisseau.invincible - dt);
        ralenti = Math.max(0, ralenti - dt);
        score += 10 * palier(t) * dt;
      }

      // ── apparitions (de plus en plus serrées et rapides) ──
      prochaine -= dtm;
      if (vivant && prochaine <= 0) {
        const n = t > 45 && Math.random() < 0.35 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const r = 11 + Math.random() * (14 + Math.min(16, t * 0.25));
          roches.push(nouvelleRoche(Math.random() * W, -r - 10, r, (Math.random() - 0.5) * (30 + t * 1.6), 150 + Math.min(380, t * 6.5) + Math.random() * 80));
        }
        prochaine = Math.max(0.17, 0.85 - t * 0.012) * (0.75 + Math.random() * 0.5);
      }
      prochainBonus -= dt;
      if (vivant && prochainBonus <= 0) {
        const types: TypeBonus[] = t > 8 ? ["bouclier", "ralenti", "mini", "etoile", "etoile", ...ARMES] : ["bouclier", "ralenti", "mini", "etoile", "etoile"];
        bonus.push({ x: 30 + Math.random() * (W - 60), y: -20, vy: 120, type: types[Math.floor(Math.random() * types.length)], t: 0 });
        prochainBonus = 6 + Math.random() * 4;
      }

      // ── armes du vaisseau ──
      for (const k of ARMES) armes[k] = Math.max(0, armes[k] - dt);
      const niveau = palier(t);
      if (vivant && armes.laser <= 0) {
        prochainTir -= dt;
        if (prochainTir <= 0) {
          // cadence et vitesse qui augmentent avec le temps ; la rafale les booste
          const rafale = armes.rafale > 0;
          prochainTir = Math.max(0.12, 0.85 - t * 0.0075) / (rafale ? 2.6 : 1);
          const v = Math.min(760, 360 + t * 4.5) * (rafale ? 1.35 : 1);
          const chercheur = armes.chercheur > 0;
          const angles = armes.eventail > 0 ? [-0.5, -0.25, 0, 0.25, 0.5] : niveau >= 4 ? [-0.12, 0, 0.12] : niveau >= 2 ? [-0.04, 0.04] : [0];
          for (const a of angles) {
            const ex = niveau >= 2 && armes.eventail <= 0 && angles.length === 2 ? Math.sign(a) * 7 : 0;
            missiles.push({ x: vaisseau.x + ex, y: vaisseau.y - 20, vx: Math.sin(a) * v, vy: -Math.cos(a) * v, degat: 1, chercheur, vie: 3 });
          }
        }
      }
      // laser : un rayon continu qui traverse tout, droit devant
      const laser = vivant && armes.laser > 0;
      if (laser) {
        laserFlash += dt;
        const demi = 9;
        roches = roches.filter((p) => !(p.y < vaisseau.y && Math.abs(p.x - vaisseau.x) < p.r + demi && toucherRoche(p, 9 * dt)));
        ovnis = ovnis.filter((o) => !(o.y < vaisseau.y && Math.abs(o.x - vaisseau.x) < o.r + demi && toucherOvni(o, 6 * dt)));
      }
      missiles = missiles.filter((m) => {
        if (m.chercheur) {
          // vise la cible la plus proche devant lui
          let best: { x: number; y: number } | null = null, d = 1e9;
          for (const p of [...roches, ...ovnis]) { if (p.y > m.y) continue; const dd = Math.hypot(p.x - m.x, p.y - m.y); if (dd < d) { d = dd; best = p; } }
          if (best) {
            const v = Math.hypot(m.vx, m.vy), ang = Math.atan2(best.y - m.y, best.x - m.x), cur = Math.atan2(m.vy, m.vx);
            let diff = ang - cur; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
            const n = cur + Math.max(-6 * dt, Math.min(6 * dt, diff));
            m.vx = Math.cos(n) * v; m.vy = Math.sin(n) * v;
          }
        }
        m.x += m.vx * dt; m.y += m.vy * dt; m.vie -= dt;
        for (let i = 0; i < roches.length; i++) {
          const p = roches[i];
          if (Math.hypot(p.x - m.x, p.y - m.y) < p.r + 4) { if (toucherRoche(p, m.degat)) roches.splice(i, 1); exploser(m.x, m.y, "#ffe0f5", 4); return false; }
        }
        for (let i = 0; i < ovnis.length; i++) {
          const o = ovnis[i];
          if (Math.abs(o.x - m.x) < o.r && Math.abs(o.y - m.y) < o.r * 0.55) { if (toucherOvni(o, m.degat)) ovnis.splice(i, 1); exploser(m.x, m.y, "#c9fff0", 4); return false; }
        }
        return m.vie > 0 && m.y > -20 && m.x > -20 && m.x < W + 20;
      });
      if (enfants.length) { roches.push(...enfants); enfants = []; }

      // ── soucoupes extraterrestres ──
      prochainOvni -= dtm;
      if (vivant && prochainOvni <= 0) {
        const r = 24 + Math.random() * 6;
        const depuisGauche = Math.random() < 0.5;
        const pv = 4 + Math.floor(t / 20) * 2;
        ovnis.push({ x: depuisGauche ? -r : W + r, y: 0, base: 60 + Math.random() * Math.min(160, H * 0.3), vx: (depuisGauche ? 1 : -1) * (70 + Math.random() * 40 + t * 0.6), phase: Math.random() * 6, r, pv, pvMax: pv, tir: 1.2 + Math.random(), touche: 0, t: 0 });
        prochainOvni = Math.max(5, 13 - t * 0.08) * (0.8 + Math.random() * 0.4);
      }
      ovnis = ovnis.filter((o) => {
        o.t += dtm; o.touche = Math.max(0, o.touche - dt);
        o.x += o.vx * dtm; o.y = o.base + Math.sin(o.t * 2 + o.phase) * 18;
        // rebondit sur les bords puis repart
        if ((o.x < o.r && o.vx < 0) || (o.x > W - o.r && o.vx > 0)) { if (o.t > 2) o.vx = -o.vx; }
        o.tir -= dtm;
        if (vivant && o.tir <= 0) {
          const a = Math.atan2(vaisseau.y - o.y, vaisseau.x - o.x), v = 170 + Math.min(150, t * 1.5);
          plasmas.push({ x: o.x, y: o.y + o.r * 0.3, vx: Math.cos(a) * v, vy: Math.sin(a) * v });
          o.tir = Math.max(1, 2.4 - t * 0.012) * (0.8 + Math.random() * 0.4);
        }
        return o.t < 22 && o.x > -80 && o.x < W + 80;
      });

      // ── déplacements et collisions ──
      const rayon = vaisseau.mini > 0 ? 8 : 14;
      const choc = (x: number, y: number, c: string) => {
        if (vaisseau.bouclier > 0 || vaisseau.invincible > 0) {
          if (vaisseau.bouclier > 0) { vaisseau.bouclier = 0; vaisseau.invincible = 0.8; }
          exploser(x, y, "#5fd4ff", 14);
          return;
        }
        mort = 0;
        exploser(vaisseau.x, vaisseau.y, "#ff9d5c", 40);
        exploser(vaisseau.x, vaisseau.y, c, 18);
      };
      plasmas = plasmas.filter((b) => {
        b.x += b.vx * dtm; b.y += b.vy * dtm;
        if (vivant && Math.hypot(b.x - vaisseau.x, b.y - vaisseau.y) < rayon + 5) { choc(b.x, b.y, "#6bffc8"); return false; }
        return b.y < H + 20 && b.y > -20 && b.x > -20 && b.x < W + 20;
      });
      for (const o of ovnis) if (vivant && Math.hypot(o.x - vaisseau.x, o.y - vaisseau.y) < o.r * 0.8 + rayon) { choc(o.x, o.y, "#6bffc8"); o.pv = 0; }
      ovnis = ovnis.filter((o) => o.pv > 0);
      roches = roches.filter((p) => {
        p.x += p.vx * dtm; p.y += p.vy * dtm; p.a += p.va * dtm; p.touche = Math.max(0, p.touche - dt);
        if (vivant && Math.hypot(p.x - vaisseau.x, p.y - vaisseau.y) < p.r * 0.82 + rayon) {
          const protege = vaisseau.bouclier > 0 || vaisseau.invincible > 0;
          choc(p.x, p.y, "#fff3c4");
          if (protege) return false;
        }
        return p.y < H + 60 && p.x > -80 && p.x < W + 80;
      });
      bonus = bonus.filter((b) => {
        b.y += b.vy * dtm; b.t += dt;
        if (vivant && Math.hypot(b.x - vaisseau.x, b.y - vaisseau.y) < 18 + rayon + 6) {
          ramasses += 1;
          if (b.type === "bouclier") vaisseau.bouclier = 10;
          if (b.type === "ralenti") ralenti = 5;
          if (b.type === "mini") vaisseau.mini = 7;
          if ((ARMES as string[]).includes(b.type)) {
            // une nouvelle arme remplace la précédente (pas de cumul laser + éventail)
            for (const k of ARMES) armes[k] = 0;
            armes[b.type as TypeArme] = DUREE_ARME;
          }
          score += b.type === "etoile" ? 150 : 40;
          exploser(b.x, b.y, BONUS[b.type].couleur, 12);
          return false;
        }
        return b.y < H + 30;
      });
      eclats = eclats.filter((e) => { e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= 0.97; e.vy *= 0.97; e.vie -= dt; return e.vie > 0; });

      // ── dessin ──
      ctx.clearRect(0, 0, W, H);
      for (const s of fond) {
        s.y += (s.z * 40 * dtm + 0.02 * t * s.z * dtm) / H;
        if (s.y > 1) { s.y -= 1; s.x = Math.random(); }
        ctx.globalAlpha = 0.25 + s.z * 0.5;
        ctx.fillStyle = "#fff";
        ctx.fillRect(s.x * W, s.y * H, s.z * 1.6, s.z * (1.6 + (lent < 1 ? 0 : t * 0.04)));
      }
      ctx.globalAlpha = 1;
      if (ralenti > 0) { ctx.fillStyle = "rgba(192,132,252,0.08)"; ctx.fillRect(0, 0, W, H); }
      for (const p of roches) {
        asteroide(ctx, p.x, p.y, p.r, p.a, p.forme, p.teinte);
        if (p.touche > 0) { ctx.globalAlpha = p.touche * 5; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      }
      for (const o of ovnis) {
        soucoupe(ctx, o.x, o.y, o.r, o.t, o.touche);
        // jauge de vie
        ctx.fillStyle = "#00000088"; ctx.fillRect(o.x - o.r * 0.7, o.y - o.r * 0.95, o.r * 1.4, 3);
        ctx.fillStyle = "#6bffc8"; ctx.fillRect(o.x - o.r * 0.7, o.y - o.r * 0.95, o.r * 1.4 * Math.max(0, o.pv / o.pvMax), 3);
      }
      for (const b of plasmas) {
        const g2 = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 9);
        g2.addColorStop(0, "#ffffff"); g2.addColorStop(0.35, "#6bffc8"); g2.addColorStop(1, "rgba(107,255,200,0)");
        ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(b.x, b.y, 9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineCap = "round";
      for (const m of missiles) {
        const a = Math.atan2(m.vy, m.vx), c = m.chercheur ? "#ff5c7a" : armes.rafale > 0 ? "#ffb15c" : armes.eventail > 0 ? "#7ee2a8" : "#ff9ad5";
        ctx.save(); ctx.translate(m.x, m.y); ctx.rotate(a + Math.PI / 2);
        const gm = ctx.createLinearGradient(0, -6, 0, 16);
        gm.addColorStop(0, "#ffffff"); gm.addColorStop(0.3, c); gm.addColorStop(1, c + "00");
        ctx.fillStyle = gm; ctx.beginPath(); ctx.ellipse(0, 4, 2.6, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, -4, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      if (laser) {
        const lx = vaisseau.x, w = 7 + Math.sin(laserFlash * 40) * 2;
        const gl = ctx.createLinearGradient(lx - w * 2, 0, lx + w * 2, 0);
        gl.addColorStop(0, "rgba(255,107,214,0)"); gl.addColorStop(0.35, "rgba(255,107,214,.55)"); gl.addColorStop(0.5, "#ffffff"); gl.addColorStop(0.65, "rgba(255,107,214,.55)"); gl.addColorStop(1, "rgba(255,107,214,0)");
        ctx.fillStyle = gl; ctx.fillRect(lx - w * 2, 0, w * 4, vaisseau.y - 18);
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(lx, vaisseau.y - 20, 6 + Math.sin(laserFlash * 30) * 2, 0, Math.PI * 2); ctx.fill();
      }
      for (const b of bonus) {
        if (b.type === "etoile") { etoileCanvas(ctx, b.x, b.y, 15, "#ffd76b", b.t * 1.5, 18); eclat(ctx, b.x + 13, b.y - 12, 4); }
        else pastilleBonus(ctx, b.x, b.y, 17, BONUS[b.type].couleur, b.t, BONUS[b.type].dessin);
      }
      if (vivant) {
        const s = vaisseau.mini > 0 ? 0.6 : 1;
        ctx.save();
        ctx.translate(vaisseau.x, vaisseau.y); ctx.scale(s, s);
        // flamme
        const f = 10 + Math.random() * 8;
        const g = ctx.createLinearGradient(0, 10, 0, 18 + f);
        g.addColorStop(0, "#fff3c4"); g.addColorStop(0.5, "#ff9d5c"); g.addColorStop(1, "rgba(255,70,85,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(-6, 11); ctx.lineTo(0, 18 + f); ctx.lineTo(6, 11); ctx.fill();
        // coque
        ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(13, 12); ctx.lineTo(0, 7); ctx.lineTo(-13, 12); ctx.closePath();
        const c = ctx.createLinearGradient(-13, 0, 13, 0);
        c.addColorStop(0, "#b57cff"); c.addColorStop(1, "#f0abfc");
        ctx.fillStyle = c; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = "#fff"; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0, -6, 3.5, 6, 0, 0, Math.PI * 2); ctx.fillStyle = "#5fd4ff"; ctx.fill();
        ctx.restore();
        if (vaisseau.bouclier > 0) {
          ctx.beginPath(); ctx.arc(vaisseau.x, vaisseau.y - 2, 26 * s + Math.sin(t * 8) * 1.5, 0, Math.PI * 2);
          ctx.lineWidth = 2.5; ctx.strokeStyle = vaisseau.bouclier < 2 && Math.floor(t * 8) % 2 ? "rgba(95,212,255,0.25)" : "rgba(95,212,255,0.85)"; ctx.stroke();
        }
      }
      for (const e of eclats) { ctx.globalAlpha = Math.max(0, e.vie); ctx.fillStyle = e.c; ctx.fillRect(e.x - 2, e.y - 2, 4, 4); }
      ctx.globalAlpha = 1;

      if (now - dernierHud > 100) {
        dernierHud = now;
        const effets = ([vaisseau.bouclier > 0 ? "bouclier" : "", ralenti > 0 ? "ralenti" : "", vaisseau.mini > 0 ? "mini" : "", ...ARMES.filter((k) => armes[k] > 0)].filter(Boolean)) as TypeBonus[];
        setHud({ t, score: Math.floor(score), mult: palier(t), effets });
      }
      if (!vivant) {
        mort += dt;
        if (mort > 0.9 && !fini) {
          fini = true;
          onFin(Math.floor(score), `${t.toFixed(1)} s de survie · ${detruites} astéroïde${detruites > 1 ? "s" : ""} et ${ovnisAbattus} soucoupe${ovnisAbattus > 1 ? "s" : ""} détruit${detruites + ovnisAbattus > 1 ? "s" : ""} · ${ramasses} bonus · palier ×${palier(t)}`);
          return;
        }
      }
      raf = requestAnimationFrame(boucle);
    };
    raf = requestAnimationFrame(boucle);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", dim); };
  }, [phase, onFin]);

  function viser(ev: React.PointerEvent) {
    if (phase !== "jeu" || !zone.current) return;
    const r = zone.current.getBoundingClientRect();
    // au doigt, le vaisseau se place un peu au-dessus pour rester visible
    cible.current = { x: ev.clientX - r.left, y: ev.clientY - r.top - (ev.pointerType === "touch" ? 56 : 0) };
  }

  return (
    <div
      ref={zone}
      onPointerMove={viser}
      onPointerDown={viser}
      className="relative h-[480px] md:h-[540px] select-none overflow-hidden rounded-2xl border border-violet/20 touch-none"
      style={{ cursor: phase === "jeu" ? "none" : "default", background: "radial-gradient(ellipse at 50% -10%, #3a1a2a 0%, #140b1c 55%, #0a0712 100%)" }}
    >
      <canvas ref={toile} className="absolute inset-0 h-full w-full" />
      {phase === "depart" ? (
        <EcranDepart
          icone="fusee"
          titre="Astro Dodge"
          regles={<>Ton vaisseau suit la souris (ou ton doigt, ou les flèches du clavier) et <strong className="text-ink">tire tout seul</strong> : ses missiles deviennent plus rapides et plus nombreux au fil de la partie. Détruis les astéroïdes et les soucoupes extraterrestres, mais esquive leurs tirs : <strong className="text-ink">un seul choc et c&apos;est fini</strong>. Ramasse les bonus (les armes durent 8 s) :
            <span className="mt-3 flex flex-wrap justify-center gap-2">
              {(Object.keys(BONUS) as TypeBonus[]).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold" style={{ borderColor: BONUS[k].couleur + "88", color: BONUS[k].couleur }}>
                  <Icone nom={BONUS[k].icone} className="w-4 h-4" />{k === "etoile" ? "Étoile +150" : BONUS[k].nom}
                </span>
              ))}
            </span></>}
          onJouer={lancer}
        />
      ) : null}
      {phase === "decompte" ? <p className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-ink glow-text">{decompte || "GO"}</p> : null}
      {phase === "jeu" ? (
        <div className="pointer-events-none absolute left-4 right-4 top-3 flex justify-between text-sm font-semibold text-ink tabular-nums">
          <span><Icone nom="chrono" className="w-4 h-4 mr-1" />{hud.t.toFixed(1)} s</span>
          <span className="flex items-center gap-1.5">
            {hud.effets.map((e) => <span key={e} className="flex h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: BONUS[e].couleur, color: BONUS[e].couleur, background: BONUS[e].couleur + "22" }} title={BONUS[e].nom}><Icone nom={BONUS[e].icone} className="w-3.5 h-3.5" /></span>)}
            <span className="rounded-full bg-[#ff9d5c]/20 px-2 py-0.5 text-[#ffc59a]">×{hud.mult}</span>
          </span>
          <span className="text-lilac">{hud.score.toLocaleString("fr-FR")} pts</span>
        </div>
      ) : null}
    </div>
  );
}
