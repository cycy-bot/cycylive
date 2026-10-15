"use client";

// 🎯 Réflexes Valorant : 30 secondes pour toucher un maximum de cibles avant qu'elles
// ne rétrécissent. Plus tu es rapide, plus la cible rapporte (100 + jusqu'à 50 de bonus).
// Un tir dans le vide coûte 25 points.
import { useEffect, useRef, useState } from "react";
import { EcranDepart, type PropsJeu } from "./FinDePartie";

const DUREE = 30;
type Cible = { id: number; x: number; y: number; ne: number; vie: number };

export default function Reflexes({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "decompte" | "jeu">("depart");
  const [decompte, setDecompte] = useState(3);
  const [, rafraichir] = useState(0);
  const zone = useRef<HTMLDivElement | null>(null);
  const etat = useRef({ debut: 0, cibles: [] as Cible[], prochain: 0, id: 0, score: 0, touches: 0, tirs: 0, ratees: 0, reactions: [] as number[], fini: false, flash: [] as { x: number; y: number; t: number; texte: string; bon: boolean }[] });

  function lancer() {
    setPhase("decompte");
    setDecompte(3);
    let n = 3;
    const t = setInterval(() => {
      n -= 1;
      setDecompte(n);
      if (n === 0) {
        clearInterval(t);
        etat.current = { ...etat.current, debut: performance.now(), cibles: [], prochain: 0, score: 0, touches: 0, tirs: 0, ratees: 0, reactions: [], fini: false, flash: [] };
        setPhase("jeu");
        onDebut();
      }
    }, 650);
  }

  useEffect(() => {
    if (phase !== "jeu") return;
    let raf = 0;
    const boucle = () => {
      const e = etat.current;
      const maintenant = performance.now();
      const t = (maintenant - e.debut) / 1000;
      if (t >= DUREE) {
        if (!e.fini) {
          e.fini = true;
          const precision = e.tirs ? Math.round((e.touches / e.tirs) * 100) : 0;
          const reaction = e.reactions.length ? Math.round(e.reactions.reduce((a, b) => a + b, 0) / e.reactions.length) : 0;
          onFin(Math.max(0, e.score), `${e.touches} cible${e.touches > 1 ? "s" : ""} touchée${e.touches > 1 ? "s" : ""} · ${precision} % de précision${reaction ? ` · réaction moyenne ${reaction} ms` : ""}`);
        }
        return;
      }
      // Les cibles vivent de moins en moins longtemps, et il y en a jusqu'à 3 à la fois
      const vie = 1500 - Math.min(650, t * 22);
      const max = t < 8 ? 1 : t < 18 ? 2 : 3;
      e.cibles = e.cibles.filter((c) => {
        if (maintenant - c.ne > c.vie) {
          e.ratees += 1;
          return false;
        }
        return true;
      });
      if (e.cibles.length < max && maintenant >= e.prochain) {
        e.cibles.push({ id: ++e.id, x: 8 + Math.random() * 84, y: 12 + Math.random() * 76, ne: maintenant, vie });
        e.prochain = maintenant + 260 + Math.random() * 220;
      }
      e.flash = e.flash.filter((f) => maintenant - f.t < 500);
      rafraichir((n) => n + 1);
      raf = requestAnimationFrame(boucle);
    };
    raf = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(raf);
  }, [phase, onFin]);

  function tir(ev: React.PointerEvent) {
    if (phase !== "jeu" || !zone.current) return;
    const e = etat.current;
    if (e.fini) return;
    const r = zone.current.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * 100;
    const y = ((ev.clientY - r.top) / r.height) * 100;
    const maintenant = performance.now();
    e.tirs += 1;
    // Cible touchée ? (rayon en px converti selon la taille de la zone)
    const touchee = e.cibles.find((c) => {
      const taille = 30 * Math.max(0.35, 1 - (maintenant - c.ne) / c.vie);
      const dx = ((x - c.x) / 100) * r.width;
      const dy = ((y - c.y) / 100) * r.height;
      return Math.hypot(dx, dy) <= taille + 6;
    });
    if (touchee) {
      const reste = Math.max(0, 1 - (maintenant - touchee.ne) / touchee.vie);
      const points = 100 + Math.round(50 * reste);
      e.score += points;
      e.touches += 1;
      e.reactions.push(Math.round(maintenant - touchee.ne));
      e.cibles = e.cibles.filter((c) => c.id !== touchee.id);
      e.flash.push({ x: touchee.x, y: touchee.y, t: maintenant, texte: `+${points}`, bon: true });
    } else {
      e.score -= 25;
      e.flash.push({ x, y, t: maintenant, texte: "-25", bon: false });
    }
  }

  const e = etat.current;
  const maintenant = typeof performance !== "undefined" ? performance.now() : 0;
  const reste = phase === "jeu" ? Math.max(0, DUREE - (maintenant - e.debut) / 1000) : DUREE;

  return (
    <div
      ref={zone}
      onPointerDown={tir}
      className="relative h-[440px] md:h-[500px] select-none overflow-hidden rounded-2xl border border-violet/20 touch-none"
      style={{ cursor: phase === "jeu" ? "crosshair" : "default", background: "radial-gradient(ellipse at 50% 120%, #2a1238 0%, #120b22 55%, #0b0817 100%)" }}
    >
      {/* sol façon stand de tir */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 opacity-30" style={{ background: "repeating-linear-gradient(90deg, transparent 0 58px, #ff465533 58px 60px)", maskImage: "linear-gradient(transparent, black)" }} />
      {phase === "depart" ? (
        <EcranDepart
          emoji="🎯"
          titre="Réflexes Valorant"
          regles={<>30 secondes pour toucher un maximum de cibles. Plus tu tires vite, plus ça rapporte ; les cibles rétrécissent et arrivent de plus en plus vite. <strong className="text-ink">Un tir dans le vide coûte 25 points</strong>, vise juste !</>}
          onJouer={lancer}
        />
      ) : null}
      {phase === "decompte" ? <p className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-ink glow-text">{decompte || "GO"}</p> : null}
      {phase === "jeu" ? (
        <>
          <div className="pointer-events-none absolute left-4 right-4 top-3 flex justify-between text-sm font-semibold text-ink tabular-nums">
            <span>⏱️ {reste.toFixed(1)} s</span>
            <span>🎯 {e.touches} · {e.tirs ? Math.round((e.touches / e.tirs) * 100) : 100} %</span>
            <span className="text-lilac">{Math.max(0, e.score).toLocaleString("fr-FR")} pts</span>
          </div>
          <div className="pointer-events-none absolute left-0 top-0 h-1 bg-[#ff4655]" style={{ width: `${(reste / DUREE) * 100}%` }} />
          {e.cibles.map((c) => {
            const k = Math.max(0.35, 1 - (maintenant - c.ne) / c.vie);
            const taille = 60 * k;
            return (
              <div
                key={c.id}
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  width: taille,
                  height: taille,
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(circle, #fff 0 14%, #ff4655 15% 38%, #ffd1d6 39% 46%, #ff4655 47% 70%, transparent 71%)",
                  boxShadow: "0 0 18px #ff465599",
                }}
              />
            );
          })}
          {e.flash.map((f) => (
            <span
              key={f.t}
              className={`pointer-events-none absolute text-sm font-bold ${f.bon ? "text-emerald-300" : "text-red-300"}`}
              style={{ left: `${f.x}%`, top: `${f.y}%`, transform: `translate(-50%, ${-100 - (maintenant - f.t) / 12}%)`, opacity: 1 - (maintenant - f.t) / 500 }}
            >
              {f.texte}
            </span>
          ))}
        </>
      ) : null}
    </div>
  );
}
