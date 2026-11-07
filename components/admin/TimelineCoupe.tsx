"use client";

// ✂️ Montage : couper le clip comme dans CapCut.
// Place la tête de lecture → « Couper ici » → touche le morceau en trop → « Supprimer ».
// La pellicule (images du clip) et l'onde du son aident à couper pile au bon endroit ; le son est coupé
// exactement comme l'image. Annuler / rétablir à volonté.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { couperA, dureeMontee, morceaux, recoller, remettre, retirer, segmentsGardes, type Coupe } from "@/lib/coupesMontage";
import { decoderSon } from "@/lib/mp4Export";

type Props = {
  src: string; // adresse du clip (pellicule)
  fichier: Blob | null; // le clip (onde du son)
  duree: number;
  debut: number;
  fin: number;
  coupe: Coupe;
  setCoupe: (c: Coupe) => void;
  t: number; // tête de lecture (temps de la source)
  enLecture: boolean;
  allerA: (t: number) => void; // temps de la source
  lecture: () => void;
};

const fmt = (s: number) => { const m = Math.floor(Math.max(0, s) / 60), r = Math.max(0, s) - m * 60; return `${m}:${r.toFixed(1).padStart(4, "0")}`; };
const fmtCourt = (s: number) => { const m = Math.floor(Math.max(0, s) / 60), r = Math.round(Math.max(0, s) - m * 60); return `${m}:${String(r).padStart(2, "0")}`; };

export default function TimelineCoupe({ src, fichier, duree, debut, fin, coupe, setCoupe, t, enLecture, allerA, lecture }: Props) {
  const boite = useRef<HTMLDivElement>(null);
  const piste = useRef<HTMLDivElement>(null);
  const onde = useRef<HTMLCanvasElement>(null);
  const [largeurBoite, setLargeurBoite] = useState(600);
  const [zoom, setZoom] = useState(1);
  const [pellicule, setPellicule] = useState<string[]>([]);
  const [cretes, setCretes] = useState<Float32Array | null>(null);
  const [selT, setSelT] = useState<number | null>(null); // milieu du morceau choisi
  const [selPoint, setSelPoint] = useState<number | null>(null);
  const passe = useRef<Coupe[]>([]), futur = useRef<Coupe[]>([]);
  const dernier = useRef(coupe); dernier.current = coupe;

  const finT = fin || duree;
  const liste = useMemo(() => morceaux(coupe, debut, finT), [coupe, debut, finT]);
  const segs = useMemo(() => segmentsGardes(coupe, debut, finT), [coupe, debut, finT]);
  const monte = dureeMontee(segs), enleve = Math.max(0, finT - debut - monte);
  const choisi = selT == null ? null : liste.find((m) => selT >= m.a && selT <= m.b) || null;
  const sousTete = liste.find((m) => t >= m.a && t < m.b) || null;

  // ── historique : annuler / rétablir ──
  const changer = useCallback((c: Coupe) => { passe.current.push(dernier.current); if (passe.current.length > 80) passe.current.shift(); futur.current = []; setCoupe(c); }, [setCoupe]);
  const annuler = useCallback(() => { const c = passe.current.pop(); if (!c) return; futur.current.push(dernier.current); setCoupe(c); }, [setCoupe]);
  const retablir = useCallback(() => { const c = futur.current.pop(); if (!c) return; passe.current.push(dernier.current); setCoupe(c); }, [setCoupe]);

  const couper = useCallback(() => {
    const n = couperA(dernier.current, t, debut, finT);
    if (n !== dernier.current) { changer(n); setSelT(t + 0.01); setSelPoint(null); }
  }, [t, debut, finT, changer]);
  const supprimer = useCallback(() => {
    const m = choisi || sousTete; if (!m) return;
    if (m.retire) { changer(remettre(dernier.current, m)); return; }
    if (segs.length <= 1 && Math.abs(segs[0].a - m.a) < 1e-6 && Math.abs(segs[0].b - m.b) < 1e-6) return; // on garde au moins un morceau
    changer(retirer(dernier.current, m));
    // la tête saute au morceau gardé suivant
    const suivant = liste.find((x) => x.a >= m.b - 1e-6 && !x.retire) || [...liste].reverse().find((x) => x.b <= m.a + 1e-6 && !x.retire);
    if (suivant) { allerA(suivant.a + 0.001); setSelT((suivant.a + suivant.b) / 2); }
  }, [choisi, sousTete, segs, liste, changer, allerA]);

  // ── raccourcis clavier (quand on n'écrit pas dans un champ) ──
  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement | null;
      if (cible && (cible.tagName === "INPUT" || cible.tagName === "TEXTAREA" || cible.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "z") { e.preventDefault(); if (e.shiftKey) retablir(); else annuler(); return; }
      if ((e.metaKey || e.ctrlKey) && k === "y") { e.preventDefault(); retablir(); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (k === "s" || k === "c") { e.preventDefault(); couper(); }
      else if (k === "delete" || k === "backspace") { e.preventDefault(); supprimer(); }
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [couper, supprimer, annuler, retablir]);

  // ── taille de la piste ──
  useEffect(() => {
    const b = boite.current; if (!b) return;
    const ro = new ResizeObserver(() => setLargeurBoite(b.clientWidth || 600));
    ro.observe(b); setLargeurBoite(b.clientWidth || 600);
    return () => ro.disconnect();
  }, []);
  const largeur = Math.max(largeurBoite, Math.round(largeurBoite * zoom));
  const px = (s: number) => (duree > 0 ? (s / duree) * largeur : 0);

  // la tête de lecture reste visible quand on zoome ou pendant la lecture
  useEffect(() => {
    const b = boite.current; if (!b || zoom <= 1) return;
    const x = px(t);
    if (x < b.scrollLeft + 30 || x > b.scrollLeft + b.clientWidth - 30) b.scrollLeft = Math.max(0, x - b.clientWidth / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, zoom]);

  // ── pellicule : quelques images du clip ──
  useEffect(() => {
    if (!src || !(duree > 0)) return;
    let fini = false;
    const n = Math.max(8, Math.min(40, Math.round(duree / 1.2)));
    const v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.preload = "auto"; v.crossOrigin = "anonymous"; v.src = src;
    const c = document.createElement("canvas"); c.width = 128; c.height = 72;
    const g = c.getContext("2d");
    const imgs: string[] = [];
    const suivante = (i: number) => {
      if (fini || i >= n || !g) return;
      const aller = () => {
        try {
          const vw = v.videoWidth || 16, vh = v.videoHeight || 9, s = Math.max(128 / vw, 72 / vh);
          g.drawImage(v, (128 - vw * s) / 2, (72 - vh * s) / 2, vw * s, vh * s);
          imgs[i] = c.toDataURL("image/jpeg", 0.6);
          if (i % 4 === 3 || i === n - 1) setPellicule([...imgs]);
        } catch { /* image illisible : on continue */ }
        suivante(i + 1);
      };
      v.addEventListener("seeked", aller, { once: true });
      v.currentTime = Math.min(duree - 0.05, (i + 0.5) * (duree / n));
    };
    v.addEventListener("loadeddata", () => suivante(0), { once: true });
    return () => { fini = true; v.removeAttribute("src"); v.load(); };
  }, [src, duree]);

  // ── onde du son ──
  useEffect(() => {
    if (!fichier) { setCretes(null); return; }
    let fini = false;
    decoderSon(fichier).then((b) => {
      if (fini) return;
      const N = 1400, d = b.getChannelData(0), pas = Math.max(1, Math.floor(d.length / N)), out = new Float32Array(N);
      let max = 1e-4;
      for (let i = 0; i < N; i++) { let m = 0; const o = i * pas; for (let j = 0; j < pas; j += 8) { const x = Math.abs(d[o + j] || 0); if (x > m) m = x; } out[i] = m; if (m > max) max = m; }
      for (let i = 0; i < N; i++) out[i] = Math.sqrt(out[i] / max);
      setCretes(out);
    }).catch(() => setCretes(null));
    return () => { fini = true; };
  }, [fichier]);
  useEffect(() => {
    const cv = onde.current; if (!cv) return;
    const w = Math.min(4000, largeur), h = 34; cv.width = w; cv.height = h;
    const g = cv.getContext("2d")!; g.clearRect(0, 0, w, h);
    if (!cretes) return;
    g.fillStyle = "rgba(196,181,253,.85)";
    for (let x = 0; x < w; x++) { const v = cretes[Math.floor((x / w) * cretes.length)] || 0, hh = Math.max(1, v * (h - 2)); g.fillRect(x, (h - hh) / 2, 1, hh); }
  }, [cretes, largeur]);

  // ── tête de lecture : toucher / glisser sur la piste ──
  function saisir(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("[data-point]")) return;
    const p = piste.current; if (!p) return;
    const r = p.getBoundingClientRect();
    const tps = (cx: number) => Math.max(0, Math.min(duree, ((cx - r.left) / r.width) * duree));
    const t0 = tps(e.clientX);
    allerA(t0); setSelT(t0); setSelPoint(null);
    p.setPointerCapture(e.pointerId);
    const bouger = (ev: PointerEvent) => { const x = tps(ev.clientX); allerA(x); setSelT(x); };
    const lacher = () => { p.removeEventListener("pointermove", bouger); p.removeEventListener("pointerup", lacher); p.removeEventListener("pointercancel", lacher); };
    p.addEventListener("pointermove", bouger); p.addEventListener("pointerup", lacher); p.addEventListener("pointercancel", lacher);
  }

  // graduations
  const pasGrad = [1, 2, 5, 10, 15, 30, 60].find((s) => px(s) >= 56) || 120;
  const grads: number[] = []; for (let s = 0; s <= duree + 1e-6; s += pasGrad) grads.push(s);

  const bouton = "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all disabled:opacity-40 disabled:pointer-events-none";
  const cible = choisi || sousTete;

  return (
    <section className="rounded-2xl border border-violet/25 bg-[#120c22] p-3 md:p-4" aria-label="Montage : couper le clip">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="font-semibold text-ink">✂️ Montage</p>
        <p className="text-xs text-ink-soft">Vidéo finale <b className="text-ink tabular-nums">{fmtCourt(monte)}</b>{enleve > 0.05 ? <> · <span className="text-rose-300 tabular-nums">−{fmtCourt(enleve)}</span> enlevées</> : null}</p>
        <div className="ml-auto flex gap-1.5">
          <button type="button" onClick={annuler} disabled={!passe.current.length} className={`${bouton} border-violet/25 text-ink-soft hover:text-ink px-3`} title="Annuler (Ctrl/⌘ + Z)">↶<span className="sr-only">Annuler</span></button>
          <button type="button" onClick={retablir} disabled={!futur.current.length} className={`${bouton} border-violet/25 text-ink-soft hover:text-ink px-3`} title="Rétablir (Ctrl/⌘ + Maj + Z)">↷<span className="sr-only">Rétablir</span></button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={lecture} className={`${bouton} border-violet-light bg-violet text-white hover:bg-violet-light w-11 justify-center px-0`} aria-label={enLecture ? "Pause" : "Lecture"}>{enLecture ? "❚❚" : "▶"}</button>
        <span className="min-w-[92px] rounded-lg bg-black/30 px-2.5 py-1.5 text-center font-mono text-sm text-ink tabular-nums">{fmt(t)}</span>
        <button type="button" onClick={couper} disabled={t <= debut + 0.05 || t >= finT - 0.05} className={`${bouton} border-lilac/50 bg-lilac/10 text-ink hover:bg-lilac/20`} title="Couper à la tête de lecture (S)">✂️ Couper ici</button>
        <button type="button" onClick={supprimer} disabled={!cible || (!cible.retire && segs.length <= 1 && liste.filter((m) => !m.retire).length <= 1)}
          className={`${bouton} ${cible?.retire ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20" : "border-rose-300/50 bg-rose-400/10 text-rose-100 hover:bg-rose-400/20"}`} title="Supprimer le morceau choisi (Suppr)">
          {cible?.retire ? "↩︎ Remettre le morceau" : "🗑️ Supprimer le morceau"}
        </button>
        {selPoint != null && <button type="button" onClick={() => { changer(recoller(dernier.current, selPoint)); setSelPoint(null); }} className={`${bouton} border-violet/30 text-ink-soft hover:text-ink`}>⇹ Recoller ici</button>}
        <div className="ml-auto flex items-center gap-1.5">
          <button type="button" onClick={() => setZoom((z) => Math.max(1, z / 1.6))} disabled={zoom <= 1} className={`${bouton} border-violet/25 text-ink-soft w-9 justify-center px-0`} aria-label="Dézoomer">−</button>
          <span className="text-xs text-ink-soft w-10 text-center">×{zoom.toFixed(1)}</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(12, z * 1.6))} disabled={zoom >= 12} className={`${bouton} border-violet/25 text-ink-soft w-9 justify-center px-0`} aria-label="Zoomer">+</button>
        </div>
      </div>

      <div ref={boite} className="relative overflow-x-auto overscroll-x-contain rounded-xl bg-black/40 pb-1 [scrollbar-width:thin]">
        <div ref={piste} onPointerDown={saisir} className="relative select-none touch-none cursor-pointer" style={{ width: largeur, height: 118 }}>
          {/* graduations */}
          <div className="absolute inset-x-0 top-0 h-5 border-b border-white/10">
            {grads.map((s) => <span key={s} className="absolute top-0 h-full border-l border-white/15 pl-1 text-[10px] leading-5 text-ink-soft/70 tabular-nums" style={{ left: px(s) }}>{fmtCourt(s)}</span>)}
          </div>
          {/* pellicule */}
          <div className="absolute left-0 right-0 top-6 flex h-[56px] overflow-hidden rounded-md bg-white/5">
            {pellicule.map((u, i) => u ? <img key={i} src={u} alt="" draggable={false} className="h-full flex-1 object-cover min-w-0" /> : <span key={i} className="h-full flex-1" />)}
          </div>
          {/* onde du son */}
          <canvas ref={onde} className="absolute left-0 top-[84px] h-[34px] pointer-events-none" style={{ width: largeur }} aria-hidden />
          {/* hors coupe (début / fin réglés plus bas) */}
          {debut > 0 && <div className="absolute top-5 bottom-0 left-0 bg-black/70 pointer-events-none" style={{ width: px(debut) }} />}
          {finT < duree && <div className="absolute top-5 bottom-0 right-0 bg-black/70 pointer-events-none" style={{ width: largeur - px(finT) }} />}
          {/* morceaux */}
          {liste.map((m) => {
            const sel = choisi && choisi.i === m.i;
            return (
              <div key={m.i + ":" + m.a} className={`absolute top-6 bottom-0 rounded-md pointer-events-none ${m.retire ? "bg-[repeating-linear-gradient(135deg,rgba(15,5,20,.82)_0_8px,rgba(244,63,94,.32)_8px_12px)]" : ""} ${sel ? "ring-2 ring-inset " + (m.retire ? "ring-rose-300" : "ring-lilac") : ""}`}
                style={{ left: px(m.a), width: Math.max(2, px(m.b) - px(m.a)) }}>
                {m.retire && px(m.b) - px(m.a) > 54 && <span className="absolute left-1/2 top-[22px] -translate-x-1/2 rounded-full bg-rose-500/85 px-2 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap">enlevé</span>}
              </div>
            );
          })}
          {/* points de coupe */}
          {liste.slice(1).map((m) => (
            <button key={"p" + m.a} type="button" data-point onPointerDown={(e) => { e.stopPropagation(); setSelPoint(m.a); setSelT(null); allerA(m.a); }}
              className={`absolute top-5 bottom-0 z-10 w-5 -translate-x-1/2 ${selPoint != null && Math.abs(selPoint - m.a) < 1e-4 ? "" : ""}`} style={{ left: px(m.a) }} aria-label={`Coupe à ${fmt(m.a)}`}>
              <span className={`absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 rounded ${selPoint != null && Math.abs(selPoint - m.a) < 1e-4 ? "bg-lilac" : "bg-white"} shadow-[0_0_6px_rgba(0,0,0,.8)]`} />
              <span className="absolute left-1/2 top-[-2px] -translate-x-1/2 text-[11px] leading-none">✂️</span>
            </button>
          ))}
          {/* tête de lecture */}
          <div className="absolute top-0 bottom-0 z-20 w-0 pointer-events-none" style={{ left: px(t) }}>
            <span className="absolute -left-[7px] top-0 h-3.5 w-3.5 rounded-sm bg-rose-400 shadow-glow-sm" />
            <span className="absolute -left-px top-0 bottom-0 w-[2px] bg-rose-400" />
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-soft/80">
        Place la tête de lecture (touche ou glisse sur la pellicule), <b>✂️ Couper ici</b>, puis touche le morceau en trop et <b>🗑️ Supprimer</b>. Le son est enlevé exactement au même endroit ; la lecture saute les parties enlevées. Raccourcis : <kbd>S</kbd> couper · <kbd>Suppr</kbd> supprimer · <kbd>⌘/Ctrl Z</kbd> annuler.
      </p>
    </section>
  );
}
