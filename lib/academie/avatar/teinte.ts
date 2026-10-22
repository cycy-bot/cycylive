// Recoloration des calques de l'avatar (navigateur uniquement).
// La luminance de chaque pixel, rapportée à la couleur de référence
// du calque, pilote la nouvelle teinte : ombres, traits et volumes sont
// conservés. Un masque optionnel (canal R ou V) limite la zone teintée
// (peau des paupières, iris, peau visible d'une tenue...).
// Les résultats sont mis en cache (une image par calque et par couleur).

export type OperationTeinte =
  | { mode: "remap"; ref: number[]; cible: string; masque?: string; canal?: number; res?: number; hi?: number; comp?: number }
  | { mode: "assombrir"; facteur: number };

const lum = (r: number, g: number, b: number) => r * 0.299 + g * 0.587 + b * 0.114;
const hex = (h: string) => {
  const v = h.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};

const pixels = new Map<string, Promise<ImageData>>();
function lirePixels(src: string): Promise<ImageData> {
  let p = pixels.get(src);
  if (!p) {
    p = new Promise<ImageData>((ok, ko) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const x = c.getContext("2d", { willReadFrequently: true })!;
        x.drawImage(img, 0, 0);
        ok(x.getImageData(0, 0, c.width, c.height));
      };
      img.onerror = () => ko(new Error("image introuvable : " + src));
      img.src = src;
    });
    p.catch(() => pixels.delete(src));
    pixels.set(src, p);
  }
  return p;
}

function appliquer(d: ImageData, op: OperationTeinte, masque: ImageData | null) {
  const a = d.data;
  if (op.mode === "assombrir") {
    const k = op.facteur;
    for (let i = 0; i < a.length; i += 4) { a[i] *= k; a[i + 1] *= k; a[i + 2] *= k; }
    return;
  }
  const ref = op.ref, tgt = hex(op.cible), m = masque?.data, ch = op.canal ?? 0;
  const lr = Math.max(lum(ref[0], ref[1], ref[2]), 1), res = op.res ?? 0.25, hi = op.hi ?? 1.15, comp = op.comp ?? 1;
  for (let i = 0; i < a.length; i += 4) {
    if (a[i + 3] === 0) continue;
    const w = m ? m[i + ch] / 255 : 1;
    if (w < 0.004) continue;
    const r = a[i], g = a[i + 1], b = a[i + 2];
    let t = lum(r, g, b) / lr;
    if (t > 1) t = 1 + (t - 1) * comp;
    let n0, n1, n2;
    if (t <= 1) { n0 = tgt[0] * t; n1 = tgt[1] * t; n2 = tgt[2] * t; }
    else {
      const k = Math.min(Math.max((t - 1) * hi, 0), 1);
      n0 = tgt[0] + (255 - tgt[0]) * k; n1 = tgt[1] + (255 - tgt[1]) * k; n2 = tgt[2] + (255 - tgt[2]) * k;
    }
    n0 += (r - ref[0] * t) * res; n1 += (g - ref[1] * t) * res; n2 += (b - ref[2] * t) * res;
    a[i] = r * (1 - w) + n0 * w; a[i + 1] = g * (1 - w) + n1 * w; a[i + 2] = b * (1 - w) + n2 * w;
  }
}

const resultats = new Map<string, Promise<string>>();

/** Adresse (blob:) de l'image teintée ; l'image d'origine si aucune opération. */
export function imageTeintee(src: string, ops: OperationTeinte[] | undefined, racine: string): Promise<string> {
  if (!ops?.length || typeof document === "undefined") return Promise.resolve(src);
  const cle = src + "|" + JSON.stringify(ops);
  let p = resultats.get(cle);
  if (!p) {
    p = (async () => {
      const base = await lirePixels(src);
      const d = new ImageData(new Uint8ClampedArray(base.data), base.width, base.height);
      for (const op of ops) {
        const m = op.mode === "remap" && op.masque ? await lirePixels(racine + op.masque) : null;
        appliquer(d, op, m && m.width === d.width && m.height === d.height ? m : null);
      }
      const c = document.createElement("canvas");
      c.width = d.width;
      c.height = d.height;
      c.getContext("2d")!.putImageData(d, 0, 0);
      const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, "image/png"));
      return blob ? URL.createObjectURL(blob) : src;
    })();
    p.catch(() => resultats.delete(cle));
    resultats.set(cle, p);
    if (resultats.size > 160) {   // garde le cache borné (les plus anciens d'abord)
      const premier = resultats.keys().next().value as string;
      resultats.get(premier)?.then((u) => u.startsWith("blob:") && URL.revokeObjectURL(u)).catch(() => undefined);
      resultats.delete(premier);
    }
  }
  return p;
}
