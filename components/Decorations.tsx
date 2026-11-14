"use client";

// ============================================================
// DÉCORATIONS DE SAISON — sur tout le site
// ============================================================
// Le décor suit le calendrier des saisons de CycyBot (lib/saison.ts) :
// Noël, Halloween, Nouvel An, Pâques, Saint-Valentin, Nuit des
// étoiles, Automne, Anniversaire… ou un décor choisi dans l'admin.
// Chaque décor : des particules légères (neige, chauves-souris,
// confettis, pétales, cœurs, étoiles filantes, feuilles), une
// guirlande lumineuse sous l'en-tête avec ses pendants sur les bords,
// et parfois une touche en plus (toiles d'araignée, neige au sol).
// Rien ne bouge si l'utilisateur préfère réduire les animations.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSaison } from "@/lib/saison";

type Particule = "neige" | "chauvesSouris" | "confettis" | "petales" | "coeurs" | "filantes" | "feuilles";
type Pendant = "etoile" | "sucre" | "citrouille" | "araignee" | "oeuf" | "fleur" | "coeur" | "ballon" | "etoileOr";
type Decor = { particules: Particule; nombre: number; couleurs: string[]; guirlande?: { fil: string; ampoules: string[] }; pendants: Pendant[]; toiles?: boolean; neigeSol?: boolean };

export const DECORS: Record<string, Decor> = {
  noel: { particules: "neige", nombre: 1, couleurs: ["#ffffff"], guirlande: { fil: "#2f5d3a", ampoules: ["#ffd166", "#ff5d73", "#c084fc", "#7dd3fc", "#fb7185", "#fde68a"] }, pendants: ["sucre", "etoile", "etoile", "sucre"], neigeSol: true },
  halloween: { particules: "chauvesSouris", nombre: 0.35, couleurs: ["#14081f"], guirlande: { fil: "#241433", ampoules: ["#fb923c", "#a855f7", "#fb923c", "#84cc16", "#f97316"] }, pendants: ["araignee", "citrouille", "citrouille", "araignee"], toiles: true },
  nouvelAn: { particules: "confettis", nombre: 0.8, couleurs: ["#fde68a", "#f5c26b", "#e5e7eb", "#c084fc", "#fbbf24"], guirlande: { fil: "#8a6a2a", ampoules: ["#fde68a", "#ffffff", "#fbbf24", "#e5e7eb"] }, pendants: ["etoileOr", "etoileOr", "etoileOr", "etoileOr"] },
  paques: { particules: "petales", nombre: 0.7, couleurs: ["#fbcfe8", "#ddd6fe", "#bbf7d0", "#fef08a", "#bae6fd"], guirlande: { fil: "#6b9a5b", ampoules: ["#fbcfe8", "#bbf7d0", "#fef08a", "#bae6fd", "#ddd6fe"] }, pendants: ["oeuf", "fleur", "fleur", "oeuf"] },
  valentin: { particules: "coeurs", nombre: 0.5, couleurs: ["#f472b6", "#fb7185", "#e879f9", "#fda4af"], guirlande: { fil: "#9d4b73", ampoules: ["#f472b6", "#fda4af", "#e879f9", "#fb7185"] }, pendants: ["coeur", "coeur", "coeur", "coeur"] },
  etoiles: { particules: "filantes", nombre: 1, couleurs: ["#fde68a", "#ffffff", "#c4b5fd"], pendants: [] },
  automne: { particules: "feuilles", nombre: 0.55, couleurs: ["#f59e0b", "#ea580c", "#b45309", "#facc15", "#dc2626"], pendants: [] },
  anniversaire: { particules: "confettis", nombre: 0.8, couleurs: ["#f472b6", "#60a5fa", "#fde047", "#a78bfa", "#34d399", "#fb923c"], guirlande: { fil: "#7c3aed", ampoules: ["#f472b6", "#60a5fa", "#fde047", "#a78bfa", "#34d399"] }, pendants: ["ballon", "ballon", "ballon", "ballon"] },
};

// ── Les pendants (petits dessins au bout d'un fil) ──
const PENDANT: Record<Pendant, ReactNode> = {
  etoile: (
    <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden>
      <path d="M20 2l5.3 11.2 12.2 1.5-9 8.4 2.4 12.1L20 29.3 9.1 35.2l2.4-12.1-9-8.4 12.2-1.5z" fill="#ffd166" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 8l3 6.5 7 .9" fill="none" stroke="#fff7d6" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
    </svg>
  ),
  etoileOr: (
    <svg viewBox="0 0 40 40" width="24" height="24" aria-hidden>
      <path d="M20 1 C21 14 26 19 39 20 C26 21 21 26 20 39 C19 26 14 21 1 20 C14 19 19 14 20 1Z" fill="#fde68a" stroke="#d4a017" strokeWidth="1.2" />
      <circle cx="20" cy="20" r="3" fill="#fff" />
    </svg>
  ),
  sucre: (
    <svg viewBox="0 0 30 56" width="18" height="34" aria-hidden>
      <path d="M8 54V18a7 7 0 0 1 14 0v3" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
      <path d="M8 54V18a7 7 0 0 1 14 0v3" fill="none" stroke="#ef4444" strokeWidth="7" strokeDasharray="4 5" />
    </svg>
  ),
  citrouille: (
    <svg viewBox="0 0 40 40" width="28" height="28" aria-hidden>
      <path d="M19 9 q0 -5 4 -7" stroke="#3f6b2a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M20 10 C9 9 3 16 3 24 C3 33 11 38 20 38 C29 38 37 33 37 24 C37 16 31 9 20 10Z" fill="#fb923c" stroke="#9a3412" strokeWidth="1.5" />
      <path d="M20 10 C15 15 15 33 20 38 M20 10 C25 15 25 33 20 38" stroke="#c2410c" strokeWidth="1.3" fill="none" />
      <path d="M12 21 l4 3 -4 1z M28 21 l-4 3 4 1z M13 30 q7 5 14 0 l-3 1 -2 -1 -2 1 -2 -1 -2 1z" fill="#3b0d00" />
      <path d="M12 21 l4 3 -4 1z M28 21 l-4 3 4 1z" fill="#fde047" opacity=".55" />
    </svg>
  ),
  araignee: (
    <svg viewBox="0 0 40 40" width="24" height="24" aria-hidden>
      <g stroke="#14081f" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M14 18 L4 12 M14 21 L3 21 M14 24 L4 30 M15 26 L8 36 M26 18 L36 12 M26 21 L37 21 M26 24 L36 30 M25 26 L32 36" />
      </g>
      <ellipse cx="20" cy="22" rx="7" ry="8" fill="#14081f" />
      <circle cx="20" cy="13" r="4.5" fill="#14081f" />
      <circle cx="18.3" cy="12.5" r="1.1" fill="#f0abfc" /><circle cx="21.7" cy="12.5" r="1.1" fill="#f0abfc" />
    </svg>
  ),
  oeuf: (
    <svg viewBox="0 0 40 48" width="22" height="27" aria-hidden>
      <path d="M20 2 C31 2 38 20 38 30 C38 40 30 46 20 46 C10 46 2 40 2 30 C2 20 9 2 20 2Z" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.4" />
      <path d="M3 26 l6 -4 5 5 6 -5 6 5 5 -5 6 4" stroke="#8b5cf6" strokeWidth="2.4" fill="none" strokeLinejoin="round" />
      <circle cx="13" cy="36" r="2.2" fill="#34d399" /><circle cx="27" cy="37" r="2.2" fill="#60a5fa" /><circle cx="20" cy="14" r="2" fill="#fde047" />
    </svg>
  ),
  fleur: (
    <svg viewBox="0 0 40 40" width="24" height="24" aria-hidden>
      {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="20" cy="10" rx="6" ry="9" fill="#fbcfe8" stroke="#ec4899" strokeWidth="1" transform={`rotate(${a} 20 20)`} />)}
      <circle cx="20" cy="20" r="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
    </svg>
  ),
  coeur: (
    <svg viewBox="0 0 40 40" width="24" height="24" aria-hidden>
      <path d="M20 36 C6 27 2 19 5 12 C8 5 17 5 20 12 C23 5 32 5 35 12 C38 19 34 27 20 36Z" fill="#f472b6" stroke="#be185d" strokeWidth="1.5" />
      <path d="M10 13 q2 -4 6 -4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".8" />
    </svg>
  ),
  ballon: (
    <svg viewBox="0 0 40 52" width="22" height="29" aria-hidden>
      <ellipse cx="20" cy="18" rx="15" ry="17" fill="#f472b6" stroke="#be185d" strokeWidth="1.4" />
      <path d="M17 34 l3 4 3 -4z" fill="#be185d" />
      <path d="M11 11 q3 -5 8 -5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".7" />
    </svg>
  ),
};

// Les pendants restent sur les bords, loin du contenu (ceux du milieu seulement sur grand écran)
const PLACES = [{ left: "1.5%", long: 6 }, { left: "5%", long: 20, cache: true }, { left: "93%", long: 14, cache: true }, { left: "97%", long: 8 }];

function Ampoule({ x, y, c, d, culot }: { x: number; y: number; c: string; d: number; culot: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${(Math.round(x) % 3) * 8 - 8})`}>
      <rect x={-2.2} y={-1} width={4.4} height={3.6} rx={1} fill={culot} />
      <ellipse cx={0} cy={7} rx={3.6} ry={5.4} fill={c} className="deco-ampoule" style={{ animationDelay: `${d}s`, color: c }} />
      <ellipse cx={-1.1} cy={5.4} rx={0.9} ry={1.8} fill="#fff" opacity={0.7} />
    </g>
  );
}

function Guirlande({ d }: { d: Decor }) {
  const W = 180;
  const [largeur, setLargeur] = useState(1440);
  useEffect(() => {
    const maj = () => setLargeur(window.innerWidth);
    maj();
    window.addEventListener("resize", maj);
    return () => window.removeEventListener("resize", maj);
  }, []);
  if (!d.guirlande) return null;
  const g = d.guirlande;
  const festons = Array.from({ length: Math.ceil(largeur / W) + 1 }, (_, k) => k * W);
  return (
    <div className="deco-guirlande" aria-hidden>
      <svg width="100%" height="34" className="block overflow-visible">
        {festons.map((x0) => (
          <g key={x0}>
            <path d={`M${x0} 3 Q ${x0 + W / 2} 27 ${x0 + W} 3`} fill="none" stroke={g.fil} strokeWidth="2.2" />
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((t, i) => (
              <Ampoule key={i} x={x0 + t * W} y={3 + Math.sin(Math.PI * t) * 12} c={g.ampoules[(i + x0 / W) % g.ampoules.length]} d={((i * 3 + x0 / W) % 7) * 0.35} culot={g.fil} />
            ))}
          </g>
        ))}
      </svg>
      {d.pendants.map((p, i) => (
        <span key={i} className={`deco-pendant ${PLACES[i]?.cache ? "hidden xl:flex" : "flex"}`} style={{ left: PLACES[i]?.left, animationDelay: `${i * 0.6}s`, filter: p === "ballon" ? `hue-rotate(${i * 70}deg)` : undefined }}>
          <span className="deco-fil" style={{ height: (PLACES[i]?.long || 10) + (p === "araignee" ? 26 : 0), background: p === "araignee" ? "#d8ccf0aa" : undefined }} />
          {PENDANT[p]}
        </span>
      ))}
    </div>
  );
}

// Toiles d'araignée dans les coins, sous l'en-tête
function Toile({ droite }: { droite?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" className="deco-toile" style={droite ? { right: 0, transform: "scaleX(-1)" } : { left: 0 }} aria-hidden>
      <g fill="none" stroke="#e9d5ff" strokeOpacity=".28" strokeWidth="1">
        {[0, 15, 30, 45, 60, 75, 90].map((a) => { const r = (a * Math.PI) / 180; return <path key={a} d={`M0 0 L${Math.cos(r) * 118} ${Math.sin(r) * 118}`} />; })}
        {[22, 42, 64, 88, 112].map((k) => <path key={k} d={`M${k} 0 Q${k * 0.62} ${k * 0.18} ${k * 0.71} ${k * 0.71} Q${k * 0.18} ${k * 0.62} 0 ${k}`} />)}
      </g>
    </svg>
  );
}

// ── Les particules (un canvas léger, en pause quand l'onglet est caché) ──
function Particules({ d }: { d: Decor }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const taille = () => { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    taille();
    const type = d.particules, monte = type === "coeurs";
    const n = Math.round(Math.min(90, Math.max(12, (w * h) / 22000)) * d.nombre);
    const alea = (a: number, b: number) => a + Math.random() * (b - a);
    const nouvelle = (debut = false) => ({
      x: type === "chauvesSouris" ? (Math.random() < 0.5 ? -40 : w + 40) : Math.random() * w,
      y: debut ? Math.random() * h : monte ? h + 10 : type === "chauvesSouris" ? alea(h * 0.08, h * 0.7) : -12,
      r: type === "neige" ? alea(0.8, 3.2) : type === "chauvesSouris" ? alea(9, 16) : type === "filantes" ? alea(0.6, 1.8) : alea(4, 8),
      v: type === "neige" ? alea(0.25, 0.85) : type === "chauvesSouris" ? alea(0.9, 1.8) : type === "coeurs" ? alea(0.3, 0.7) : type === "filantes" ? 0 : alea(0.5, 1.2),
      p: Math.random() * 6.28, rot: Math.random() * 6.28, vr: alea(-0.04, 0.04),
      o: alea(0.35, 0.85), c: d.couleurs[Math.floor(Math.random() * d.couleurs.length)], brille: Math.random() < 0.12,
      sens: 1, vie: 0,
    });
    const liste = Array.from({ length: n }, () => nouvelle(true));
    for (const f of liste) if (type === "chauvesSouris") f.sens = f.x < 0 ? 1 : -1;
    // étoiles filantes : rares, en diagonale
    const filantes: { x: number; y: number; t: number; l: number }[] = [];

    const dessiner = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of liste) {
        f.p += 0.012; f.rot += f.vr;
        ctx.globalAlpha = f.o;
        if (type === "neige") {
          f.y += f.v; f.x += Math.sin(f.p) * 0.35;
          if (f.y > h + 6) Object.assign(f, nouvelle(), { y: -6 });
          if (f.brille) { ctx.fillStyle = "#fde68a"; const s = f.r * 2.2; ctx.beginPath(); ctx.moveTo(f.x, f.y - s); ctx.lineTo(f.x + s * 0.28, f.y); ctx.lineTo(f.x, f.y + s); ctx.lineTo(f.x - s * 0.28, f.y); ctx.closePath(); ctx.fill(); }
          else { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill(); }
        } else if (type === "chauvesSouris") {
          f.x += f.v * f.sens; f.y += Math.sin(f.p * 3) * 0.6;
          if (f.x < -60 || f.x > w + 60) { Object.assign(f, nouvelle()); f.sens = f.x < 0 ? 1 : -1; }
          const b = Math.sin(f.p * 22) * 0.6, s = f.r;
          ctx.save(); ctx.translate(f.x, f.y); ctx.scale(f.sens, 1); ctx.fillStyle = f.c; ctx.globalAlpha = 0.75;
          ctx.beginPath(); ctx.ellipse(0, 0, s * 0.18, s * 0.28, 0, 0, 6.283); ctx.fill();
          for (const k of [1, -1]) {
            ctx.beginPath(); ctx.moveTo(0, -s * 0.05);
            ctx.quadraticCurveTo(k * s * 0.5, -s * (0.6 + b), k * s, -s * (0.2 + b * 0.6));
            ctx.quadraticCurveTo(k * s * 0.75, s * 0.05, k * s * 0.55, s * 0.12);
            ctx.quadraticCurveTo(k * s * 0.35, 0, 0, s * 0.2); ctx.fill();
          }
          ctx.restore();
        } else if (type === "confettis") {
          f.y += f.v; f.x += Math.sin(f.p) * 0.5;
          if (f.y > h + 10) Object.assign(f, nouvelle());
          ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillStyle = f.c;
          ctx.fillRect(-f.r / 2, -f.r / 4, f.r, f.r / 2 * Math.abs(Math.cos(f.p * 4)) + 1); ctx.restore();
        } else if (type === "petales" || type === "feuilles") {
          f.y += f.v * 0.8; f.x += Math.sin(f.p) * 0.9;
          if (f.y > h + 10) Object.assign(f, nouvelle());
          ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillStyle = f.c;
          ctx.beginPath();
          if (type === "petales") ctx.ellipse(0, 0, f.r, f.r * 0.55 * Math.abs(Math.cos(f.p * 2)) + 1, 0, 0, 6.283);
          else { const s = f.r * 1.3; ctx.moveTo(0, -s); ctx.quadraticCurveTo(s, -s * 0.2, 0, s); ctx.quadraticCurveTo(-s, -s * 0.2, 0, -s); }
          ctx.fill(); ctx.restore();
        } else if (type === "coeurs") {
          f.y -= f.v; f.x += Math.sin(f.p) * 0.4;
          if (f.y < -12) Object.assign(f, nouvelle());
          const s = f.r; ctx.fillStyle = f.c; ctx.globalAlpha = f.o * 0.8;
          ctx.beginPath(); ctx.moveTo(f.x, f.y + s * 0.9);
          ctx.bezierCurveTo(f.x - s * 1.4, f.y - s * 0.1, f.x - s * 0.6, f.y - s * 1.2, f.x, f.y - s * 0.35);
          ctx.bezierCurveTo(f.x + s * 0.6, f.y - s * 1.2, f.x + s * 1.4, f.y - s * 0.1, f.x, f.y + s * 0.9); ctx.fill();
        } else if (type === "filantes") {
          // lucioles qui scintillent doucement
          f.x += Math.sin(f.p) * 0.25; f.y += Math.cos(f.p * 0.8) * 0.2;
          ctx.globalAlpha = f.o * (0.5 + 0.5 * Math.sin(f.p * 5)); ctx.fillStyle = f.c;
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
        }
      }
      if (type === "filantes") {
        if (Math.random() < 0.006 && filantes.length < 2) filantes.push({ x: alea(w * 0.3, w), y: alea(0, h * 0.4), t: 0, l: alea(80, 160) });
        for (let i = filantes.length - 1; i >= 0; i--) {
          const s = filantes[i]; s.t += 1;
          const k = s.t * 9, x = s.x - k, y = s.y + k * 0.45;
          const gr = ctx.createLinearGradient(x, y, x + s.l, y - s.l * 0.45);
          gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
          ctx.globalAlpha = Math.max(0, 1 - s.t / 45); ctx.strokeStyle = gr; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s.l, y - s.l * 0.45); ctx.stroke();
          if (s.t > 45) filantes.splice(i, 1);
        }
      }
      raf = requestAnimationFrame(dessiner);
    };
    const visible = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(dessiner); };
    raf = requestAnimationFrame(dessiner);
    window.addEventListener("resize", taille);
    document.addEventListener("visibilitychange", visible);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", taille); document.removeEventListener("visibilitychange", visible); };
  }, [d]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[45] h-full w-full" aria-hidden />;
}

export default function Decorations() {
  const saison = useSaison();
  const cle = saison?.decor || "aucune";
  const d = DECORS[cle];
  useEffect(() => {
    const html = document.documentElement;
    for (const k of Object.keys(DECORS)) html.classList.toggle("deco-" + k, k === cle);
  }, [cle]);
  if (!d) return null;
  return (
    <>
      <Particules key={cle} d={d} />
      <Guirlande d={d} />
      {d.toiles ? <div className="pointer-events-none fixed left-0 right-0 top-20 z-[44] hidden md:block" aria-hidden><Toile /><Toile droite /></div> : null}
      <style>{`
        .deco-guirlande{position:fixed;left:0;right:0;top:80px;z-index:49;height:34px;pointer-events:none}
        .deco-ampoule{filter:drop-shadow(0 0 4px currentColor);animation:deco-clignote 2.4s ease-in-out infinite}
        @keyframes deco-clignote{0%,100%{opacity:1}50%{opacity:.45}}
        .deco-pendant{position:absolute;top:6px;flex-direction:column;align-items:center;transform-origin:top center;animation:deco-balance 4s ease-in-out infinite}
        .deco-fil{width:1.5px;background:linear-gradient(#5b4a7a,#d4b06a)}
        @keyframes deco-balance{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        .deco-toile{position:absolute;top:0}
        ${d.neigeSol ? `html footer{position:relative}
        html footer::before{content:"";position:absolute;left:0;right:0;top:-9px;height:14px;pointer-events:none;
          background:radial-gradient(15px 9px at 13px 14px,#fff 98%,transparent) 0 0/26px 14px repeat-x;opacity:.9;filter:drop-shadow(0 -2px 6px #ffffff66)}` : ""}
        @media (prefers-reduced-motion:reduce){.deco-ampoule,.deco-pendant{animation:none}}
      `}</style>
    </>
  );
}
