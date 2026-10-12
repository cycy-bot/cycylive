"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ARCADE, vitesseA } from "@/lib/arcadeRegles";

// ============================================================
// CYCY RUNNER — jeu de course façon « dinosaure de Google »
// ============================================================
// Le petit robot CycyBot court sur une planète : il saute par-dessus
// les astéroïdes et les cristaux, et se baisse sous les comètes.
// Pas de compte : à la fin, on entre un pseudo pour enregistrer son record.

const L = 900; // largeur logique du terrain
const H = 300; // hauteur logique
const SOL = 252; // ligne du sol
const ROBOT_X = 86;
const ROBOT_L = 40;
const ROBOT_H = 54;
const ROBOT_H_BAS = 30;
const GRAVITE = 2600;
const SAUT = -880;
const CLE_PSEUDO = "cycylive-arcade-pseudo";
const CLE_RECORD = "cycylive-arcade-record";

type Obstacle = { type: "rocher" | "cristal" | "comete"; x: number; y: number; l: number; h: number; graine: number };
type Particule = { x: number; y: number; vx: number; vy: number; vie: number; couleur: string };
type Etoile = { x: number; y: number; r: number; couche: number };

type Jeu = {
  enCours: boolean;
  mort: boolean;
  t: number; // secondes de course
  distance: number;
  robotY: number; // bas du robot (SOL quand il est au sol)
  vy: number;
  baisse: boolean;
  sautTenu: boolean;
  obstacles: Obstacle[];
  prochain: number; // distance avant le prochain obstacle
  particules: Particule[];
  etoiles: Etoile[];
  decor: number; // défilement du sol
  flash: number; // clignotement du score (paliers de 500)
  mortDepuis: number;
};

type Phase = "attente" | "jeu" | "fin";

function lireLocal(cle: string): string {
  try {
    return localStorage.getItem(cle) || "";
  } catch {
    return "";
  }
}
function ecrireLocal(cle: string, valeur: string) {
  try {
    localStorage.setItem(cle, valeur);
  } catch {
    /* navigateur sans stockage */
  }
}

function nouvellesEtoiles(): Etoile[] {
  const liste: Etoile[] = [];
  for (let i = 0; i < 70; i++) {
    liste.push({ x: Math.random() * L, y: Math.random() * (SOL - 40), r: Math.random() * 1.3 + 0.3, couche: Math.random() < 0.7 ? 0 : 1 });
  }
  return liste;
}

function nouveauJeu(etoiles?: Etoile[]): Jeu {
  return {
    enCours: false, mort: false, t: 0, distance: 0, robotY: SOL, vy: 0, baisse: false, sautTenu: false,
    obstacles: [], prochain: 650, particules: [], etoiles: etoiles ?? nouvellesEtoiles(), decor: 0, flash: 0, mortDepuis: 0,
  };
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

/** Ajoute un obstacle (ou un petit groupe) adapté à la vitesse actuelle. */
function creerObstacle(j: Jeu) {
  const score = Math.floor(j.distance / ARCADE.pxParPoint);
  const v = vitesseA(j.t);
  const x = L + 30;
  const tirage = Math.random();
  if (score > 250 && tirage < 0.22) {
    // Comète : basse (il faut se baisser) ou haute (il ne faut pas sauter)
    const basse = Math.random() < 0.65;
    const h = 22;
    const y = basse ? SOL - 58 : SOL - 112;
    j.obstacles.push({ type: "comete", x, y, l: 54, h, graine: Math.random() });
  } else if (tirage < 0.55) {
    const n = score > 400 && Math.random() < 0.35 ? (Math.random() < 0.5 ? 2 : 3) : 1;
    let dx = 0;
    for (let i = 0; i < n; i++) {
      const l = rand(26, 38);
      const h = rand(30, 50);
      j.obstacles.push({ type: "rocher", x: x + dx, y: SOL - h, l, h, graine: Math.random() });
      dx += l + 4;
    }
  } else {
    const h = rand(44, 62);
    j.obstacles.push({ type: "cristal", x, y: SOL - h, l: 22, h, graine: Math.random() });
  }
  // Écart jusqu'au suivant : toujours franchissable, de plus en plus serré
  // Un saut dure ~0,68 s : l'écart minimum laisse le temps d'atterrir et de réagir
  const ecartMin = 150 + v * 0.74;
  j.prochain = ecartMin + Math.random() * v * 0.65;
}

function collision(j: Jeu): boolean {
  const h = j.baisse && j.robotY >= SOL - 0.5 ? ROBOT_H_BAS : ROBOT_H;
  const rx1 = ROBOT_X + 7, rx2 = ROBOT_X + ROBOT_L - 7;
  const ry1 = j.robotY - h + 6, ry2 = j.robotY - 3;
  return j.obstacles.some((o) => {
    const m = o.type === "comete" ? 5 : 4;
    return rx1 < o.x + o.l - m && rx2 > o.x + m && ry1 < o.y + o.h - m && ry2 > o.y + m;
  });
}

// ── Dessin ──────────────────────────────────────────────────

function dessinerFond(ctx: CanvasRenderingContext2D, j: Jeu) {
  const ciel = ctx.createLinearGradient(0, 0, 0, SOL);
  ciel.addColorStop(0, "#07040f");
  ciel.addColorStop(1, "#1a0f38");
  ctx.fillStyle = ciel;
  ctx.fillRect(0, 0, L, H);

  // Planète lointaine
  const px = 720 - ((j.distance * 0.02) % (L + 300));
  const planete = ctx.createRadialGradient(px - 18, 70, 6, px, 84, 46);
  planete.addColorStop(0, "#b57cff");
  planete.addColorStop(1, "#3b1a7a");
  ctx.fillStyle = planete;
  ctx.beginPath();
  ctx.arc(px < -60 ? px + L + 300 : px, 84, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(224,179,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(px < -60 ? px + L + 300 : px, 86, 66, 12, -0.25, 0, Math.PI * 2);
  ctx.stroke();

  for (const e of j.etoiles) {
    ctx.fillStyle = e.couche ? "rgba(245,241,255,0.9)" : "rgba(207,198,232,0.55)";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r * (e.couche ? 1.3 : 1), 0, Math.PI * 2);
    ctx.fill();
  }

  // Sol
  const sol = ctx.createLinearGradient(0, SOL, 0, H);
  sol.addColorStop(0, "#2a1857");
  sol.addColorStop(1, "#120a26");
  ctx.fillStyle = sol;
  ctx.fillRect(0, SOL, L, H - SOL);
  ctx.strokeStyle = "#b57cff";
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, SOL + 1);
  ctx.lineTo(L, SOL + 1);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Petits cratères et cailloux qui défilent
  ctx.fillStyle = "rgba(224,179,255,0.25)";
  for (let i = 0; i < 14; i++) {
    const x = (((i * 137 - j.decor) % (L + 40)) + L + 40) % (L + 40) - 20;
    const y = SOL + 10 + ((i * 53) % 34);
    ctx.fillRect(x, y, 2 + (i % 3) * 3, 2);
  }
}

function dessinerRobot(ctx: CanvasRenderingContext2D, j: Jeu, temps: number) {
  const auSol = j.robotY >= SOL - 0.5;
  const bas = j.baisse && auSol;
  const h = bas ? ROBOT_H_BAS : ROBOT_H;
  const x = ROBOT_X;
  const y = j.robotY - h;
  const pas = j.enCours && auSol ? Math.floor(temps * 12) % 2 : 0;

  // Jambes
  ctx.fillStyle = "#4b23a8";
  if (auSol) {
    ctx.fillRect(x + 9, j.robotY - 9 + (pas ? 2 : 0), 8, 9 - (pas ? 2 : 0));
    ctx.fillRect(x + ROBOT_L - 17, j.robotY - 9 + (pas ? 0 : 2), 8, 9 - (pas ? 0 : 2));
  } else {
    ctx.fillRect(x + 8, j.robotY - 10, 8, 7);
    ctx.fillRect(x + ROBOT_L - 16, j.robotY - 8, 8, 7);
  }
  // Corps
  const corps = ctx.createLinearGradient(x, y, x, y + h);
  corps.addColorStop(0, "#9b5cff");
  corps.addColorStop(1, "#6a2ee8");
  ctx.fillStyle = corps;
  arrondi(ctx, x, y + (bas ? 2 : 10), ROBOT_L + (bas ? 10 : 0), h - (bas ? 10 : 18), 9);
  ctx.fill();
  // Visière
  ctx.fillStyle = "#120a26";
  arrondi(ctx, x + 7 + (bas ? 14 : 0), y + (bas ? 6 : 16), 26, 13, 6);
  ctx.fill();
  ctx.fillStyle = j.mort ? "#ff6b8b" : "#e0b3ff";
  ctx.shadowColor = "#e0b3ff";
  ctx.shadowBlur = 8;
  ctx.fillRect(x + 13 + (bas ? 14 : 0), y + (bas ? 10 : 20), 5, 5);
  ctx.fillRect(x + 23 + (bas ? 14 : 0), y + (bas ? 10 : 20), 5, 5);
  // Antenne
  if (!bas) {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#b57cff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + ROBOT_L / 2, y + 10);
    ctx.lineTo(x + ROBOT_L / 2 + 3, y + 1);
    ctx.stroke();
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#f472b6";
    ctx.beginPath();
    ctx.arc(x + ROBOT_L / 2 + 3, y + 1, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function arrondi(ctx: CanvasRenderingContext2D, x: number, y: number, l: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + l, y, x + l, y + h, r);
  ctx.arcTo(x + l, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + l, y, r);
  ctx.closePath();
}

function dessinerObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, temps: number) {
  if (o.type === "rocher") {
    const g = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
    g.addColorStop(0, "#7d6aa8");
    g.addColorStop(1, "#3d2f63");
    ctx.fillStyle = g;
    ctx.beginPath();
    const pts = 9;
    for (let i = 0; i <= pts; i++) {
      const a = Math.PI + (i / pts) * Math.PI;
      const bosse = 0.82 + 0.18 * Math.sin(o.graine * 40 + i * 2.3);
      const px = o.x + o.l / 2 + Math.cos(a) * (o.l / 2) * bosse;
      const py = o.y + o.h + Math.sin(a) * o.h * bosse;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(18,10,38,0.45)";
    ctx.beginPath();
    ctx.arc(o.x + o.l * 0.38, o.y + o.h * 0.45, o.l * 0.11, 0, Math.PI * 2);
    ctx.arc(o.x + o.l * 0.66, o.y + o.h * 0.7, o.l * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (o.type === "cristal") {
    ctx.shadowColor = "#e0b3ff";
    ctx.shadowBlur = 12;
    const g = ctx.createLinearGradient(o.x, o.y, o.x + o.l, o.y + o.h);
    g.addColorStop(0, "#f5d6ff");
    g.addColorStop(1, "#8b4dff");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(o.x + o.l / 2, o.y);
    ctx.lineTo(o.x + o.l, o.y + o.h * 0.35);
    ctx.lineTo(o.x + o.l * 0.8, o.y + o.h);
    ctx.lineTo(o.x + o.l * 0.2, o.y + o.h);
    ctx.lineTo(o.x, o.y + o.h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(o.x + o.l / 2, o.y + 3);
    ctx.lineTo(o.x + o.l / 2, o.y + o.h - 2);
    ctx.stroke();
  } else {
    // Comète : noyau lumineux + traînée
    const cx = o.x + 14, cy = o.y + o.h / 2;
    const trainee = ctx.createLinearGradient(cx, cy, cx + o.l + 30, cy);
    trainee.addColorStop(0, "rgba(244,114,182,0.85)");
    trainee.addColorStop(1, "rgba(244,114,182,0)");
    ctx.fillStyle = trainee;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 9);
    ctx.lineTo(cx + o.l + 30, cy - 2 + Math.sin(temps * 20) * 2);
    ctx.lineTo(cx + o.l + 30, cy + 2 + Math.sin(temps * 20) * 2);
    ctx.lineTo(cx, cy + 9);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = "#f472b6";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#ffe4f3";
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function texteScore(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(5, "0");
}

function dessinerHud(ctx: CanvasRenderingContext2D, j: Jeu, record: number, phase: Phase) {
  const score = Math.floor(j.distance / ARCADE.pxParPoint);
  ctx.font = "600 18px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(207,198,232,0.6)";
  ctx.fillText(`RECORD ${texteScore(Math.max(record, phase === "fin" ? score : 0))}`, L - 130, 32);
  const visible = j.flash <= 0 || Math.floor(j.flash * 8) % 2 === 0;
  ctx.fillStyle = visible ? "#f5f1ff" : "rgba(245,241,255,0.15)";
  ctx.fillText(texteScore(score), L - 22, 32);
  ctx.textAlign = "center";
  if (phase === "attente") {
    ctx.font = "700 26px system-ui, sans-serif";
    ctx.fillStyle = "#f5f1ff";
    ctx.fillText("CYCY RUNNER", L / 2, 112);
    ctx.font = "500 15px system-ui, sans-serif";
    ctx.fillStyle = "#cfc6e8";
    ctx.fillText("Espace / ↑ ou touche l'écran pour commencer", L / 2, 140);
  } else if (phase === "fin") {
    ctx.font = "700 28px system-ui, sans-serif";
    ctx.fillStyle = "#f5f1ff";
    ctx.fillText("PARTIE TERMINÉE", L / 2, 108);
    ctx.font = "500 15px system-ui, sans-serif";
    ctx.fillStyle = "#cfc6e8";
    ctx.fillText(`${score} points · Espace ou touche l'écran pour rejouer`, L / 2, 136);
  }
  ctx.textAlign = "left";
}

// ── Composant ───────────────────────────────────────────────

export default function BorneArcade() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const jeuRef = useRef<Jeu>(nouveauJeu());
  const phaseRef = useRef<Phase>("attente");
  const recordRef = useRef(0);
  const jetonRef = useRef<{ partie: number; jeton: string | null }>({ partie: 0, jeton: null });
  const partieRef = useRef(0);
  const pseudoRef = useRef<HTMLInputElement | null>(null);

  const [phase, setPhaseEtat] = useState<Phase>("attente");
  const [scoreFinal, setScoreFinal] = useState(0);
  const [pseudo, setPseudo] = useState("");
  const [record, setRecord] = useState(0);
  const [envoi, setEnvoi] = useState<{ etat: "libre" | "envoi" | "ok" | "erreur"; texte: string }>({ etat: "libre", texte: "" });

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseEtat(p);
  }, []);

  useEffect(() => {
    setPseudo(lireLocal(CLE_PSEUDO));
    const r = Number(lireLocal(CLE_RECORD)) || 0;
    recordRef.current = r;
    setRecord(r);
  }, []);

  const demarrer = useCallback(() => {
    const ancien = jeuRef.current;
    const j = nouveauJeu(ancien.etoiles);
    j.enCours = true;
    jeuRef.current = j;
    partieRef.current += 1;
    const partie = partieRef.current;
    jetonRef.current = { partie, jeton: null };
    setEnvoi({ etat: "libre", texte: "" });
    setPhase("jeu");
    fetch("/api/arcade/partie", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (jetonRef.current.partie === partie && d.ok) jetonRef.current = { partie, jeton: d.jeton };
      })
      .catch(() => {});
  }, [setPhase]);

  const sauter = useCallback(() => {
    const j = jeuRef.current;
    if (phaseRef.current === "attente") return demarrer();
    if (phaseRef.current === "fin") {
      if (performance.now() - j.mortDepuis > 600) demarrer();
      return;
    }
    j.sautTenu = true;
    if (j.robotY >= SOL - 0.5) j.vy = SAUT;
  }, [demarrer]);

  const relacherSaut = useCallback(() => {
    const j = jeuRef.current;
    j.sautTenu = false;
    if (j.vy < -320) j.vy = -320; // saut plus court si on relâche tôt
  }, []);

  const seBaisser = useCallback((oui: boolean) => {
    jeuRef.current.baisse = oui;
  }, []);

  // Boucle de jeu
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let avant = performance.now();

    const ajuster = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = L * ratio;
      canvas.height = H * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    ajuster();
    window.addEventListener("resize", ajuster);

    const image = (maintenant: number) => {
      const dt = Math.min(0.05, (maintenant - avant) / 1000);
      avant = maintenant;
      const j = jeuRef.current;
      const temps = maintenant / 1000;

      if (j.enCours && !j.mort) {
        j.t += dt;
        const v = vitesseA(j.t);
        const avance = v * dt;
        const avantPalier = Math.floor(j.distance / ARCADE.pxParPoint / 500);
        j.distance += avance;
        if (Math.floor(j.distance / ARCADE.pxParPoint / 500) > avantPalier) j.flash = 1;
        j.decor += avance;
        j.flash = Math.max(0, j.flash - dt);

        // Robot
        const g = GRAVITE * (j.baisse && j.robotY < SOL - 0.5 ? 2.4 : 1); // se baisser en l'air = redescendre vite
        j.vy += g * dt;
        j.robotY += j.vy * dt;
        if (j.robotY >= SOL) {
          j.robotY = SOL;
          j.vy = 0;
        }

        // Obstacles
        for (const o of j.obstacles) o.x -= avance * (o.type === "comete" ? 1.12 : 1);
        j.obstacles = j.obstacles.filter((o) => o.x + o.l + 60 > 0);
        j.prochain -= avance;
        if (j.prochain <= 0) creerObstacle(j);

        // Étoiles (parallaxe)
        for (const e of j.etoiles) {
          e.x -= avance * (e.couche ? 0.08 : 0.03);
          if (e.x < 0) e.x += L;
        }

        if (collision(j)) {
          j.mort = true;
          j.enCours = false;
          j.mortDepuis = maintenant;
          for (let i = 0; i < 26; i++) {
            j.particules.push({ x: ROBOT_X + ROBOT_L / 2, y: j.robotY - 26, vx: rand(-260, 260), vy: rand(-380, 60), vie: rand(0.5, 1.1), couleur: Math.random() < 0.5 ? "#b57cff" : "#f472b6" });
          }
          const score = Math.floor(j.distance / ARCADE.pxParPoint);
          if (score > recordRef.current) {
            recordRef.current = score;
            ecrireLocal(CLE_RECORD, String(score));
            setRecord(score);
          }
          setScoreFinal(score);
          setPhase("fin");
        }
      }

      for (const p of j.particules) {
        p.vy += 900 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vie -= dt;
      }
      j.particules = j.particules.filter((p) => p.vie > 0);

      dessinerFond(ctx, j);
      for (const o of j.obstacles) dessinerObstacle(ctx, o, temps);
      dessinerRobot(ctx, j, temps);
      for (const p of j.particules) {
        ctx.globalAlpha = Math.max(0, Math.min(1, p.vie));
        ctx.fillStyle = p.couleur;
        ctx.fillRect(p.x, p.y, 4, 4);
      }
      ctx.globalAlpha = 1;
      dessinerHud(ctx, j, recordRef.current, phaseRef.current);
      raf = requestAnimationFrame(image);
    };
    raf = requestAnimationFrame(image);

    // Onglet caché : le jeu se met en pause (la boucle reprend sans saut de temps)
    const visibilite = () => {
      avant = performance.now();
    };
    document.addEventListener("visibilitychange", visibilite);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", ajuster);
      document.removeEventListener("visibilitychange", visibilite);
    };
  }, [setPhase]);

  // Clavier
  useEffect(() => {
    const dansChamp = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return Boolean(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "BUTTON" || t.isContentEditable));
    };
    const bas = (e: KeyboardEvent) => {
      if (dansChamp(e)) return;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        if (!e.repeat) sauter();
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        seBaisser(true);
      }
    };
    const haut = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") relacherSaut();
      else if (e.code === "ArrowDown" || e.code === "KeyS") seBaisser(false);
    };
    window.addEventListener("keydown", bas);
    window.addEventListener("keyup", haut);
    return () => {
      window.removeEventListener("keydown", bas);
      window.removeEventListener("keyup", haut);
    };
  }, [sauter, relacherSaut, seBaisser]);

  // Tactile sur le terrain : toucher = sauter, glisser vers le bas = se baisser
  const departToucher = useRef<{ y: number } | null>(null);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    const jeton = jetonRef.current.jeton;
    if (!jeton) {
      setEnvoi({ etat: "erreur", texte: "Connexion au classement impossible pour cette partie : rejoue pour enregistrer un score." });
      return;
    }
    setEnvoi({ etat: "envoi", texte: "Enregistrement…" });
    try {
      const r = await fetch("/api/arcade/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jeton, score: scoreFinal, pseudo, site: "" }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.erreur || "Enregistrement impossible.");
      ecrireLocal(CLE_PSEUDO, pseudo.trim());
      const place = d.rang ? ` Tu es ${d.rang === 1 ? "1er·e" : `${d.rang}e`} du classement.` : "";
      setEnvoi({
        etat: "ok",
        texte: d.nouveauRecord ? `🎉 Nouveau record pour ${pseudo.trim()} : ${d.score} points !${place}` : `Score enregistré. Ton record reste de ${d.meilleur} points.${place}`,
      });
      window.dispatchEvent(new CustomEvent("arcade:classement", { detail: { pseudo: pseudo.trim() } }));
    } catch (err) {
      setEnvoi({ etat: "erreur", texte: err instanceof Error ? err.message : "Enregistrement impossible." });
    }
  }

  return (
    <div>
      <div className="carte-holo rounded-3xl border border-violet/20 overflow-hidden shadow-glow-sm">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Cycy Runner : fais sauter le robot au-dessus des obstacles"
          className="block w-full aspect-[3/1] touch-none select-none cursor-pointer"
          onPointerDown={(e) => {
            departToucher.current = { y: e.clientY };
            sauter();
          }}
          onPointerMove={(e) => {
            if (departToucher.current && e.clientY - departToucher.current.y > 24) seBaisser(true);
          }}
          onPointerUp={() => {
            departToucher.current = null;
            relacherSaut();
            seBaisser(false);
          }}
          onPointerCancel={() => {
            departToucher.current = null;
            relacherSaut();
            seBaisser(false);
          }}
        />
      </div>

      {/* Boutons pour mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3 mt-3 select-none">
        <button
          type="button"
          className="rounded-2xl border border-violet/30 bg-violet/15 py-4 text-ink font-semibold active:bg-violet/30 touch-none"
          onPointerDown={(e) => {
            e.preventDefault();
            seBaisser(true);
          }}
          onPointerUp={() => seBaisser(false)}
          onPointerCancel={() => seBaisser(false)}
          onPointerLeave={() => seBaisser(false)}
        >
          ⬇ Se baisser
        </button>
        <button
          type="button"
          className="rounded-2xl bg-violet py-4 text-ink font-semibold active:bg-violet-light touch-none"
          onPointerDown={(e) => {
            e.preventDefault();
            sauter();
          }}
          onPointerUp={relacherSaut}
          onPointerCancel={relacherSaut}
        >
          ⬆ Sauter
        </button>
      </div>

      <div className="mt-4 carte-holo rounded-2xl border border-violet/12 p-5" aria-live="polite">
        {phase !== "fin" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-ink-soft text-sm">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-ink">Espace</kbd> ou{" "}
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-ink">↑</kbd> pour sauter (garde appuyé pour sauter plus haut),{" "}
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-ink">↓</kbd> pour te baisser sous les comètes. Sur mobile : touche l&apos;écran.
            </p>
            <p className="text-sm text-lilac whitespace-nowrap">Ton record : {record} pts</p>
          </div>
        ) : (
          <div>
            <p className="text-ink text-lg font-semibold mb-1">
              Partie terminée : {scoreFinal} point{scoreFinal > 1 ? "s" : ""}
              {scoreFinal >= record && scoreFinal > 0 && <span className="ml-2 text-lilac text-sm">(record perso !)</span>}
            </p>
            {envoi.etat !== "ok" ? (
              <form onSubmit={enregistrer} className="flex flex-wrap items-center gap-2 mt-3">
                <label htmlFor="arcade-pseudo" className="sr-only">
                  Ton pseudo
                </label>
                <input
                  ref={pseudoRef}
                  id="arcade-pseudo"
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  maxLength={ARCADE.pseudoMax}
                  minLength={ARCADE.pseudoMin}
                  required
                  autoComplete="nickname"
                  placeholder="Ton pseudo (ex. ton pseudo Twitch)"
                  className="flex-1 min-w-[200px] rounded-full bg-card border border-violet/25 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 outline-none focus:border-violet/60"
                />
                <input type="text" name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <button
                  type="submit"
                  disabled={envoi.etat === "envoi" || scoreFinal < 1}
                  className="rounded-full px-5 py-2.5 bg-violet text-ink text-sm font-medium hover:bg-violet-light hover:shadow-glow transition-all disabled:opacity-50"
                >
                  {envoi.etat === "envoi" ? "Enregistrement…" : "Enregistrer mon record"}
                </button>
                <button
                  type="button"
                  onClick={demarrer}
                  className="rounded-full px-5 py-2.5 border border-violet/30 text-ink-soft text-sm font-medium hover:bg-violet/10 transition-all"
                >
                  Rejouer
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-sm text-lilac flex-1">{envoi.texte}</p>
                <button
                  type="button"
                  onClick={demarrer}
                  className="rounded-full px-5 py-2.5 bg-violet text-ink text-sm font-medium hover:bg-violet-light transition-all"
                >
                  Rejouer
                </button>
              </div>
            )}
            {envoi.etat === "erreur" && <p className="text-sm text-red-300 mt-2">{envoi.texte}</p>}
            <p className="text-xs text-ink-soft/50 mt-3">
              Pas besoin de compte : ton pseudo garde ton meilleur score. Essais illimités !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
