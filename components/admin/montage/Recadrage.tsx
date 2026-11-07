"use client";

// Studio montage — recadrer un morceau ou une incrustation : on garde une partie de l'image
// (glisser le cadre pour le déplacer, tirer un coin pour l'agrandir), au format libre, 9:16, 3:4, 4:3, carré ou 16:9.
import { useEffect, useRef, useState } from "react";
import Icone from "@/components/icones/Icone";
import type { Crop } from "@/lib/montage/projet";

const FORMATS: { id: string; l: string; r: number | null }[] = [
  { id: "libre", l: "Libre", r: null },
  { id: "9:16", l: "9:16", r: 9 / 16 },
  { id: "3:4", l: "3:4", r: 3 / 4 },
  { id: "4:3", l: "4:3", r: 4 / 3 },
  { id: "1:1", l: "Carré", r: 1 },
  { id: "16:9", l: "16:9", r: 16 / 9 },
];
const ENTIER: Crop = { x: 0, y: 0, w: 1, h: 1, ratio: "libre" };
const borne = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type Props = {
  titre: string;
  el: () => HTMLVideoElement | HTMLImageElement | null; // l'image à montrer (celle de la tête de lecture)
  w: number; h: number; // taille du média
  depart?: Crop;
  onAppliquer: (c: Crop | undefined) => void;
  onFermer: () => void;
};

export default function Recadrage({ titre, el, w, h, depart, onAppliquer, onFermer }: Props) {
  const [c, setC] = useState<Crop>(depart || ENTIER);
  const cv = useRef<HTMLCanvasElement>(null);
  const boite = useRef<HTMLDivElement>(null);
  const A = w / Math.max(1, h); // forme du média
  const fmt = FORMATS.find((f) => f.id === (c.ratio || "libre")) || FORMATS[0];

  // l'image du média, redessinée en continu (la vidéo peut encore se caler)
  useEffect(() => {
    let raf = 0;
    const pas = () => {
      const x = cv.current?.getContext("2d"), s = el();
      if (x && s) { try { x.drawImage(s, 0, 0, x.canvas.width, x.canvas.height); } catch { /* pas encore prête */ } }
      raf = requestAnimationFrame(pas);
    };
    raf = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(raf);
  }, [el]);

  function format(id: string) {
    const f = FORMATS.find((x) => x.id === id)!;
    if (!f.r) { setC((o) => ({ ...o, ratio: "libre" })); return; }
    // le plus grand cadre de ce format, centré sur le cadre actuel
    let fw = f.r / A, fh = 1;
    if (fw > 1) { fh = A / f.r; fw = 1; }
    setC((o) => { const cx = o.x + o.w / 2, cy = o.y + o.h / 2; return { x: borne(cx - fw / 2, 0, 1 - fw), y: borne(cy - fh / 2, 0, 1 - fh), w: fw, h: fh, ratio: id }; });
  }

  function saisir(e: React.PointerEvent, mode: "bouger" | "hg" | "hd" | "bg" | "bd") {
    e.preventDefault(); e.stopPropagation();
    const r = boite.current!.getBoundingClientRect(), x0 = e.clientX, y0 = e.clientY, c0 = c;
    const cible = e.currentTarget as HTMLElement; try { cible.setPointerCapture(e.pointerId); } catch { /* rien */ }
    const bouger = (ev: PointerEvent) => {
      const dx = (ev.clientX - x0) / r.width, dy = (ev.clientY - y0) / r.height;
      if (mode === "bouger") { setC({ ...c0, x: borne(c0.x + dx, 0, 1 - c0.w), y: borne(c0.y + dy, 0, 1 - c0.h) }); return; }
      // coin opposé fixe
      const fx = mode === "hg" || mode === "bg" ? c0.x + c0.w : c0.x, fy = mode === "hg" || mode === "hd" ? c0.y + c0.h : c0.y;
      const px = borne((mode === "hg" || mode === "bg" ? c0.x : c0.x + c0.w) + dx, 0, 1), py = borne((mode === "hg" || mode === "hd" ? c0.y : c0.y + c0.h) + dy, 0, 1);
      let nw = Math.max(0.05, Math.abs(px - fx)), nh = Math.max(0.05, Math.abs(py - fy));
      if (fmt.r) {
        const k = fmt.r / A; // nw / nh
        if (nw / nh > k) nw = nh * k; else nh = nw / k;
        const maxW = mode === "hg" || mode === "bg" ? fx : 1 - fx, maxH = mode === "hg" || mode === "hd" ? fy : 1 - fy;
        if (nw > maxW) { nw = maxW; nh = nw / k; }
        if (nh > maxH) { nh = maxH; nw = nh * k; }
      }
      const nx = mode === "hg" || mode === "bg" ? fx - nw : fx, ny = mode === "hg" || mode === "hd" ? fy - nh : fy;
      setC({ ...c0, x: borne(nx, 0, 1 - nw), y: borne(ny, 0, 1 - nh), w: nw, h: nh });
    };
    const fin = () => { cible.removeEventListener("pointermove", bouger); cible.removeEventListener("pointerup", fin); cible.removeEventListener("pointercancel", fin); };
    cible.addEventListener("pointermove", bouger); cible.addEventListener("pointerup", fin); cible.addEventListener("pointercancel", fin);
  }

  // place de l'image dans la fenêtre
  const maxW = 760, maxH = 430, kAff = Math.min(maxW / w, maxH / h), aw = Math.round(w * kAff), ah = Math.round(h * kAff);
  const coin = (m: "hg" | "hd" | "bg" | "bd", cls: string) => (
    <span onPointerDown={(e) => saisir(e, m)} className={`absolute z-10 h-7 w-7 touch-none rounded-full border-[3px] border-violet bg-white shadow ${cls}`} style={{ cursor: m === "hg" || m === "bd" ? "nwse-resize" : "nesw-resize" }} />
  );
  const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true">
      <div className="w-full max-w-[820px] rounded-2xl border border-violet/30 bg-[#150d28] p-4 shadow-2xl">
        <div className="mb-3 flex items-center gap-2">
          <Icone nom="recadrer" className="h-5 w-5 text-lilac" />
          <p className="text-lg font-semibold">Recadrer</p>
          <span className="truncate text-sm text-ink-soft">· {titre}</span>
          <button type="button" onClick={onFermer} className="ml-auto rounded-full p-2 hover:bg-white/10" aria-label="Fermer"><Icone nom="fermer" className="h-5 w-5" /></button>
        </div>
        <div className="flex justify-center">
          <div ref={boite} className="relative select-none overflow-hidden rounded-lg bg-black" style={{ width: aw, height: ah, maxWidth: "100%" }}>
            <canvas ref={cv} width={aw * 2} height={ah * 2} className="absolute inset-0 h-full w-full" />
            {/* zone gardée : le reste est assombri */}
            <div onPointerDown={(e) => saisir(e, "bouger")} className="absolute touch-none cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,.62)]"
              style={{ left: pct(c.x), top: pct(c.y), width: pct(c.w), height: pct(c.h) }}>
              <span className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">{Array.from({ length: 9 }, (_, i) => <span key={i} className="border border-white/25" />)}</span>
              {coin("hg", "-left-3.5 -top-3.5")}{coin("hd", "-right-3.5 -top-3.5")}{coin("bg", "-left-3.5 -bottom-3.5")}{coin("bd", "-right-3.5 -bottom-3.5")}
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {FORMATS.map((f) => (
            <button key={f.id} type="button" onClick={() => format(f.id)} className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${fmt.id === f.id ? "border-violet-light bg-violet/25 text-ink" : "border-white/10 text-ink-soft hover:bg-white/5"}`}>{f.l}</button>
          ))}
          <button type="button" onClick={() => setC(ENTIER)} className="ml-auto rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-ink-soft hover:bg-white/5">Image entière</button>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onFermer} className="rounded-full border border-white/15 px-4 py-2 text-sm">Annuler</button>
          <button type="button" onClick={() => { const entier = c.w > 0.999 && c.h > 0.999; onAppliquer(entier ? undefined : { ...c, x: +c.x.toFixed(4), y: +c.y.toFixed(4), w: +c.w.toFixed(4), h: +c.h.toFixed(4) }); }} className="rounded-full bg-violet px-5 py-2 text-sm font-semibold text-white">Appliquer</button>
        </div>
      </div>
    </div>
  );
}
