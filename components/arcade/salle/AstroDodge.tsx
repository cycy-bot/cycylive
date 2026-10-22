"use client";

// Astro Dodge : pilote ton vaisseau à travers une pluie d'astéroïdes qui s'intensifie.
// 10 points par seconde de survie, multipliés par le palier (×2 à 20 s, ×3 à 40 s, ×4 à 60 s).
// Bonus : 🛡️ bouclier (encaisse un choc), ⏳ ralenti, 🔹 mini-vaisseau, ⭐ +150 points.
// Souris / doigt : le vaisseau suit le pointeur. Clavier : flèches ou ZQSD / WASD.
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import { EcranDepart, type PropsJeu } from "./FinDePartie";

type Roche = { x: number; y: number; vx: number; vy: number; r: number; a: number; va: number; forme: number[]; teinte: string };
type TypeBonus = "bouclier" | "ralenti" | "mini" | "etoile";
type Bonus = { x: number; y: number; vy: number; type: TypeBonus; t: number };
type Eclat = { x: number; y: number; vx: number; vy: number; vie: number; c: string };

const BONUS: Record<TypeBonus, { emoji: string; couleur: string; nom: string }> = {
  bouclier: { emoji: "🛡️", couleur: "#5fd4ff", nom: "Bouclier" },
  ralenti: { emoji: "⏳", couleur: "#c084fc", nom: "Ralenti" },
  mini: { emoji: "🔹", couleur: "#6bffc8", nom: "Mini-vaisseau" },
  etoile: { emoji: "⭐", couleur: "#ffd76b", nom: "+150" },
};
const TEINTES = ["#8a6d5a", "#7a6a7f", "#9b7b62", "#6d5f7a"];
const palier = (t: number) => Math.min(4, 1 + Math.floor(t / 20));

export default function AstroDodge({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "decompte" | "jeu">("depart");
  const [decompte, setDecompte] = useState(3);
  const [hud, setHud] = useState({ t: 0, score: 0, mult: 1, effets: [] as string[] });
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
    let roches: Roche[] = [], bonus: Bonus[] = [], eclats: Eclat[] = [];
    let t = 0, score = 0, prochaine = 0.6, prochainBonus = 5, ralenti = 0, ramasses = 0, mort = -1, fini = false, dernierHud = 0;
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
          const pts = 7 + Math.floor(Math.random() * 4);
          roches.push({
            x: Math.random() * W, y: -r - 10, r,
            vx: (Math.random() - 0.5) * (30 + t * 1.6), vy: 150 + Math.min(380, t * 6.5) + Math.random() * 80,
            a: Math.random() * 6, va: (Math.random() - 0.5) * 2.4,
            forme: Array.from({ length: pts }, () => 0.72 + Math.random() * 0.34), teinte: TEINTES[Math.floor(Math.random() * TEINTES.length)],
          });
        }
        prochaine = Math.max(0.17, 0.85 - t * 0.012) * (0.75 + Math.random() * 0.5);
      }
      prochainBonus -= dt;
      if (vivant && prochainBonus <= 0) {
        const types: TypeBonus[] = ["bouclier", "ralenti", "mini", "etoile", "etoile"];
        bonus.push({ x: 30 + Math.random() * (W - 60), y: -20, vy: 120, type: types[Math.floor(Math.random() * types.length)], t: 0 });
        prochainBonus = 6 + Math.random() * 4;
      }

      // ── déplacements et collisions ──
      const rayon = vaisseau.mini > 0 ? 8 : 14;
      roches = roches.filter((p) => {
        p.x += p.vx * dtm; p.y += p.vy * dtm; p.a += p.va * dtm;
        if (vivant && Math.hypot(p.x - vaisseau.x, p.y - vaisseau.y) < p.r * 0.82 + rayon) {
          if (vaisseau.bouclier > 0 || vaisseau.invincible > 0) {
            if (vaisseau.bouclier > 0) { vaisseau.bouclier = 0; vaisseau.invincible = 0.8; }
            exploser(p.x, p.y, "#5fd4ff", 14);
            return false;
          }
          mort = 0;
          exploser(vaisseau.x, vaisseau.y, "#ff9d5c", 40);
          exploser(vaisseau.x, vaisseau.y, "#fff3c4", 18);
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
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.beginPath();
        p.forme.forEach((k, i) => { const a = (i / p.forme.length) * Math.PI * 2; ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * p.r * k, Math.sin(a) * p.r * k); });
        ctx.closePath();
        ctx.fillStyle = p.teinte; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.stroke();
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath(); ctx.arc(p.r * 0.25, -p.r * 0.2, p.r * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-p.r * 0.3, p.r * 0.28, p.r * 0.14, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.font = "20px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      for (const b of bonus) {
        const pulse = 1 + Math.sin(b.t * 6) * 0.08;
        ctx.beginPath(); ctx.arc(b.x, b.y, 17 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = BONUS[b.type].couleur + "33"; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = BONUS[b.type].couleur; ctx.stroke();
        ctx.fillText(BONUS[b.type].emoji, b.x, b.y + 1);
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
        const effets = [vaisseau.bouclier > 0 ? "🛡️" : "", ralenti > 0 ? "⏳" : "", vaisseau.mini > 0 ? "🔹" : ""].filter(Boolean);
        setHud({ t, score: Math.floor(score), mult: palier(t), effets });
      }
      if (!vivant) {
        mort += dt;
        if (mort > 0.9 && !fini) {
          fini = true;
          onFin(Math.floor(score), `${t.toFixed(1)} s de survie · ${ramasses} bonus ramassé${ramasses > 1 ? "s" : ""} · palier ×${palier(t)}`);
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
          regles={<>Ton vaisseau suit la souris (ou ton doigt, ou les flèches du clavier). Esquive les astéroïdes : <strong className="text-ink">un seul choc et c&apos;est fini</strong>. La pluie s&apos;intensifie, mais le multiplicateur aussi (×4 après une minute). Ramasse les bonus : 🛡️ bouclier, ⏳ ralenti, 🔹 mini-vaisseau, ⭐ +150.</>}
          onJouer={lancer}
        />
      ) : null}
      {phase === "decompte" ? <p className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-ink glow-text">{decompte || "GO"}</p> : null}
      {phase === "jeu" ? (
        <div className="pointer-events-none absolute left-4 right-4 top-3 flex justify-between text-sm font-semibold text-ink tabular-nums">
          <span><Icone nom="chrono" className="w-4 h-4 mr-1" />{hud.t.toFixed(1)} s</span>
          <span>{hud.effets.join(" ")} <span className="rounded-full bg-[#ff9d5c]/20 px-2 py-0.5 text-[#ffc59a]">×{hud.mult}</span></span>
          <span className="text-lilac">{hud.score.toLocaleString("fr-FR")} pts</span>
        </div>
      ) : null}
    </div>
  );
}
