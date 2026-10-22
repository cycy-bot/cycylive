"use client";

// Star Catcher : attrape les étoiles qui tombent avec ton filet cosmique.
// Étoile 50 points, étoile dorée 150, multipliés par le combo (×1 → ×5, +1 toutes les 5 prises).
// Une étoile qui tombe sans être attrapée casse le combo. Météorite et trou noir = une vie en moins.
// Bonus : vie, aimant, grand filet, points doublés. Trois vies. Dessins : dessinsCanvas.ts
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import { EcranDepart, type PropsJeu } from "./FinDePartie";
import type { NomIcone } from "@/components/icones/banque";
import { etoile as etoileCanvas, eclat, meteorite, trouNoir, pastilleBonus, iconeCoeur, iconeAimant, iconeFilet, iconeDouble } from "./dessinsCanvas";

type Type = "etoile" | "doree" | "meteore" | "trou" | "vie" | "aimant" | "filet" | "double";
type Objet = { x: number; y: number; vy: number; vx: number; type: Type; t: number; base: number };
type Texte = { x: number; y: number; texte: string; vie: number; c: string };
type Eclat = { x: number; y: number; vx: number; vy: number; vie: number; c: string };

const DANGER: Type[] = ["meteore", "trou"];
const BONUS: Type[] = ["vie", "aimant", "filet", "double"];
const DESSIN: Partial<Record<Type, (ctx: CanvasRenderingContext2D, s: number) => void>> = { vie: iconeCoeur, aimant: iconeAimant, filet: iconeFilet, double: iconeDouble };
const ICONE: Record<"vie" | "aimant" | "filet" | "double", NomIcone> = { vie: "coeur", aimant: "aimant", filet: "filet", double: "eclair" };
const NOM: Record<"vie" | "aimant" | "filet" | "double", string> = { vie: "Vie en plus", aimant: "Aimant à étoiles", filet: "Grand filet", double: "Points ×2" };
const COULEUR: Record<Type, string> = { etoile: "#ffe066", doree: "#ffb627", meteore: "#ff7a45", trou: "#a855f7", vie: "#ff5c8a", aimant: "#60a5fa", filet: "#6bffc8", double: "#f0abfc" };
const multDe = (combo: number) => Math.min(5, 1 + Math.floor(combo / 5));


export default function StarCatcher({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "decompte" | "jeu">("depart");
  const [decompte, setDecompte] = useState(3);
  const [hud, setHud] = useState({ score: 0, vies: 3, combo: 0, effets: [] as ("aimant" | "filet" | "double")[] });
  const zone = useRef<HTMLDivElement | null>(null);
  const toile = useRef<HTMLCanvasElement | null>(null);
  const cibleX = useRef<number | null>(null);
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

  useEffect(() => {
    if (phase !== "jeu") return;
    const bas = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "q", "d", "a"].includes(k)) { e.preventDefault(); touches.current.add(k); cibleX.current = null; }
    };
    const haut = (e: KeyboardEvent) => touches.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", bas);
    window.addEventListener("keyup", haut);
    return () => { window.removeEventListener("keydown", bas); window.removeEventListener("keyup", haut); touches.current.clear(); };
  }, [phase]);

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
    const fond = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.3, p: Math.random() * 6 }));
    const filet = { x: W / 2, invincible: 0, aimant: 0, grand: 0, double: 0 };
    let objets: Objet[] = [], textes: Texte[] = [], eclats: Eclat[] = [];
    let t = 0, score = 0, vies = 3, combo = 0, comboMax = 0, prises = 0, prochaine = 0.5, fin = -1, fini = false, secousse = 0, dernierHud = 0;
    let avant = performance.now(), raf = 0;
    const Y = () => H - 46;

    const gerbe = (x: number, y: number, c: string, n = 12) => {
      for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 50 + Math.random() * 170; eclats.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, vie: 0.4 + Math.random() * 0.4, c }); }
    };
    const choisir = (): Type => {
      const r = Math.random(), danger = Math.min(0.38, 0.12 + t * 0.004);
      if (r < danger) return Math.random() < (t > 25 ? 0.4 : 0.15) ? "trou" : "meteore";
      if (r < danger + 0.045) return BONUS[Math.floor(Math.random() * BONUS.length)];
      return Math.random() < 0.09 ? "doree" : "etoile";
    };

    const boucle = (now: number) => {
      const dt = Math.min(0.05, (now - avant) / 1000);
      avant = now;
      const enJeu = fin < 0;
      if (enJeu) t += dt;
      const largeur = filet.grand > 0 ? 150 : 92;

      // ── filet ──
      if (enJeu) {
        const k = touches.current;
        const dir = (k.has("arrowright") || k.has("d") ? 1 : 0) - (k.has("arrowleft") || k.has("q") || k.has("a") ? 1 : 0);
        if (dir) filet.x += dir * 620 * dt;
        else if (cibleX.current != null) filet.x += (cibleX.current - filet.x) * Math.min(1, dt * 18);
        filet.x = Math.max(largeur / 2, Math.min(W - largeur / 2, filet.x));
        for (const c of ["invincible", "aimant", "grand", "double"] as const) filet[c] = Math.max(0, filet[c] - dt);
      }

      // ── apparitions ──
      prochaine -= dt;
      if (enJeu && prochaine <= 0) {
        const type = choisir();
        const vy = (DANGER.includes(type) ? 1.15 : 1) * (150 + Math.min(330, t * 4.2) + Math.random() * 60);
        objets.push({ x: 24 + Math.random() * (W - 48), y: -24, vy, vx: type === "meteore" ? (Math.random() - 0.5) * 120 : 0, type, t: 0, base: 0 });
        objets[objets.length - 1].base = objets[objets.length - 1].x;
        prochaine = Math.max(0.24, 0.78 - t * 0.0075) * (0.7 + Math.random() * 0.6);
      }

      // ── chute, aimant, prises ──
      objets = objets.filter((o) => {
        o.t += dt;
        o.y += o.vy * dt;
        if (o.type === "trou") o.x = o.base + Math.sin(o.t * 2.4) * 46;
        else o.x += o.vx * dt;
        if (filet.aimant > 0 && (o.type === "etoile" || o.type === "doree") && o.y > H * 0.35) o.x += (filet.x - o.x) * Math.min(1, dt * 5);
        if (!enJeu) return o.y < H + 30;
        const dansFilet = o.y > Y() - 16 && o.y < Y() + 14 && Math.abs(o.x - filet.x) < largeur / 2 + 10;
        if (dansFilet) {
          if (o.type === "etoile" || o.type === "doree") {
            combo += 1; prises += 1; comboMax = Math.max(comboMax, combo);
            const pts = (o.type === "doree" ? 150 : 50) * multDe(combo) * (filet.double > 0 ? 2 : 1);
            score += pts;
            textes.push({ x: o.x, y: Y() - 26, texte: `+${pts}`, vie: 0.8, c: COULEUR[o.type] });
            gerbe(o.x, Y() - 6, COULEUR[o.type], o.type === "doree" ? 20 : 10);
          } else if (DANGER.includes(o.type)) {
            if (filet.invincible <= 0) {
              vies -= 1; combo = 0; filet.invincible = 1.2; secousse = 0.35;
              textes.push({ x: o.x, y: Y() - 30, texte: o.type === "trou" ? "Aspiré !" : "Aïe !", vie: 1, c: "#ff7a7a" });
              gerbe(o.x, Y(), COULEUR[o.type], 22);
              if (vies <= 0) fin = 0;
            }
          } else {
            if (o.type === "vie") vies = Math.min(5, vies + 1);
            if (o.type === "aimant") filet.aimant = 7;
            if (o.type === "filet") filet.grand = 8;
            if (o.type === "double") filet.double = 8;
            textes.push({ x: o.x, y: Y() - 26, texte: { vie: "+1 vie", aimant: "Aimant !", filet: "Grand filet !", double: "Points ×2 !" }[o.type as "vie"], vie: 1, c: COULEUR[o.type] });
            gerbe(o.x, Y() - 6, COULEUR[o.type], 14);
          }
          return false;
        }
        if (o.y > H + 20) {
          if ((o.type === "etoile" || o.type === "doree") && combo > 0) { combo = 0; textes.push({ x: Math.max(40, Math.min(W - 40, o.x)), y: H - 12, texte: "Combo perdu", vie: 0.9, c: "#a99cc8" }); }
          return false;
        }
        return true;
      });
      textes = textes.filter((x) => { x.y -= 40 * dt; x.vie -= dt; return x.vie > 0; });
      eclats = eclats.filter((e) => { e.x += e.vx * dt; e.y += e.vy * dt; e.vy += 300 * dt; e.vie -= dt; return e.vie > 0; });

      // ── dessin ──
      ctx.save();
      if (secousse > 0) { secousse -= dt; ctx.translate((Math.random() - 0.5) * 10 * secousse * 3, (Math.random() - 0.5) * 10 * secousse * 3); }
      ctx.clearRect(-20, -20, W + 40, H + 40);
      for (const s of fond) { ctx.globalAlpha = 0.25 + 0.3 * Math.sin(now / 700 + s.p); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      for (const o of objets) {
        if (o.type === "etoile") etoileCanvas(ctx, o.x, o.y, 12, COULEUR.etoile, o.t * 2, 12);
        else if (o.type === "doree") { etoileCanvas(ctx, o.x, o.y, 16, COULEUR.doree, o.t * 2, 24); eclat(ctx, o.x + 14, o.y - 13, 4.5); eclat(ctx, o.x - 15, o.y + 9, 3); }
        else if (o.type === "meteore") meteorite(ctx, o.x, o.y, o.vx, 13);
        else if (o.type === "trou") trouNoir(ctx, o.x, o.y, o.t, 20);
        else pastilleBonus(ctx, o.x, o.y, 16, COULEUR[o.type], o.t, DESSIN[o.type]!);
      }
      // filet cosmique (clignote quand on vient de perdre une vie)
      if (!(filet.invincible > 0 && Math.floor(now / 90) % 2)) {
        const x0 = filet.x - largeur / 2, y0 = Y();
        if (filet.aimant > 0) { ctx.strokeStyle = "rgba(96,165,250,0.35)"; ctx.lineWidth = 1.5; for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(filet.x, y0, 18 * i + ((now / 30) % 18), Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } }
        const g = ctx.createLinearGradient(x0, 0, x0 + largeur, 0);
        g.addColorStop(0, "#b57cff"); g.addColorStop(1, filet.double > 0 ? "#f0abfc" : "#ffe066");
        ctx.strokeStyle = g; ctx.lineWidth = 4; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x0, y0 - 10); ctx.quadraticCurveTo(filet.x, y0 + 26, x0 + largeur, y0 - 10); ctx.stroke();
        ctx.lineWidth = 1; ctx.strokeStyle = "rgba(255,255,255,0.35)";
        for (let i = 1; i < 6; i++) { const x = x0 + (largeur * i) / 6; ctx.beginPath(); ctx.moveTo(x, y0 - 6); ctx.lineTo(filet.x + (x - filet.x) * 0.5, y0 + 12); ctx.stroke(); }
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x0, y0 - 10, 4, 0, Math.PI * 2); ctx.arc(x0 + largeur, y0 - 10, 4, 0, Math.PI * 2); ctx.fill();
      }
      for (const e of eclats) { ctx.globalAlpha = Math.max(0, e.vie * 2); ctx.fillStyle = e.c; ctx.fillRect(e.x - 1.5, e.y - 1.5, 3, 3); }
      ctx.globalAlpha = 1;
      ctx.font = "bold 15px system-ui, sans-serif";
      for (const x of textes) { ctx.globalAlpha = Math.min(1, x.vie * 2); ctx.fillStyle = x.c; ctx.fillText(x.texte, x.x, x.y); }
      ctx.globalAlpha = 1;
      ctx.restore();

      if (now - dernierHud > 90) {
        dernierHud = now;
        setHud({ score, vies, combo, effets: ([filet.aimant > 0 ? "aimant" : "", filet.grand > 0 ? "filet" : "", filet.double > 0 ? "double" : ""].filter(Boolean)) as ("aimant" | "filet" | "double")[] });
      }
      if (!enJeu) {
        fin += dt;
        if (fin > 0.8 && !fini) {
          fini = true;
          onFin(score, `${prises} étoile${prises > 1 ? "s" : ""} attrapée${prises > 1 ? "s" : ""} · meilleur combo ${comboMax} · ${t.toFixed(0)} s`);
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
    cibleX.current = ev.clientX - zone.current.getBoundingClientRect().left;
  }

  const mult = multDe(hud.combo);
  return (
    <div
      ref={zone}
      onPointerMove={viser}
      onPointerDown={viser}
      className="relative h-[480px] md:h-[540px] select-none overflow-hidden rounded-2xl border border-violet/20 touch-none"
      style={{ cursor: phase === "jeu" ? "none" : "default", background: "radial-gradient(ellipse at 50% 0%, #2a2410 0%, #120e1c 55%, #0a0812 100%)" }}
    >
      <canvas ref={toile} className="absolute inset-0 h-full w-full" />
      {phase === "depart" ? (
        <EcranDepart
          icone="etoile"
          titre="Star Catcher"
          regles={<>Déplace ton filet (souris, doigt ou ← →) et attrape les étoiles : <strong className="text-[#ffe066]">50 pts</strong>, la dorée <strong className="text-[#ffb627]">150 pts</strong>. Enchaîne les prises pour monter le combo jusqu&apos;à <strong className="text-ink">×5</strong> ; une étoile ratée le casse. Évite les météorites et les trous noirs : trois vies.
            <span className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff7a45]/60 px-2.5 py-1 text-xs font-semibold text-[#ffb08a]"><Icone nom="comete" className="w-4 h-4" />Météorite : −1 vie</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a855f7]/60 px-2.5 py-1 text-xs font-semibold text-[#d8b4fe]"><Icone nom="galaxie" className="w-4 h-4" />Trou noir : −1 vie</span>
              {(["vie", "aimant", "filet", "double"] as const).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold" style={{ borderColor: COULEUR[k] + "88", color: COULEUR[k] }}><Icone nom={ICONE[k]} className="w-4 h-4" />{NOM[k]}</span>
              ))}
            </span></>}
          onJouer={lancer}
        />
      ) : null}
      {phase === "decompte" ? <p className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-ink glow-text">{decompte || "GO"}</p> : null}
      {phase === "jeu" ? (
        <div className="pointer-events-none absolute left-4 right-4 top-3 flex items-center justify-between text-sm font-semibold text-ink tabular-nums">
          <span aria-label={`${hud.vies} vies`} className="flex items-center gap-0.5">
            {Array.from({ length: Math.max(3, hud.vies) }, (_, i) => <Icone key={i} nom="coeur" className={`w-5 h-5 ${i < hud.vies ? "text-[#ff5c8a] drop-shadow-[0_0_6px_#ff5c8a]" : "text-white/20"}`} />)}
          </span>
          <span className="flex items-center gap-1.5">
            {hud.effets.map((e) => <span key={e} className="flex h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: COULEUR[e], color: COULEUR[e], background: COULEUR[e] + "22" }} title={NOM[e]}><Icone nom={ICONE[e]} className="w-3.5 h-3.5" /></span>)}
            <span className={`rounded-full px-2 py-0.5 ${mult > 1 ? "bg-[#ffe066]/25 text-[#ffe9a3]" : "bg-white/10 text-ink-soft"}`}>
              <Icone nom="flamme" className="w-3.5 h-3.5 mr-1" />combo {hud.combo} · ×{mult}
            </span>
          </span>
          <span className="text-lilac">{hud.score.toLocaleString("fr-FR")} pts</span>
        </div>
      ) : null}
    </div>
  );
}
