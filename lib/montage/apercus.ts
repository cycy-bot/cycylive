"use client";

// Pellicule (petites images du clip) et onde du son, pour la timeline du Studio montage.
import { useEffect, useState } from "react";
import { decoderSon } from "@/lib/mp4Export";

export type Pellicule = { pas: number; images: string[] }; // une image toutes les `pas` secondes (temps source)

export function usePellicule(src: string, duree: number): Pellicule {
  const [p, setP] = useState<Pellicule>({ pas: 1, images: [] });
  useEffect(() => {
    if (!src || !(duree > 0)) return;
    let fini = false;
    const n = Math.max(10, Math.min(90, Math.round(duree / 0.8)));
    const pas = duree / n;
    const v = document.createElement("video");
    v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = src;
    const c = document.createElement("canvas"); c.width = 96; c.height = 170;
    const g = c.getContext("2d");
    const imgs: string[] = [];
    const suivante = (i: number) => {
      if (fini || i >= n || !g) return;
      const aller = () => {
        try {
          const vw = v.videoWidth || 9, vh = v.videoHeight || 16, s = Math.max(96 / vw, 170 / vh);
          g.drawImage(v, (96 - vw * s) / 2, (170 - vh * s) / 2, vw * s, vh * s);
          imgs[i] = c.toDataURL("image/jpeg", 0.55);
          if (i % 6 === 5 || i === n - 1) setP({ pas, images: [...imgs] });
        } catch { /* image illisible */ }
        suivante(i + 1);
      };
      v.addEventListener("seeked", aller, { once: true });
      v.currentTime = Math.min(duree - 0.05, (i + 0.5) * pas);
    };
    v.addEventListener("loadeddata", () => suivante(0), { once: true });
    return () => { fini = true; v.removeAttribute("src"); v.load(); };
  }, [src, duree]);
  return p;
}

/** Crêtes du son (0 → 1), `parSeconde` valeurs par seconde de source. */
export function useOnde(fichier: Blob | null): { cretes: Float32Array; parSeconde: number } | null {
  const [o, setO] = useState<{ cretes: Float32Array; parSeconde: number } | null>(null);
  useEffect(() => {
    if (!fichier) { setO(null); return; }
    let fini = false;
    decoderSon(fichier).then((b) => {
      if (fini) return;
      const parSeconde = 50, N = Math.max(1, Math.ceil(b.duration * parSeconde));
      const d = b.getChannelData(0), pas = Math.max(1, Math.floor(d.length / N)), out = new Float32Array(N);
      let max = 1e-4;
      for (let i = 0; i < N; i++) { let m = 0; const o0 = i * pas; for (let j = 0; j < pas; j += 6) { const x = Math.abs(d[o0 + j] || 0); if (x > m) m = x; } out[i] = m; if (m > max) max = m; }
      for (let i = 0; i < N; i++) out[i] = Math.sqrt(out[i] / max);
      setO({ cretes: out, parSeconde: N / b.duration });
    }).catch(() => setO(null));
    return () => { fini = true; };
  }, [fichier]);
  return o;
}
