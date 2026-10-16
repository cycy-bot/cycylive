"use client";

// Rythme cosmique : des notes tombent sur 4 couloirs, tape-les pile sur la ligne
// (touches D F J K, ou directement sur l'écran). La musique est jouée par le
// navigateur (Web Audio), aucune piste à télécharger. 60 secondes.
// Parfait = 100, bien = 50, multiplié par le combo (×2 dès 10, ×3 dès 20, ×4 dès 30).
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import { EcranDepart, type PropsJeu } from "./FinDePartie";

const BPM = 120;
const TEMPS = 60 / BPM; // une noire = 0,5 s
const DUREE = 60;
const APPROCHE = 1.5; // secondes entre l'apparition d'une note et la ligne
const PARFAIT = 0.06, BIEN = 0.14;
const TOUCHES = ["d", "f", "j", "k"];
const COULEURS = ["#ff4655", "#c084fc", "#60a5fa", "#34d399"];
// Gamme pentatonique (la mineur) pour la mélodie des notes
const HAUTEURS = [440, 523.25, 587.33, 659.25, 783.99, 880];
const ACCORDS = [110, 87.31, 130.81, 98]; // la, fa, do, sol (basse)

type Note = { t: number; couloir: number; hauteur: number; etat: 0 | 1 | 2 | 3 }; // 0 à jouer, 1 parfait, 2 bien, 3 raté

function partition(): Note[] {
  const notes: Note[] = [];
  let dernier = -1;
  const total = Math.floor(DUREE / TEMPS) - 4;
  for (let b = 4; b < total; b++) {
    const part = b / total; // 0 → 1 : de plus en plus dense
    const croches = part < 0.25 ? [0] : part < 0.5 ? [0, 0.5] : [0, 0.5];
    for (const d of croches) {
      const p = d === 0 ? (part < 0.25 ? 0.7 : 0.85) : part < 0.5 ? 0.3 : part < 0.75 ? 0.55 : 0.72;
      if (Math.random() > p) continue;
      let c = Math.floor(Math.random() * 4);
      if (c === dernier && Math.random() < 0.6) c = (c + 1 + Math.floor(Math.random() * 3)) % 4;
      dernier = c;
      notes.push({ t: (b + d) * TEMPS, couloir: c, hauteur: HAUTEURS[(c + Math.floor(Math.random() * 3)) % HAUTEURS.length], etat: 0 });
    }
  }
  return notes;
}

/** Programme toute la musique d'un coup (batterie, basse, mélodie des notes). */
function programmerMusique(ctx: AudioContext, t0: number, notes: Note[], volume: GainNode) {
  const bruit = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = bruit.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const nbTemps = Math.floor(DUREE / TEMPS);
  for (let b = 0; b < nbTemps; b++) {
    const t = t0 + b * TEMPS;
    // grosse caisse
    const k = ctx.createOscillator(), kg = ctx.createGain();
    k.frequency.setValueAtTime(140, t);
    k.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    kg.gain.setValueAtTime(0.55, t);
    kg.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    k.connect(kg).connect(volume);
    k.start(t);
    k.stop(t + 0.2);
    // charleston sur les croches
    for (const d of [0.25, 0.75]) {
      const h = ctx.createBufferSource(), hf = ctx.createBiquadFilter(), hg = ctx.createGain();
      h.buffer = bruit;
      hf.type = "highpass";
      hf.frequency.value = 7000;
      const th = t + d * TEMPS;
      hg.gain.setValueAtTime(0.1, th);
      hg.gain.exponentialRampToValueAtTime(0.001, th + 0.045);
      h.connect(hf).connect(hg).connect(volume);
      h.start(th);
    }
    // basse (un accord par mesure de 4 temps)
    if (b % 2 === 0) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.value = ACCORDS[Math.floor(b / 4) % 4];
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + TEMPS * 1.8);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 600;
      o.connect(f).connect(g).connect(volume);
      o.start(t);
      o.stop(t + TEMPS * 2);
    }
  }
  // la mélodie suit les notes à taper
  for (const n of notes) {
    const t = t0 + n.t;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = n.hauteur;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.13, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.connect(g).connect(volume);
    o.start(t);
    o.stop(t + 0.3);
  }
}

export default function Rythme({ onDebut, onFin }: PropsJeu) {
  const [phase, setPhase] = useState<"depart" | "jeu">("depart");
  const [son, setSon] = useState(true);
  const toile = useRef<HTMLCanvasElement | null>(null);
  const audio = useRef<{ ctx: AudioContext | null; t0: number; volume: GainNode | null; debutPerf: number }>({ ctx: null, t0: 0, volume: null, debutPerf: 0 });
  const jeu = useRef({ notes: [] as Note[], score: 0, combo: 0, comboMax: 0, parfaits: 0, biens: 0, rates: 0, fini: false, retour: [] as { couloir: number; texte: string; t: number }[], appuis: [0, 0, 0, 0] });

  const maintenant = () => {
    const a = audio.current;
    return a.ctx ? a.ctx.currentTime - a.t0 : (performance.now() - a.debutPerf) / 1000;
  };

  function lancer() {
    const notes = partition();
    jeu.current = { notes, score: 0, combo: 0, comboMax: 0, parfaits: 0, biens: 0, rates: 0, fini: false, retour: [], appuis: [0, 0, 0, 0] };
    const lead = 2;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const volume = ctx.createGain();
      volume.gain.value = son ? 0.8 : 0;
      volume.connect(ctx.destination);
      const t0 = ctx.currentTime + lead;
      programmerMusique(ctx, t0, notes, volume);
      audio.current = { ctx, t0, volume, debutPerf: 0 };
    } catch {
      audio.current = { ctx: null, t0: 0, volume: null, debutPerf: performance.now() + lead * 1000 };
    }
    setPhase("jeu");
    onDebut();
  }

  useEffect(() => {
    const a = audio.current;
    if (a.volume) a.volume.gain.value = son ? 0.8 : 0;
  }, [son]);

  useEffect(() => () => { audio.current.ctx?.close().catch(() => {}); }, []);

  function taper(couloir: number) {
    const j = jeu.current;
    if (phase !== "jeu" || j.fini) return;
    const t = maintenant();
    j.appuis[couloir] = performance.now();
    let meilleure: Note | null = null;
    for (const n of j.notes) {
      if (n.etat || n.couloir !== couloir) continue;
      if (Math.abs(n.t - t) <= BIEN && (!meilleure || Math.abs(n.t - t) < Math.abs(meilleure.t - t))) meilleure = n;
      if (n.t - t > BIEN) break;
    }
    if (!meilleure) return;
    const ecart = Math.abs(meilleure.t - t);
    const mult = 1 + Math.min(3, Math.floor(j.combo / 10));
    if (ecart <= PARFAIT) {
      meilleure.etat = 1;
      j.parfaits += 1;
      j.score += 100 * mult;
      j.retour.push({ couloir, texte: "PARFAIT", t: performance.now() });
    } else {
      meilleure.etat = 2;
      j.biens += 1;
      j.score += 50 * mult;
      j.retour.push({ couloir, texte: "BIEN", t: performance.now() });
    }
    j.combo += 1;
    j.comboMax = Math.max(j.comboMax, j.combo);
  }

  useEffect(() => {
    if (phase !== "jeu") return;
    const clavier = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const i = TOUCHES.indexOf(e.key.toLowerCase());
      if (i >= 0) {
        e.preventDefault();
        taper(i);
      }
    };
    window.addEventListener("keydown", clavier);
    let raf = 0;
    const dessiner = () => {
      const c = toile.current;
      const j = jeu.current;
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      const g = c.getContext("2d")!;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const t = maintenant();
      const ligne = h - 70;
      const lc = w / 4;
      // couloirs
      for (let i = 0; i < 4; i++) {
        const appui = performance.now() - j.appuis[i] < 120;
        g.fillStyle = appui ? COULEURS[i] + "33" : i % 2 ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.045)";
        g.fillRect(i * lc, 0, lc, h);
        g.strokeStyle = COULEURS[i];
        g.lineWidth = appui ? 4 : 2;
        g.beginPath();
        g.arc(i * lc + lc / 2, ligne, Math.min(26, lc / 3), 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = "rgba(245,241,255,0.55)";
        g.font = "600 13px system-ui, sans-serif";
        g.textAlign = "center";
        g.fillText(TOUCHES[i].toUpperCase(), i * lc + lc / 2, h - 22);
      }
      // notes
      for (const n of j.notes) {
        if (!n.etat && t - n.t > BIEN) {
          n.etat = 3;
          j.rates += 1;
          j.combo = 0;
          j.retour.push({ couloir: n.couloir, texte: "RATÉ", t: performance.now() });
        }
        if (n.etat === 1 || n.etat === 2) continue;
        const dt = n.t - t;
        if (dt > APPROCHE + 0.1) break;
        if (dt < -0.4) continue;
        const y = ligne - (dt / APPROCHE) * ligne;
        const x = n.couloir * lc + lc / 2;
        const r = Math.min(22, lc / 3.4);
        g.globalAlpha = n.etat === 3 ? 0.25 : 1;
        g.fillStyle = COULEURS[n.couloir];
        g.shadowColor = COULEURS[n.couloir];
        g.shadowBlur = 14;
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
        g.shadowBlur = 0;
        g.fillStyle = "rgba(255,255,255,0.75)";
        g.beginPath();
        g.arc(x - r / 3, y - r / 3, r / 4, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
      }
      // retours
      j.retour = j.retour.filter((f) => performance.now() - f.t < 450);
      for (const f of j.retour) {
        const age = (performance.now() - f.t) / 450;
        g.globalAlpha = 1 - age;
        g.fillStyle = f.texte === "PARFAIT" ? "#fde68a" : f.texte === "BIEN" ? "#a7f3d0" : "#fca5a5";
        g.font = "700 14px system-ui, sans-serif";
        g.fillText(f.texte, f.couloir * lc + lc / 2, ligne - 40 - age * 24);
        g.globalAlpha = 1;
      }
      // fin
      const derniere = j.notes.length ? j.notes[j.notes.length - 1].t : 0;
      if (!j.fini && t > derniere + 1.2) {
        j.fini = true;
        audio.current.ctx?.close().catch(() => {});
        audio.current.ctx = null;
        onFin(j.score, `${j.parfaits} parfaits · ${j.biens} biens · ${j.rates} ratés · combo max ${j.comboMax}`);
        return;
      }
      raf = requestAnimationFrame(dessiner);
    };
    raf = requestAnimationFrame(dessiner);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", clavier);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const j = jeu.current;
  const [, tic] = useState(0);
  useEffect(() => {
    if (phase !== "jeu") return;
    const t = setInterval(() => tic((n) => n + 1), 100);
    return () => clearInterval(t);
  }, [phase]);
  const t = phase === "jeu" ? maintenant() : 0;

  return (
    <div className="relative h-[440px] md:h-[500px] overflow-hidden rounded-2xl border border-violet/20 select-none" style={{ background: "linear-gradient(180deg, #0b0817 0%, #1a0f33 70%, #2a1250 100%)" }}>
      {phase === "depart" ? (
        <EcranDepart
          icone="note"
          titre="Rythme cosmique"
          regles={<>Tape les notes quand elles passent sur les cercles : touches <strong className="text-ink">D F J K</strong> au clavier, ou directement sur l’écran. Enchaîne sans rater pour multiplier tes points (jusqu’à ×4). Monte le son !</>}
          onJouer={lancer}
        />
      ) : (
        <>
          <canvas
            ref={toile}
            className="absolute inset-0 h-full w-full touch-none"
            onPointerDown={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              taper(Math.max(0, Math.min(3, Math.floor(((e.clientX - r.left) / r.width) * 4))));
            }}
          />
          <div className="pointer-events-none absolute left-4 right-4 top-3 flex justify-between text-sm font-semibold text-ink tabular-nums">
            <span><Icone nom="chrono" className="w-4 h-4 mr-1" />{Math.max(0, Math.ceil(DUREE - Math.max(0, t)))} s</span>
            <span><Icone nom="flamme" className="w-4 h-4 mr-1" />{j.combo} {j.combo >= 10 ? `· ×${1 + Math.min(3, Math.floor(j.combo / 10))}` : ""}</span>
            <span className="text-lilac">{j.score.toLocaleString("fr-FR")} pts</span>
          </div>
          {t < 0 ? <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-5xl font-bold text-ink glow-text">{Math.ceil(-t)}</p> : null}
          <button type="button" onClick={() => setSon(!son)} className="absolute right-3 top-10 rounded-full border border-violet/30 bg-void/60 px-3 py-1 text-xs text-ink-soft">
            <Icone nom={son ? "son" : "muet"} className="w-4 h-4 mr-1" />{son ? "Son" : "Muet"}
          </button>
        </>
      )}
    </div>
  );
}
