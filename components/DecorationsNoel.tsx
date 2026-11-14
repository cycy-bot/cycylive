"use client";

// ============================================================
// DÉCORATIONS DE NOËL — sur tout le site du 1er au 25 décembre
// ============================================================
// • une guirlande lumineuse sous l'en-tête, avec des étoiles et
//   des sucres d'orge suspendus ;
// • de la neige qui tombe doucement (rien si l'utilisateur
//   préfère réduire les animations) ;
// • un peu de neige posée sur le pied de page.
// Tout s'affiche seul à minuit le 1er décembre (heure de Paris),
// même sur une page restée ouverte. Aperçu : ?apercu-noel

import { useEffect, useRef, useState } from "react";
import { saisonNoel } from "@/lib/noel";

const COULEURS = ["#ffd166", "#ff5d73", "#c084fc", "#7dd3fc", "#fb7185", "#fde68a"];

// Une ampoule de guirlande : un culot et un verre qui brille
function Ampoule({ x, y, c, d }: { x: number; y: number; c: string; d: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${(Math.round(x) % 3) * 8 - 8})`}>
      <rect x={-2.2} y={-1} width={4.4} height={3.6} rx={1} fill="#3f6b4a" />
      <ellipse cx={0} cy={7} rx={3.6} ry={5.4} fill={c} className="noel-ampoule" style={{ animationDelay: `${d}s`, color: c }} />
      <ellipse cx={-1.1} cy={5.4} rx={0.9} ry={1.8} fill="#fff" opacity={0.7} />
    </g>
  );
}

// Les pendants : étoile dorée et sucre d'orge
function Etoile() {
  return (
    <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden>
      <path d="M20 2l5.3 11.2 12.2 1.5-9 8.4 2.4 12.1L20 29.3 9.1 35.2l2.4-12.1-9-8.4 12.2-1.5z" fill="#ffd166" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 8l3 6.5 7 .9" fill="none" stroke="#fff7d6" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}
function SucreOrge() {
  return (
    <svg viewBox="0 0 30 56" width="18" height="34" aria-hidden>
      <defs>
        <pattern id="noel-rayures" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <rect width="8" height="8" fill="#fff" />
          <rect width="4" height="8" fill="#ef4444" />
        </pattern>
      </defs>
      <path d="M8 54V18a7 7 0 0 1 14 0v3" fill="none" stroke="url(#noel-rayures)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

// Les pendants restent sur les bords, loin du contenu (les étoiles seulement sur grand écran)
const PENDANTS: { left: string; type: "etoile" | "sucre"; long: number; cache?: boolean }[] = [
  { left: "1.5%", type: "sucre", long: 6 },
  { left: "5%", type: "etoile", long: 20, cache: true },
  { left: "93%", type: "etoile", long: 14, cache: true },
  { left: "97%", type: "sucre", long: 8 },
];

function Guirlande() {
  // Des festons de 180 px sur toute la largeur, 5 ampoules chacun (qui clignotent l'une après l'autre)
  const W = 180;
  const [largeur, setLargeur] = useState(1440);
  useEffect(() => {
    const maj = () => setLargeur(window.innerWidth);
    maj();
    window.addEventListener("resize", maj);
    return () => window.removeEventListener("resize", maj);
  }, []);
  const n = Math.ceil(largeur / W) + 1;
  const festons = Array.from({ length: n }, (_, k) => k * W);
  return (
    <div className="noel-guirlande" aria-hidden>
      <svg width="100%" height="34" className="block overflow-visible">
        {festons.map((x0) => (
          <g key={x0}>
            <path d={`M${x0} 3 Q ${x0 + W / 2} 27 ${x0 + W} 3`} fill="none" stroke="#2f5d3a" strokeWidth="2.2" />
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((t, i) => (
              <Ampoule key={i} x={x0 + t * W} y={3 + Math.sin(Math.PI * t) * 12} c={COULEURS[(i + x0 / W) % COULEURS.length]} d={((i * 3 + x0 / W) % 7) * 0.35} />
            ))}
          </g>
        ))}
      </svg>
      {PENDANTS.map((p, i) => (
        <span key={i} className={`noel-pendant ${p.cache ? "hidden xl:flex" : "flex"}`} style={{ left: p.left, animationDelay: `${i * 0.6}s` }}>
          <span className="noel-fil" style={{ height: p.long }} />
          {p.type === "etoile" ? <Etoile /> : <SucreOrge />}
        </span>
      ))}
    </div>
  );
}

// La neige : des flocons et quelques paillettes, très légers
function Neige() {
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
    const n = Math.round(Math.min(90, Math.max(30, (w * h) / 22000)));
    const flocons = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: 0.8 + Math.random() * 2.4, v: 0.25 + Math.random() * 0.6, o: 0.35 + Math.random() * 0.5, p: Math.random() * 6.28, brille: Math.random() < 0.12 }));
    const dessiner = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flocons) {
        f.y += f.v; f.p += 0.012; f.x += Math.sin(f.p) * 0.35;
        if (f.y > h + 6) { f.y = -6; f.x = Math.random() * w; }
        ctx.globalAlpha = f.o;
        if (f.brille) {
          ctx.fillStyle = "#fde68a";
          const s = f.r * 2.2;
          ctx.beginPath(); ctx.moveTo(f.x, f.y - s); ctx.lineTo(f.x + s * 0.28, f.y); ctx.lineTo(f.x, f.y + s); ctx.lineTo(f.x - s * 0.28, f.y); ctx.closePath(); ctx.fill();
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
        }
      }
      raf = requestAnimationFrame(dessiner);
    };
    // en pause quand l'onglet est caché
    const visible = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(dessiner); };
    raf = requestAnimationFrame(dessiner);
    window.addEventListener("resize", taille);
    document.addEventListener("visibilitychange", visible);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", taille); document.removeEventListener("visibilitychange", visible); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[45] h-full w-full" aria-hidden />;
}

export default function DecorationsNoel() {
  const [actif, setActif] = useState(false);
  useEffect(() => {
    let apercu = false;
    try {
      if (new URLSearchParams(location.search).has("apercu-noel")) sessionStorage.setItem("apercu-noel", "1");
      apercu = sessionStorage.getItem("apercu-noel") === "1";
    } catch { /* stockage indisponible */ }
    const verifier = () => setActif(apercu || saisonNoel());
    verifier();
    const t = setInterval(verifier, 60000); // minuit pile, même sur une page restée ouverte
    return () => clearInterval(t);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle("noel", actif); }, [actif]);
  if (!actif) return null;
  return (
    <>
      <Neige />
      <Guirlande />
      <style>{`
        .noel-guirlande{position:fixed;left:0;right:0;top:80px;z-index:49;height:34px;pointer-events:none}
        .noel-ampoule{filter:drop-shadow(0 0 4px currentColor);animation:noel-clignote 2.4s ease-in-out infinite}
        @keyframes noel-clignote{0%,100%{opacity:1}50%{opacity:.45}}
        .noel-pendant{position:absolute;top:6px;flex-direction:column;align-items:center;transform-origin:top center;animation:noel-balance 4s ease-in-out infinite}
        .noel-fil{width:1.5px;background:linear-gradient(#2f5d3a,#d4b06a)}
        @keyframes noel-balance{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        html.noel footer{position:relative}
        html.noel footer::before{content:"";position:absolute;left:0;right:0;top:-9px;height:14px;pointer-events:none;
          background:radial-gradient(15px 9px at 13px 14px,#fff 98%,transparent) 0 0/26px 14px repeat-x;opacity:.9;filter:drop-shadow(0 -2px 6px #ffffff66)}
        @media (prefers-reduced-motion:reduce){.noel-ampoule,.noel-pendant{animation:none}}
      `}</style>
    </>
  );
}
